import { ArrowUpRight } from "@phosphor-icons/react";
import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";
import { Imagem } from "./Imagem";

export type Instituicao = { nome: string; escopo?: string; logo?: string };
export type Materia = { veiculo?: string; data?: string; titulo: string; link?: string };

/** Posição de cada logo na sequência do destaque (só as instituições com logo contam). */
function ordemDasLogos(lista: Instituicao[]) {
  const comLogo = lista.filter((i) => i.logo);
  return (inst: Instituicao) =>
    inst.logo ? { i: comLogo.indexOf(inst), total: comLogo.length } : undefined;
}

/** Nome ou logo, no mesmo lugar: sem logo, o nome aparece escrito em serifa. */
function Marca({
  inst,
  className,
  ordem,
}: {
  inst: Instituicao;
  className?: string;
  /** Posição e total, para o destaque que passa de logo em logo nas telas de toque. */
  ordem?: { i: number; total: number };
}) {
  if (inst.logo) {
    return (
      <Imagem
        style={
          ordem
            ? ({ "--i": ordem.i, "--total": ordem.total } as CSSProperties)
            : undefined
        }
        src={inst.logo}
        alt={inst.nome}
        className={cn("h-12 w-full max-w-[11rem] bg-transparent md:h-14", className)}
        // Em tons de cinza para as logos terem o mesmo peso; a cor volta no hover (desktop).
        imgClassName="logo-ciclo object-contain object-left grayscale opacity-80 transition-[filter,opacity] duration-300 group-hover:grayscale-0 group-hover:opacity-100"
        sizes="11rem"
        larguraMax={480}
      />
    );
  }
  return (
    <span className={cn("font-serif text-[1.2rem] leading-snug text-petroleo", className)}>
      {inst.nome}
    </span>
  );
}

/**
 * Faixa da Início: as instituições em grade com fios finos, como uma lista de clientes.
 * Logos entram no lugar do nome quando houver (com autorização de cada instituição).
 */
export function FaixaInstituicoes({ itens }: { itens: Instituicao[] }) {
  const lista = itens.filter((i) => i.nome);
  if (!lista.length) return null;
  const ordem = ordemDasLogos(lista);
  return (
    <ul
      className={cn(
        "grid grid-cols-2 border-t border-l border-linha md:grid-cols-3",
        // Com 4 ou 5 instituições, uma linha só no desktop (sem célula vazia no fim da grade).
        lista.length === 4 && "lg:grid-cols-4",
        lista.length === 5 && "lg:grid-cols-5",
      )}
      data-revelar-grupo
    >
      {lista.map((inst) => (
        <li
          key={inst.nome}
          className="group flex min-h-[6.5rem] items-center border-r border-b border-linha px-4 py-5 transition-colors duration-300 hover:bg-papel md:min-h-[7.5rem] md:px-7"
        >
          {inst.logo ? (
            <Marca inst={inst} ordem={ordem(inst)} />
          ) : (
            <span className="flex items-start gap-3">
              <span
                aria-hidden
                className="mt-[0.7rem] h-px w-4 shrink-0 bg-ouro transition-[width] duration-300 group-hover:w-6"
              />
              <Marca inst={inst} className="text-[1.02rem] md:text-[1.2rem]" />
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}

/** Página Instituições: um cartão por instituição, com o escopo do trabalho. */
export function CartoesInstituicoes({
  itens,
  trilho,
}: {
  itens: Instituicao[];
  /** No celular, cartões lado a lado com rolagem (a seção cabe numa tela). */
  trilho?: boolean;
}) {
  const lista = itens.filter((i) => i.nome);
  if (!lista.length) return null;
  const ordem = ordemDasLogos(lista);
  return (
    <ul
      className={cn(
        "gap-4 md:grid md:grid-cols-2 md:gap-5 lg:grid-cols-3",
        trilho ? "trilho" : "grid sm:grid-cols-2",
      )}
      data-revelar-grupo
    >
      {lista.map((inst, n) => (
        <li
          key={inst.nome}
          className="group flex flex-col rounded-[2px] border border-linha bg-papel p-6 transition-colors duration-300 hover:border-petroleo/50 md:p-7"
        >
          {/* Número e logo (ou nome) na mesma linha, com altura fixa: todos os cartões alinham. */}
          <div className="flex h-14 items-center gap-5">
            <span className="type-numeral shrink-0 text-[1.6rem] leading-none text-ouro-texto">
              {String(n + 1).padStart(2, "0")}
            </span>
            <span aria-hidden className="h-8 w-px shrink-0 bg-linha" />
            <Marca inst={inst} className="min-w-0" ordem={ordem(inst)} />
          </div>
          {inst.escopo && (
            <p className="mt-5 border-t border-linha pt-4 text-[0.95rem] leading-relaxed text-cinza">
              {inst.escopo}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}

/** "Na imprensa": veículo e data em cima, título da matéria como link externo. */
export function NaImprensa({ itens, escuro }: { itens: Materia[]; escuro?: boolean }) {
  const lista = itens.filter((m) => m.titulo);
  if (!lista.length) return null;
  return (
    <ul
      className={cn("flex flex-col border-t", escuro ? "border-linha-escura" : "border-linha")}
      data-revelar-grupo
    >
      {lista.map((m) => {
        const conteudo = (
          <>
            <span className="flex min-w-0 flex-col gap-1.5">
              <span className={cn("type-meta", escuro ? "text-gelo/55" : "text-cinza")}>
                {[m.veiculo, m.data].filter(Boolean).join(" · ")}
              </span>
              <span
                className={cn(
                  "font-serif text-[1.15rem] leading-snug md:text-[1.3rem]",
                  escuro ? "text-gelo" : "text-petroleo",
                )}
              >
                {m.titulo}
              </span>
            </span>
            {m.link && (
              <ArrowUpRight
                aria-hidden
                className={cn(
                  "size-5 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5",
                  escuro ? "text-ouro-claro" : "text-ouro-texto",
                )}
              />
            )}
          </>
        );
        const classe = cn(
          "group flex items-start justify-between gap-6 border-b py-5 md:py-6",
          escuro ? "border-linha-escura" : "border-linha",
        );
        return (
          <li key={m.titulo}>
            {m.link ? (
              <a
                href={m.link}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  classe,
                  "rounded-[2px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ouro",
                )}
              >
                {conteudo}
              </a>
            ) : (
              <div className={classe}>{conteudo}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
