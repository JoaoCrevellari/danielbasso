/**
 * Respostas dos formulários de uma LP: filtro por formulário, busca, colunas montadas a
 * partir dos campos enviados e exportação para planilha (CSV do Excel em pt-BR).
 */
import { Link } from "@tanstack/react-router";
import { DownloadSimple, Tray, WhatsappLogo } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { QK } from "@/components/admin/contexto";
import {
  Cartao,
  CampoBusca,
  Esqueleto,
  EstadoErro,
  EstadoVazio,
  Selo,
  acao,
} from "@/components/admin/ui";
import { baixarArquivo, dataHora, gerarCsv, mensagemErro, whatsappDe } from "@/lib/admin/formato";
import { respostasLpFn, type RespostaLp } from "@/lib/admin/lps.functions";
import { rotuloStatus } from "@/lib/admin/rotulos";
import { cn } from "@/lib/utils";

const OCULTOS = new Set(["consentimento_em"]);

function rotuloCampo(k: string) {
  const s = k.replace(/_/g, " ");
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function RespostasLp({ lpId, slug }: { lpId: string; slug: string }) {
  const q = useQuery({
    queryKey: [...QK.lp(lpId), "respostas"],
    // Busca em blocos de 1.000 (até 20.000); a tela desenha 100 por vez.
    queryFn: async () => {
      let todas: RespostaLp[] = [];
      for (let pagina = 0; pagina < 20; pagina++) {
        const r = await respostasLpFn({ data: { id: lpId, pagina } });
        todas = todas.concat(r.respostas);
        if (todas.length >= r.total || !r.respostas.length) break;
      }
      return todas;
    },
  });
  const [form, setForm] = useState("todos");
  const [busca, setBusca] = useState("");
  const [limite, setLimite] = useState(100);

  const todas = useMemo(() => q.data ?? [], [q.data]);
  const formularios = useMemo(() => [...new Set(todas.map((r) => r.formulario))], [todas]);
  const lista = useMemo(() => {
    const t = busca.trim().toLowerCase();
    return todas.filter(
      (r) =>
        (form === "todos" || r.formulario === form) &&
        (!t ||
          [r.nome, r.email, r.telefone, ...Object.values(r.campos)].some((v) =>
            (v ?? "").toLowerCase().includes(t),
          )),
    );
  }, [todas, form, busca]);
  const visiveis = useMemo(() => lista.slice(0, limite), [lista, limite]);
  const colunas = useMemo(() => {
    const s = new Set<string>();
    for (const r of lista) for (const k of Object.keys(r.campos)) if (!OCULTOS.has(k)) s.add(k);
    return [...s];
  }, [lista]);

  function exportar() {
    const cab = [
      "Data",
      "Formulário",
      "Nome",
      "E-mail",
      "WhatsApp",
      ...colunas.map(rotuloCampo),
      "UTM source",
      "UTM medium",
      "UTM campaign",
      "UTM content",
      "Status",
    ];
    const linhas = lista.map((r) => [
      dataHora(r.criadaEm),
      r.formulario,
      r.nome,
      r.email,
      r.telefone,
      ...colunas.map((c) => r.campos[c] ?? ""),
      r.utm.utm_source,
      r.utm.utm_medium,
      r.utm.utm_campaign,
      r.utm.utm_content,
      rotuloStatus(r.status),
    ]);
    baixarArquivo(
      `respostas-${slug}-${new Date().toISOString().slice(0, 10)}.csv`,
      gerarCsv(cab, linhas),
    );
  }

  if (q.isError)
    return <EstadoErro mensagem={mensagemErro(q.error)} onTentar={() => q.refetch()} />;
  if (q.isPending) {
    return (
      <Cartao aria-hidden className="p-5">
        {Array.from({ length: 5 }, (_, i) => (
          <Esqueleto key={i} className="mb-3 h-10" />
        ))}
      </Cartao>
    );
  }
  if (!todas.length) {
    return (
      <EstadoVazio
        icone={<Tray />}
        titulo="Nenhuma resposta ainda"
        texto="Quando alguém enviar um formulário da LP, a resposta aparece aqui e também na caixa de Leads."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-center">
        <CampoBusca
          valor={busca}
          onChange={(v) => {
            setBusca(v);
            setLimite(100);
          }}
          rotulo="Buscar nas respostas"
          className="md:max-w-sm md:flex-1"
        />
        {formularios.length > 1 && (
          <div className="flex flex-wrap gap-1.5">
            {["todos", ...formularios].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => {
                  setForm(f);
                  setLimite(100);
                }}
                aria-pressed={form === f}
                className={cn(
                  "min-h-9 rounded-full border px-3 text-sm transition-colors",
                  form === f
                    ? "border-petroleo bg-petroleo text-gelo"
                    : "border-linha-forte bg-papel text-cinza hover:border-petroleo",
                )}
              >
                {f === "todos" ? "Todos" : f}
              </button>
            ))}
          </div>
        )}
        <div className="flex gap-2 md:ml-auto">
          <Link to="/admin/leads" search={{ tipo: "lp" }} className={acao("fantasma", "sm")}>
            Abrir em Leads
          </Link>
          <button
            type="button"
            className={acao("secundario", "sm")}
            onClick={exportar}
            disabled={!lista.length}
          >
            <DownloadSimple aria-hidden className="size-4" />
            Exportar ({lista.length})
          </button>
        </div>
      </div>

      <Cartao>
        {/* Celular: cartões */}
        <ul className="divide-y divide-linha md:hidden">
          {visiveis.map((r) => {
            const whats = whatsappDe(r.telefone);
            return (
              <li key={r.id} className="px-4 py-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-grafite">{r.nome}</p>
                    <p className="truncate text-xs text-cinza">
                      {[r.email, r.telefone].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  {whats && (
                    <a
                      href={whats}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex size-10 shrink-0 items-center justify-center rounded-full text-salvia-texto hover:bg-salvia/10"
                      aria-label={`WhatsApp de ${r.nome}`}
                    >
                      <WhatsappLogo aria-hidden className="size-5" />
                    </a>
                  )}
                </div>
                <p className="mt-1 text-xs text-cinza">
                  {dataHora(r.criadaEm)} · {r.formulario}
                  {r.utm.utm_source ? ` · ${r.utm.utm_source}` : ""}
                </p>
                {colunas.length > 0 && (
                  <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-xs">
                    {colunas
                      .filter((c) => r.campos[c])
                      .map((c) => (
                        <div key={c} className="contents">
                          <dt className="text-cinza">{rotuloCampo(c)}</dt>
                          <dd className="text-grafite">{r.campos[c]}</dd>
                        </div>
                      ))}
                  </dl>
                )}
              </li>
            );
          })}
        </ul>

        {/* Desktop: tabela */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-linha text-left text-xs text-cinza">
                <th className="px-4 py-2.5 font-medium whitespace-nowrap">Data</th>
                <th className="px-3 py-2.5 font-medium">Nome</th>
                <th className="px-3 py-2.5 font-medium">Contato</th>
                <th className="px-3 py-2.5 font-medium">Formulário</th>
                {colunas.map((c) => (
                  <th key={c} className="px-3 py-2.5 font-medium whitespace-nowrap">
                    {rotuloCampo(c)}
                  </th>
                ))}
                <th className="px-3 py-2.5 font-medium">Origem</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {visiveis.map((r) => {
                const whats = whatsappDe(r.telefone);
                return (
                  <tr key={r.id} className="border-b border-linha align-top last:border-0">
                    <td className="px-4 py-2.5 whitespace-nowrap text-cinza">
                      {dataHora(r.criadaEm)}
                    </td>
                    <td className="px-3 py-2.5 font-medium text-grafite">{r.nome}</td>
                    <td className="px-3 py-2.5">
                      {r.email && (
                        <a
                          href={`mailto:${r.email}`}
                          className="block text-petroleo hover:underline"
                        >
                          {r.email}
                        </a>
                      )}
                      {r.telefone &&
                        (whats ? (
                          <a
                            href={whats}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-salvia-texto hover:underline"
                          >
                            {r.telefone}
                          </a>
                        ) : (
                          <span className="block text-cinza">{r.telefone}</span>
                        ))}
                    </td>
                    <td className="px-3 py-2.5 text-cinza">{r.formulario}</td>
                    {colunas.map((c) => (
                      <td key={c} className="max-w-[16rem] px-3 py-2.5 text-grafite">
                        {r.campos[c] ?? ""}
                      </td>
                    ))}
                    <td className="px-3 py-2.5 text-cinza">
                      {[r.utm.utm_source, r.utm.utm_campaign].filter(Boolean).join(" / ") || "–"}
                    </td>
                    <td className="px-4 py-2.5">
                      <Selo
                        tom={
                          r.status === "novo"
                            ? "ouro"
                            : r.status === "convertido"
                              ? "salvia"
                              : "neutro"
                        }
                      >
                        {rotuloStatus(r.status)}
                      </Selo>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Cartao>
      {lista.length > visiveis.length && (
        <div className="flex justify-center">
          <button
            type="button"
            className={acao("secundario")}
            onClick={() => setLimite((l) => l + 100)}
          >
            Mostrar mais ({(lista.length - visiveis.length).toLocaleString("pt-BR")} restantes)
          </button>
        </div>
      )}
    </div>
  );
}
