/**
 * Leads: lista filtrável (cartões no celular, tabela no desktop), detalhe em gaveta,
 * mudança de status, anotações, contato rápido, exclusão (admin) e exportação CSV.
 * Filtros e lead aberto ficam na URL (dá para compartilhar o link).
 */
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowSquareOut,
  DownloadSimple,
  EnvelopeSimple,
  Trash,
  Tray,
  WhatsappLogo,
} from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

import { QK, useAdmin } from "@/components/admin/contexto";
import { Gaveta, useConfirmar } from "@/components/admin/Dialogo";
import { BarrasEscala } from "@/components/admin/graficos";
import { useToast } from "@/components/admin/Toast";
import {
  CampoBusca,
  Cartao,
  Esqueleto,
  EstadoErro,
  EstadoVazio,
  Girando,
  SelectFiltro,
  Selo,
  acao,
} from "@/components/admin/ui";
import { AreaTexto } from "@/components/admin/campos/base";
import { ETAPAS, nomeEtapa } from "@/content/fields";
import { getCollection } from "@/content/collections";
import {
  atualizarLeadFn,
  excluirLeadFn,
  listarLeadsFn,
  type Lead,
} from "@/lib/admin/leads.functions";
import {
  baixarArquivo,
  dataHora,
  gerarCsv,
  hojeSP,
  mensagemErro,
  relativo,
  whatsappDe,
} from "@/lib/admin/formato";
import {
  STATUS_LEAD,
  TIPOS_LEAD,
  TOM_STATUS,
  rotuloStatus,
  rotuloTipo,
  type StatusLead,
  type TipoLead,
} from "@/lib/admin/rotulos";
import { cn } from "@/lib/utils";

type Busca = {
  tipo?: TipoLead;
  status?: StatusLead;
  q?: string;
  ordem?: "antigos";
  lead?: string;
};

export const Route = createFileRoute("/admin/leads")({
  validateSearch: (s: Record<string, unknown>): Busca => ({
    tipo: TIPOS_LEAD.some((t) => t.value === s.tipo) ? (s.tipo as TipoLead) : undefined,
    status: STATUS_LEAD.some((t) => t.value === s.status) ? (s.status as StatusLead) : undefined,
    q: typeof s.q === "string" && s.q ? s.q.slice(0, 120) : undefined,
    ordem: s.ordem === "antigos" ? "antigos" : undefined,
    lead: typeof s.lead === "string" ? s.lead : undefined,
  }),
  head: () => ({
    meta: [{ title: "Leads | Painel" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: LeadsPagina,
});

function LeadsPagina() {
  const busca = Route.useSearch();
  const navigate = useNavigate({ from: "/admin/leads" });
  const [texto, setTexto] = useState(busca.q ?? "");

  // Busca com atraso curto para não consultar a cada tecla.
  useEffect(() => {
    const t = setTimeout(() => {
      const q = texto.trim() || undefined;
      if (q !== busca.q) navigate({ search: (s) => ({ ...s, q }), replace: true });
    }, 300);
    return () => clearTimeout(t);
  }, [texto, busca.q, navigate]);

  const filtros = {
    tipo: busca.tipo,
    status: busca.status,
    busca: busca.q,
    ordem: busca.ordem ?? "recentes",
  } as const;
  const q = useQuery({
    queryKey: [...QK.leads, filtros],
    queryFn: () => listarLeadsFn({ data: filtros }),
    placeholderData: (anterior) => anterior,
  });

  const leads = q.data ?? [];
  const aberto = busca.lead ? leads.find((l) => l.id === busca.lead) : undefined;
  const filtrando = !!(busca.tipo || busca.status || busca.q);

  const abrir = (id?: string) => navigate({ search: (s) => ({ ...s, lead: id }) });

  function exportar() {
    const linhas = leads.map((l) => [
      dataHora(l.created_at),
      rotuloTipo(l.kind),
      rotuloStatus(l.status),
      l.name,
      l.email,
      l.phone,
      l.company,
      l.subject ?? l.item?.title,
      l.message,
      l.kind === "diagnostico" ? (nomeEtapa(l.data.foco) ?? "") : "",
      l.source_path,
      l.referrer,
      l.utm?.utm_source ?? l.utm?.source,
      l.utm?.utm_medium ?? l.utm?.medium,
      l.utm?.utm_campaign ?? l.utm?.campaign,
      l.notes,
    ]);
    const csv = gerarCsv(
      [
        "Recebido em",
        "Tipo",
        "Status",
        "Nome",
        "E-mail",
        "Telefone",
        "Empresa",
        "Assunto",
        "Mensagem",
        "Etapa foco",
        "Página de origem",
        "Referência",
        "UTM origem",
        "UTM mídia",
        "UTM campanha",
        "Anotações",
      ],
      linhas,
    );
    baixarArquivo(`leads-${hojeSP()}.csv`, csv);
  }

  return (
    <>
      <header className="mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-serif text-[2rem] leading-[1.1] font-[420] tracking-[-0.015em] text-petroleo md:text-[2.4rem]">
            Leads
          </h1>
          <p className="mt-2 max-w-2xl text-[0.9375rem] text-cinza">
            Tudo o que chega pelos formulários do site: contato, interesse, propostas e
            diagnósticos.
          </p>
        </div>
        <button
          type="button"
          className={acao("secundario")}
          onClick={exportar}
          disabled={!leads.length}
        >
          <DownloadSimple aria-hidden className="size-4" />
          Exportar CSV
        </button>
      </header>

      {/* Filtros */}
      <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))]">
        <CampoBusca
          valor={texto}
          onChange={setTexto}
          rotulo="Buscar por nome, e-mail ou empresa"
          className="sm:col-span-2 lg:col-span-1"
        />
        <SelectFiltro
          rotulo="Tipo"
          valor={busca.tipo ?? ""}
          onChange={(v) =>
            navigate({ search: (s) => ({ ...s, tipo: (v || undefined) as TipoLead | undefined }) })
          }
          opcoes={TIPOS_LEAD}
        />
        <SelectFiltro
          rotulo="Status"
          valor={busca.status ?? ""}
          onChange={(v) =>
            navigate({
              search: (s) => ({ ...s, status: (v || undefined) as StatusLead | undefined }),
            })
          }
          opcoes={STATUS_LEAD}
        />
        <SelectFiltro
          rotulo="Ordem"
          todos="Mais recentes primeiro"
          valor={busca.ordem ?? ""}
          onChange={(v) =>
            navigate({ search: (s) => ({ ...s, ordem: v === "antigos" ? "antigos" : undefined }) })
          }
          opcoes={[{ value: "antigos", label: "Mais antigos primeiro" }]}
        />
      </div>

      <div
        className="mb-3 flex min-h-6 items-center justify-between gap-3 text-sm text-cinza"
        aria-live="polite"
      >
        <span>
          {q.isPending
            ? "Carregando…"
            : `${leads.length.toLocaleString("pt-BR")} ${leads.length === 1 ? "lead" : "leads"}${filtrando ? " com estes filtros" : ""}`}
          {q.isFetching && !q.isPending && <Girando className="ml-2 inline size-3.5" />}
        </span>
        {filtrando && (
          <button
            type="button"
            className="min-h-11 text-petroleo underline-offset-4 hover:underline md:min-h-0"
            onClick={() => {
              setTexto("");
              navigate({ search: {} });
            }}
          >
            Limpar filtros
          </button>
        )}
      </div>

      {q.isError ? (
        <EstadoErro mensagem={mensagemErro(q.error)} onTentar={() => q.refetch()} />
      ) : q.isPending ? (
        <EsqueletoLeads />
      ) : leads.length === 0 ? (
        <Cartao>
          <EstadoVazio
            icone={<Tray />}
            titulo={filtrando ? "Nenhum lead com estes filtros" : "Nenhum lead ainda"}
            texto={
              filtrando
                ? "Tente outro termo de busca ou limpe os filtros."
                : "Quando alguém enviar um formulário ou concluir o diagnóstico, o contato aparece aqui."
            }
          />
        </Cartao>
      ) : (
        <div
          className={cn("transition-opacity", q.isFetching && q.isPlaceholderData && "opacity-60")}
        >
          {/* Celular: cartões */}
          <ul className="space-y-2 md:hidden">
            {leads.map((l) => (
              <li key={l.id}>
                <button
                  type="button"
                  onClick={() => abrir(l.id)}
                  className="block w-full rounded-[2px] border border-linha bg-papel px-4 py-3.5 text-left transition-colors active:bg-petroleo-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="min-w-0 truncate font-medium text-grafite">{l.name}</p>
                    <Selo tom={TOM_STATUS[l.status]} ponto={l.status === "novo"}>
                      {rotuloStatus(l.status)}
                    </Selo>
                  </div>
                  <p className="mt-0.5 truncate text-sm text-cinza">{l.email ?? l.phone}</p>
                  <div className="mt-2 flex items-center justify-between gap-3 text-xs text-cinza">
                    <span className="truncate">
                      {rotuloTipo(l.kind)}
                      {l.subject || l.item?.title ? `: ${l.subject ?? l.item?.title}` : ""}
                    </span>
                    <span className="shrink-0">{relativo(l.created_at)}</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>

          {/* Desktop: tabela */}
          <Cartao className="hidden overflow-hidden md:block">
            <table className="w-full text-sm">
              <caption className="sr-only">Leads recebidos</caption>
              <thead className="border-b border-linha bg-gelo/60 text-left text-xs text-cinza">
                <tr>
                  <th scope="col" className="px-5 py-3 font-medium">
                    Pessoa
                  </th>
                  <th scope="col" className="px-3 py-3 font-medium">
                    Tipo
                  </th>
                  <th scope="col" className="hidden px-3 py-3 font-medium lg:table-cell">
                    Assunto
                  </th>
                  <th scope="col" className="px-3 py-3 font-medium">
                    Status
                  </th>
                  <th scope="col" className="px-5 py-3 text-right font-medium">
                    Recebido
                  </th>
                </tr>
              </thead>
              <tbody>
                {leads.map((l) => (
                  <tr
                    key={l.id}
                    onClick={() => abrir(l.id)}
                    className="cursor-pointer border-b border-linha transition-colors last:border-0 hover:bg-petroleo/[0.03]"
                  >
                    <td className="max-w-0 px-5 py-3 lg:w-[34%]">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          abrir(l.id);
                        }}
                        className="block max-w-full truncate text-left font-medium text-grafite hover:text-petroleo hover:underline"
                      >
                        {l.name}
                      </button>
                      <p className="truncate text-xs text-cinza">
                        {[l.email, l.phone, l.company].filter(Boolean).join(" · ")}
                      </p>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-grafite">
                      {rotuloTipo(l.kind)}
                    </td>
                    <td className="hidden max-w-0 truncate px-3 py-3 text-cinza lg:table-cell">
                      {l.kind === "diagnostico"
                        ? l.data.foco
                          ? `Foco: ${nomeEtapa(l.data.foco) ?? l.data.foco}`
                          : ""
                        : (l.subject ?? l.item?.title ?? l.message ?? "")}
                    </td>
                    <td className="px-3 py-3">
                      <Selo tom={TOM_STATUS[l.status]} ponto={l.status === "novo"}>
                        {rotuloStatus(l.status)}
                      </Selo>
                    </td>
                    <td
                      className="px-5 py-3 text-right whitespace-nowrap text-cinza"
                      title={dataHora(l.created_at)}
                    >
                      {relativo(l.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Cartao>
          {leads.length >= 1000 && (
            <p className="mt-3 text-sm text-cinza">
              Mostrando os 1.000 mais recentes. Use os filtros para refinar.
            </p>
          )}
        </div>
      )}

      <Gaveta
        aberto={!!busca.lead && !!aberto}
        onFechar={() => abrir(undefined)}
        titulo={aberto?.name ?? "Lead"}
        descricao={
          aberto ? `${rotuloTipo(aberto.kind)}, recebido ${relativo(aberto.created_at)}` : undefined
        }
      >
        {aberto && <DetalheLead lead={aberto} onFechar={() => abrir(undefined)} />}
      </Gaveta>
    </>
  );
}

function EsqueletoLeads() {
  return (
    <div aria-hidden>
      <div className="space-y-2 md:hidden">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="rounded-[2px] border border-linha bg-papel px-4 py-3.5">
            <div className="flex justify-between">
              <Esqueleto className="h-4 w-36" />
              <Esqueleto className="h-5 w-16 rounded-full" />
            </div>
            <Esqueleto className="mt-2 h-3.5 w-48" />
            <Esqueleto className="mt-3 h-3 w-full" />
          </div>
        ))}
      </div>
      <div className="hidden rounded-[2px] border border-linha bg-papel md:block">
        {Array.from({ length: 7 }, (_, i) => (
          <div
            key={i}
            className="flex items-center gap-6 border-b border-linha px-5 py-4 last:border-0"
          >
            <div className="flex-1">
              <Esqueleto className="h-4 w-40" />
              <Esqueleto className="mt-1.5 h-3 w-56" />
            </div>
            <Esqueleto className="h-4 w-20" />
            <Esqueleto className="h-5 w-20 rounded-full" />
            <Esqueleto className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

function Linha({ termo, children }: { termo: string; children: React.ReactNode }) {
  if (children === null || children === undefined || children === "") return null;
  return (
    <div className="grid grid-cols-[8rem_minmax(0,1fr)] gap-3 py-2 text-sm">
      <dt className="text-cinza">{termo}</dt>
      <dd className="min-w-0 break-words text-grafite">{children}</dd>
    </div>
  );
}

function DetalheLead({ lead, onFechar }: { lead: Lead; onFechar: () => void }) {
  const qc = useQueryClient();
  const toast = useToast();
  const confirmar = useConfirmar();
  const { admin } = useAdmin();
  const [notas, setNotas] = useState(lead.notes ?? "");
  useEffect(() => setNotas(lead.notes ?? ""), [lead.id, lead.notes]);

  const substituir = (novo: Lead) => {
    qc.setQueriesData<Lead[]>({ queryKey: QK.leads }, (lista) =>
      lista?.map((l) => (l.id === novo.id ? novo : l)),
    );
    qc.invalidateQueries({ queryKey: QK.leadsNovos });
  };

  const status = useMutation({
    mutationFn: (s: StatusLead) => atualizarLeadFn({ data: { id: lead.id, status: s } }),
    onSuccess: (novo) => {
      substituir(novo);
      toast.sucesso(`Status alterado para "${rotuloStatus(novo.status)}".`);
    },
    onError: (e) => toast.erro(mensagemErro(e)),
  });

  const salvarNotas = useMutation({
    mutationFn: () => atualizarLeadFn({ data: { id: lead.id, notes: notas } }),
    onSuccess: (novo) => {
      substituir(novo);
      toast.sucesso("Anotações salvas.");
    },
    onError: (e) => toast.erro(mensagemErro(e)),
  });

  const excluir = useMutation({
    mutationFn: () => excluirLeadFn({ data: { id: lead.id } }),
    onSuccess: () => {
      qc.setQueriesData<Lead[]>({ queryKey: QK.leads }, (lista) =>
        lista?.filter((l) => l.id !== lead.id),
      );
      qc.invalidateQueries({ queryKey: QK.leadsNovos });
      qc.invalidateQueries({ queryKey: QK.visaoGeral });
      toast.sucesso("Lead excluído.");
      onFechar();
    },
    onError: (e) => toast.erro(mensagemErro(e)),
  });

  const whats = whatsappDe(lead.phone);
  const notasSujas = (lead.notes ?? "") !== notas;
  const col = lead.item ? getCollection(lead.item.collection) : undefined;
  const pontuacao = (lead.data.pontuacao ?? {}) as Record<string, number>;
  const foco = typeof lead.data.foco === "string" ? lead.data.foco : null;
  const temUtm = lead.utm && Object.keys(lead.utm).length > 0;

  return (
    <div className="space-y-6 px-5 py-5 md:px-6">
      {/* Ações rápidas */}
      <div className="flex flex-wrap gap-2">
        {whats && (
          <a
            href={whats}
            target="_blank"
            rel="noopener noreferrer"
            className={acao("primario", "sm")}
          >
            <WhatsappLogo aria-hidden className="size-4" />
            WhatsApp
          </a>
        )}
        {lead.email && (
          <a href={`mailto:${lead.email}`} className={acao("secundario", "sm")}>
            <EnvelopeSimple aria-hidden className="size-4" />
            E-mail
          </a>
        )}
      </div>

      {/* Status */}
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-grafite">Status</legend>
        <div
          className="grid grid-cols-2 gap-2 sm:grid-cols-4"
          role="radiogroup"
          aria-label="Status do lead"
        >
          {STATUS_LEAD.map((s) => {
            const ativo = lead.status === s.value;
            return (
              <button
                key={s.value}
                type="button"
                role="radio"
                aria-checked={ativo}
                disabled={status.isPending}
                onClick={() => !ativo && status.mutate(s.value)}
                className={cn(
                  "min-h-11 rounded-full border px-3 text-sm font-medium transition-colors md:min-h-9",
                  ativo
                    ? "border-petroleo bg-petroleo text-gelo"
                    : "border-linha-forte bg-papel text-cinza hover:border-petroleo hover:text-petroleo",
                )}
              >
                {status.isPending && status.variables === s.value ? (
                  <Girando className="mx-auto" />
                ) : (
                  s.label
                )}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Dados */}
      <section>
        <h3 className="mb-1 text-xs font-medium tracking-[0.12em] text-cinza uppercase">
          Dados enviados
        </h3>
        <dl className="divide-y divide-linha">
          <Linha termo="Recebido em">{dataHora(lead.created_at)}</Linha>
          <Linha termo="Tipo">{rotuloTipo(lead.kind)}</Linha>
          <Linha termo="E-mail">
            {lead.email && (
              <a
                href={`mailto:${lead.email}`}
                className="text-petroleo underline-offset-4 hover:underline"
              >
                {lead.email}
              </a>
            )}
          </Linha>
          <Linha termo="Telefone">{lead.phone}</Linha>
          <Linha termo="Empresa">{lead.company}</Linha>
          <Linha termo="Assunto">{lead.subject}</Linha>
          <Linha termo="Interesse em">
            {lead.item && (
              <span>
                {lead.item.title}
                {col && <span className="text-cinza"> ({col.singular.toLowerCase()})</span>}
              </span>
            )}
          </Linha>
        </dl>
        {lead.message && (
          <div className="mt-3 rounded-[2px] border border-linha bg-papel px-4 py-3">
            <p className="mb-1 text-xs text-cinza">Mensagem</p>
            <p className="text-sm whitespace-pre-wrap text-grafite">{lead.message}</p>
          </div>
        )}
        {/* Campos extras enviados pelo formulário (exceto os do diagnóstico, mostrados abaixo) */}
        {Object.entries(lead.data)
          .filter(
            ([k, v]) =>
              !["respostas", "pontuacao", "foco"].includes(k) &&
              (typeof v === "string" || typeof v === "number"),
          )
          .map(([k, v]) => (
            <dl key={k}>
              <Linha termo={k.replace(/_/g, " ")}>{String(v)}</Linha>
            </dl>
          ))}
      </section>

      {/* Diagnóstico */}
      {lead.kind === "diagnostico" && Object.keys(pontuacao).length > 0 && (
        <section>
          <h3 className="mb-3 text-xs font-medium tracking-[0.12em] text-cinza uppercase">
            Resultado do diagnóstico
          </h3>
          {foco && (
            <p className="mb-4 text-sm text-grafite">
              Etapa foco: <strong className="font-semibold">{nomeEtapa(foco) ?? foco}</strong>
            </p>
          )}
          <BarrasEscala
            maximo={5}
            destaque={foco}
            itens={ETAPAS.map((e) => ({
              chave: e.value,
              rotulo: e.label,
              valor: typeof pontuacao[e.value] === "number" ? pontuacao[e.value] : null,
            }))}
          />
          <p className="mt-3 text-xs text-cinza">Média das respostas por etapa, de 1 a 5.</p>
        </section>
      )}

      {/* Origem */}
      <section>
        <h3 className="mb-1 text-xs font-medium tracking-[0.12em] text-cinza uppercase">Origem</h3>
        <dl className="divide-y divide-linha">
          <Linha termo="Página">
            {lead.source_path && (
              <a
                href={lead.source_path}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-1 font-mono text-[0.8125rem] text-petroleo hover:underline"
              >
                {lead.source_path}
                <ArrowSquareOut aria-hidden className="size-3.5" />
              </a>
            )}
          </Linha>
          <Linha termo="Veio de">
            {lead.referrer || (lead.source_path ? "Acesso direto" : "")}
          </Linha>
          {temUtm &&
            Object.entries(lead.utm!).map(([k, v]) => (
              <Linha key={k} termo={k.replace(/^utm_/, "UTM ")}>
                {v}
              </Linha>
            ))}
        </dl>
      </section>

      {/* Anotações */}
      <section>
        <label htmlFor="notas-lead" className="mb-1.5 block text-sm font-medium text-grafite">
          Anotações da equipe
        </label>
        <AreaTexto
          id="notas-lead"
          value={notas}
          rows={4}
          placeholder="Ex.: liguei em 12/03, retornar na semana que vem."
          onChange={(e) => setNotas(e.target.value)}
        />
        <div className="mt-2 flex items-center gap-3">
          <button
            type="button"
            className={acao("primario", "sm")}
            disabled={!notasSujas || salvarNotas.isPending}
            onClick={() => salvarNotas.mutate()}
          >
            {salvarNotas.isPending && <Girando />}
            Salvar anotações
          </button>
          {notasSujas && <span className="text-xs text-cinza">Alterações não salvas</span>}
        </div>
      </section>

      {admin && (
        <section className="border-t border-linha pt-5">
          <button
            type="button"
            className={acao("perigo", "sm")}
            disabled={excluir.isPending}
            onClick={async () => {
              const ok = await confirmar({
                titulo: "Excluir este lead?",
                descricao: (
                  <>
                    Os dados de <strong>{lead.name}</strong> serão apagados de vez. Não dá para
                    desfazer.
                  </>
                ),
                confirmar: "Excluir",
                perigo: true,
              });
              if (ok) excluir.mutate();
            }}
          >
            {excluir.isPending ? <Girando /> : <Trash aria-hidden className="size-4" />}
            Excluir lead
          </button>
        </section>
      )}

      {lead.item && col && (
        <p className="text-xs text-cinza">
          <Link
            to="/admin/conteudo/$colecao/$id"
            params={{ colecao: lead.item.collection, id: lead.item_id ?? "" }}
            className="text-petroleo underline-offset-4 hover:underline"
          >
            Abrir {col.singular.toLowerCase()} no painel
          </Link>
        </p>
      )}
    </div>
  );
}
