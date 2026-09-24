/**
 * Páginas editáveis do site (registro src/content/paginas, grupo "paginas").
 */
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Compass, Files, GearSix } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";

import { QK } from "@/components/admin/contexto";
import { Cartao, Esqueleto, EstadoErro, Selo, TopoPagina } from "@/components/admin/ui";
import { PAGINAS, type PaginaConfig } from "@/content/paginas";
import { dataHora, mensagemErro, relativo } from "@/lib/admin/formato";
import { listarPaginasSalvasFn } from "@/lib/admin/paginas.functions";

export const Route = createFileRoute("/admin/paginas/")({
  head: () => ({
    meta: [{ title: "Páginas | Painel" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: ListaPaginas,
});

function ListaPaginas() {
  const q = useQuery({ queryKey: QK.paginas, queryFn: () => listarPaginasSalvasFn() });
  const salvas = new Map((q.data ?? []).map((p) => [p.key, p]));
  const paginas = (Object.values(PAGINAS) as PaginaConfig[]).filter((p) => p.grupo === "paginas");

  return (
    <>
      <TopoPagina
        titulo="Páginas"
        descricao="Textos e imagens das páginas fixas do site. Enquanto uma página não for editada, o site mostra o texto de exemplo."
      />

      {q.isError && (
        <EstadoErro
          className="mb-4"
          mensagem={mensagemErro(q.error)}
          onTentar={() => q.refetch()}
        />
      )}

      <Cartao>
        <ul>
          {paginas.map((p) => {
            const salva = salvas.get(p.key);
            return (
              <li key={p.key} className="border-b border-linha last:border-0">
                <Link
                  to="/admin/paginas/$chave"
                  params={{ chave: p.key }}
                  className="group flex min-h-16 items-center gap-4 px-4 py-3 transition-colors hover:bg-petroleo/[0.03] md:px-5"
                >
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-petroleo-50 text-petroleo">
                    <Files aria-hidden className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-grafite group-hover:text-petroleo">
                      {p.titulo}
                    </span>
                    <span className="block truncate font-mono text-xs text-cinza">{p.path}</span>
                  </span>
                  <span className="hidden shrink-0 text-right sm:block">
                    {q.isPending ? (
                      <Esqueleto className="h-4 w-28" />
                    ) : salva ? (
                      <span className="text-xs text-cinza" title={dataHora(salva.updated_at)}>
                        Editada {relativo(salva.updated_at)}
                      </span>
                    ) : (
                      <Selo tom="ouro">Texto de exemplo</Selo>
                    )}
                  </span>
                  <ArrowRight
                    aria-hidden
                    className="size-4 shrink-0 text-cinza transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-petroleo"
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      </Cartao>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Link
          to="/admin/paginas/$chave"
          params={{ chave: "settings" }}
          className="group flex items-center gap-3 rounded-[2px] border border-linha bg-papel px-4 py-4 transition-colors hover:border-petroleo/40"
        >
          <GearSix aria-hidden className="size-5 text-petroleo" />
          <span className="flex-1">
            <span className="block font-medium text-grafite">Configurações</span>
            <span className="block text-xs text-cinza">
              Contatos, redes, rodapé e aviso de apresentação
            </span>
          </span>
        </Link>
        <Link
          to="/admin/paginas/$chave"
          params={{ chave: "diagnostico" }}
          className="group flex items-center gap-3 rounded-[2px] border border-linha bg-papel px-4 py-4 transition-colors hover:border-petroleo/40"
        >
          <Compass aria-hidden className="size-5 text-petroleo" />
          <span className="flex-1">
            <span className="block font-medium text-grafite">Diagnóstico</span>
            <span className="block text-xs text-cinza">
              Afirmações, escala e resultados por etapa
            </span>
          </span>
        </Link>
      </div>
    </>
  );
}
