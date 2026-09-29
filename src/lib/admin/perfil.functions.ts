/**
 * Quem está usando o painel: id, e-mail, papéis, nome, cargo e permissões por módulo.
 * A leitura respeita RLS: cada pessoa vê apenas o próprio papel e o próprio perfil.
 */
import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { checar } from "./erros";
import { normalizarPermissoes, type Permissoes } from "./permissoes";

export type Papel = "admin" | "editor";

export type Perfil = {
  userId: string;
  email: string | null;
  papeis: Papel[];
  nome: string | null;
  cargo: string | null;
  permissoes: Permissoes;
};

export const meuPerfilFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Perfil> => {
    const [papeis, perfil] = await Promise.all([
      context.supabase.from("user_roles").select("role").eq("user_id", context.userId),
      context.supabase
        .from("staff_profiles")
        .select("nome, cargo, permissoes")
        .eq("user_id", context.userId)
        .maybeSingle(),
    ]);
    checar(papeis.error, "perfil");
    checar(perfil.error, "perfil");
    const email = typeof context.claims.email === "string" ? context.claims.email : null;
    return {
      userId: context.userId,
      email,
      papeis: (papeis.data ?? []).map((r) => r.role),
      nome: perfil.data?.nome ?? null,
      cargo: perfil.data?.cargo ?? null,
      permissoes: normalizarPermissoes(perfil.data?.permissoes),
    };
  });

/** Contador de leads novos (para o selo do menu). A RLS conta só o que a pessoa pode ver. */
export const contarLeadsNovosFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<number> => {
    const { count, error } = await context.supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("status", "novo");
    checar(error, "contar leads");
    return count ?? 0;
  });
