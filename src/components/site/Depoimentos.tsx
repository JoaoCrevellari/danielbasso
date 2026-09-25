import { ArrowLeft, ArrowRight } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";

import type { ItemConteudo } from "@/lib/conteudo";
import { cn } from "@/lib/utils";
import { Imagem } from "./Imagem";

function iniciais(nome: string) {
  return nome
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function CartaoDepoimento({ item, className }: { item: ItemConteudo; className?: string }) {
  return (
    <figure
      className={cn(
        "flex h-full flex-col justify-between gap-5 rounded-[2px] border border-linha bg-papel p-6",
        className,
      )}
    >
      <blockquote className="relative">
        <span
          aria-hidden
          className="absolute -top-4 -left-1 font-serif text-[3.75rem] leading-none text-ouro/70 select-none"
        >
          “
        </span>
        <p className="relative line-clamp-3 pt-6 font-serif text-[1.15rem] leading-[1.45] text-petroleo-900 md:text-[1.2rem]">
          {item.excerpt}
        </p>
      </blockquote>
      <figcaption className="flex items-center gap-4">
        {item.cover_url ? (
          <Imagem
            src={item.cover_url}
            alt=""
            className="size-12 shrink-0 rounded-full"
            larguraMax={120}
            sizes="48px"
          />
        ) : (
          <span
            aria-hidden
            className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-petroleo-50 font-serif text-lg text-petroleo"
          >
            {iniciais(item.title)}
          </span>
        )}
        <span className="flex min-w-0 flex-col">
          <span className="font-medium text-petroleo-900">{item.title}</span>
          {item.subtitle && <span className="text-sm text-cinza">{item.subtitle}</span>}
        </span>
      </figcaption>
    </figure>
  );
}

/** Velocidade da rolagem contínua, em px por segundo. */
const VELOCIDADE = 28;
/** Depois de um toque/clique, quanto tempo espera parado antes de voltar a rolar. */
const PAUSA_APOS_TOQUE_MS = 4000;

/**
 * Esteira contínua de depoimentos: rola devagar e sem parar (inclusive com o mouse em
 * cima); só pausa quando a pessoa toca, clica ou arrasta, e retoma 4 s depois de soltar.
 * A lista é renderizada duas vezes para o laço não ter emenda. A rolagem é nativa, então
 * dá para arrastar no celular. Com movimento reduzido fica parada, como lista comum.
 */
export function CarrosselDepoimentos({ itens }: { itens: ItemConteudo[] }) {
  const trilho = useRef<HTMLUListElement>(null);
  const pausado = useRef(false);
  const retomar = useRef<number | undefined>(undefined);
  const [continuo, setContinuo] = useState(false);

  const pausarAteSoltar = () => {
    pausado.current = true;
    window.clearTimeout(retomar.current);
  };
  const soltarDepoisDeUmTempo = () => {
    window.clearTimeout(retomar.current);
    retomar.current = window.setTimeout(() => (pausado.current = false), PAUSA_APOS_TOQUE_MS);
  };

  /** Largura de uma volta: distância entre o 1º cartão e a sua primeira cópia. */
  const larguraVolta = (el: HTMLElement) => {
    const lis = el.querySelectorAll("li");
    const copia = lis[itens.length];
    return copia ? copia.offsetLeft - lis[0].offsetLeft : 0;
  };

  const mover = (dir: 1 | -1) => {
    const el = trilho.current;
    if (!el) return;
    pausarAteSoltar();
    soltarDepoisDeUmTempo();
    const volta = larguraVolta(el);
    // Voltando do início: pula para a cópia equivalente antes de andar.
    if (dir === -1 && volta && el.scrollLeft < 40) el.scrollLeft += volta;
    const passo = (el.querySelector("li")?.getBoundingClientRect().width ?? 360) + 20;
    el.scrollBy({ left: dir * passo, behavior: "smooth" });
  };

  useEffect(() => {
    if (itens.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setContinuo(true);
  }, [itens.length]);

  useEffect(() => {
    const el = trilho.current;
    if (!el || !continuo) return;

    let visivel = false;
    const io = new IntersectionObserver(([e]) => (visivel = e.isIntersecting));
    io.observe(el);

    // Só toque, clique, arrasto ou rolagem manual param a esteira (hover não).
    const eventosPausa = ["pointerdown", "touchstart", "wheel"] as const;
    const eventosSoltar = ["pointerup", "pointercancel", "touchend", "wheel"] as const;
    eventosPausa.forEach((ev) => el.addEventListener(ev, pausarAteSoltar, { passive: true }));
    eventosSoltar.forEach((ev) =>
      el.addEventListener(ev, soltarDepoisDeUmTempo, { passive: true }),
    );

    // Posição acumulada em float: scrollLeft arredonda, e a 28 px/s cada quadro anda <1 px.
    let posicao = el.scrollLeft;
    let anterior = performance.now();
    let quadro = 0;
    const passo = (agora: number) => {
      const dt = Math.min(agora - anterior, 64) / 1000;
      anterior = agora;
      if (pausado.current || !visivel || document.visibilityState !== "visible") {
        posicao = el.scrollLeft; // retoma de onde a pessoa deixou
      } else {
        const volta = larguraVolta(el);
        posicao += VELOCIDADE * dt;
        if (volta && posicao >= volta) posicao -= volta;
        el.scrollLeft = posicao;
      }
      quadro = requestAnimationFrame(passo);
    };
    quadro = requestAnimationFrame(passo);

    return () => {
      io.disconnect();
      cancelAnimationFrame(quadro);
      window.clearTimeout(retomar.current);
      eventosPausa.forEach((ev) => el.removeEventListener(ev, pausarAteSoltar));
      eventosSoltar.forEach((ev) => el.removeEventListener(ev, soltarDepoisDeUmTempo));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [continuo, itens.length]);

  if (!itens.length) return null;

  // As cópias só existem com a esteira ligada e são decorativas (fora do leitor de tela).
  // Três voltas garantem folga para o laço mesmo com poucos cartões em tela larga.
  const lista = continuo ? [...itens, ...itens, ...itens] : itens;

  return (
    <div className="relative">
      <ul
        ref={trilho}
        className={cn(
          "sem-barra -mx-[var(--gutter)] flex scroll-px-[var(--gutter)] gap-5 overflow-x-auto px-[var(--gutter)] pb-2",
          !continuo && "snap-x snap-mandatory",
        )}
        aria-label="Depoimentos"
      >
        {lista.map((d, i) => {
          const copia = i >= itens.length;
          return (
            <li
              key={copia ? `${d.id}-${i}` : d.id}
              aria-hidden={copia || undefined}
              data-revelar={copia ? undefined : ""}
              style={{ "--i": Math.min(i, 3) } as React.CSSProperties}
              className="w-[86%] shrink-0 snap-start sm:w-[60%] lg:w-[calc((100%-2.5rem)/3)]"
            >
              <CartaoDepoimento item={d} />
            </li>
          );
        })}
      </ul>
      {itens.length > 3 && (
        <div className="mt-8 hidden justify-end gap-2 md:flex">
          <button
            type="button"
            onClick={() => mover(-1)}
            aria-label="Depoimentos anteriores"
            className="inline-flex size-12 items-center justify-center rounded-full border border-linha-forte text-petroleo transition-colors hover:border-petroleo hover:bg-petroleo hover:text-gelo"
          >
            <ArrowLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => mover(1)}
            aria-label="Próximos depoimentos"
            className="inline-flex size-12 items-center justify-center rounded-full border border-linha-forte text-petroleo transition-colors hover:border-petroleo hover:bg-petroleo hover:text-gelo"
          >
            <ArrowRight className="size-5" />
          </button>
        </div>
      )}
    </div>
  );
}
