import { createFileRoute } from "@tanstack/react-router";

import { Abertura } from "@/components/site/Abertura";
import { Botao } from "@/components/site/Botao";
import { CartaoOferta } from "@/components/site/CartaoOferta";
import { ChamadaFinal } from "@/components/site/ChamadaFinal";
import { Passos } from "@/components/site/Passos";
import { CabecalhoSecao, Secao } from "@/components/site/Secao";
import { semDestaque } from "@/components/site/Titulo";
import { carregarPagina, listarItens } from "@/lib/conteudo";
import { buildMeta, canonical } from "@/lib/seo";

export const Route = createFileRoute("/mentorias/")({
  loader: async () => {
    const [pagina, itens] = await Promise.all([
      carregarPagina("mentorias"),
      listarItens("mentoria"),
    ]);
    return { pagina, itens };
  },
  head: ({ loaderData }) => ({
    meta: buildMeta({
      title: "Mentorias",
      description: semDestaque(loaderData?.pagina.hero.subtitulo),
      path: "/mentorias",
    }),
    links: canonical("/mentorias"),
  }),
  component: Mentorias,
});

function Mentorias() {
  const { pagina, itens } = Route.useLoaderData();

  return (
    <>
      <Abertura rotulo="Mentorias" titulo={pagina.hero.titulo} subtitulo={pagina.hero.subtitulo}>
        <Botao
          href="whatsapp"
          variante="contorno"
          mensagemWhatsApp="Olá, Daniel. Gostaria de agendar a conversa inicial da mentoria."
        >
          Agendar conversa inicial
        </Botao>
      </Abertura>

      <Secao>
        <CabecalhoSecao
          rotulo="Programas"
          titulo="Escolha o formato de *acompanhamento*"
          texto="Individual, para líderes ou em grupo reduzido: escolha pelo tipo de decisão que você precisa tomar."
          textoAoLado
        />
        {itens.length === 0 ? (
          <p className="mt-10 text-cinza">As mentorias serão publicadas em breve.</p>
        ) : (
          <div
            className="trilho mt-conteudo md:grid md:grid-cols-2 md:gap-6 lg:grid-cols-3"
            data-revelar-grupo
          >
            {itens.map((m) => (
              <CartaoOferta key={m.id} item={m} />
            ))}
          </div>
        )}
      </Secao>

      <Secao tom="suave">
        <CabecalhoSecao rotulo={pagina.processo.rotulo} titulo={pagina.processo.titulo} />
        <Passos itens={pagina.processo.itens} className="mt-conteudo" />
      </Secao>

      <ChamadaFinal titulo={pagina.cta.titulo} texto={pagina.cta.texto} cta={pagina.cta.cta} />
    </>
  );
}
