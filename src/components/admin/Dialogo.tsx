/**
 * Gaveta lateral, modal e confirmação. Radix Dialog cuida de foco, Esc e bloqueio de
 * rolagem; o motion cuida da entrada e da saída (e respeita reduced-motion).
 */
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "@phosphor-icons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";
import { EASE, acao, acaoIcone } from "./ui";

function Fundo() {
  return (
    <Dialog.Overlay asChild forceMount>
      <motion.div
        className="fixed inset-0 z-[var(--z-overlay)] bg-petroleo-950/45 backdrop-blur-[2px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      />
    </Dialog.Overlay>
  );
}

export function Gaveta({
  aberto,
  onFechar,
  titulo,
  descricao,
  lado = "direita",
  className,
  rodape,
  children,
  escura,
}: {
  aberto: boolean;
  onFechar: () => void;
  titulo: ReactNode;
  descricao?: ReactNode;
  lado?: "direita" | "esquerda";
  className?: string;
  rodape?: ReactNode;
  children: ReactNode;
  /** Sem cabeçalho padrão (o conteúdo desenha o próprio). */
  escura?: boolean;
}) {
  const reduzir = useReducedMotion();
  const fora = lado === "direita" ? "100%" : "-100%";
  return (
    <Dialog.Root open={aberto} onOpenChange={(v) => !v && onFechar()}>
      <AnimatePresence>
        {aberto && (
          <Dialog.Portal forceMount>
            <Fundo />
            <Dialog.Content
              asChild
              forceMount
              {...(descricao && !escura ? {} : { "aria-describedby": undefined })}
            >
              <motion.div
                className={cn(
                  "fixed inset-y-0 z-[var(--z-overlay)] flex w-full flex-col shadow-[0_0_60px_-20px_rgb(0_20_30/0.5)] focus:outline-none",
                  lado === "direita" ? "right-0 max-w-xl" : "left-0 max-w-[20rem]",
                  escura ? "bg-petroleo-950 text-gelo" : "bg-gelo",
                  className,
                )}
                initial={reduzir ? { opacity: 0 } : { x: fora }}
                animate={reduzir ? { opacity: 1 } : { x: 0 }}
                exit={reduzir ? { opacity: 0 } : { x: fora }}
                transition={{ duration: 0.3, ease: EASE }}
              >
                {escura ? (
                  <Dialog.Title className="sr-only">{titulo}</Dialog.Title>
                ) : (
                  <div className="flex shrink-0 items-start justify-between gap-4 border-b border-linha bg-papel px-5 py-4 md:px-6">
                    <div className="min-w-0">
                      <Dialog.Title className="font-serif text-xl leading-tight text-petroleo">
                        {titulo}
                      </Dialog.Title>
                      {descricao && (
                        <Dialog.Description className="mt-1 text-sm text-cinza">
                          {descricao}
                        </Dialog.Description>
                      )}
                    </div>
                    <Dialog.Close aria-label="Fechar" className={acaoIcone(false, "-mr-2 -mt-1")}>
                      <X aria-hidden className="size-5" />
                    </Dialog.Close>
                  </div>
                )}
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
                {rodape && (
                  <div className="shrink-0 border-t border-linha bg-papel px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:px-6">
                    {rodape}
                  </div>
                )}
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}

export function Modal({
  aberto,
  onFechar,
  titulo,
  descricao,
  children,
  rodape,
  largura = "max-w-lg",
}: {
  aberto: boolean;
  onFechar: () => void;
  titulo: ReactNode;
  descricao?: ReactNode;
  children: ReactNode;
  rodape?: ReactNode;
  largura?: string;
}) {
  const reduzir = useReducedMotion();
  return (
    <Dialog.Root open={aberto} onOpenChange={(v) => !v && onFechar()}>
      <AnimatePresence>
        {aberto && (
          <Dialog.Portal forceMount>
            <Fundo />
            <div className="pointer-events-none fixed inset-0 z-[var(--z-overlay)] flex items-end justify-center sm:items-center sm:p-6">
              <Dialog.Content
                asChild
                forceMount
                {...(descricao ? {} : { "aria-describedby": undefined })}
              >
                <motion.div
                  className={cn(
                    "pointer-events-auto flex max-h-[92dvh] w-full flex-col rounded-t-[10px] bg-gelo shadow-[0_24px_60px_-20px_rgb(0_20_30/0.55)] focus:outline-none sm:rounded-[2px]",
                    largura,
                  )}
                  initial={reduzir ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={
                    reduzir
                      ? { opacity: 0 }
                      : { opacity: 0, y: 16, scale: 0.98, transition: { duration: 0.15 } }
                  }
                  transition={{ duration: 0.26, ease: EASE }}
                >
                  <div className="flex shrink-0 items-start justify-between gap-4 px-5 pt-5 md:px-6">
                    <div className="min-w-0">
                      <Dialog.Title className="font-serif text-xl leading-tight text-petroleo">
                        {titulo}
                      </Dialog.Title>
                      {descricao && (
                        <Dialog.Description className="mt-1.5 text-sm text-cinza">
                          {descricao}
                        </Dialog.Description>
                      )}
                    </div>
                    <Dialog.Close aria-label="Fechar" className={acaoIcone(false, "-mr-2 -mt-2")}>
                      <X aria-hidden className="size-5" />
                    </Dialog.Close>
                  </div>
                  <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 md:px-6">{children}</div>
                  {rodape && (
                    <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-linha px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:flex-row sm:justify-end md:px-6">
                      {rodape}
                    </div>
                  )}
                </motion.div>
              </Dialog.Content>
            </div>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}

// ── Confirmação ────────────────────────────────────────────────────────────────
type OpcoesConfirmar = {
  titulo: string;
  descricao?: ReactNode;
  confirmar?: string;
  cancelar?: string;
  perigo?: boolean;
};

const ConfirmarCtx = createContext<((o: OpcoesConfirmar) => Promise<boolean>) | null>(null);

/** `const confirmar = useConfirmar(); if (await confirmar({...})) …` */
export function useConfirmar() {
  const fn = useContext(ConfirmarCtx);
  if (!fn) throw new Error("useConfirmar fora do ConfirmarProvider");
  return fn;
}

export function ConfirmarProvider({ children }: { children: ReactNode }) {
  const [opcoes, setOpcoes] = useState<OpcoesConfirmar | null>(null);
  const resolver = useRef<((v: boolean) => void) | null>(null);

  const confirmar = useCallback((o: OpcoesConfirmar) => {
    resolver.current?.(false);
    setOpcoes(o);
    return new Promise<boolean>((ok) => {
      resolver.current = ok;
    });
  }, []);

  const responder = (v: boolean) => {
    resolver.current?.(v);
    resolver.current = null;
    setOpcoes(null);
  };

  return (
    <ConfirmarCtx.Provider value={confirmar}>
      {children}
      <Modal
        aberto={!!opcoes}
        onFechar={() => responder(false)}
        titulo={opcoes?.titulo ?? ""}
        largura="max-w-md"
        rodape={
          <>
            <button type="button" className={acao("secundario")} onClick={() => responder(false)}>
              {opcoes?.cancelar ?? "Cancelar"}
            </button>
            <button
              type="button"
              autoFocus
              className={acao(opcoes?.perigo ? "perigo" : "primario")}
              onClick={() => responder(true)}
            >
              {opcoes?.confirmar ?? "Confirmar"}
            </button>
          </>
        }
      >
        {opcoes?.descricao && (
          <div className="text-[0.9375rem] text-grafite">{opcoes.descricao}</div>
        )}
      </Modal>
    </ConfirmarCtx.Provider>
  );
}
