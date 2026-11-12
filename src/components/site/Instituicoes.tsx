import { ArrowUpRight } from "@phosphor-icons/react";

import { cn } from "@/lib/utils";
import { Imagem } from "./Imagem";

export type Instituicao = { nome: string; escopo?: string; logo?: string };
export type Materia = { veiculo?: string; data?: string; titulo: string; link?: string };

/** Nome ou logo, no mesmo lugar: sem logo, o nome aparece escrito em serifa. */
function Marca({ inst, className }: { inst: Instituicao; className?: string }) {
  if (inst.logo) {
    return (
      <Imagem
        src={inst.logo}
        alt={inst.nome}
        className={cn("h-12 w-full max-w-[11rem] bg-transparent", className)}
        imgClassName="object-contain object-left"
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
  return (
    <ul
      className="grid grid-cols-2 border-t border-l border-linha md:grid-cols-3"
      data-revelar-grupo
    >
      {lista.map((inst) => (
        <li
          key={inst.nome}
          className="group flex min-h-[6.5rem] items-center border-r border-b border-linha px-4 py-5 transition-colors duration-300 hover:bg-papel md:min-h-[7.5rem] md:px-7"
        >
          <span className="flex items-start gap-3">
            <span
              aria-hidden
              className="mt-[0.7rem] h-px w-4 shrink-0 bg-ouro transition-[width] duration-300 group-hover:w-6"
            />
            <Marca inst={inst} className="text-[1.02rem] md:text-[1.2rem]" />
          </span>
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
          className="flex flex-col rounded-[2px] border border-linha bg-papel p-6 transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-linha-forte md:p-7"
        >
          <span className="type-numeral text-[1.6rem] leading-none text-ouro-texto">
            {String(n + 1).padStart(2, "0")}
          </span>
          <Marca inst={inst} className="mt-4" />
          {inst.escopo && (
            <p className="mt-3 text-[0.95rem] leading-relaxed text-cinza">{inst.escopo}</p>
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
