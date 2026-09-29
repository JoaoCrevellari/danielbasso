/**
 * Resultados de uma LP no período: indicadores, visitantes × respostas por dia, funil de
 * leitura (seções e rolagem), formulários, cliques, origem/campanhas, aparelhos e cidades.
 */
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { motion, useReducedMotion } from "motion/react";
import { useMemo, useState } from "react";

import { QK } from "@/components/admin/contexto";
import {
  COR_PAGINAS,
  COR_VISITANTES,
  EsqueletoGrafico,
  EsqueletoIndicador,
  EsqueletoLista,
  GraficoDiario,
  ListaRanqueada,
  type PontoDiario,
} from "@/components/admin/graficos";
import { Cartao, EASE, EstadoErro, Segmentado, TituloCartao } from "@/components/admin/ui";
import { diasEntre, duracao, hojeSP, mensagemErro, numero, porcentagem } from "@/lib/admin/formato";
import { relatorioLpFn, type RelatorioLp } from "@/lib/admin/lps.functions";
import { rotuloDispositivo } from "@/lib/admin/rotulos";
import { cn } from "@/lib/utils";

type Dias = 7 | 30 | 90;
const PERIODOS: { value: Dias; label: string }[] = [
  { value: 7, label: "7 dias" },
  { value: 30, label: "30 dias" },
  { value: 90, label: "90 dias" },
];

function Numero({ rotulo, valor, ajuda }: { rotulo: string; valor: string; ajuda?: string }) {
  return (
    <div className="rounded-[2px] border border-linha bg-papel p-4 md:p-5">
      <p className="text-sm text-cinza">{rotulo}</p>
      <p className="mt-2 text-[1.6rem] leading-none font-semibold tracking-[-0.02em] text-petroleo-900 md:text-[1.9rem]">
        {valor}
      </p>
      {ajuda && <p className="mt-2 text-xs text-cinza">{ajuda}</p>}
    </div>
  );
}

/** Barras de porcentagem (funil): 100% = todas as sessões do período. */
function BarrasPct({
  itens,
  vazio,
}: {
  itens: { chave: string; rotulo: string; pct: number | null; detalhe?: string }[];
  vazio: string;
}) {
  const reduzir = useReducedMotion();
  if (!itens.length) return <p className="py-6 text-sm text-cinza">{vazio}</p>;
  return (
    <ol className="space-y-3.5">
      {itens.map((i, k) => (
        <li key={i.chave}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 truncate text-grafite">{i.rotulo}</span>
            <span className="shrink-0 tabular-nums">
              <strong className="font-semibold text-grafite">{porcentagem(i.pct ?? 0, 0)}</strong>
              {i.detalhe && <span className="ml-2 text-xs text-cinza">{i.detalhe}</span>}
            </span>
          </div>
          <div className="mt-1.5 h-1.5 rounded-full bg-gelo-2">
            <motion.div
              aria-hidden
              className="h-full origin-left rounded-full"
              style={{
                width: `${Math.max(1, Math.min(100, i.pct ?? 0))}%`,
                background: COR_VISITANTES,
              }}
              initial={reduzir ? false : { scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.5, delay: k * 0.04, ease: EASE }}
            />
          </div>
        </li>
      ))}
    </ol>
  );
}

function preencher(r: RelatorioLp & { de: string; ate: string }): PontoDiario[] {
  const mapa = new Map(r.diario.map((d) => [d.dia, d]));
  return diasEntre(hojeSP(new Date(r.de)), hojeSP(new Date(r.ate))).map((day) => {
    const d = mapa.get(day);
    return { day, visitors: d?.visitantes ?? 0, pageviews: d?.respostas ?? 0 };
  });
}

export function RelatorioLp({ lpId }: { lpId: string }) {
  const [dias, setDias] = useState<Dias>(30);
  const q = useQuery({
    queryKey: [...QK.lp(lpId), "relatorio", dias],
    queryFn: () => relatorioLpFn({ data: { id: lpId, dias } }),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
  const r = q.data;
  const serie = useMemo(() => (r ? preencher(r) : []), [r]);
  const atualizando = q.isFetching && q.isPlaceholderData;

  if (q.isError && !r)
    return <EstadoErro mensagem={mensagemErro(q.error)} onTentar={() => q.refetch()} />;

  return (
    <div className={cn("space-y-4 transition-opacity md:space-y-5", atualizando && "opacity-60")}>
      <div className="flex justify-end">
        <Segmentado rotulo="Período" opcoes={PERIODOS} valor={dias} onChange={setDias} />
      </div>

      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-6">
        {!r ? (
          Array.from({ length: 6 }, (_, i) => <EsqueletoIndicador key={i} />)
        ) : (
          <>
            <Numero
              rotulo="Visitantes"
              valor={numero(r.visitantes)}
              ajuda={`${numero(r.visitas)} visitas`}
            />
            <Numero rotulo="Respostas" valor={numero(r.respostas)} />
            <Numero
              rotulo="Conversão"
              valor={porcentagem(r.conversao ?? 0)}
              ajuda="visitantes que responderam"
            />
            <Numero rotulo="Tempo médio" valor={duracao(r.tempo_medio)} />
            <Numero
              rotulo="Rolagem média"
              valor={porcentagem(r.rolagem_media ?? 0, 0)}
              ajuda="da página"
            />
            <Numero rotulo="Cliques" valor={numero(r.cliques)} ajuda="botões e links" />
          </>
        )}
      </div>

      <Cartao className="pb-5">
        <TituloCartao titulo="Visitantes e respostas por dia" />
        <div className="px-5 pt-4 md:px-6">
          {!r ? (
            <EsqueletoGrafico />
          ) : (
            <GraficoDiario
              dados={serie}
              rotulos={{ visitors: "Visitantes", pageviews: "Respostas" }}
            />
          )}
        </div>
      </Cartao>

      <div className="grid gap-4 md:gap-5 lg:grid-cols-2">
        <Cartao className="pb-5">
          <TituloCartao
            titulo="Até onde as pessoas leem"
            descricao="Porcentagem das sessões que chegaram a cada seção (data-lp-secao)."
          />
          <div className="px-5 pt-4 md:px-6">
            {!r ? (
              <EsqueletoLista />
            ) : (
              <BarrasPct
                vazio="A LP não tem seções marcadas ou ainda não teve visitas."
                itens={r.secoes.map((s) => ({
                  chave: s.label,
                  rotulo: s.label,
                  pct: s.pct,
                  detalhe: `${numero(s.sessoes)} sessões`,
                }))}
              />
            )}
          </div>
        </Cartao>

        <Cartao className="pb-5">
          <TituloCartao
            titulo="Rolagem da página"
            descricao="Sessões que passaram de cada ponto da página."
          />
          <div className="px-5 pt-4 md:px-6">
            {!r ? (
              <EsqueletoLista linhas={4} />
            ) : (
              <BarrasPct
                vazio="Sem visitas no período."
                itens={r.rolagem.map((m) => ({
                  chave: String(m.marco),
                  rotulo: m.marco === 100 ? "Até o fim" : `${m.marco}% da página`,
                  pct: m.pct,
                }))}
              />
            )}
          </div>
        </Cartao>

        <Cartao className="pb-5">
          <TituloCartao titulo="Formulários" descricao="Quem começou a preencher e quem enviou." />
          <div className="px-5 pt-4 md:px-6">
            {!r ? (
              <EsqueletoLista linhas={2} />
            ) : r.formularios.length === 0 ? (
              <p className="py-6 text-sm text-cinza">Nenhum formulário usado no período.</p>
            ) : (
              <ul className="divide-y divide-linha">
                {r.formularios.map((f) => {
                  const taxa = f.inicios ? (f.respostas / f.inicios) * 100 : null;
                  return (
                    <li
                      key={f.form}
                      className="flex items-center justify-between gap-4 py-3 text-sm"
                    >
                      <span className="font-medium text-grafite">{f.form}</span>
                      <span className="text-right tabular-nums text-cinza">
                        {numero(f.inicios)} começaram →{" "}
                        <strong className="text-grafite">{numero(f.respostas)}</strong> enviaram
                        {taxa !== null && (
                          <span className="ml-2 rounded-full bg-gelo-2 px-2 py-0.5 text-xs">
                            {porcentagem(Math.min(100, taxa), 0)}
                          </span>
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </Cartao>

        <Cartao className="pb-5">
          <TituloCartao titulo="Cliques" descricao="Botões com data-lp-cta e links da página." />
          <div className="px-5 pt-4 md:px-6">
            {!r ? (
              <EsqueletoLista />
            ) : (
              <ListaRanqueada
                cor={COR_PAGINAS}
                vazio="Nenhum clique no período."
                itens={r.ctas.map((c) => ({
                  chave: `${c.tipo}-${c.label}`,
                  rotulo: c.tipo === "cta" ? c.label : `Link: ${c.label}`,
                  valor: c.cliques,
                  detalhe: `${numero(c.sessoes)} sessões`,
                }))}
              />
            )}
          </div>
        </Cartao>

        <Cartao className="pb-5">
          <TituloCartao titulo="De onde vêm" descricao="UTM source ou site de origem." />
          <div className="px-5 pt-4 md:px-6">
            {!r ? (
              <EsqueletoLista />
            ) : (
              <ListaRanqueada
                itens={r.origens.map((o) => ({
                  chave: o.label,
                  rotulo: o.label,
                  valor: o.visitantes,
                }))}
              />
            )}
          </div>
        </Cartao>

        <Cartao className="pb-5">
          <TituloCartao titulo="Aparelhos e cidades" />
          <div className="grid gap-6 px-5 pt-4 sm:grid-cols-2 md:px-6">
            {!r ? (
              <EsqueletoLista linhas={3} />
            ) : (
              <ListaRanqueada
                max={4}
                itens={r.dispositivos.map((d) => ({
                  chave: d.label,
                  rotulo: rotuloDispositivo(d.label),
                  valor: d.value,
                }))}
              />
            )}
            {!r ? (
              <EsqueletoLista linhas={3} />
            ) : (
              <ListaRanqueada
                max={6}
                vazio="Sem cidade identificada."
                itens={r.cidades.map((c) => ({ chave: c.label, rotulo: c.label, valor: c.value }))}
              />
            )}
          </div>
        </Cartao>
      </div>

      <Cartao className="pb-2">
        <TituloCartao
          titulo="Campanhas (UTM)"
          descricao="Visitantes e respostas por combinação de source, medium e campaign."
        />
        <div className="overflow-x-auto px-5 pt-3 md:px-6">
          {!r ? (
            <EsqueletoLista linhas={3} />
          ) : r.campanhas.length === 0 ? (
            <p className="py-6 text-sm text-cinza">Sem visitas no período.</p>
          ) : (
            <table className="w-full min-w-[34rem] text-sm">
              <thead>
                <tr className="border-b border-linha text-left text-xs text-cinza">
                  <th className="py-2 pr-3 font-medium">Source</th>
                  <th className="py-2 pr-3 font-medium">Medium</th>
                  <th className="py-2 pr-3 font-medium">Campaign</th>
                  <th className="py-2 pr-3 text-right font-medium">Visitantes</th>
                  <th className="py-2 pr-3 text-right font-medium">Respostas</th>
                  <th className="py-2 text-right font-medium">Conversão</th>
                </tr>
              </thead>
              <tbody>
                {r.campanhas.map((c, i) => (
                  <tr key={i} className="border-b border-linha last:border-0">
                    <td className="py-2.5 pr-3 text-grafite">{c.source}</td>
                    <td className="py-2.5 pr-3 text-cinza">{c.medium ?? "–"}</td>
                    <td className="py-2.5 pr-3 text-cinza">{c.campaign ?? "–"}</td>
                    <td className="py-2.5 pr-3 text-right tabular-nums">{numero(c.visitantes)}</td>
                    <td className="py-2.5 pr-3 text-right tabular-nums">{numero(c.respostas)}</td>
                    <td className="py-2.5 text-right tabular-nums">
                      {c.visitantes ? porcentagem((c.respostas / c.visitantes) * 100) : "–"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Cartao>
    </div>
  );
}
