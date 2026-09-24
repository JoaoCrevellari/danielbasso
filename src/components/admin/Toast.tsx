/**
 * Avisos discretos do painel (sucesso, erro, informação), com entrada e saída em motion.
 * Ficam numa região aria-live; erros usam role="alert".
 */
import { CheckCircle, Info, WarningCircle, X } from "@phosphor-icons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils";
import { EASE } from "./ui";

type Tipo = "sucesso" | "erro" | "info";
type AcaoToast = { rotulo: string; onClick: () => void };
type Aviso = { id: number; tipo: Tipo; texto: string; acao?: AcaoToast };

type Api = {
  sucesso: (texto: string, acao?: AcaoToast) => void;
  erro: (texto: string) => void;
  info: (texto: string, acao?: AcaoToast) => void;
};

const Ctx = createContext<Api | null>(null);

export function useToast(): Api {
  const api = useContext(Ctx);
  if (!api) throw new Error("useToast fora do ToastProvider");
  return api;
}

const ICONES = { sucesso: CheckCircle, erro: WarningCircle, info: Info };

export function ToastProvider({ children }: { children: ReactNode }) {
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const seq = useRef(0);
  const reduzir = useReducedMotion();

  const fechar = useCallback((id: number) => setAvisos((a) => a.filter((x) => x.id !== id)), []);

  const mostrar = useCallback(
    (tipo: Tipo, texto: string, acao?: AcaoToast) => {
      const id = ++seq.current;
      setAvisos((a) => [...a.slice(-2), { id, tipo, texto, acao }]);
      window.setTimeout(() => fechar(id), tipo === "erro" ? 7000 : acao ? 6000 : 3800);
    },
    [fechar],
  );

  const api = useMemo<Api>(
    () => ({
      sucesso: (t, a) => mostrar("sucesso", t, a),
      erro: (t) => mostrar("erro", t),
      info: (t, a) => mostrar("info", t, a),
    }),
    [mostrar],
  );

  return (
    <Ctx.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[var(--z-toast)] flex flex-col items-center gap-2 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:items-end md:px-6 md:pb-6"
      >
        <AnimatePresence initial={false}>
          {avisos.map((a) => {
            const Icone = ICONES[a.tipo];
            return (
              <motion.div
                key={a.id}
                layout={!reduzir}
                role={a.tipo === "erro" ? "alert" : "status"}
                initial={reduzir ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={
                  reduzir
                    ? { opacity: 0 }
                    : { opacity: 0, y: 8, scale: 0.97, transition: { duration: 0.15 } }
                }
                transition={{ duration: 0.28, ease: EASE }}
                className={cn(
                  "pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-[2px] py-2.5 pr-2 pl-4 text-sm shadow-[0_12px_32px_-12px_rgb(0_20_30/0.45)]",
                  a.tipo === "erro" ? "bg-[#5a2e14] text-gelo" : "bg-petroleo-950 text-gelo",
                )}
              >
                <Icone
                  aria-hidden
                  weight="fill"
                  className={cn(
                    "size-5 shrink-0",
                    a.tipo === "sucesso" && "text-salvia",
                    a.tipo === "erro" && "text-terracota",
                    a.tipo === "info" && "text-ouro",
                  )}
                />
                <p className="min-w-0 flex-1 py-1 leading-snug">{a.texto}</p>
                {a.acao && (
                  <button
                    type="button"
                    onClick={() => {
                      a.acao!.onClick();
                      fechar(a.id);
                    }}
                    className="min-h-9 shrink-0 rounded-full px-3 font-medium text-ouro transition-colors hover:bg-gelo/10"
                  >
                    {a.acao.rotulo}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => fechar(a.id)}
                  aria-label="Fechar aviso"
                  className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-gelo/60 transition-colors hover:bg-gelo/10 hover:text-gelo"
                >
                  <X aria-hidden className="size-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  );
}
