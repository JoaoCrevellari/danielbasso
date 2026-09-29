import { createContext, useContext, type ReactNode } from "react";
import { Lock } from "@phosphor-icons/react";

import type { Perfil } from "@/lib/admin/perfil.functions";
import type { Acao, Modulo } from "@/lib/admin/permissoes";

export type AdminCtx = Perfil & {
  admin: boolean;
  /** Mesma regra da função public.pode do banco (a RLS confere de novo). */
  pode: (modulo: Modulo, acao?: Acao) => boolean;
  sair: () => Promise<void>;
};

const Ctx = createContext<AdminCtx | null>(null);

export const AdminProvider = Ctx.Provider;

export function useAdmin(): AdminCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAdmin fora do layout /admin");
  return v;
}

/** Mostra o conteúdo só para quem pode ver o módulo; senão, um aviso discreto. */
export function ExigePermissao({ modulo, children }: { modulo: Modulo; children: ReactNode }) {
  const { pode } = useAdmin();
  if (pode(modulo, "ver")) return <>{children}</>;
  return (
    <div className="flex min-h-[50dvh] items-center justify-center px-4">
      <div className="max-w-sm text-center">
        <span className="mx-auto inline-flex size-12 items-center justify-center rounded-full bg-petroleo-50 text-petroleo">
          <Lock aria-hidden className="size-5" />
        </span>
        <p className="mt-4 font-serif text-2xl text-petroleo">Sem acesso a esta área</p>
        <p className="mt-2 text-sm text-cinza">
          Peça a um administrador para liberar este módulo para você.
        </p>
      </div>
    </div>
  );
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
  lps: ["admin", "lps"] as const,
  lp: (id: string) => ["admin", "lp", id] as const,
};
