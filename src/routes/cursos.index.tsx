import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { Abertura } from "@/components/site/Abertura";
import { CartaoOferta } from "@/components/site/CartaoOferta";
import { ChamadaFinal } from "@/components/site/ChamadaFinal";
import { Filtros } from "@/components/site/Filtros";
import { Passos } from "@/components/site/Passos";
import { CabecalhoSecao, Secao } from "@/components/site/Secao";
import { semDestaque } from "@/components/site/Titulo";
import { ETAPAS } from "@/content/fields";
import { carregarPagina, listarItens, txt } from "@/lib/conteudo";
import { buildMeta, canonical } from "@/lib/seo";

export const Route = createFileRoute("/cursos/")({
  loader: async () => {
    const [pagina, itens] = await Promise.all([carregarPagina("cursos"), listarItens("curso")]);
    return { pagina, itens };
  },
  head: ({ loaderData }) => ({
    meta: buildMeta({
      title: "Cursos",
      description: semDestaque(loaderData?.pagina.hero.subtitulo),
      path: "/cursos",
    }),
    links: canonical("/cursos"),
  }),
  component: Cursos,
});

function Cursos() {
  const { pagina, itens } = Route.useLoaderData();
  const [filtro, setFiltro] = useState("todos");
  const etapas = ETAPAS.filter((e) => itens.some((i) => txt(i, "etapa") === e.value));
  const visiveis = filtro === "todos" ? itens : itens.filter((i) => txt(i, "etapa") === filtro);

  return (
    <>
      <Abertura rotulo="Cursos" titulo={pagina.hero.titulo} subtitulo={pagina.hero.subtitulo} />

      <Secao>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="type-meta text-cinza max-md:hidden">
            {visiveis.length} {visiveis.length === 1 ? "curso" : "cursos"}
            {filtro !== "todos" && " nesta etapa"}
          </p>
          <Filtros
            rotulo="Filtrar por etapa do método"
            opcoes={etapas}
            valor={filtro}
            onChange={setFiltro}
          />
        </div>
        {visiveis.length === 0 ? (
          <p className="mt-10 text-cinza">Nenhum curso publicado nesta etapa ainda.</p>
        ) : (
          <div
            key={filtro}
            className="trilho mt-8 md:grid md:grid-cols-1 md:gap-6 lg:grid-cols-2"
            data-revelar-grupo
          >
            {visiveis.map((item) => (
              <CartaoOferta key={item.id} item={item} horizontal />
            ))}
          </div>
        )}
      </Secao>

      <Secao tom="branco">
        <CabecalhoSecao rotulo={pagina.como.rotulo} titulo={pagina.como.titulo} />
        <Passos itens={pagina.como.itens} className="mt-conteudo" />
      </Secao>

      <ChamadaFinal titulo={pagina.cta.titulo} texto={pagina.cta.texto} cta={pagina.cta.cta} />
    </>
  );
}
