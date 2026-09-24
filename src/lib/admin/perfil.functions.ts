/**
 * Quem está usando o painel: id, e-mail e papéis (admin/editor).
 * A leitura de user_roles respeita RLS: cada pessoa vê apenas os próprios papéis.
 */
import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { checar } from "./erros";

export type Papel = "admin" | "editor";

export type Perfil = {
  userId: string;
  email: string | null;
  papeis: Papel[];
};

export const meuPerfilFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Perfil> => {
    const { data, error } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    checar(error, "perfil");
    const email = typeof context.claims.email === "string" ? context.claims.email : null;
    return {
      userId: context.userId,
      email,
      papeis: (data ?? []).map((r) => r.role),
    };
  });

/** Contador de leads novos (para o selo do menu). */
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
