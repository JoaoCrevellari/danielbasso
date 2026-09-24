import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { Abertura } from "@/components/site/Abertura";
import { PostDestaque, PostLinha } from "@/components/site/CartaoPost";
import { ChamadaFinal } from "@/components/site/ChamadaFinal";
import { Filtros } from "@/components/site/Filtros";
import { CabecalhoSecao, Secao } from "@/components/site/Secao";
import { semDestaque } from "@/components/site/Titulo";
import { COLLECTIONS } from "@/content/collections";
import { carregarPagina, listarItens, txt } from "@/lib/conteudo";
import { buildMeta, canonical } from "@/lib/seo";

export const Route = createFileRoute("/blog/")({
  loader: async () => {
    const [pagina, posts] = await Promise.all([carregarPagina("blog"), listarItens("post")]);
    return { pagina, posts };
  },
  head: ({ loaderData }) => ({
    meta: buildMeta({
      title: "Blog",
      description: semDestaque(loaderData?.pagina.hero.subtitulo),
      path: "/blog",
    }),
    links: canonical("/blog"),
  }),
  component: Blog,
});

const CATEGORIAS = (() => {
  const f = COLLECTIONS.post.fields.find((x) => x.key === "categoria");
  return f?.type === "select" ? f.options : [];
})();

function Blog() {
  const { pagina, posts } = Route.useLoaderData();
  const [filtro, setFiltro] = useState("todos");
  const presentes = CATEGORIAS.filter((c) => posts.some((p) => txt(p, "categoria") === c.value));
  const visiveis = filtro === "todos" ? posts : posts.filter((p) => txt(p, "categoria") === filtro);
  const [primeiro, ...resto] = visiveis;
  const recentes = resto.slice(0, 3);
  const anteriores = resto.slice(3);

  return (
    <>
      <Abertura rotulo="Blog" titulo={pagina.hero.titulo} subtitulo={pagina.hero.subtitulo} />

      <Secao>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="type-meta text-cinza max-md:hidden">
            {visiveis.length} {visiveis.length === 1 ? "texto" : "textos"}
          </p>
          <Filtros
            rotulo="Filtrar por categoria"
            opcoes={presentes}
            valor={filtro}
            onChange={setFiltro}
          />
        </div>
        {!primeiro ? (
          <p className="mt-10 text-cinza">Nenhum texto publicado nesta categoria ainda.</p>
        ) : (
          <div key={filtro} className="mt-8 grade gap-y-6">
            <div className="col-span-12 lg:col-span-6" data-revelar-grupo>
              <PostDestaque post={primeiro} />
            </div>
            {recentes.length > 0 && (
              <div
                className="col-span-12 flex flex-col divide-y divide-linha border-y border-linha lg:col-span-6 lg:self-start"
                data-revelar-grupo
              >
                {recentes.map((p) => (
                  <PostLinha key={p.id} post={p} />
                ))}
              </div>
            )}
          </div>
        )}
      </Secao>

      {anteriores.length > 0 && (
        <Secao tom="branco">
          <CabecalhoSecao rotulo="Arquivo" titulo="Textos anteriores" />
          <div
            className="mt-conteudo grid gap-x-12 border-t border-linha md:grid-cols-2"
            data-revelar-grupo
          >
            {anteriores.map((p) => (
              <div key={p.id} className="border-b border-linha">
                <PostLinha post={p} />
              </div>
            ))}
          </div>
        </Secao>
      )}

      <ChamadaFinal
        titulo="Quer ir além da *leitura*?"
        texto="O diagnóstico indica em qual etapa do método está o seu próximo passo."
        cta={{ rotulo: "Fazer o diagnóstico", link: "/diagnostico" }}
      />
    </>
  );
}
