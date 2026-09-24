import { createContext, useContext } from "react";

import type { Perfil } from "@/lib/admin/perfil.functions";

export type AdminCtx = Perfil & {
  admin: boolean;
  sair: () => Promise<void>;
};

const Ctx = createContext<AdminCtx | null>(null);

export const AdminProvider = Ctx.Provider;

export function useAdmin(): AdminCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAdmin fora do layout /admin");
  return v;
}

/** Chaves do React Query do painel (um lugar só, para invalidar sem erro de digitação). */
export const QK = {
  perfil: ["admin", "perfil"] as const,
  leadsNovos: ["admin", "leads-novos"] as const,
  leads: ["admin", "leads"] as const,
  visaoGeral: ["admin", "visao-geral"] as const,
  itens: (colecao: string) => ["admin", "itens", colecao] as const,
  item: (id: string) => ["admin", "item", id] as const,
  contagemItens: ["admin", "contagem-itens"] as const,
  paginas: ["admin", "paginas"] as const,
  pagina: (key: string) => ["admin", "pagina", key] as const,
  midia: ["admin", "midia"] as const,
  usuarios: ["admin", "usuarios"] as const,
  diagnostico: ["admin", "diagnostico"] as const,
};
