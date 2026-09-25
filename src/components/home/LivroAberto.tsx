import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

import { Monograma } from "@/components/layout/Logo";
import { CapaLivro, coresDaCapa } from "@/components/site/CapaLivro";
import { semDestaque } from "@/components/site/Titulo";
import { cn } from "@/lib/utils";

/**
 * Livro que se abre com a rolagem: a capa gira sobre a lombada, duas folhas passam e o
 * livro para aberto no capítulo 1. Tudo é 3D em CSS (perspective + preserve-3d) e a
 * posição da rolagem vira progresso 0 → 1 num único listener com rAF, que escreve os
 * transforms direto no DOM (sem re-render do React). Funciona igual no iOS e no desktop.
 *
 * Geometria: a cena tem proporção 4:3 (duas páginas 2:3 lado a lado). Fechado, o livro
 * ocupa a metade direita e é deslocado 25% para a esquerda, ficando centralizado; ao abrir,
 * volta para o lugar e a página da esquerda aparece. Tamanhos de texto em cqw (largura da
 * cena), então as páginas escalam juntas no celular e no desktop.
 */

type Props = {
  titulo: string;
  subtitulo?: string | null;
  capa?: string | null;
  cor?: string | null;
  trecho?: string | null;
  sumario?: string | null;
  abertura?: string | null;
  /** Usado quando não há sumário: linhas "- item" do texto sobre o livro. */
  corpo?: string | null;
  resumo?: string | null;
};

const limitar = (v: number) => Math.min(1, Math.max(0, v));
const suave = (t: number) => t * t * (3 - 2 * t);
/** Trechos do progresso (0–1) em que cada folha vira: capa, folha 1, folha 2. */
const TRECHOS: Array<[number, number]> = [
  [0.08, 0.42],
  [0.48, 0.7],
  [0.74, 0.96],
];

function capitulos({ sumario, corpo }: Pick<Props, "sumario" | "corpo">) {
  const doSumario = (sumario ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  if (doSumario.length) return doSumario.slice(0, 6);
  return (corpo ?? "")
    .split("\n")
    .filter((l) => /^\s*[-*]\s+/.test(l))
    .map((l) => l.replace(/^\s*[-*]\s+/, "").trim())
    .slice(0, 6);
}

/** Uma face de página (papel), com sombra junto da lombada do lado certo. */
function Papel({
  lado,
  numero,
  children,
  className,
}: {
  lado: "esquerda" | "direita";
  numero?: number;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "absolute inset-0 flex flex-col bg-[#FBFAF6] px-[9%] pt-[11%] pb-[8%] text-petroleo-900",
        lado === "direita" ? "rounded-r-[3px]" : "rounded-l-[3px]",
        className,
      )}
    >
      {children}
      {numero && (
        <span
          className={cn(
            "mt-auto font-serif text-[max(7px,1.5cqw)] text-cinza/70",
            lado === "direita" ? "self-end" : "self-start",
          )}
        >
          {numero}
        </span>
      )}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-y-0 w-[14%]",
          lado === "direita"
            ? "left-0 bg-gradient-to-r from-black/12 to-transparent"
            : "right-0 bg-gradient-to-l from-black/12 to-transparent",
        )}
      />
    </div>
  );
}

const FACE: CSSProperties = { backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" };
const VERSO: CSSProperties = { ...FACE, transform: "rotateY(180deg)" };

export function LivroAberto(props: Props) {
  const cena = useRef<HTMLDivElement>(null);
  const livro = useRef<HTMLDivElement>(null);
  const sombra = useRef<HTMLDivElement>(null);
  const folhas = useRef<Array<HTMLDivElement | null>>([]);
  const dobras = useRef<Array<HTMLSpanElement | null>>([]);

  useEffect(() => {
    const el = cena.current;
    if (!el) return;
    let quadro = 0;
    let ativo = false;

    const aplicar = () => {
      quadro = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 quando o centro do livro chega a 95% da tela; 1 quando passa de 35%.
      const p = limitar((vh * 0.95 - (r.top + r.height / 2)) / (vh * 0.6));
      const ts = TRECHOS.map(([a, b]) => suave(limitar((p - a) / (b - a))));
      const aberto = ts[0];

      if (livro.current) {
        livro.current.style.transform = `translateX(${-25 * (1 - aberto)}%) rotateY(${-16 * (1 - aberto)}deg) rotateX(${6 * (1 - aberto)}deg)`;
      }
      if (sombra.current) {
        sombra.current.style.transform = `translateX(${-25 * (1 - aberto)}%) scaleX(${0.5 + 0.5 * aberto})`;
      }
      ts.forEach((t, i) => {
        const f = folhas.current[i];
        if (!f) return;
        const ang = -180 * t;
        f.style.transform = `rotateY(${ang}deg)`;
        // Na direita, a de cima é a primeira; depois de virar, a última virada fica por cima.
        f.style.zIndex = String(t > 0.5 ? 10 + i : 10 - i);
        const d = dobras.current[i];
        if (d) d.style.opacity = String(Math.sin(t * Math.PI) * 0.35);
      });
    };

    const pedir = () => {
      if (ativo && !quadro) quadro = requestAnimationFrame(aplicar);
    };
    const io = new IntersectionObserver(
      ([e]) => {
        ativo = e.isIntersecting;
        pedir();
      },
      { rootMargin: "20% 0px 20% 0px" },
    );
    io.observe(el);
    window.addEventListener("scroll", pedir, { passive: true });
    window.addEventListener("resize", pedir);
    aplicar();
    return () => {
      io.disconnect();
      cancelAnimationFrame(quadro);
      window.removeEventListener("scroll", pedir);
      window.removeEventListener("resize", pedir);
    };
  }, []);

  const c = coresDaCapa(props.cor);
  const titulo = semDestaque(props.titulo);
  const caps = capitulos(props);
  const primeiro = caps[0] ?? "Introdução";
  const texto = props.abertura || props.resumo || "";
  // Segundo parágrafo da página: 1º parágrafo do texto sobre o livro, sem marcação.
  const continuacao = (props.corpo ?? "")
    .split(/\n\s*\n/)
    .map((b) => b.replace(/[*_#>`]/g, "").trim())
    .find((b) => b && !b.startsWith("-") && b !== texto);

  const folha = (i: number, frente: ReactNode, verso: ReactNode) => (
    <div
      ref={(n) => {
        folhas.current[i] = n;
      }}
      className="absolute inset-y-0 left-1/2 w-1/2 origin-left [transform-style:preserve-3d]"
      style={{ zIndex: 10 - i }}
    >
      <div className="absolute inset-0" style={FACE}>
        {frente}
      </div>
      <div className="absolute inset-0" style={VERSO}>
        {verso}
      </div>
      <span
        aria-hidden
        ref={(n) => {
          dobras.current[i] = n;
        }}
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/60 to-transparent opacity-0"
        style={FACE}
      />
    </div>
  );

  return (
    <div
      ref={cena}
      data-livro-aberto
      aria-hidden
      className="relative mx-auto aspect-[4/3] w-full max-w-[36rem] [container-type:inline-size] [perspective:1800px]"
    >
      {/* Sombra no chão */}
      <div
        ref={sombra}
        className="absolute inset-x-[4%] -bottom-[5%] h-[8%] rounded-[50%] bg-petroleo-950/25 blur-xl"
        style={{ transform: "translateX(-25%) scaleX(0.5)" }}
      />
      <div
        ref={livro}
        className="absolute inset-0 [transform-style:preserve-3d]"
        style={{ transform: "translateX(-25%) rotateY(-16deg) rotateX(6deg)" }}
      >
        {/* Bloco de páginas (direita): última página visível, com o capítulo 1 */}
        <div className="absolute inset-y-[1.2%] right-[0.6%] left-1/2 shadow-[4px_0_0_#ece9e0,8px_0_0_#e3dfd4,0_24px_48px_-20px_rgb(0_20_30/0.5)]">
          <Papel lado="direita" numero={13}>
            <p className="font-serif text-[max(8.5px,2.35cqw)] leading-[1.55] text-petroleo-900/90 [text-wrap:pretty]">
              <span className="float-left mr-[0.08em] font-serif text-[3.4em] leading-[0.8] text-ouro-texto">
                {texto.charAt(0)}
              </span>
              {texto.slice(1)}
            </p>
            {continuacao && (
              <p className="mt-[0.7em] indent-[1.4em] font-serif text-[max(8.5px,2.35cqw)] leading-[1.55] text-petroleo-900/90 [text-wrap:pretty]">
                {continuacao}
              </p>
            )}
          </Papel>
        </div>

        {/* Folha 2: sumário → abertura do capítulo 1 */}
        {folha(
          2,
          <Papel lado="direita" numero={7}>
            <p className="text-[max(6px,1.35cqw)] font-medium tracking-[0.28em] text-ouro-texto uppercase">
              Sumário
            </p>
            <ol className="mt-[9%] flex flex-col gap-[0.7em] font-serif text-[max(8px,2.05cqw)] leading-snug">
              {caps.map((cap, n) => (
                <li key={n} className="flex items-baseline gap-[0.6em]">
                  <span className="text-ouro-texto">{n + 1}</span>
                  <span className="min-w-0 truncate">{cap}</span>
                  <span className="flex-1 border-b border-dotted border-cinza/40" />
                  <span className="text-cinza">{13 + n * 16}</span>
                </li>
              ))}
            </ol>
          </Papel>,
          <Papel lado="esquerda" numero={12} className="pt-[34%]">
            <p className="text-[max(6px,1.35cqw)] font-medium tracking-[0.28em] text-ouro-texto uppercase">
              Capítulo 1
            </p>
            <p className="mt-[6%] font-serif text-[max(13px,4.2cqw)] leading-[1.05] tracking-[-0.02em] text-petroleo">
              {primeiro}
            </p>
            <span className="mt-[9%] block h-px w-[22%] bg-ouro" />
          </Papel>,
        )}

        {/* Folha 1: folha de rosto → epígrafe */}
        {folha(
          1,
          <Papel lado="direita" className="items-center justify-center text-center">
            <p className="text-[max(6px,1.35cqw)] font-medium tracking-[0.28em] text-ouro-texto uppercase">
              Daniel Basso
            </p>
            <p className="mt-[10%] font-serif text-[max(15px,4.8cqw)] leading-[1.02] tracking-[-0.02em] text-petroleo">
              {titulo}
            </p>
            {props.subtitulo && (
              <p className="mt-[6%] font-serif text-[max(8px,1.9cqw)] leading-snug text-cinza italic">
                {props.subtitulo}
              </p>
            )}
            <Monograma className="mt-auto h-[max(14px,3.6cqw)] text-ouro-texto" />
          </Papel>,
          <Papel lado="esquerda" className="justify-center">
            {props.trecho && (
              <>
                <p className="font-serif text-[max(9px,2.5cqw)] leading-[1.45] text-petroleo-900 italic [text-wrap:balance]">
                  “{props.trecho}”
                </p>
                <p className="mt-[8%] text-right font-serif text-[max(7px,1.7cqw)] text-cinza">
                  — Daniel Basso
                </p>
              </>
            )}
          </Papel>,
        )}

        {/* Capa: frente → guarda (verso), na cor da capa */}
        {folha(
          0,
          <CapaLivro
            titulo={props.titulo}
            subtitulo={props.subtitulo}
            imagem={props.capa}
            cor={props.cor ?? undefined}
            tamanho="lg"
            className="h-full shadow-none"
          />,
          <div
            className="flex h-full items-center justify-center rounded-l-[3px]"
            style={{ background: c.fundo, color: c.texto }}
          >
            <Monograma className="h-[22%] opacity-[0.12]" />
            <span
              aria-hidden
              className="absolute inset-y-0 right-0 w-[10%] bg-gradient-to-l from-black/30 to-transparent"
            />
          </div>,
        )}
      </div>
    </div>
  );
}
