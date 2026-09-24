/**
 * Diagnóstico de Autogoverno: distribuição das etapas-foco, média geral por etapa,
 * últimos resultados e atalho para editar as perguntas.
 */
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Compass, PencilSimple } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";

import { QK } from "@/components/admin/contexto";
import { BarrasEscala, EsqueletoLista, ListaRanqueada } from "@/components/admin/graficos";
import {
  Cartao,
  Esqueleto,
  EstadoErro,
  EstadoVazio,
  Selo,
  TituloCartao,
  TopoPagina,
  acao,
} from "@/components/admin/ui";
import { ETAPAS, nomeEtapa } from "@/content/fields";
import { dataCurta, mensagemErro, numero, relativo } from "@/lib/admin/formato";
import { resumoDiagnosticoFn } from "@/lib/admin/leads.functions";
import { TOM_STATUS, rotuloStatus } from "@/lib/admin/rotulos";

export const Route = createFileRoute("/admin/diagnostico")({
  head: () => ({
    meta: [{ title: "Diagnóstico | Painel" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: DiagnosticoPagina,
});

function DiagnosticoPagina() {
  const q = useQuery({ queryKey: QK.diagnostico, queryFn: () => resumoDiagnosticoFn() });
  const d = q.data;

  const maisComum = d
    ? ETAPAS.map((e) => ({ ...e, n: d.focos[e.value] ?? 0 })).sort((a, b) => b.n - a.n)[0]
    : null;

  return (
    <>
      <TopoPagina
        titulo="Diagnóstico"
        descricao="Resultados do Diagnóstico de Autogoverno respondido no site. A etapa foco é a de menor média nas respostas."
        acoes={
          <Link
            to="/admin/paginas/$chave"
            params={{ chave: "diagnostico" }}
            className={acao("primario")}
          >
            <PencilSimple aria-hidden className="size-4" />
            Editar perguntas e resultados
          </Link>
        }
      />

      {q.isError ? (
        <EstadoErro mensagem={mensagemErro(q.error)} onTentar={() => q.refetch()} />
      ) : d && d.total === 0 ? (
        <Cartao>
          <EstadoVazio
            icone={<Compass />}
            titulo="Ninguém concluiu o diagnóstico ainda"
            texto="Quando alguém responder e deixar o contato, a distribuição por etapa aparece aqui. Divulgue o link /diagnostico nas redes."
            acao={
              <a href="/diagnostico" target="_blank" rel="noopener" className={acao("secundario")}>
                Ver o diagnóstico no site
              </a>
            }
          />
        </Cartao>
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-3">
            <div className="rounded-[2px] border border-linha bg-papel p-4 md:p-5">
              <p className="text-sm text-cinza">Diagnósticos concluídos</p>
              {d ? (
                <p className="mt-2 text-[1.75rem] leading-none font-semibold text-petroleo-900 md:text-[2rem]">
                  {numero(d.total)}
                </p>
              ) : (
                <Esqueleto className="mt-3 h-8 w-16" />
              )}
            </div>
            <div className="rounded-[2px] border border-linha bg-papel p-4 md:p-5">
              <p className="text-sm text-cinza">Foco mais comum</p>
              {d && maisComum ? (
                <p className="mt-2 text-[1.35rem] leading-tight font-semibold text-petroleo-900 md:text-[1.6rem]">
                  {maisComum.n ? maisComum.label : "Sem dados"}
                </p>
              ) : (
                <Esqueleto className="mt-3 h-8 w-32" />
              )}
            </div>
            <div className="col-span-2 rounded-[2px] border border-linha bg-papel p-4 md:p-5 lg:col-span-1">
              <p className="text-sm text-cinza">Público</p>
              <p className="mt-2 text-sm text-grafite">
                Cada resultado vira um lead do tipo Diagnóstico.{" "}
                <Link
                  to="/admin/leads"
                  search={{ tipo: "diagnostico" }}
                  className="text-petroleo underline-offset-4 hover:underline"
                >
                  Ver leads
                </Link>
              </p>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <Cartao>
              <TituloCartao titulo="Etapa foco" descricao="Quantas pessoas caíram em cada etapa" />
              <div className="px-5 pt-4 pb-5 md:px-6">
                {!d ? (
                  <EsqueletoLista linhas={5} />
                ) : (
                  <ListaRanqueada
                    max={5}
                    itens={ETAPAS.map((e) => ({
                      chave: e.value,
                      rotulo: e.label,
                      valor: d.focos[e.value] ?? 0,
                    }))}
                  />
                )}
              </div>
            </Cartao>
            <Cartao>
              <TituloCartao
                titulo="Média geral por etapa"
                descricao="De 1 (discordo totalmente) a 5 (concordo totalmente)"
              />
              <div className="px-5 pt-4 pb-5 md:px-6">
                {!d ? (
                  <EsqueletoLista linhas={5} />
                ) : (
                  <BarrasEscala
                    maximo={5}
                    destaque={
                      ETAPAS.map((e) => ({ k: e.value, v: d.medias[e.value] }))
                        .filter((x) => typeof x.v === "number")
                        .sort((a, b) => (a.v as number) - (b.v as number))[0]?.k ?? null
                    }
                    itens={ETAPAS.map((e) => ({
                      chave: e.value,
                      rotulo: e.label,
                      valor: d.medias[e.value] ?? null,
                    }))}
                  />
                )}
              </div>
            </Cartao>
          </div>

          <Cartao>
            <TituloCartao
              titulo="Últimos resultados"
              acoes={
                <Link
                  to="/admin/leads"
                  search={{ tipo: "diagnostico" }}
                  className="inline-flex min-h-11 items-center gap-1 text-sm text-petroleo hover:underline md:min-h-0"
                >
                  Ver todos <ArrowRight aria-hidden className="size-3.5" />
                </Link>
              }
            />
            <div className="px-2 pt-2 pb-3 md:px-3">
              {!d ? (
                <div className="space-y-2 px-3 py-2">
                  {Array.from({ length: 4 }, (_, i) => (
                    <Esqueleto key={i} className="h-12" />
                  ))}
                </div>
              ) : (
                <ul>
                  {d.recentes.map((r) => (
                    <li key={r.id}>
                      <Link
                        to="/admin/leads"
                        search={{ lead: r.id }}
                        className="flex min-h-14 flex-wrap items-center gap-x-3 gap-y-1 rounded-[2px] px-3 py-2.5 transition-colors hover:bg-petroleo/[0.04]"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-grafite">
                            {r.name}
                          </span>
                          <span className="block truncate text-xs text-cinza">{r.email}</span>
                        </span>
                        {r.foco && <Selo tom="ouro">{nomeEtapa(r.foco) ?? r.foco}</Selo>}
                        <Selo tom={TOM_STATUS[r.status]}>{rotuloStatus(r.status)}</Selo>
                        <span
                          className="w-20 shrink-0 text-right text-xs text-cinza"
                          title={dataCurta(r.created_at)}
                        >
                          {relativo(r.created_at)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Cartao>
        </div>
      )}
    </>
  );
}
