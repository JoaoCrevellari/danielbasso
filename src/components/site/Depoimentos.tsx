import { ArrowLeft, ArrowRight } from "@phosphor-icons/react";
import { useEffect, useRef } from "react";

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

const INTERVALO_MS = 5000;

/**
 * Carrossel com rolagem nativa (arrastar no celular) e setas no desktop. Avança sozinho
 * a cada 5 s enquanto está visível; pausa quando a pessoa interage (toque, mouse, foco)
 * e fica parado para quem pede movimento reduzido.
 */
export function CarrosselDepoimentos({ itens }: { itens: ItemConteudo[] }) {
  const trilho = useRef<HTMLUListElement>(null);
  const pausado = useRef(false);
  const visivel = useRef(false);

  // Seta clicada: dá tempo para ler antes de voltar a avançar sozinho.
  const pausarPorUmTempo = () => {
    pausado.current = true;
    window.setTimeout(() => (pausado.current = false), INTERVALO_MS * 2);
  };

  const mover = (dir: 1 | -1) => {
    const el = trilho.current;
    if (!el) return;
    const cartao = el.querySelector("li");
    const passo = (cartao?.getBoundingClientRect().width ?? 360) + 20;
    const noFim = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8;
    if (dir === 1 && noFim) el.scrollTo({ left: 0, behavior: "smooth" });
    else el.scrollBy({ left: dir * passo, behavior: "smooth" });
  };

  useEffect(() => {
    const el = trilho.current;
    if (!el || itens.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const io = new IntersectionObserver(([e]) => (visivel.current = e.isIntersecting), {
      threshold: 0.4,
    });
    io.observe(el);

    // Qualquer interação pausa; a retomada espera um intervalo inteiro.
    let retomar: number | undefined;
    const pausar = () => {
      pausado.current = true;
      window.clearTimeout(retomar);
    };
    const soltar = () => {
      window.clearTimeout(retomar);
      retomar = window.setTimeout(() => (pausado.current = false), INTERVALO_MS);
    };
    const eventosPausa = ["pointerenter", "pointerdown", "focusin", "wheel", "touchstart"] as const;
    const eventosSoltar = ["pointerleave", "focusout", "touchend"] as const;
    eventosPausa.forEach((ev) => el.addEventListener(ev, pausar, { passive: true }));
    eventosSoltar.forEach((ev) => el.addEventListener(ev, soltar, { passive: true }));

    const timer = window.setInterval(() => {
      if (!pausado.current && visivel.current && document.visibilityState === "visible") mover(1);
    }, INTERVALO_MS);

    return () => {
      io.disconnect();
      window.clearInterval(timer);
      window.clearTimeout(retomar);
      eventosPausa.forEach((ev) => el.removeEventListener(ev, pausar));
      eventosSoltar.forEach((ev) => el.removeEventListener(ev, soltar));
    };
  }, [itens.length]);

  if (!itens.length) return null;

  return (
    <div className="relative">
      <ul
        ref={trilho}
        className="sem-barra -mx-[var(--gutter)] flex snap-x snap-mandatory scroll-px-[var(--gutter)] gap-5 overflow-x-auto px-[var(--gutter)] pb-2"
        aria-label="Depoimentos"
      >
        {itens.map((d, i) => (
          <li
            key={d.id}
            data-revelar
            style={{ "--i": Math.min(i, 3) } as React.CSSProperties}
            className="w-[86%] shrink-0 snap-start sm:w-[60%] lg:w-[calc((100%-2.5rem)/3)]"
          >
            <CartaoDepoimento item={d} />
          </li>
        ))}
      </ul>
      {itens.length > 3 && (
        <div className="mt-8 hidden justify-end gap-2 md:flex">
          <button
            type="button"
            onClick={() => {
              pausarPorUmTempo();
              mover(-1);
            }}
            aria-label="Depoimentos anteriores"
            className="inline-flex size-12 items-center justify-center rounded-full border border-linha-forte text-petroleo transition-colors hover:border-petroleo hover:bg-petroleo hover:text-gelo"
          >
            <ArrowLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => {
              pausarPorUmTempo();
              mover(1);
            }}
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
