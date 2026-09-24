import * as Dialog from "@radix-ui/react-dialog";
import { Link } from "@tanstack/react-router";
import { ArrowRight, X } from "@phosphor-icons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { Botao } from "@/components/site/Botao";
import { NAV_PRINCIPAL, NAV_SECUNDARIA } from "@/lib/site";
import { Logo } from "./Logo";
import { RedesSociais } from "./RedesSociais";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Menu de tela cheia (celular e tablet). Radix Dialog cuida do foco, do Esc e do
 * bloqueio de rolagem; o motion cuida da entrada e da saída em cascata.
 */
export function MenuMovel({ aberto, onFechar }: { aberto: boolean; onFechar: () => void }) {
  const reduzir = useReducedMotion();
  const itens = [...NAV_PRINCIPAL, ...NAV_SECUNDARIA.filter((i) => i.to !== "/diagnostico")];

  return (
    <Dialog.Root open={aberto} onOpenChange={(v) => !v && onFechar()}>
      <AnimatePresence>
        {aberto && (
          <Dialog.Portal forceMount>
            <Dialog.Content asChild forceMount aria-describedby={undefined}>
              <motion.div
                className="superficie-escura grao fixed inset-0 z-[var(--z-overlay)] flex flex-col overflow-y-auto"
                initial={reduzir ? { opacity: 0 } : { clipPath: "inset(0 0 100% 0)" }}
                animate={reduzir ? { opacity: 1 } : { clipPath: "inset(0 0 0% 0)" }}
                exit={reduzir ? { opacity: 0 } : { clipPath: "inset(0 0 100% 0)" }}
                transition={{ duration: 0.55, ease: EASE }}
              >
                <Dialog.Title className="sr-only">Menu</Dialog.Title>
                <div className="container-site flex h-[var(--header-h)] shrink-0 items-center justify-between">
                  <Logo claro />
                  <Dialog.Close
                    aria-label="Fechar menu"
                    className="-mr-2 inline-flex size-12 items-center justify-center rounded-full text-gelo transition-colors hover:bg-gelo/10"
                  >
                    <X className="size-6" weight="light" />
                  </Dialog.Close>
                </div>

                <nav aria-label="Menu" className="container-site flex-1 pt-6 pb-10">
                  <ul className="flex flex-col">
                    {itens.map((item, i) => (
                      <motion.li
                        key={item.to}
                        initial={reduzir ? false : { opacity: 0, y: 22 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={
                          reduzir
                            ? undefined
                            : { opacity: 0, y: 10, transition: { duration: 0.15 } }
                        }
                        transition={{ duration: 0.6, delay: 0.12 + i * 0.045, ease: EASE }}
                        className="border-b border-linha"
                      >
                        <Link
                          to={item.to}
                          onClick={onFechar}
                          className="group flex items-baseline justify-between py-3.5 font-serif text-[1.9rem] leading-tight text-gelo/90 transition-colors hover:text-gelo data-[status=active]:text-ouro"
                        >
                          {item.label}
                          <ArrowRight
                            aria-hidden
                            weight="light"
                            className="size-5 -translate-x-2 text-ouro opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 group-data-[status=active]:translate-x-0 group-data-[status=active]:opacity-100"
                          />
                        </Link>
                      </motion.li>
                    ))}
                  </ul>

                  <motion.div
                    initial={reduzir ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="mt-10 flex flex-col gap-6"
                  >
                    <Botao
                      href="/diagnostico"
                      variante="ouro"
                      className="w-full sm:w-auto"
                      onClick={onFechar}
                    >
                      Fazer o diagnóstico
                    </Botao>
                    <RedesSociais claro />
                  </motion.div>
                </nav>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
