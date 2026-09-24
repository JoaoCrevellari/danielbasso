import { createFileRoute } from "@tanstack/react-router";
import { CaretDown } from "@phosphor-icons/react";
import { useState } from "react";

import { Abertura } from "@/components/site/Abertura";
import { classeBotao } from "@/components/site/Botao";
import { ChamadaFinal } from "@/components/site/ChamadaFinal";
import { CartaoDepoimento } from "@/components/site/Depoimentos";
import { Filtros } from "@/components/site/Filtros";
import { Secao } from "@/components/site/Secao";
import { semDestaque } from "@/components/site/Titulo";
import { COLLECTIONS } from "@/content/collections";
import { carregarPagina, listarItens, txt } from "@/lib/conteudo";
import { buildMeta, canonical } from "@/lib/seo";

export const Route = createFileRoute("/depoimentos")({
  loader: async () => {
    const [pagina, itens] = await Promise.all([
      carregarPagina("depoimentos"),
      listarItens("depoimento"),
    ]);
    return { pagina, itens };
  },
  head: ({ loaderData }) => ({
    meta: buildMeta({
      title: "Depoimentos",
      description: semDestaque(loaderData?.pagina.hero.subtitulo),
      path: "/depoimentos",
    }),
    links: canonical("/depoimentos"),
  }),
  component: Depoimentos,
});

const ORIGENS = (() => {
  const f = COLLECTIONS.depoimento.fields.find((x) => x.key === "origem");
  return f?.type === "select" ? f.options : [];
})();

const POR_VEZ = 6;

function Depoimentos() {
  const { pagina, itens } = Route.useLoaderData();
  const [filtro, setFiltro] = useState("todos");
  const [limite, setLimite] = useState(POR_VEZ);
  const presentes = ORIGENS.filter((o) => itens.some((d) => txt(d, "origem") === o.value));
  const filtrados = filtro === "todos" ? itens : itens.filter((d) => txt(d, "origem") === filtro);

  return (
    <>
      <Abertura
        rotulo="Depoimentos"
        titulo={pagina.hero.titulo}
        subtitulo={pagina.hero.subtitulo}
      />
      <Secao>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="type-meta text-cinza max-md:hidden">
            {filtrados.length} {filtrados.length === 1 ? "depoimento" : "depoimentos"}
          </p>
          <Filtros
            rotulo="Filtrar depoimentos"
            opcoes={presentes}
            valor={filtro}
            onChange={(v) => {
              setFiltro(v);
              setLimite(POR_VEZ);
            }}
          />
        </div>
        {filtrados.length === 0 ? (
          <p className="mt-10 text-cinza">Nenhum depoimento nesta categoria ainda.</p>
        ) : (
          <div
            key={filtro}
            className="trilho mt-6 md:grid md:grid-cols-2 md:gap-5 lg:grid-cols-3"
            data-revelar-grupo
          >
            {/* No celular o trilho mostra todos; no desktop, "mostrar mais" libera de 6 em 6. */}
            {filtrados.map((d, n) => (
              <CartaoDepoimento
                key={d.id}
                item={d}
                className={n >= limite ? "md:hidden" : undefined}
              />
            ))}
          </div>
        )}
        {filtrados.length > limite && (
          <div className="mt-6 hidden justify-center md:flex">
            <button
              type="button"
              onClick={() => setLimite((l) => l + POR_VEZ)}
              className={classeBotao("contorno")}
            >
              Mostrar mais depoimentos <CaretDown className="size-4" />
            </button>
          </div>
        )}
      </Secao>
      <ChamadaFinal
        titulo="A próxima história *pode ser a sua*"
        texto="Comece pelo diagnóstico e descubra o seu próximo passo."
        cta={{ rotulo: "Fazer o diagnóstico", link: "/diagnostico" }}
      />
    </>
  );
}
