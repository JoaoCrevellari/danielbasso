/**
 * Usuários do painel (só administradores).
 *
 * Listar e convidar pessoas exige a API admin do Supabase Auth, que só funciona com a
 * service role (SUPABASE_SERVICE_ROLE_KEY, segredo do Worker). O cliente admin é
 * importado dinamicamente e SÓ depois de confirmar que quem chama é administrador.
 * Sem a chave, o módulo continua listando os papéis visíveis pela RLS (admin vê todos).
 * Os papéis (user_roles) são gravados com o token de quem chama: a RLS confere de novo.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { checar } from "./erros";
import type { Papel } from "./perfil.functions";

export type UsuarioPainel = {
  id: string;
  email: string | null;
  papel: Papel | null;
  convidadoEm: string | null;
  ultimoAcesso: string | null;
  confirmado: boolean;
  voce: boolean;
};

export type ListaUsuarios = {
  semChave: boolean;
  usuarios: UsuarioPainel[];
};

type Ctx = {
  supabase: import("@supabase/supabase-js").SupabaseClient<
    import("@/integrations/supabase/types").Database
  >;
  userId: string;
};

async function exigirAdmin(ctx: Ctx) {
  const { data, error } = await ctx.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", ctx.userId)
    .eq("role", "admin")
    .maybeSingle();
  checar(error, "verificar admin");
  if (!data) throw new Error("Apenas administradores podem gerenciar usuários.");
}

function temChaveServico() {
  return !!process.env.SUPABASE_SERVICE_ROLE_KEY && !!process.env.SUPABASE_URL;
}

async function clienteAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

/** Papel principal (admin prevalece sobre editor). */
function papelDe(papeis: string[]): Papel | null {
  if (papeis.includes("admin")) return "admin";
  if (papeis.includes("editor")) return "editor";
  return null;
}

export const listarUsuariosFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ListaUsuarios> => {
    await exigirAdmin(context);
    const email = typeof context.claims.email === "string" ? context.claims.email : null;

    const { data: roles, error } = await context.supabase
      .from("user_roles")
      .select("user_id, role, created_at");
    checar(error, "listar papéis");
    const papeisPorUsuario = new Map<string, { papeis: string[]; desde: string }>();
    for (const r of roles ?? []) {
      const atual = papeisPorUsuario.get(r.user_id) ?? { papeis: [], desde: r.created_at };
      atual.papeis.push(r.role);
      if (r.created_at < atual.desde) atual.desde = r.created_at;
      papeisPorUsuario.set(r.user_id, atual);
    }

    if (!temChaveServico()) {
      const usuarios: UsuarioPainel[] = [...papeisPorUsuario.entries()].map(([id, p]) => ({
        id,
        email: id === context.userId ? email : null,
        papel: papelDe(p.papeis),
        convidadoEm: p.desde,
        ultimoAcesso: null,
        confirmado: true,
        voce: id === context.userId,
      }));
      if (!usuarios.some((u) => u.voce)) {
        usuarios.unshift({
          id: context.userId,
          email,
          papel: "admin",
          convidadoEm: null,
          ultimoAcesso: null,
          confirmado: true,
          voce: true,
        });
      }
      return { semChave: true, usuarios: usuarios.sort((a, b) => Number(b.voce) - Number(a.voce)) };
    }

    const admin = await clienteAdmin();
    const { data: lista, error: e2 } = await admin.auth.admin.listUsers({ page: 1, perPage: 500 });
    if (e2) {
      console.error("[usuarios] listUsers:", e2);
      throw new Error("Não foi possível listar os usuários do login. Confira a chave de serviço.");
    }
    const usuarios: UsuarioPainel[] = lista.users.map((u) => ({
      id: u.id,
      email: u.email ?? null,
      papel: papelDe(papeisPorUsuario.get(u.id)?.papeis ?? []),
      convidadoEm: u.invited_at ?? u.created_at ?? null,
      ultimoAcesso: u.last_sign_in_at ?? null,
      confirmado: !!(u.email_confirmed_at || u.last_sign_in_at),
      voce: u.id === context.userId,
    }));
    // Quem tem acesso primeiro; depois por e-mail.
    usuarios.sort(
      (a, b) =>
        Number(b.voce) - Number(a.voce) ||
        Number(!!b.papel) - Number(!!a.papel) ||
        (a.email ?? "").localeCompare(b.email ?? ""),
    );
    return { semChave: false, usuarios };
  });

async function definirPapel(ctx: Ctx, userId: string, papel: Papel) {
  const { error: e1 } = await ctx.supabase
    .from("user_roles")
    .delete()
    .eq("user_id", userId)
    .neq("role", papel);
  checar(e1, "trocar papel (remover)");
  const { error: e2 } = await ctx.supabase
    .from("user_roles")
    .upsert(
      { user_id: userId, role: papel },
      { onConflict: "user_id,role", ignoreDuplicates: true },
    );
  checar(e2, "trocar papel (gravar)");
}

export const convidarUsuarioFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(
    z.object({
      email: z.string().trim().toLowerCase().email("E-mail inválido.").max(200),
      papel: z.enum(["admin", "editor"]),
    }),
  )
  .handler(async ({ data, context }): Promise<{ jaExistia: boolean }> => {
    await exigirAdmin(context);
    if (!temChaveServico()) {
      throw new Error(
        "Convites precisam da chave SUPABASE_SERVICE_ROLE_KEY configurada no servidor.",
      );
    }
    const { getRequest } = await import("@tanstack/react-start/server");
    const req = getRequest();
    const origem = req?.url ? new URL(req.url).origin : (process.env.SITE_URL ?? "");
    const admin = await clienteAdmin();

    const { data: convite, error } = await admin.auth.admin.inviteUserByEmail(data.email, {
      redirectTo: `${origem}/redefinir-senha`,
    });

    let userId = convite?.user?.id;
    let jaExistia = false;
    if (error) {
      const existe =
        error.code === "email_exists" || /already.*registered|already exists/i.test(error.message);
      if (!existe) {
        console.error("[usuarios] convite:", error);
        if (error.status === 429)
          throw new Error("Muitos convites em pouco tempo. Aguarde alguns minutos.");
        throw new Error("Não foi possível enviar o convite agora.");
      }
      const { data: lista, error: e2 } = await admin.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });
      if (e2) throw new Error("Não foi possível localizar o usuário existente.");
      userId = lista.users.find((u) => u.email?.toLowerCase() === data.email)?.id;
      jaExistia = true;
    }
    if (!userId) throw new Error("Não foi possível identificar o usuário convidado.");
    await definirPapel(context, userId, data.papel);
    return { jaExistia };
  });

export const mudarPapelFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(z.object({ userId: z.string().uuid(), papel: z.enum(["admin", "editor"]) }))
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    await exigirAdmin(context);
    if (data.userId === context.userId && data.papel !== "admin") {
      throw new Error("Você não pode tirar o seu próprio acesso de administrador.");
    }
    await definirPapel(context, data.userId, data.papel);
    return { ok: true };
  });

export const removerAcessoFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(z.object({ userId: z.string().uuid() }))
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    await exigirAdmin(context);
    if (data.userId === context.userId)
      throw new Error("Você não pode remover o seu próprio acesso.");
    const { error } = await context.supabase.from("user_roles").delete().eq("user_id", data.userId);
    checar(error, "remover acesso");
    return { ok: true };
  });
