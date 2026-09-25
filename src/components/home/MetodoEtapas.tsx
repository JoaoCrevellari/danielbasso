import { useEffect, useRef } from "react";

import type { Etapa } from "@/content/paginas/metodo";

/**
 * As cinco etapas acendem uma a uma quando passam da faixa inferior da tela e apagam
 * de novo se a pessoa volta para cima: a leitura acompanha a sequência do método.
 * Usa IntersectionObserver + transição de CSS (funciona igual no iOS e no desktop);
 * sem JS ou com movimento reduzido, todas aparecem acesas (regras em styles.css).
 */
export function MetodoEtapas({ etapas }: { etapas: Etapa[] }) {
  const lista = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const itens = lista.current?.querySelectorAll<HTMLElement>("[data-etapa]");
    if (!itens?.length) return;
    const io = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (e.isIntersecting) e.target.classList.add("acesa");
          // Só apaga quando sai por baixo (a pessoa voltou para cima).
          else if (e.boundingClientRect.top > 0) e.target.classList.remove("acesa");
        }
      },
      { rootMargin: "0px 0px -30% 0px" },
    );
    itens.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [etapas.length]);

  return (
    <ol ref={lista} className="flex flex-col">
      {etapas.map((etapa, i) => (
        <li
          key={etapa.chave + i}
          data-etapa
          className="relative border-b border-linha py-3.5 first:border-t md:py-5"
        >
          <span
            aria-hidden
            className="etapa-linha absolute -bottom-px left-0 h-px w-full origin-left bg-ouro"
          />
          <div className="etapa-conteudo flex items-baseline gap-3 md:gap-5">
            <span className="w-7 shrink-0 font-serif text-[1.6rem] leading-none font-[380] text-ouro [font-feature-settings:'lnum','tnum'] md:w-9 md:text-[2rem]">
              {i + 1}
            </span>
            <div className="min-w-0">
              <h3 className="font-serif text-[clamp(1.8rem,1.3rem+2vw,3rem)] leading-none font-[380] tracking-[-0.025em] text-gelo">
                {etapa.nome}
              </h3>
              <p className="mt-2 max-w-md text-[0.95rem] leading-relaxed text-gelo/65 max-md:hidden">
                {etapa.pergunta}
              </p>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
