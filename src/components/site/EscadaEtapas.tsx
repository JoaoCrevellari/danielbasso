import { ArrowRight } from "@phosphor-icons/react";

import { nomeEtapa } from "@/content/fields";
import { LinkInterno } from "./LinkInterno";

export type Degrau = { etapa: string; produto: string; link: string };

/**
 * Escada do método: as cinco etapas em ordem, cada uma com o produto que a trabalha.
 * No desktop vira uma linha com degraus que sobem; no celular, uma lista numerada.
 */
export function EscadaEtapas({ degraus }: { degraus: Degrau[] }) {
  const lista = degraus.filter((d) => d.produto);
  if (!lista.length) return null;
  return (
    <ol className="grid gap-3 md:grid-cols-5 md:gap-4" data-revelar-grupo>
      {lista.map((d, n) => (
        <li
          key={d.etapa + n}
          // Base alinhada e cada etapa um pouco mais alta que a anterior: a subida lê da esquerda para a direita.
          style={{ "--degrau": `${(lista.length - 1 - n) * 1.25}rem` } as React.CSSProperties}
          className="md:mt-[var(--degrau)]"
        >
          <LinkInterno
            to={d.link}
            className="group flex h-full items-center gap-4 rounded-[2px] border border-linha bg-papel p-4 transition-[border-color,transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-linha-forte hover:shadow-[0_18px_36px_-28px_rgb(0_31_46/0.5)] md:flex-col md:items-start md:gap-0 md:p-5"
          >
            <span className="type-numeral inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-ouro/60 text-[1.05rem] text-ouro-texto md:size-11">
              {n + 1}
            </span>
            <span className="flex min-w-0 flex-1 flex-col md:mt-5">
              <span className="type-meta text-cinza">{nomeEtapa(d.etapa) ?? d.etapa}</span>
              <span className="mt-1 font-serif text-[1.15rem] leading-snug text-petroleo md:text-[1.2rem]">
                {d.produto}
              </span>
            </span>
            <ArrowRight
              aria-hidden
              className="size-4 shrink-0 text-petroleo transition-transform duration-300 group-hover:translate-x-1 md:mt-4"
            />
          </LinkInterno>
        </li>
      ))}
    </ol>
  );
}
