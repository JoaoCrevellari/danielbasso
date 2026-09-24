/**
 * Visão geral: indicadores de navegação e leads do período, gráfico diário e rankings.
 */
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, ChartLineUp, Tray, WhatsappLogo } from "@phosphor-icons/react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { QK, useAdmin } from "@/components/admin/contexto";
import {
  EsqueletoGrafico,
  EsqueletoIndicador,
  EsqueletoLista,
  GraficoDiario,
  Indicador,
  ListaRanqueada,
  type PontoDiario,
} from "@/components/admin/graficos";
import {
  Cartao,
  Esqueleto,
  EstadoErro,
  EstadoVazio,
  Segmentado,
  Selo,
  TituloCartao,
  TopoPagina,
} from "@/components/admin/ui";
import { visaoGeralFn, type VisaoGeral } from "@/lib/admin/analytics.functions";
import {
  dataCurta,
  diasEntre,
  duracao,
  hojeSP,
  mensagemErro,
  numero,
  porcentagem,
  relativo,
} from "@/lib/admin/formato";
import { rotuloDispositivo, rotuloStatus, rotuloTipo } from "@/lib/admin/rotulos";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [{ title: "Visão geral | Painel" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: VisaoGeralPagina,
});

type Dias = 7 | 30 | 90;
const PERIODOS: { value: Dias; label: string }[] = [
  { value: 7, label: "7 dias" },
  { value: 30, label: "30 dias" },
  { value: 90, label: "90 dias" },
];

function saudacao() {
  const h = Number(
    new Date().toLocaleString("en-US", {
      hour: "numeric",
      hour12: false,
      timeZone: "America/Sao_Paulo",
    }),
  );
  return h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
}

function preencherDias(v: VisaoGeral): PontoDiario[] {
  const mapa = new Map(v.atual.daily.map((d) => [d.day, d]));
  return diasEntre(hojeSP(new Date(v.de)), hojeSP(new Date(v.ate))).map(
    (day) => mapa.get(day) ?? { day, visitors: 0, pageviews: 0 },
  );
}

function VisaoGeralPagina() {
  const [dias, setDias] = useState<Dias>(30);
  const { email } = useAdmin();
  const q = useQuery({
    queryKey: [...QK.visaoGeral, dias],
    queryFn: () => visaoGeralFn({ data: { dias } }),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });

  const v = q.data;
  const atualizando = q.isFetching && q.isPlaceholderData;
  const serie = useMemo(() => (v ? preencherDias(v) : []), [v]);
  const nome = email?.split("@")[0];

  return (
    <>
      <TopoPagina
        titulo={`${saudacao()}${nome ? `, ${nome}` : ""}`}
        descricao="Como o site está indo: visitas, origem do público e contatos recebidos."
        acoes={<Segmentado rotulo="Período" opcoes={PERIODOS} valor={dias} onChange={setDias} />}
      />

      {q.isError && !v ? (
        <EstadoErro mensagem={mensagemErro(q.error)} onTentar={() => q.refetch()} />
      ) : (
        <div className="space-y-4 md:space-y-5">
          {/* Indicadores */}
          <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
            {!v ? (
              Array.from({ length: 7 }, (_, i) => (
                <div key={i} className={i === 6 ? "col-span-2 lg:col-span-1" : undefined}>
                  <EsqueletoIndicador />
                </div>
              ))
            ) : (
              <Indicadores v={v} dias={dias} atualizando={atualizando} />
            )}
          </div>

          {q.isError && v && (
            <EstadoErro mensagem={mensagemErro(q.error)} onTentar={() => q.refetch()} />
          )}

          {/* Gráfico diário */}
          <Cartao>
            <TituloCartao
              titulo="Visitas por dia"
              descricao={`Últimos ${dias} dias, horário de Brasília`}
            />
            <div className="px-5 pt-3 pb-5 md:px-6">
              {!v ? (
                <EsqueletoGrafico />
              ) : v.atual.pageviews === 0 ? (
                <EstadoVazio
                  icone={<ChartLineUp />}
                  titulo="Ainda não há visitas registradas neste período"
                  texto="As visitas aparecem aqui assim que o site recebe público. Visitas de quem está logado no painel não contam."
                />
              ) : (
                <GraficoDiario dados={serie} atualizando={atualizando} />
              )}
            </div>
          </Cartao>

          {/* Rankings */}
          <div className="grid gap-4 md:gap-5 lg:grid-cols-2">
            <CartaoLista titulo="Páginas mais vistas" descricao="Páginas vistas no período">
              {!v ? (
                <EsqueletoLista />
              ) : (
                <ListaRanqueada
                  atualizando={atualizando}
                  total={v.atual.pageviews}
                  itens={v.atual.pages.map((p) => ({
                    chave: p.label,
                    rotulo: <span className="font-mono text-[0.8125rem]">{p.label}</span>,
                    titulo: p.label,
                    valor: p.value,
                    detalhe: p.visitors ? `${numero(p.visitors)} visitantes` : undefined,
                  }))}
                />
              )}
            </CartaoLista>

            <CartaoLista titulo="Origens" descricao="De onde vieram as sessões">
              {!v ? (
                <EsqueletoLista />
              ) : (
                <ListaRanqueada
                  atualizando={atualizando}
                  itens={v.atual.referrers.map((r) => ({
                    chave: r.label,
                    rotulo: r.label,
                    valor: r.value,
                  }))}
                />
              )}
            </CartaoLista>

            <CartaoLista titulo="Dispositivos" descricao="Visitantes por tipo de aparelho">
              {!v ? (
                <EsqueletoLista linhas={3} />
              ) : (
                <ListaRanqueada
                  atualizando={atualizando}
                  itens={v.atual.devices.map((d) => ({
                    chave: d.label,
                    rotulo: rotuloDispositivo(d.label),
                    valor: d.value,
                  }))}
                />
              )}
            </CartaoLista>

            <CartaoLista titulo="Cidades" descricao="Visitantes por cidade (aproximada)">
              {!v ? (
                <EsqueletoLista />
              ) : (
                <ListaRanqueada
                  atualizando={atualizando}
                  vazio="Sem localização registrada neste período."
                  itens={v.atual.cities.map((c) => ({
                    chave: c.label,
                    rotulo: c.label,
                    valor: c.value,
                  }))}
                />
              )}
            </CartaoLista>

            <CartaoLista
              titulo="Cliques em botões e WhatsApp"
              descricao="O que o público mais clicou"
            >
              {!v ? (
                <EsqueletoLista />
              ) : (
                <ListaRanqueada
                  atualizando={atualizando}
                  vazio="Nenhum clique registrado neste período."
                  itens={v.atual.ctas.map((c) => ({
                    chave: `${c.type}-${c.label}`,
                    rotulo: (
                      <span className="inline-flex items-center gap-2">
                        {c.type === "whatsapp" && (
                          <WhatsappLogo
                            aria-label="WhatsApp"
                            className="size-4 shrink-0 text-salvia-texto"
                          />
                        )}
                        {c.label}
                      </span>
                    ),
                    titulo: c.label,
                    valor: c.value,
                  }))}
                />
              )}
            </CartaoLista>

            <Cartao>
              <TituloCartao
                titulo="Leads recentes"
                descricao="Os últimos contatos recebidos"
                acoes={
                  <Link
                    to="/admin/leads"
                    className="inline-flex min-h-11 items-center gap-1 text-sm text-petroleo hover:underline md:min-h-0"
                  >
                    Ver todos <ArrowRight aria-hidden className="size-3.5" />
                  </Link>
                }
              />
              <div className="px-2 pt-2 pb-3 md:px-3">
                {!v ? (
                  <div className="space-y-2 px-3 py-2">
                    {Array.from({ length: 4 }, (_, i) => (
                      <Esqueleto key={i} className="h-10" />
                    ))}
                  </div>
                ) : v.leadsRecentes.length === 0 ? (
                  <EstadoVazio
                    icone={<Tray />}
                    titulo="Nenhum lead ainda"
                    texto="Formulários de contato, interesse e diagnóstico aparecem aqui."
                    className="py-8"
                  />
                ) : (
                  <ul>
                    {v.leadsRecentes.map((l) => (
                      <li key={l.id}>
                        <Link
                          to="/admin/leads"
                          search={{ lead: l.id }}
                          className="flex min-h-14 items-center gap-3 rounded-[2px] px-3 py-2 transition-colors hover:bg-petroleo/[0.04]"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-grafite">{l.name}</p>
                            <p className="truncate text-xs text-cinza">
                              {rotuloTipo(l.kind)}
                              {l.subject ? `: ${l.subject}` : l.company ? `, ${l.company}` : ""}
                            </p>
                          </div>
                          {l.status === "novo" && (
                            <Selo tom="ouro" ponto>
                              {rotuloStatus(l.status)}
                            </Selo>
                          )}
                          <span
                            className="shrink-0 text-xs text-cinza"
                            title={dataCurta(l.created_at)}
                          >
                            {relativo(l.created_at)}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Cartao>
          </div>
        </div>
      )}
    </>
  );
}

function Indicadores({
  v,
  dias,
  atualizando,
}: {
  v: VisaoGeral;
  dias: Dias;
  atualizando: boolean;
}) {
  const { atual: a, anterior: b } = v;
  const conv = a.visitors ? (a.leads / a.visitors) * 100 : 0;
  const convAnt = b.visitors ? (b.leads / b.visitors) * 100 : 0;
  const comum = { dias, atualizando };
  return (
    <>
      <Indicador
        {...comum}
        rotulo="Visitantes"
        valor={numero(a.visitors)}
        atual={a.visitors}
        anterior={b.visitors}
      />
      <Indicador
        {...comum}
        rotulo="Páginas vistas"
        valor={numero(a.pageviews)}
        atual={a.pageviews}
        anterior={b.pageviews}
      />
      <Indicador
        {...comum}
        rotulo="Sessões"
        valor={numero(a.sessions)}
        atual={a.sessions}
        anterior={b.sessions}
      />
      <Indicador
        {...comum}
        rotulo="Taxa de rejeição"
        ajuda="Sessões com uma única página vista"
        valor={porcentagem(a.bounce)}
        atual={a.bounce}
        anterior={b.bounce}
        menorMelhor
      />
      <Indicador
        {...comum}
        rotulo="Duração média"
        ajuda="Tempo médio das sessões com mais de uma página"
        valor={duracao(a.avg_duration)}
        atual={a.avg_duration}
        anterior={b.avg_duration}
      />
      <Indicador
        {...comum}
        rotulo="Leads"
        valor={numero(a.leads)}
        atual={a.leads}
        anterior={b.leads}
      />
      <div className="col-span-2 lg:col-span-1">
        <Indicador
          {...comum}
          rotulo="Conversão"
          ajuda="Leads divididos por visitantes"
          valor={porcentagem(conv)}
          atual={a.visitors ? conv : null}
          anterior={b.visitors ? convAnt : null}
        />
      </div>
    </>
  );
}

function CartaoLista({
  titulo,
  descricao,
  children,
}: {
  titulo: string;
  descricao: string;
  children: React.ReactNode;
}) {
  return (
    <Cartao>
      <TituloCartao titulo={titulo} descricao={descricao} />
      <div className="px-5 pt-4 pb-5 md:px-6">{children}</div>
    </Cartao>
  );
}
