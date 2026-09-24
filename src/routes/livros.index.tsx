import { Link, createFileRoute } from "@tanstack/react-router";

import { Abertura } from "@/components/site/Abertura";
import { CapaLivro } from "@/components/site/CapaLivro";
import { ChamadaFinal } from "@/components/site/ChamadaFinal";
import { Secao } from "@/components/site/Secao";
import { SeloStatus } from "@/components/site/Selo";
import { semDestaque } from "@/components/site/Titulo";
import { carregarPagina, listarItens, txt } from "@/lib/conteudo";
import { buildMeta, canonical } from "@/lib/seo";

export const Route = createFileRoute("/livros/")({
  loader: async () => {
    const [pagina, livros] = await Promise.all([carregarPagina("livros"), listarItens("livro")]);
    return { pagina, livros };
  },
  head: ({ loaderData }) => ({
    meta: buildMeta({
      title: "Livros",
      description: semDestaque(loaderData?.pagina.hero.subtitulo),
      path: "/livros",
    }),
    links: canonical("/livros"),
  }),
  component: Livros,
});

function Livros() {
  const { pagina, livros } = Route.useLoaderData();
  return (
    <>
      <Abertura rotulo="Livros" titulo={pagina.hero.titulo} subtitulo={pagina.hero.subtitulo} />
      <Secao>
        {livros.length === 0 && <p className="text-cinza">Os livros serão publicados em breve.</p>}
        {/* Estante: capas lado a lado, com leve inclinação que se corrige no hover */}
        <ul className="trilho md:grid md:grid-cols-3 md:gap-8" data-revelar-grupo>
          {livros.map((l) => (
            <li key={l.id}>
              <Link
                to="/livros/$slug"
                params={{ slug: l.slug }}
                className="group flex h-full flex-col"
              >
                <div className="flex justify-center rounded-[2px] bg-gelo-2 py-8 transition-colors duration-500 group-hover:bg-petroleo-50 [perspective:1000px] md:py-10">
                  <div className="w-[46%] max-w-[11rem] transition-transform duration-700 ease-[var(--ease-out)] [transform:rotateY(-12deg)] group-hover:[transform:rotateY(0deg)_translateY(-6px)]">
                    <CapaLivro
                      titulo={l.title}
                      subtitulo={l.subtitle}
                      imagem={l.cover_url}
                      cor={txt(l, "cor")}
                    />
                  </div>
                </div>
                <div className="mt-5">
                  <SeloStatus status={txt(l, "situacao")} />
                  <h2 className="type-h2 mt-3 text-petroleo transition-colors group-hover:text-petroleo-700">
                    {l.title}
                  </h2>
                  {l.subtitle && <p className="mt-1.5 text-[0.95rem] text-cinza">{l.subtitle}</p>}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </Secao>
      <ChamadaFinal
        titulo="Quer começar pela *prática*?"
        texto="Os cursos aplicam as ideias dos livros com exercícios e acompanhamento."
        cta={{ rotulo: "Conhecer os cursos", link: "/cursos" }}
      />
    </>
  );
}
