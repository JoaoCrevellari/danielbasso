import { createFileRoute } from "@tanstack/react-router";
import { Buildings, ChalkboardTeacher, Microphone } from "@phosphor-icons/react";

import { Abertura } from "@/components/site/Abertura";
import { Botao } from "@/components/site/Botao";
import { CartaoOferta } from "@/components/site/CartaoOferta";
import { FormularioLead } from "@/components/site/FormularioLead";
import { Passos } from "@/components/site/Passos";
import { CabecalhoSecao, Secao } from "@/components/site/Secao";
import { Titulo, semDestaque } from "@/components/site/Titulo";
import { carregarPagina, listarItens } from "@/lib/conteudo";
import { buildMeta, canonical } from "@/lib/seo";

export const Route = createFileRoute("/treinamentos/")({
  loader: async () => {
    const [pagina, itens] = await Promise.all([
      carregarPagina("treinamentos"),
      listarItens("treinamento"),
    ]);
    return { pagina, itens };
  },
  head: ({ loaderData }) => ({
    meta: buildMeta({
      title: "Treinamentos corporativos",
      description: semDestaque(loaderData?.pagina.hero.subtitulo),
      path: "/treinamentos",
    }),
    links: canonical("/treinamentos"),
  }),
  component: Treinamentos,
});

const ICONES_FORMATO = [Microphone, ChalkboardTeacher, Buildings];

function Treinamentos() {
  const { pagina, itens } = Route.useLoaderData();

  return (
    <>
      <Abertura
        rotulo="Para empresas"
        titulo={pagina.hero.titulo}
        subtitulo={pagina.hero.subtitulo}
        imagem={pagina.hero.imagem}
        altImagem="Sala de reunião preparada para um treinamento"
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Botao href="#proposta">Solicitar proposta</Botao>
          <Botao
            href="whatsapp"
            variante="contorno"
            mensagemWhatsApp="Olá, Daniel. Gostaria de conversar sobre um treinamento para a minha empresa."
          >
            Falar pelo WhatsApp
          </Botao>
        </div>
      </Abertura>

      {/* Formatos */}
      <Secao>
        <CabecalhoSecao rotulo={pagina.formatos.rotulo} titulo={pagina.formatos.titulo} />
        <ul className="mt-conteudo grid gap-4 md:grid-cols-3 md:gap-6" data-revelar-grupo>
          {pagina.formatos.itens.map((f, n) => {
            const Icone = ICONES_FORMATO[n % ICONES_FORMATO.length];
            return (
              <li
                key={f.titulo + n}
                className="flex gap-4 rounded-[2px] border border-linha bg-papel p-5 md:flex-col md:gap-0 md:p-7"
              >
                <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-petroleo text-gelo">
                  <Icone className="size-5" weight="light" />
                </span>
                <div className="md:mt-6">
                  <h3 className="type-h2 text-petroleo">{f.titulo}</h3>
                  <p className="mt-2 text-[0.975rem] leading-relaxed text-cinza">{f.texto}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </Secao>

      {/* Programas */}
      {itens.length > 0 && (
        <Secao tom="suave">
          <CabecalhoSecao
            rotulo="Programas"
            titulo="Palestras, workshops e *programas*"
            texto="Cada formato pode ser adaptado ao contexto, ao tamanho da equipe e ao objetivo da empresa."
            textoAoLado
          />
          <div
            className="trilho mt-conteudo md:grid md:grid-cols-2 md:gap-6 lg:grid-cols-3"
            data-revelar-grupo
          >
            {itens.map((t) => (
              <CartaoOferta key={t.id} item={t} />
            ))}
          </div>
        </Secao>
      )}

      {/* Processo + setores */}
      <Secao tom="escuro">
        <CabecalhoSecao rotulo={pagina.processo.rotulo} titulo={pagina.processo.titulo} />
        <Passos escuro itens={pagina.processo.itens} className="mt-conteudo" />
      </Secao>

      {/* Setores */}
      <Secao tom="profundo" compacta>
        <div
          className="flex flex-col gap-5 md:flex-row md:items-center md:gap-10"
          data-revelar-grupo
        >
          <p className="rotulo-secao shrink-0">{pagina.segmentos.titulo}</p>
          <ul className="flex flex-wrap gap-2">
            {pagina.segmentos.itens.map((s) => (
              <li
                key={s}
                className="rounded-full border border-gelo/20 px-4 py-1.5 text-[0.875rem] text-gelo/80"
              >
                {s}
              </li>
            ))}
          </ul>
        </div>
      </Secao>

      {/* Proposta */}
      <Secao tom="branco" id="proposta" semFlutuante>
        <div className="grade gap-y-8">
          <div className="col-span-12 lg:col-span-5" data-revelar-grupo>
            <p className="rotulo-secao mb-4">{pagina.formulario.rotulo}</p>
            <Titulo as="h2" className="type-h1 text-petroleo">
              {pagina.formulario.titulo}
            </Titulo>
            <p className="mt-4 max-w-[44ch] text-[1.0625rem] leading-relaxed text-cinza max-md:hidden">
              {pagina.formulario.texto}
            </p>
          </div>
          <div className="col-span-12 lg:col-span-6 lg:col-start-7" data-revelar>
            <FormularioLead
              tipo="corporativo"
              empresa="obrigatoria"
              rotuloMensagem="Contexto e objetivo"
              assuntos={["Palestra", "Workshop", "Programa contínuo", "Ainda não sei"]}
              botao="Solicitar proposta"
              sucesso={{
                titulo: "Pedido recebido",
                texto:
                  "Obrigado. Retorno em até dois dias úteis com as primeiras perguntas e uma sugestão de agenda.",
              }}
            />
          </div>
        </div>
      </Secao>
    </>
  );
}
