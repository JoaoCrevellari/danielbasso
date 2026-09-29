/**
 * Aceite do convite da equipe (página pública /convite/<token>).
 *
 * O token chega em texto só no link; aqui ele vira sha256 e é procurado no banco com a
 * chave de serviço. Aceitar "reserva" o convite num UPDATE atômico (used_at IS NULL e no
 * prazo), cria a conta com a senha escolhida, grava papel e permissões e marca quem usou.
 * Se algo falhar depois da reserva, o convite volta a valer. Um link = um cadastro.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { hashToken } from "./token";

const esquemaToken = z.string().regex(/^[A-Za-z0-9_-]{40,60}$/, "Link inválido.");

export type EstadoConvite =
  | { estado: "valido"; nome: string; email: string; expiraEm: string }
  | { estado: "usado" | "expirado" | "invalido" };

async function clienteAdmin() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("O servidor ainda não está configurado para aceitar convites.");
  }
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export const verConviteFn = createServerFn({ method: "POST" })
  .validator(z.object({ token: z.string() }))
  .handler(async ({ data }): Promise<EstadoConvite> => {
    const token = esquemaToken.safeParse(data.token);
    if (!token.success) return { estado: "invalido" };
    const admin = await clienteAdmin();
    const { data: c } = await admin
      .from("staff_invites")
      .select("nome, email, expires_at, used_at")
      .eq("token_hash", await hashToken(token.data))
      .maybeSingle();
    if (!c) return { estado: "invalido" };
    if (c.used_at) return { estado: "usado" };
    if (new Date(c.expires_at).getTime() < Date.now()) return { estado: "expirado" };
    return { estado: "valido", nome: c.nome, email: c.email, expiraEm: c.expires_at };
  });

export const aceitarConviteFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      token: esquemaToken,
      senha: z
        .string()
        .min(10, "A senha precisa de pelo menos 10 caracteres.")
        .max(72, "A senha pode ter no máximo 72 caracteres."),
    }),
  )
  .handler(async ({ data }): Promise<{ email: string }> => {
    const { dentroDoLimite, ipDaRequisicao } = await import("@/lib/limite.server");
    if (!(await dentroDoLimite("LIMITE_FORMULARIO", `convite:${ipDaRequisicao()}`))) {
      throw new Error("Muitas tentativas em pouco tempo. Aguarde um minuto.");
    }
    const admin = await clienteAdmin();
    const agora = new Date().toISOString();

    // Reserva atômica: só um aceite passa, e só dentro do prazo.
    const { data: reservado, error: e0 } = await admin
      .from("staff_invites")
      .update({ used_at: agora })
      .eq("token_hash", await hashToken(data.token))
      .is("used_at", null)
      .gt("expires_at", agora)
      .select("id, email, nome, cargo, admin, permissoes")
      .maybeSingle();
    if (e0) console.error("[convite] reservar:", e0);
    if (!reservado) throw new Error("Este link é inválido, expirou ou já foi usado.");

    const desfazer = async () => {
      await admin.from("staff_invites").update({ used_at: null }).eq("id", reservado.id);
    };

    try {
      let userId: string | undefined;
      const { data: criado, error: e1 } = await admin.auth.admin.createUser({
        email: reservado.email,
        password: data.senha,
        email_confirm: true,
        user_metadata: { nome: reservado.nome },
      });
      userId = criado?.user?.id;

      if (e1) {
        const existe =
          e1.code === "email_exists" || /already.*registered|already exists/i.test(e1.message);
        if (!existe) {
          console.error("[convite] createUser:", e1);
          if (/password/i.test(e1.message)) {
            throw new Error("Essa senha não foi aceita. Use uma senha mais forte e diferente.");
          }
          throw new Error("Não foi possível criar o acesso agora. Tente de novo em instantes.");
        }
        // Conta de login já existia (ex.: acesso removido antes): só volta se não tiver papel.
        const { data: lista } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
        const conta = lista?.users.find((u) => u.email?.toLowerCase() === reservado.email);
        if (!conta) throw new Error("Não foi possível localizar a conta deste e-mail.");
        const { data: papel } = await admin
          .from("user_roles")
          .select("id")
          .eq("user_id", conta.id)
          .limit(1);
        if (papel?.length)
          throw new Error("Este e-mail já tem acesso ao painel. Entre pela tela de login.");
        const { error: e2 } = await admin.auth.admin.updateUserById(conta.id, {
          password: data.senha,
          email_confirm: true,
        });
        if (e2) {
          console.error("[convite] updateUser:", e2);
          throw new Error("Não foi possível definir a senha. Tente de novo em instantes.");
        }
        userId = conta.id;
      }
      if (!userId) throw new Error("Não foi possível criar o acesso agora.");

      const { error: e3 } = await admin.from("staff_profiles").upsert({
        user_id: userId,
        nome: reservado.nome,
        cargo: reservado.cargo,
        permissoes: reservado.admin ? {} : reservado.permissoes,
      });
      if (e3) throw new Error("Não foi possível gravar o perfil.");
      const { error: e4 } = await admin
        .from("user_roles")
        .upsert(
          { user_id: userId, role: reservado.admin ? "admin" : "editor" },
          { onConflict: "user_id,role", ignoreDuplicates: true },
        );
      if (e4) throw new Error("Não foi possível liberar o acesso.");
      await admin.from("staff_invites").update({ used_by: userId }).eq("id", reservado.id);
      return { email: reservado.email };
    } catch (err) {
      await desfazer();
      throw err;
    }
  });
