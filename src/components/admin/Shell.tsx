/**
 * Moldura do painel: menu lateral fixo no desktop (petróleo), barra superior e gaveta
 * no celular/tablet. As coleções entram no menu sozinhas, a partir do registro.
 */
import { Link, useRouterState } from "@tanstack/react-router";
import {
  ArrowSquareOut,
  Article,
  BookOpen,
  Buildings,
  ChartLineUp,
  ChatsCircle,
  Compass,
  Files,
  GearSix,
  GraduationCap,
  Images,
  List,
  Quotes,
  SignOut,
  Stack,
  Tray,
  UserGear,
  X,
  type Icon,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { COLLECTIONS, type CollectionConfig } from "@/content/collections";
import { contarLeadsNovosFn } from "@/lib/admin/perfil.functions";
import { rotuloPapel } from "@/lib/admin/rotulos";
import { cn } from "@/lib/utils";
import { QK, useAdmin } from "./contexto";
import { EASE } from "./ui";

const ICONES_COLECAO: Record<string, Icon> = {
  curso: GraduationCap,
  mentoria: ChatsCircle,
  treinamento: Buildings,
  livro: BookOpen,
  depoimento: Quotes,
  post: Article,
};

type ItemNav = {
  chave: string;
  rotulo: string;
  icone: Icon;
  ativo: (p: string) => boolean;
  link: ReactNode | ((classe: string, conteudo: ReactNode, onClick?: () => void) => ReactNode);
  contador?: number;
};

type GrupoNav = { titulo?: string; itens: ItemNav[] };

function semBarra(p: string) {
  return p.length > 1 ? p.replace(/\/+$/, "") : p;
}

function useGrupos(novos: number): GrupoNav[] {
  const { admin } = useAdmin();
  const colecoes = Object.values(COLLECTIONS) as CollectionConfig[];
  const grupos: GrupoNav[] = [
    {
      itens: [
        {
          chave: "visao",
          rotulo: "Visão geral",
          icone: ChartLineUp,
          ativo: (p) => p === "/admin",
          link: (c, n, f) => (
            <Link to="/admin" className={c} onClick={f}>
              {n}
            </Link>
          ),
        },
        {
          chave: "leads",
          rotulo: "Leads",
          icone: Tray,
          contador: novos,
          ativo: (p) => p.startsWith("/admin/leads"),
          link: (c, n, f) => (
            <Link to="/admin/leads" className={c} onClick={f}>
              {n}
            </Link>
          ),
        },
      ],
    },
    {
      titulo: "Conteúdo",
      itens: colecoes.map((col) => ({
        chave: `col-${col.key}`,
        rotulo: col.plural,
        icone: ICONES_COLECAO[col.key] ?? Stack,
        ativo: (p: string) =>
          p === `/admin/conteudo/${col.key}` || p.startsWith(`/admin/conteudo/${col.key}/`),
        link: (c: string, n: ReactNode, f?: () => void) => (
          <Link
            to="/admin/conteudo/$colecao"
            params={{ colecao: col.key }}
            className={c}
            onClick={f}
          >
            {n}
          </Link>
        ),
      })),
    },
    {
      titulo: "Site",
      itens: [
        {
          chave: "paginas",
          rotulo: "Páginas",
          icone: Files,
          ativo: (p) =>
            p.startsWith("/admin/paginas") &&
            !p.startsWith("/admin/paginas/settings") &&
            !p.startsWith("/admin/paginas/diagnostico"),
          link: (c, n, f) => (
            <Link to="/admin/paginas" className={c} onClick={f}>
              {n}
            </Link>
          ),
        },
        {
          chave: "diagnostico",
          rotulo: "Diagnóstico",
          icone: Compass,
          ativo: (p) =>
            p.startsWith("/admin/diagnostico") || p.startsWith("/admin/paginas/diagnostico"),
          link: (c, n, f) => (
            <Link to="/admin/diagnostico" className={c} onClick={f}>
              {n}
            </Link>
          ),
        },
        {
          chave: "midia",
          rotulo: "Mídia",
          icone: Images,
          ativo: (p) => p.startsWith("/admin/midia"),
          link: (c, n, f) => (
            <Link to="/admin/midia" className={c} onClick={f}>
              {n}
            </Link>
          ),
        },
        {
          chave: "config",
          rotulo: "Configurações",
          icone: GearSix,
          ativo: (p) => p.startsWith("/admin/paginas/settings"),
          link: (c, n, f) => (
            <Link
              to="/admin/paginas/$chave"
              params={{ chave: "settings" }}
              className={c}
              onClick={f}
            >
              {n}
            </Link>
          ),
        },
      ],
    },
  ];
  if (admin) {
    grupos.push({
      titulo: "Equipe",
      itens: [
        {
          chave: "usuarios",
          rotulo: "Usuários",
          icone: UserGear,
          ativo: (p) => p.startsWith("/admin/usuarios"),
          link: (c, n, f) => (
            <Link to="/admin/usuarios" className={c} onClick={f}>
              {n}
            </Link>
          ),
        },
      ],
    });
  }
  return grupos;
}

function Assinatura() {
  return (
    <div className="flex flex-col leading-none">
      <span className="font-serif text-[1.3rem] font-[420] tracking-[-0.015em] text-gelo">
        Daniel Basso
      </span>
      <span className="mt-1 text-[0.6rem] font-medium tracking-[0.24em] text-ouro uppercase">
        Painel
      </span>
    </div>
  );
}

function ConteudoMenu({ onNavegar }: { onNavegar?: () => void }) {
  const pathname = semBarra(useRouterState({ select: (s) => s.location.pathname }));
  const perfil = useAdmin();
  const { data: novos = 0 } = useQuery({
    queryKey: QK.leadsNovos,
    queryFn: () => contarLeadsNovosFn(),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
  const grupos = useGrupos(novos);

  return (
    <div className="flex h-full flex-col">
      <nav aria-label="Painel" className="rolagem-fina flex-1 overflow-y-auto px-3 py-4">
        {grupos.map((g, gi) => (
          <div key={g.titulo ?? gi} className={cn(gi > 0 && "mt-6")}>
            {g.titulo && (
              <p className="mb-1.5 px-3 text-[0.6875rem] font-medium tracking-[0.14em] text-gelo/40 uppercase">
                {g.titulo}
              </p>
            )}
            <ul className="flex flex-col gap-0.5">
              {g.itens.map((item) => {
                const ativo = item.ativo(pathname);
                const Icone = item.icone;
                const classe = cn(
                  "group relative flex min-h-11 items-center gap-3 rounded-[2px] px-3 text-[0.9375rem] transition-colors duration-200 lg:min-h-10",
                  ativo
                    ? "bg-gelo/[0.08] text-gelo"
                    : "text-gelo/65 hover:bg-gelo/[0.04] hover:text-gelo",
                );
                const conteudo = (
                  <>
                    {ativo && (
                      <motion.span
                        layoutId={onNavegar ? "nav-ativo-movel" : "nav-ativo"}
                        aria-hidden
                        className="absolute inset-y-2 left-0 w-[2px] rounded-full bg-ouro"
                        transition={{ duration: 0.25, ease: EASE }}
                      />
                    )}
                    <Icone
                      aria-hidden
                      weight={ativo ? "fill" : "regular"}
                      className="size-[1.15rem] shrink-0"
                    />
                    <span className="min-w-0 flex-1 truncate">{item.rotulo}</span>
                    {!!item.contador && (
                      <span className="rounded-full bg-ouro px-2 py-0.5 text-[0.6875rem] font-semibold text-petroleo-950 tabular-nums">
                        <span className="sr-only">, </span>
                        {item.contador > 99 ? "99+" : item.contador}
                        <span className="sr-only"> novos</span>
                      </span>
                    )}
                  </>
                );
                return (
                  <li key={item.chave} aria-current={ativo ? "page" : undefined}>
                    {typeof item.link === "function"
                      ? item.link(classe, conteudo, onNavegar)
                      : item.link}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-gelo/10 px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="px-3 pb-2">
          <p className="truncate text-sm text-gelo/85" title={perfil.email ?? undefined}>
            {perfil.email ?? "Sessão ativa"}
          </p>
          <p className="text-xs text-gelo/45">{perfil.papeis.map(rotuloPapel).join(", ")}</p>
        </div>
        <a
          href="/"
          target="_blank"
          rel="noopener"
          className="flex min-h-11 items-center gap-3 rounded-[2px] px-3 text-[0.9375rem] text-gelo/65 transition-colors hover:bg-gelo/[0.04] hover:text-gelo lg:min-h-10"
        >
          <ArrowSquareOut aria-hidden className="size-[1.15rem]" />
          Ver site
          <span className="sr-only">(abre em nova aba)</span>
        </a>
        <button
          type="button"
          onClick={() => perfil.sair()}
          className="flex min-h-11 w-full items-center gap-3 rounded-[2px] px-3 text-left text-[0.9375rem] text-gelo/65 transition-colors hover:bg-gelo/[0.04] hover:text-gelo lg:min-h-10"
        >
          <SignOut aria-hidden className="size-[1.15rem]" />
          Sair
        </button>
      </div>
    </div>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  const [menu, setMenu] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const reduzir = useReducedMotion();

  useEffect(() => setMenu(false), [pathname]);

  return (
    <div className="min-h-dvh bg-gelo lg:pl-64">
      <a
        href="#painel-conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[var(--z-toast)] focus:rounded-full focus:bg-ouro focus:px-5 focus:py-3 focus:text-petroleo-950"
      >
        Pular para o conteúdo
      </a>

      {/* Desktop */}
      <aside className="fixed inset-y-0 left-0 z-[var(--z-header)] hidden w-64 flex-col bg-petroleo-950 lg:flex">
        <div className="flex h-16 shrink-0 items-center px-6">
          <Link to="/admin" aria-label="Painel: visão geral">
            <Assinatura />
          </Link>
        </div>
        <ConteudoMenu />
      </aside>

      {/* Celular e tablet */}
      <header className="sticky top-0 z-[var(--z-header)] flex h-14 items-center justify-between bg-petroleo-950 pr-4 pl-2 pt-[env(safe-area-inset-top)] lg:hidden">
        <button
          type="button"
          onClick={() => setMenu(true)}
          aria-label="Abrir menu do painel"
          aria-expanded={menu}
          className="inline-flex size-11 items-center justify-center rounded-full text-gelo transition-colors hover:bg-gelo/10"
        >
          <List aria-hidden className="size-6" />
        </button>
        <Link to="/admin" aria-label="Painel: visão geral">
          <Assinatura />
        </Link>
        <span className="size-11" aria-hidden />
      </header>

      <Dialog.Root open={menu} onOpenChange={setMenu}>
        <AnimatePresence>
          {menu && (
            <Dialog.Portal forceMount>
              <Dialog.Overlay asChild forceMount>
                <motion.div
                  className="fixed inset-0 z-[var(--z-overlay)] bg-petroleo-950/50 lg:hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                />
              </Dialog.Overlay>
              <Dialog.Content asChild forceMount aria-describedby={undefined}>
                <motion.div
                  className="fixed inset-y-0 left-0 z-[var(--z-overlay)] flex w-[min(20rem,86vw)] flex-col bg-petroleo-950 pt-[env(safe-area-inset-top)] focus:outline-none lg:hidden"
                  initial={reduzir ? { opacity: 0 } : { x: "-100%" }}
                  animate={reduzir ? { opacity: 1 } : { x: 0 }}
                  exit={reduzir ? { opacity: 0 } : { x: "-100%" }}
                  transition={{ duration: 0.3, ease: EASE }}
                >
                  <Dialog.Title className="sr-only">Menu do painel</Dialog.Title>
                  <div className="flex h-14 shrink-0 items-center justify-between pr-2 pl-6">
                    <Assinatura />
                    <Dialog.Close
                      aria-label="Fechar menu"
                      className="inline-flex size-11 items-center justify-center rounded-full text-gelo transition-colors hover:bg-gelo/10"
                    >
                      <X aria-hidden className="size-5" />
                    </Dialog.Close>
                  </div>
                  <ConteudoMenu onNavegar={() => setMenu(false)} />
                </motion.div>
              </Dialog.Content>
            </Dialog.Portal>
          )}
        </AnimatePresence>
      </Dialog.Root>

      <main
        id="painel-conteudo"
        className="mx-auto w-full max-w-[84rem] px-4 pt-6 pb-24 md:px-8 md:pt-10"
      >
        {children}
      </main>
    </div>
  );
}
