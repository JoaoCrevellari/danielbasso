import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, Buildings, ChatsCircle, GraduationCap } from "@phosphor-icons/react";

import { Abertura } from "@/components/site/Abertura";
import { Botao } from "@/components/site/Botao";
import { ChamadaFinal } from "@/components/site/ChamadaFinal";
import { LinkInterno } from "@/components/site/LinkInterno";
import { CabecalhoSecao, Secao } from "@/components/site/Secao";
import { SeletorEtapas } from "@/components/site/SeletorEtapas";
import { Titulo, semDestaque } from "@/components/site/Titulo";
import { carregarPagina, listarItens, txt, type ItemConteudo } from "@/lib/conteudo";
import { buildMeta, canonical } from "@/lib/seo";

export const Route = createFileRoute("/metodo")({
  loader: async () => {
    const [metodo, cursos, mentorias] = await Promise.all([
      carregarPagina("metodo"),
      listarItens("curso"),
      listarItens("mentoria"),
    ]);
    return { metodo, ofertas: [...cursos, ...mentorias] };
  },
  head: ({ loaderData }) => ({
    meta: buildMeta({
      title: "O Método",
      description: semDestaque(loaderData?.metodo.hero.subtitulo),
      path: "/metodo",
    }),
    links: canonical("/metodo"),
  }),
  component: Metodo,
});

const CAMINHOS = [
  {
    titulo: "Cursos",
    texto: "As etapas viram trilhas de estudo com começo, meio e fim.",
    link: "/cursos",
    Icone: GraduationCap,
  },
  {
    titulo: "Mentorias",
    texto: "As etapas viram um plano pessoal acompanhado de perto.",
    link: "/mentorias",
    Icone: ChatsCircle,
  },
  {
    titulo: "Empresas",
    texto: "As etapas viram programas para lideranças e equipes.",
    link: "/treinamentos",
    Icone: Buildings,
  },
];

function Metodo() {
  const { metodo, ofertas } = Route.useLoaderData();
  const ofertaDe = (chave: string): ItemConteudo | undefined =>
    ofertas.find((o) => txt(o, "etapa") === chave);

  return (
    <>
      <Abertura rotulo="O Método" titulo={metodo.hero.titulo} subtitulo={metodo.hero.subtitulo}>
        <Botao href="#etapas">Conhecer as cinco etapas</Botao>
      </Abertura>

      {/* Etapas: seletor interativo */}
      <Secao id="etapas">
        <SeletorEtapas
          etapas={metodo.etapas.itens}
          ofertaDe={ofertaDe}
          cabecalho={
            <>
              <p className="rotulo-secao mb-4">As etapas</p>
              <Titulo as="h2" className="type-h1 text-petroleo">
                {metodo.etapas.titulo}
              </Titulo>
              <p className="mt-3 text-[0.975rem] text-cinza max-md:hidden">
                Escolha uma etapa para ver os detalhes.
              </p>
            </>
          }
        />
      </Secao>

      {/* Princípios */}
      <Secao tom="escuro">
        <CabecalhoSecao rotulo="Princípios" titulo={metodo.principios.titulo} />
        <div
          className="trilho mt-conteudo md:grid md:grid-cols-2 md:gap-4 lg:grid-cols-4"
          data-revelar-grupo
        >
          {metodo.principios.itens.map((p, n) => (
            <div key={n} className="rounded-[2px] border border-gelo/10 bg-gelo/[0.03] p-6 md:p-7">
              <span className="type-numeral text-[1.5rem] text-ouro">{n + 1}</span>
              <h3 className="type-h3 mt-3 text-gelo">{p.titulo}</h3>
              <p className="mt-2 text-[0.95rem] leading-relaxed text-gelo/65">{p.texto}</p>
            </div>
          ))}
        </div>
      </Secao>

      {/* Como o método chega até você */}
      <Secao tom="branco">
        <CabecalhoSecao
          rotulo="Na prática"
          titulo={metodo.aplicacao.titulo}
          texto={metodo.aplicacao.texto}
        />
        <ul className="mt-conteudo grid gap-4 md:grid-cols-3 md:gap-6" data-revelar-grupo>
          {CAMINHOS.map(({ titulo, texto, link, Icone }) => (
            <li key={titulo}>
              <LinkInterno
                to={link}
                className="group flex h-full gap-4 rounded-[2px] border border-linha bg-gelo p-5 transition-[border-color,transform,box-shadow] duration-300 hover:-translate-y-1 hover:border-linha-forte hover:shadow-[0_24px_48px_-32px_rgb(0_31_46/0.45)] md:flex-col md:gap-0 md:p-7"
              >
                <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-petroleo text-gelo">
                  <Icone className="size-5" weight="light" />
                </span>
                <div className="flex-1 md:mt-6">
                  <h3 className="type-h2 flex items-center justify-between gap-3 text-petroleo">
                    {titulo}
                    <ArrowUpRight className="size-5 text-ouro-texto transition-transform duration-300 group-hover:rotate-45" />
                  </h3>
                  <p className="mt-2 text-[0.975rem] leading-relaxed text-cinza">{texto}</p>
                </div>
              </LinkInterno>
            </li>
          ))}
        </ul>
      </Secao>

      <ChamadaFinal
        titulo="Descubra em qual etapa *você está*"
        texto="O diagnóstico leva cinco minutos e indica o seu próximo passo."
        cta={metodo.aplicacao.cta}
      />
    </>
  );
}
