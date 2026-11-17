import { ArrowRight } from "@phosphor-icons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useId, useState, type ReactNode } from "react";

import { nomeEtapa } from "@/content/fields";
import { cn } from "@/lib/utils";
import { Botao } from "./Botao";
import { LinkInterno } from "./LinkInterno";

const EASE = [0.16, 1, 0.3, 1] as const;

export type Nivel = {
  etapa: string;
  produto: string;
  para_quem: string;
  rotulo_falas: string;
  falas: string;
  compra: string;
  entrega: string;
  link: string;
};

const linhas = (t: string) =>
  t
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);

/**
 * Os níveis do Daniel (do Diagnóstico ao Mastermind) como abas: lista à esquerda (chips
 * no celular) e o detalhe do nível escolhido à direita, com o "Saiba mais" que leva à
 * página do produto, onde fica a lista de interesse. Mesmo padrão do SeletorEtapas.
 */
export function SeletorNiveis({ niveis, cabecalho }: { niveis: Nivel[]; cabecalho?: ReactNode }) {
  const lista = niveis.filter((n) => n.produto);
  const [ativo, setAtivo] = useState(0);
  const reduzir = useReducedMotion();
  const base = useId();
  const nv = lista[ativo];

  const aoTeclar = (ev: React.KeyboardEvent) => {
    const dir =
      ev.key === "ArrowDown" || ev.key === "ArrowRight"
        ? 1
        : ev.key === "ArrowUp" || ev.key === "ArrowLeft"
          ? -1
          : 0;
    if (!dir) return;
    ev.preventDefault();
    const prox = (ativo + dir + lista.length) % lista.length;
    setAtivo(prox);
    document.getElementById(`${base}-aba-${prox}`)?.focus();
  };

  if (!nv) return null;
  const falas = linhas(nv.falas);

  return (
    <div className="grade gap-y-6" data-revelar>
      <div className="col-span-12 lg:col-span-4">
        {cabecalho}
        <div
          role="tablist"
          aria-label="Níveis"
          aria-orientation="vertical"
          onKeyDown={aoTeclar}
          className="sem-barra -mx-[var(--gutter)] mt-6 flex gap-2 overflow-x-auto px-[var(--gutter)] lg:mx-0 lg:mt-6 lg:flex-col lg:gap-0 lg:overflow-visible lg:border-t lg:border-linha lg:px-0"
        >
          {lista.map((n, k) => {
            const sel = k === ativo;
            return (
              <button
                key={n.produto + k}
                id={`${base}-aba-${k}`}
                role="tab"
                type="button"
                aria-selected={sel}
                aria-controls={`${base}-painel`}
                tabIndex={sel ? 0 : -1}
                onClick={() => setAtivo(k)}
                className={cn(
                  "group relative flex min-h-11 shrink-0 items-center gap-3 rounded-full border px-4 py-2.5 text-left transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ouro lg:rounded-none lg:border-0 lg:border-b lg:border-linha lg:px-0 lg:py-2",
                  sel
                    ? "border-petroleo bg-petroleo text-gelo lg:bg-transparent lg:text-petroleo"
                    : "border-linha-forte text-petroleo lg:text-cinza lg:hover:text-petroleo",
                )}
              >
                <span
                  className={cn(
                    "type-numeral text-[1rem] lg:w-8 lg:text-[1.3rem]",
                    sel ? "text-ouro lg:text-ouro-texto" : "text-ouro-texto/70",
                  )}
                >
                  {k + 1}
                </span>
                <span className="flex flex-col">
                  <span className="font-serif text-[1rem] whitespace-nowrap lg:text-[1.25rem] lg:leading-tight">
                    {n.produto}
                  </span>
                  <span className="type-meta mt-0.5 text-cinza max-lg:hidden">
                    {nomeEtapa(n.etapa) ?? n.etapa}
                  </span>
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
            key={ativo}
            id={`${base}-painel`}
            role="tabpanel"
            aria-labelledby={`${base}-aba-${ativo}`}
            initial={reduzir ? { opacity: 0 } : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduzir ? { opacity: 0 } : { opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="rounded-[2px] border border-linha bg-papel p-5 md:p-8"
          >
            <p className="type-meta text-cinza">
              {`Nível ${ativo + 1} · ${nomeEtapa(nv.etapa) ?? nv.etapa}`}
            </p>
            <h3 className="type-h1 mt-1 text-petroleo">{nv.produto}</h3>
            {nv.para_quem && (
              <p className="mt-3 text-[0.95rem] leading-relaxed text-grafite md:text-base">
                <span className="font-medium text-petroleo">Para quem é: </span>
                {nv.para_quem}
              </p>
            )}
            {falas.length > 0 && (
              <figure className="mt-4 border-l-2 border-ouro pl-4 max-sm:hidden">
                {nv.rotulo_falas && (
                  <figcaption className="type-eyebrow text-cinza">{nv.rotulo_falas}</figcaption>
                )}
                <blockquote className="mt-1.5 font-serif text-[1.1rem] leading-snug text-petroleo italic md:text-[1.2rem]">
                  {falas.map((f) => (
                    <span key={f} className="block">
                      {`“${f}”`}
                    </span>
                  ))}
                </blockquote>
              </figure>
            )}
            <dl className="mt-5 grid gap-5 border-t border-linha pt-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:mt-6 md:pt-5">
              <div>
                <dt className="type-eyebrow text-cinza">O que você compra</dt>
                <dd className="mt-1.5 font-serif text-[1.4rem] leading-tight text-ouro-texto md:text-[1.6rem]">
                  {nv.compra}
                </dd>
              </div>
              <div>
                <dt className="type-eyebrow text-cinza">O que você recebe</dt>
                <dd className="mt-1.5 text-[0.95rem] leading-relaxed text-grafite">{nv.entrega}</dd>
              </div>
            </dl>
            {nv.link && (
              <Botao href={nv.link} className="mt-6">
                Saiba mais
              </Botao>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/**
 * Versão curta para a Início: os níveis numa linha (trilho no celular), cada um com o
 * que a pessoa compra, levando direto à página do produto.
 */
export function NiveisResumo({ niveis }: { niveis: Nivel[] }) {
  const lista = niveis.filter((n) => n.produto);
  if (!lista.length) return null;
  return (
    <ol className="trilho mt-conteudo md:grid md:grid-cols-3 md:gap-4 lg:grid-cols-6" data-revelar-grupo>
      {lista.map((n, k) => (
        <li key={n.produto + k}>
          <LinkInterno
            to={n.link}
            className="group flex h-full flex-col rounded-[2px] border border-linha bg-papel p-5 transition-[border-color,transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-linha-forte hover:shadow-[0_18px_36px_-28px_rgb(0_31_46/0.5)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ouro"
          >
            <span className="type-meta text-cinza">{`Nível ${k + 1}`}</span>
            <span className="mt-2 font-serif text-[1.15rem] leading-snug text-petroleo">
              {n.produto}
            </span>
            <span className="mt-auto pt-5 type-eyebrow text-cinza">Você compra</span>
            <span className="mt-1 flex items-end justify-between gap-3 font-serif text-[1.05rem] leading-snug text-ouro-texto">
              {n.compra}
              <ArrowRight
                aria-hidden
                className="mb-1 size-4 shrink-0 text-petroleo transition-transform duration-300 group-hover:translate-x-1"
              />
            </span>
          </LinkInterno>
        </li>
      ))}
    </ol>
  );
}
