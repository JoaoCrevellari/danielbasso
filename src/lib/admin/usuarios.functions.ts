/**
 * Equipe do painel (só administradores): listar, convidar com link de uso único,
 * editar nome/cargo/permissões e remover acesso.
 *
 * Convite: gera um token aleatório de 256 bits; o banco guarda só o sha256. O link
 * (/convite/<token>) aparece uma única vez para o administrador copiar e enviar; vale por
 * 7 dias e para um cadastro só. Quem abre o link cria a própria senha (convite.functions).
 *
 * Listar e-mails e último acesso exige a API admin do Supabase Auth (service role, segredo
 * do Worker), importada dinamicamente e SÓ depois de confirmar que quem chama é admin.
 * Perfis, papéis e convites são gravados com o token de quem chama: a RLS confere de novo.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { novoToken } from "@/lib/token";
import { checar } from "./erros";
import { normalizarPermissoes, type Permissoes } from "./permissoes";

export type MembroEquipe = {
  id: string;
  email: string | null;
  nome: string | null;
  cargo: string | null;
  admin: boolean;
  permissoes: Permissoes;
  desde: string | null;
  ultimoAcesso: string | null;
  voce: boolean;
};

export type ConvitePendente = {
  id: string;
  email: string;
  nome: string;
  cargo: string | null;
  admin: boolean;
  permissoes: Permissoes;
  criadoEm: string;
  expiraEm: string;
  expirado: boolean;
};

export type ListaEquipe = {
  semChave: boolean;
  membros: MembroEquipe[];
  convites: ConvitePendente[];
};

type Ctx = {
  supabase: import("@supabase/supabase-js").SupabaseClient<
    import("@/integrations/supabase/types").Database
  >;
  userId: string;
};

const DIAS_CONVITE = 7;

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

async function origemDoSite() {
  const { getRequest } = await import("@tanstack/react-start/server");
  const req = getRequest();
  return req?.url
    ? new URL(req.url).origin
    : (process.env.SITE_URL ?? "https://danielbasso.com.br");
}

const esquemaPermissoes = z
  .record(z.string(), z.array(z.string()))
  .transform((p) => normalizarPermissoes(p));

const esquemaPessoa = z.object({
  nome: z.string().trim().min(2, "Informe o nome.").max(120),
  cargo: z
    .string()
    .trim()
    .max(120)
    .transform((c) => c || null),
  admin: z.boolean(),
  permissoes: esquemaPermissoes,
});

export const listarEquipeFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ListaEquipe> => {
    await exigirAdmin(context);
    const email = typeof context.claims.email === "string" ? context.claims.email : null;

    const [roles, perfis, convites] = await Promise.all([
      context.supabase.from("user_roles").select("user_id, role, created_at"),
      context.supabase.from("staff_profiles").select("user_id, nome, cargo, permissoes"),
      context.supabase
        .from("staff_invites")
        .select("id, email, nome, cargo, admin, permissoes, created_at, expires_at")
        .is("used_at", null)
        .order("created_at", { ascending: false }),
    ]);
    checar(roles.error, "listar papéis");
    checar(perfis.error, "listar perfis");
    checar(convites.error, "listar convites");

    const papeis = new Map<string, { admin: boolean; desde: string }>();
    for (const r of roles.data ?? []) {
      const atual = papeis.get(r.user_id) ?? { admin: false, desde: r.created_at };
      if (r.role === "admin") atual.admin = true;
      if (r.created_at < atual.desde) atual.desde = r.created_at;
      papeis.set(r.user_id, atual);
    }
    const perfilDe = new Map((perfis.data ?? []).map((p) => [p.user_id, p]));

    let contas = new Map<string, { email: string | null; ultimo: string | null }>();
    if (temChaveServico()) {
      const admin = await clienteAdmin();
      const { data: lista, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      if (error) {
        console.error("[usuarios] listUsers:", error);
        throw new Error(
          "Não foi possível listar os usuários do login. Confira a chave de serviço.",
        );
      }
      contas = new Map(
        lista.users.map((u) => [
          u.id,
          { email: u.email ?? null, ultimo: u.last_sign_in_at ?? null },
        ]),
      );
    }

    const membros: MembroEquipe[] = [...papeis.entries()].map(([id, p]) => {
      const perfil = perfilDe.get(id);
      return {
        id,
        email: contas.get(id)?.email ?? (id === context.userId ? email : null),
        nome: perfil?.nome ?? null,
        cargo: perfil?.cargo ?? null,
        admin: p.admin,
        permissoes: normalizarPermissoes(perfil?.permissoes),
        desde: p.desde,
        ultimoAcesso: contas.get(id)?.ultimo ?? null,
        voce: id === context.userId,
      };
    });
    membros.sort(
      (a, b) =>
        Number(b.voce) - Number(a.voce) ||
        Number(b.admin) - Number(a.admin) ||
        (a.nome ?? a.email ?? "").localeCompare(b.nome ?? b.email ?? ""),
    );

    const agora = Date.now();
    return {
      semChave: !temChaveServico(),
      membros,
      convites: (convites.data ?? []).map((c) => ({
        id: c.id,
        email: c.email,
        nome: c.nome,
        cargo: c.cargo,
        admin: c.admin,
        permissoes: normalizarPermissoes(c.permissoes),
        criadoEm: c.created_at,
        expiraEm: c.expires_at,
        expirado: new Date(c.expires_at).getTime() < agora,
      })),
    };
  });

export const criarConviteFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(
    esquemaPessoa.extend({
      email: z.string().trim().toLowerCase().email("E-mail inválido.").max(200),
    }),
  )
  .handler(async ({ data, context }): Promise<{ link: string; expiraEm: string }> => {
    await exigirAdmin(context);
    if (!temChaveServico()) {
      throw new Error(
        "Convites precisam da chave SUPABASE_SERVICE_ROLE_KEY configurada no servidor.",
      );
    }
    if (!data.admin && !Object.keys(data.permissoes).length) {
      throw new Error("Marque pelo menos uma permissão ou dê acesso de administrador.");
    }

    // Quem já está na equipe não precisa de convite.
    const admin = await clienteAdmin();
    const { data: lista, error: e1 } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (e1) throw new Error("Não foi possível conferir os usuários existentes.");
    const existente = lista.users.find((u) => u.email?.toLowerCase() === data.email);
    if (existente) {
      const { data: papel } = await context.supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", existente.id)
        .limit(1);
      if (papel?.length)
        throw new Error("Este e-mail já tem acesso ao painel. Edite as permissões na lista.");
    }

    // Um convite pendente por e-mail: o novo substitui o anterior.
    const { error: e2 } = await context.supabase
      .from("staff_invites")
      .delete()
      .eq("email", data.email)
      .is("used_at", null);
    checar(e2, "substituir convite anterior");

    const { token, hash } = await novoToken();
    const expira = new Date(Date.now() + DIAS_CONVITE * 86_400_000).toISOString();
    const { error: e3 } = await context.supabase.from("staff_invites").insert({
      token_hash: hash,
      email: data.email,
      nome: data.nome,
      cargo: data.cargo,
      admin: data.admin,
      permissoes: data.admin ? {} : data.permissoes,
      created_by: context.userId,
      expires_at: expira,
    });
    checar(e3, "criar convite");
    return { link: `${await origemDoSite()}/convite/${token}`, expiraEm: expira };
  });

/** Gera um link novo para um convite pendente (o anterior deixa de valer). */
export const renovarConviteFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data, context }): Promise<{ link: string; expiraEm: string }> => {
    await exigirAdmin(context);
    const { token, hash } = await novoToken();
    const expira = new Date(Date.now() + DIAS_CONVITE * 86_400_000).toISOString();
    const { data: atualizado, error } = await context.supabase
      .from("staff_invites")
      .update({ token_hash: hash, expires_at: expira })
      .eq("id", data.id)
      .is("used_at", null)
      .select("id");
    checar(error, "renovar convite");
    if (!atualizado?.length) throw new Error("Este convite já foi usado ou não existe mais.");
    return { link: `${await origemDoSite()}/convite/${token}`, expiraEm: expira };
  });

export const revogarConviteFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    await exigirAdmin(context);
    const { error } = await context.supabase
      .from("staff_invites")
      .delete()
      .eq("id", data.id)
      .is("used_at", null);
    checar(error, "cancelar convite");
    return { ok: true };
  });

export const salvarMembroFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(esquemaPessoa.extend({ userId: z.string().uuid() }))
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    await exigirAdmin(context);
    if (data.userId === context.userId && !data.admin) {
      throw new Error("Você não pode tirar o seu próprio acesso de administrador.");
    }
    if (!data.admin && !Object.keys(data.permissoes).length) {
      throw new Error("Marque pelo menos uma permissão ou use “Remover acesso”.");
    }
    const { error: e1 } = await context.supabase.from("staff_profiles").upsert({
      user_id: data.userId,
      nome: data.nome,
      cargo: data.cargo,
      permissoes: data.admin ? {} : data.permissoes,
      updated_by: context.userId,
    });
    checar(e1, "salvar perfil");

    const papel = data.admin ? "admin" : "editor";
    const { error: e2 } = await context.supabase
      .from("user_roles")
      .delete()
      .eq("user_id", data.userId)
      .neq("role", papel);
    checar(e2, "trocar papel (remover)");
    const { error: e3 } = await context.supabase
      .from("user_roles")
      .upsert(
        { user_id: data.userId, role: papel },
        { onConflict: "user_id,role", ignoreDuplicates: true },
      );
    checar(e3, "trocar papel (gravar)");
    return { ok: true };
  });

export const removerAcessoFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(z.object({ userId: z.string().uuid() }))
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    await exigirAdmin(context);
    if (data.userId === context.userId)
      throw new Error("Você não pode remover o seu próprio acesso.");
    const { error: e1 } = await context.supabase
      .from("user_roles")
      .delete()
      .eq("user_id", data.userId);
    checar(e1, "remover acesso");
    const { error: e2 } = await context.supabase
      .from("staff_profiles")
      .delete()
      .eq("user_id", data.userId);
    checar(e2, "remover perfil");
    return { ok: true };
  });
