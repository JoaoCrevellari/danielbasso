/**
 * Gráficos do painel em SVG próprio (sem biblioteca).
 *
 * Cores validadas com o validador da skill de dataviz sobre o fundo #fbfbf9
 * (faixa de luminosidade, croma, separação para daltonismo e contraste ≥ 3:1):
 *   visitantes     #0f6a93  (petróleo vivo)
 *   páginas vistas #b8860b  (ouro escuro)
 * Marcas finas: linha de 2 px, área a 10%, pontos de 8 px com anel de 2 px da superfície,
 * grade em linha fina sólida. Texto sempre nas cores de texto, nunca na cor da série.
 */
import { TrendDown, TrendUp, Minus } from "@phosphor-icons/react";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";

import { diaCurto, diaLongo, numero } from "@/lib/admin/formato";
import { cn } from "@/lib/utils";
import { EASE, Esqueleto } from "./ui";

export const COR_VISITANTES = "#0f6a93";
export const COR_PAGINAS = "#b8860b";
const SUPERFICIE = "#fbfbf9";

// ── Escala "bonita" ──────────────────────────────────────────────────────────────
function passoBonito(max: number, alvo = 4) {
  if (max <= 0) return 1;
  const bruto = max / alvo;
  const pot = 10 ** Math.floor(Math.log10(bruto));
  const n = bruto / pot;
  const f = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10;
  return Math.max(1, f * pot);
}

function useLargura<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [largura, setLargura] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setLargura(Math.round(e.contentRect.width)));
    ro.observe(el);
    setLargura(Math.round(el.getBoundingClientRect().width));
    return () => ro.disconnect();
  }, []);
  return [ref, largura] as const;
}

// ── Gráfico diário ──────────────────────────────────────────────────────────────
export type PontoDiario = { day: string; visitors: number; pageviews: number };

const SERIES = [
  { chave: "visitors" as const, rotulo: "Visitantes", cor: COR_VISITANTES },
  { chave: "pageviews" as const, rotulo: "Páginas vistas", cor: COR_PAGINAS },
];

export function GraficoDiario({
  dados,
  atualizando,
}: {
  dados: PontoDiario[];
  atualizando?: boolean;
}) {
  const [ref, largura] = useLargura<HTMLDivElement>();
  const [idx, setIdx] = useState<number | null>(null);
  const [tabela, setTabela] = useState(false);
  const idTabela = useId();

  const ALTURA = 240;
  const M = { top: 12, right: 12, bottom: 30, left: 40 };
  const w = Math.max(0, largura - M.left - M.right);
  const h = ALTURA - M.top - M.bottom;
  const n = dados.length;

  const maxBruto = Math.max(0, ...dados.map((d) => Math.max(d.pageviews, d.visitors)));
  const passo = passoBonito(maxBruto);
  const topo = Math.max(passo, Math.ceil(maxBruto / passo) * passo);
  const ticksY: number[] = [];
  for (let v = 0; v <= topo + 1e-9; v += passo) ticksY.push(v);

  const x = (i: number) => (n <= 1 ? w / 2 : (i / (n - 1)) * w);
  const y = (v: number) => h - (v / topo) * h;

  const caminhos = useMemo(() => {
    return SERIES.map((s) => {
      const pts = dados.map((d, i) => [x(i), y(d[s.chave])] as const);
      const linha = pts
        .map(([px, py], i) => `${i ? "L" : "M"}${px.toFixed(1)},${py.toFixed(1)}`)
        .join("");
      const area = pts.length
        ? `${linha}L${pts[pts.length - 1][0].toFixed(1)},${h}L${pts[0][0].toFixed(1)},${h}Z`
        : "";
      return { ...s, linha, area };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dados, w, h, topo]);

  const qtdRotulos = Math.max(2, Math.min(7, Math.floor(w / 84)));
  const ticksX = useMemo(() => {
    if (n === 0) return [];
    if (n <= qtdRotulos) return dados.map((_, i) => i);
    const out: number[] = [];
    for (let k = 0; k < qtdRotulos; k++) out.push(Math.round((k * (n - 1)) / (qtdRotulos - 1)));
    return [...new Set(out)];
  }, [n, qtdRotulos, dados]);

  function indicePorX(clientX: number, el: Element) {
    const r = el.getBoundingClientRect();
    const px = clientX - r.left - M.left;
    if (n <= 1) return 0;
    return Math.max(0, Math.min(n - 1, Math.round((px / w) * (n - 1))));
  }

  const atual = idx !== null ? dados[idx] : null;
  const tooltipEsq = idx !== null ? M.left + x(idx) : 0;

  return (
    <div ref={ref}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ul
          className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-cinza"
          aria-label="Legenda"
        >
          {SERIES.map((s) => (
            <li key={s.chave} className="flex items-center gap-2">
              <span
                aria-hidden
                className="h-[2px] w-4 rounded-full"
                style={{ background: s.cor }}
              />
              {s.rotulo}
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => setTabela((t) => !t)}
          aria-expanded={tabela}
          aria-controls={idTabela}
          className="min-h-11 rounded-full px-3 text-sm text-petroleo underline-offset-4 hover:underline md:min-h-8"
        >
          {tabela ? "Ver gráfico" : "Ver como tabela"}
        </button>
      </div>

      {tabela ? (
        <div id={idTabela} className="rolagem-fina mt-3 max-h-[300px] overflow-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">Visitantes e páginas vistas por dia</caption>
            <thead className="sticky top-0 bg-papel text-left text-xs text-cinza">
              <tr>
                <th scope="col" className="py-2 font-medium">
                  Dia
                </th>
                <th scope="col" className="py-2 text-right font-medium">
                  Visitantes
                </th>
                <th scope="col" className="py-2 text-right font-medium">
                  Páginas vistas
                </th>
              </tr>
            </thead>
            <tbody className="tabular-nums">
              {[...dados].reverse().map((d) => (
                <tr key={d.day} className="border-t border-linha">
                  <th scope="row" className="py-2 text-left font-normal text-grafite">
                    {diaLongo(d.day)}
                  </th>
                  <td className="py-2 text-right">{numero(d.visitors)}</td>
                  <td className="py-2 text-right">{numero(d.pageviews)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div
          className={cn(
            "relative mt-3 transition-opacity duration-200 focus-visible:outline-offset-4",
            atualizando && "opacity-60",
          )}
          style={{ height: ALTURA }}
          tabIndex={0}
          role="group"
          aria-label="Gráfico diário de visitantes e páginas vistas. Use as setas para percorrer os dias."
          onKeyDown={(e) => {
            if (!n) return;
            if (e.key === "ArrowRight") {
              e.preventDefault();
              setIdx((i) => (i === null ? n - 1 : Math.min(n - 1, i + 1)));
            } else if (e.key === "ArrowLeft") {
              e.preventDefault();
              setIdx((i) => (i === null ? n - 1 : Math.max(0, i - 1)));
            } else if (e.key === "Home") setIdx(0);
            else if (e.key === "End") setIdx(n - 1);
            else if (e.key === "Escape") setIdx(null);
          }}
          onBlur={() => setIdx(null)}
        >
          {largura > 0 && (
            <svg width={largura} height={ALTURA} className="block overflow-visible" aria-hidden>
              <g transform={`translate(${M.left},${M.top})`}>
                {ticksY.map((v) => (
                  <g key={v} transform={`translate(0,${y(v)})`}>
                    <line
                      x1={0}
                      x2={w}
                      stroke="rgb(0 63 92 / 0.1)"
                      strokeWidth={1}
                      shapeRendering="crispEdges"
                    />
                    <text
                      x={-10}
                      dy="0.32em"
                      textAnchor="end"
                      className="fill-cinza text-[11px] tabular-nums"
                    >
                      {numero(v)}
                    </text>
                  </g>
                ))}
                {ticksX.map((i) => (
                  <text
                    key={i}
                    x={x(i)}
                    y={h + 20}
                    textAnchor={
                      n > 1 && i === 0 ? "start" : n > 1 && i === n - 1 ? "end" : "middle"
                    }
                    className="fill-cinza text-[11px]"
                  >
                    {diaCurto(dados[i].day)}
                  </text>
                ))}
                {caminhos.map((c) => (
                  <path key={`a-${c.chave}`} d={c.area} fill={c.cor} fillOpacity={0.08} />
                ))}
                {caminhos.map((c) => (
                  <path
                    key={`l-${c.chave}`}
                    d={c.linha}
                    fill="none"
                    stroke={c.cor}
                    strokeWidth={2}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                ))}
                {n === 1 &&
                  SERIES.map((s) => (
                    <circle
                      key={s.chave}
                      cx={x(0)}
                      cy={y(dados[0][s.chave])}
                      r={4}
                      fill={s.cor}
                      stroke={SUPERFICIE}
                      strokeWidth={2}
                    />
                  ))}
                {atual && idx !== null && (
                  <g>
                    <line
                      x1={x(idx)}
                      x2={x(idx)}
                      y1={0}
                      y2={h}
                      stroke="rgb(0 63 92 / 0.35)"
                      strokeWidth={1}
                    />
                    {SERIES.map((s) => (
                      <circle
                        key={s.chave}
                        cx={x(idx)}
                        cy={y(atual[s.chave])}
                        r={4.5}
                        fill={s.cor}
                        stroke={SUPERFICIE}
                        strokeWidth={2}
                      />
                    ))}
                  </g>
                )}
                <rect
                  x={-8}
                  y={0}
                  width={w + 16}
                  height={h}
                  fill="transparent"
                  style={{ touchAction: "pan-y" }}
                  onPointerMove={(e) =>
                    setIdx(indicePorX(e.clientX, e.currentTarget.ownerSVGElement!))
                  }
                  onPointerDown={(e) =>
                    setIdx(indicePorX(e.clientX, e.currentTarget.ownerSVGElement!))
                  }
                  onPointerLeave={(e) => e.pointerType === "mouse" && setIdx(null)}
                />
              </g>
            </svg>
          )}

          {atual && (
            <div
              aria-hidden
              className="pointer-events-none absolute top-0 z-10 min-w-40 rounded-[2px] border border-linha bg-papel px-3 py-2.5 shadow-[0_10px_30px_-12px_rgb(0_20_30/0.35)]"
              style={{
                left: tooltipEsq,
                transform: `translateX(${tooltipEsq > largura / 2 ? "calc(-100% - 12px)" : "12px"})`,
              }}
            >
              <p className="text-xs text-cinza capitalize">{diaLongo(atual.day)}</p>
              <ul className="mt-1.5 space-y-1">
                {SERIES.map((s) => (
                  <li key={s.chave} className="flex items-center gap-2 text-sm">
                    <span className="h-[2px] w-3 rounded-full" style={{ background: s.cor }} />
                    <strong className="font-semibold text-grafite tabular-nums">
                      {numero(atual[s.chave])}
                    </strong>
                    <span className="text-cinza">{s.rotulo.toLowerCase()}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <p className="sr-only" aria-live="polite">
            {atual
              ? `${diaLongo(atual.day)}: ${numero(atual.visitors)} visitantes, ${numero(atual.pageviews)} páginas vistas.`
              : ""}
          </p>
        </div>
      )}
    </div>
  );
}

export function EsqueletoGrafico() {
  return (
    <div aria-hidden>
      <div className="flex gap-5">
        <Esqueleto className="h-4 w-24" />
        <Esqueleto className="h-4 w-28" />
      </div>
      <div className="relative mt-3 h-[240px]">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="absolute inset-x-0 h-px bg-petroleo/[0.06]"
            style={{ top: `${12 + i * 66}px` }}
          />
        ))}
        <Esqueleto className="absolute inset-x-10 bottom-[30px] h-[45%] opacity-60" />
      </div>
    </div>
  );
}

// ── Lista ranqueada com barras finas (sem trilho) ──────────────────────────────────
export type ItemLista = {
  chave: string;
  rotulo: ReactNode;
  valor: number;
  detalhe?: ReactNode;
  titulo?: string;
};

export function ListaRanqueada({
  itens,
  total,
  vazio = "Sem dados neste período.",
  max = 8,
  atualizando,
  cor = COR_VISITANTES,
  formatar = numero,
}: {
  itens: ItemLista[];
  total?: number;
  vazio?: string;
  max?: number;
  atualizando?: boolean;
  cor?: string;
  formatar?: (n: number) => string;
}) {
  const reduzir = useReducedMotion();
  const lista = itens.slice(0, max);
  const maior = Math.max(1, ...lista.map((i) => i.valor));
  const soma = total ?? itens.reduce((s, i) => s + i.valor, 0);

  if (!lista.length) return <p className="py-6 text-sm text-cinza">{vazio}</p>;

  return (
    <ol className={cn("space-y-3.5 transition-opacity duration-200", atualizando && "opacity-60")}>
      {lista.map((i, k) => (
        <li key={i.chave}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 truncate text-grafite" title={i.titulo}>
              {i.rotulo}
            </span>
            <span className="shrink-0 tabular-nums">
              <strong className="font-semibold text-grafite">{formatar(i.valor)}</strong>
              {soma > 0 && (
                <span className="ml-2 inline-block w-10 text-right text-xs text-cinza">
                  {Math.round((i.valor / soma) * 100)}%
                </span>
              )}
            </span>
          </div>
          {i.detalhe && <div className="text-xs text-cinza">{i.detalhe}</div>}
          <motion.div
            aria-hidden
            className="mt-1.5 h-1 origin-left rounded-r-full"
            style={{ width: `${Math.max(1.5, (i.valor / maior) * 100)}%`, background: cor }}
            initial={reduzir ? false : { scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.5, delay: k * 0.03, ease: EASE }}
          />
        </li>
      ))}
    </ol>
  );
}

export function EsqueletoLista({ linhas = 5 }: { linhas?: number }) {
  return (
    <div aria-hidden className="space-y-4">
      {Array.from({ length: linhas }, (_, i) => (
        <div key={i}>
          <div className="flex justify-between">
            <Esqueleto className="h-3.5" style={{ width: `${60 - i * 8}%` }} />
            <Esqueleto className="h-3.5 w-10" />
          </div>
          <Esqueleto className="mt-2 h-1" style={{ width: `${90 - i * 15}%` }} />
        </div>
      ))}
    </div>
  );
}

// ── Cartão de indicador ───────────────────────────────────────────────────────────
export function Indicador({
  rotulo,
  valor,
  atual,
  anterior,
  menorMelhor,
  dias,
  atualizando,
  ajuda,
}: {
  rotulo: string;
  valor: string;
  atual: number | null;
  anterior: number | null;
  menorMelhor?: boolean;
  dias: number;
  atualizando?: boolean;
  ajuda?: string;
}) {
  let variacao: ReactNode = null;
  if (atual !== null && anterior !== null) {
    if (anterior === 0 && atual === 0) {
      variacao = <span className="text-cinza">sem movimento</span>;
    } else if (anterior === 0) {
      variacao = <span className="text-cinza">sem dados no período anterior</span>;
    } else {
      const pct = ((atual - anterior) / anterior) * 100;
      const subiu = pct > 0.5;
      const caiu = pct < -0.5;
      const bom = menorMelhor ? caiu : subiu;
      const ruim = menorMelhor ? subiu : caiu;
      const Icone = subiu ? TrendUp : caiu ? TrendDown : Minus;
      variacao = (
        <span
          className={cn(
            "inline-flex items-center gap-1 font-medium",
            bom && "text-salvia-texto",
            ruim && "text-terracota-texto",
            !bom && !ruim && "text-cinza",
          )}
        >
          <Icone aria-hidden weight="bold" className="size-3.5" />
          {subiu ? "+" : ""}
          {Math.round(pct).toLocaleString("pt-BR")}%
          <span className="font-normal text-cinza">vs {dias} dias anteriores</span>
        </span>
      );
    }
  }
  return (
    <div
      className={cn(
        "rounded-[2px] border border-linha bg-papel p-4 transition-opacity md:p-5",
        atualizando && "opacity-60",
      )}
    >
      <p className="text-sm text-cinza" title={ajuda}>
        {rotulo}
      </p>
      <p className="mt-2 text-[1.75rem] leading-none font-semibold tracking-[-0.02em] text-petroleo-900 md:text-[2rem]">
        {valor}
      </p>
      <p className="mt-2.5 min-h-4 text-xs">{variacao}</p>
    </div>
  );
}

export function EsqueletoIndicador() {
  return (
    <div aria-hidden className="rounded-[2px] border border-linha bg-papel p-4 md:p-5">
      <Esqueleto className="h-3.5 w-20" />
      <Esqueleto className="mt-3 h-8 w-24" />
      <Esqueleto className="mt-3 h-3 w-32" />
    </div>
  );
}

// ── Barras horizontais de escala fixa (diagnóstico, 1 a 5) ────────────────────────
export function BarrasEscala({
  itens,
  maximo,
  destaque,
  formatar = (n: number) => n.toLocaleString("pt-BR", { maximumFractionDigits: 1 }),
}: {
  itens: { chave: string; rotulo: string; valor: number | null }[];
  maximo: number;
  destaque?: string | null;
  formatar?: (n: number) => string;
}) {
  const reduzir = useReducedMotion();
  return (
    <ul className="space-y-3">
      {itens.map((i, k) => {
        const foco = destaque === i.chave;
        return (
          <li key={i.chave}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className={cn("text-grafite", foco && "font-semibold")}>
                {i.rotulo}
                {foco && (
                  <span className="ml-2 rounded-full bg-ouro/[0.16] px-2 py-0.5 text-[0.6875rem] font-medium text-ouro-texto">
                    foco
                  </span>
                )}
              </span>
              <span className="tabular-nums text-grafite">
                {i.valor === null ? "sem dados" : formatar(i.valor)}
                <span className="text-xs text-cinza"> / {maximo}</span>
              </span>
            </div>
            <motion.div
              aria-hidden
              className="mt-1.5 h-1.5 origin-left rounded-r-full"
              style={{
                width: `${Math.max(1.5, ((i.valor ?? 0) / maximo) * 100)}%`,
                background: foco ? COR_PAGINAS : COR_VISITANTES,
              }}
              initial={reduzir ? false : { scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.5, delay: k * 0.04, ease: EASE }}
            />
          </li>
        );
      })}
    </ul>
  );
}
