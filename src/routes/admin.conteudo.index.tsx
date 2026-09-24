/**
 * Índice de conteúdo: todas as coleções do registro com a contagem de itens.
 */
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";

import { QK } from "@/components/admin/contexto";
import { Esqueleto, EstadoErro, TopoPagina } from "@/components/admin/ui";
import { COLLECTIONS, type CollectionConfig } from "@/content/collections";
import { contarItensFn } from "@/lib/admin/conteudo.functions";
import { mensagemErro } from "@/lib/admin/formato";

export const Route = createFileRoute("/admin/conteudo/")({
  head: () => ({
    meta: [{ title: "Conteúdo | Painel" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: IndiceConteudo,
});

function IndiceConteudo() {
  const q = useQuery({ queryKey: QK.contagemItens, queryFn: () => contarItensFn() });
  const colecoes = Object.values(COLLECTIONS) as CollectionConfig[];
  return (
    <>
      <TopoPagina
        titulo="Conteúdo"
        descricao="Cursos, mentorias, treinamentos, livros, depoimentos e posts do blog."
      />
      {q.isError && (
        <EstadoErro
          className="mb-4"
          mensagem={mensagemErro(q.error)}
          onTentar={() => q.refetch()}
        />
      )}
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {colecoes.map((c) => {
          const n = q.data?.[c.key];
          return (
            <li key={c.key}>
              <Link
                to="/admin/conteudo/$colecao"
                params={{ colecao: c.key }}
                className="group flex h-full flex-col rounded-[2px] border border-linha bg-papel p-5 transition-colors hover:border-petroleo/40"
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="font-serif text-xl text-petroleo">{c.plural}</span>
                  <ArrowRight
                    aria-hidden
                    className="size-4 text-cinza transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-petroleo"
                  />
                </span>
                <span className="mt-1 text-sm text-cinza">{c.descricao}</span>
                <span className="mt-4 text-xs text-cinza">
                  {q.isPending ? (
                    <Esqueleto className="h-3.5 w-32" />
                  ) : (
                    `${n?.total ?? 0} no total, ${n?.publicados ?? 0} publicad${c.genero}s`
                  )}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
