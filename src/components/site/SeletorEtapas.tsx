import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useId, useState, type ReactNode } from "react";

import type { Etapa } from "@/content/paginas/metodo";
import type { ItemConteudo } from "@/lib/conteudo";
import { cn } from "@/lib/utils";
import { Botao } from "./Botao";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * As cinco etapas do método como abas: lista à esquerda (ou chips no celular) e o
 * detalhe da etapa escolhida à direita. Setas do teclado navegam entre as abas.
 */
export function SeletorEtapas({
  etapas,
  ofertaDe,
  cabecalho,
}: {
  etapas: Etapa[];
  ofertaDe: (chave: string) => ItemConteudo | undefined;
  /** Título da seção, exibido acima das abas (coluna da esquerda no desktop). */
  cabecalho?: ReactNode;
}) {
  const [ativa, setAtiva] = useState(0);
  const reduzir = useReducedMotion();
  const base = useId();
  const e = etapas[ativa];
  const oferta = e ? ofertaDe(e.chave) : undefined;

  const aoTeclar = (ev: React.KeyboardEvent) => {
    if (
      ev.key !== "ArrowDown" &&
      ev.key !== "ArrowRight" &&
      ev.key !== "ArrowUp" &&
      ev.key !== "ArrowLeft"
    )
      return;
    ev.preventDefault();
    const dir = ev.key === "ArrowDown" || ev.key === "ArrowRight" ? 1 : -1;
    const prox = (ativa + dir + etapas.length) % etapas.length;
    setAtiva(prox);
    document.getElementById(`${base}-aba-${prox}`)?.focus();
  };

  if (!e) return null;

  return (
    <div className="grade gap-y-6" data-revelar>
      <div className="col-span-12 lg:col-span-4">
        {cabecalho}
        <div
          role="tablist"
          aria-label="Etapas do método"
          aria-orientation="vertical"
          onKeyDown={aoTeclar}
          className="sem-barra -mx-[var(--gutter)] mt-6 flex gap-2 overflow-x-auto px-[var(--gutter)] lg:mx-0 lg:mt-8 lg:flex-col lg:gap-0 lg:overflow-visible lg:border-t lg:border-linha lg:px-0"
        >
          {etapas.map((et, n) => {
            const sel = n === ativa;
            return (
              <button
                key={et.chave + n}
                id={`${base}-aba-${n}`}
                role="tab"
                type="button"
                aria-selected={sel}
                aria-controls={`${base}-painel`}
                tabIndex={sel ? 0 : -1}
                onClick={() => setAtiva(n)}
                className={cn(
                  "group relative flex shrink-0 items-center gap-3 rounded-full border px-4 py-2.5 text-left transition-colors duration-300 lg:rounded-none lg:border-0 lg:border-b lg:border-linha lg:px-0 lg:py-3.5",
                  sel
                    ? "border-petroleo bg-petroleo text-gelo lg:bg-transparent lg:text-petroleo"
                    : "border-linha-forte text-petroleo lg:text-cinza lg:hover:text-petroleo",
                )}
              >
                <span
                  className={cn(
                    "type-numeral text-[1rem] lg:w-8 lg:text-[1.4rem]",
                    sel ? "text-ouro lg:text-ouro-texto" : "text-ouro-texto/70",
                  )}
                >
                  {n + 1}
                </span>
                <span className="font-serif text-[1rem] whitespace-nowrap lg:text-[1.4rem] lg:leading-tight">
                  {et.nome}
                </span>
                {sel && (
                  <motion.span
                    layoutId={`${base}-marca`}
                    aria-hidden
                    className="absolute -bottom-px left-0 hidden h-[2px] w-full bg-ouro lg:block"
                    transition={{ duration: reduzir ? 0 : 0.45, ease: EASE }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="col-span-12 lg:col-span-7 lg:col-start-6">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={ativa}
            id={`${base}-painel`}
            role="tabpanel"
            aria-labelledby={`${base}-aba-${ativa}`}
            initial={reduzir ? { opacity: 0 } : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduzir ? { opacity: 0 } : { opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="rounded-[2px] border border-linha bg-papel p-5 md:p-8"
          >
            <p className="type-meta text-cinza max-md:hidden">{`Etapa ${ativa + 1} de ${etapas.length}`}</p>
            <h3 className="type-h1 mt-1 text-petroleo">{e.nome}</h3>
            <p className="mt-2 font-serif text-[1.05rem] leading-snug text-ouro-texto italic md:text-[1.15rem]">
              {e.pergunta}
            </p>
            <p className="mt-3 text-[0.95rem] leading-relaxed text-grafite md:mt-4 md:text-base">
              {e.descricao}
            </p>
            <div className="mt-5 grid gap-6 border-t border-linha pt-4 sm:grid-cols-2 md:mt-6 md:pt-5">
              {[
                { titulo: "Práticas", itens: e.praticas },
                { titulo: "É o seu momento se", itens: e.sinais, soDesktop: true },
              ]
                .filter((b) => b.itens.length)
                .map((b) => (
                  <div key={b.titulo} className={b.soDesktop ? "max-sm:hidden" : undefined}>
                    <h4 className="type-eyebrow text-cinza">{b.titulo}</h4>
                    <ul className="mt-3 flex flex-col gap-2.5 text-[0.95rem] text-grafite">
                      {b.itens.map((t) => (
                        <li key={t} className="flex gap-3">
                          <span aria-hidden className="mt-[0.7em] h-px w-3.5 shrink-0 bg-ouro" />
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
            </div>
            {oferta && (
              <Botao
                href={`/${oferta.collection === "curso" ? "cursos" : "mentorias"}/${oferta.slug}`}
                variante="texto"
                className="mt-6"
              >
                {`Para esta etapa: ${oferta.title}`}
              </Botao>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
