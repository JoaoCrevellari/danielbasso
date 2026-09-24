import { createFileRoute } from "@tanstack/react-router";
import { GraduationCap } from "@phosphor-icons/react";

import { ChamadaFinal } from "@/components/site/ChamadaFinal";
import { Imagem } from "@/components/site/Imagem";
import { Markdown } from "@/components/site/Markdown";
import { CabecalhoSecao, Secao } from "@/components/site/Secao";
import { TextoExpansivel } from "@/components/site/TextoExpansivel";
import { Titulo, semDestaque } from "@/components/site/Titulo";
import { carregarPagina } from "@/lib/conteudo";
import { buildMeta, canonical } from "@/lib/seo";

const i = (n: number) => ({ "--i": n }) as React.CSSProperties;

export const Route = createFileRoute("/quem-sou")({
  staticData: { cabecalho: "escuro" },
  loader: () => carregarPagina("quem-sou"),
  head: ({ loaderData }) => ({
    meta: buildMeta({
      title: "Quem sou",
      description: semDestaque(loaderData?.hero.subtitulo),
      path: "/quem-sou",
      ogType: "profile",
      ogImage: loaderData?.hero.imagem,
    }),
    links: canonical("/quem-sou"),
  }),
  component: QuemSou,
});

function QuemSou() {
  const p = Route.useLoaderData();

  return (
    <>
      {/* ── Abertura: nome e retrato ─────────────────────────────────────── */}
      <section className="superficie-escura grao relative overflow-hidden pt-cabecalho">
        <div className="container-site grid items-end gap-8 pt-8 md:grid-cols-12 md:gap-10 md:pt-12">
          <div className="pb-2 md:col-span-7 md:pb-20">
            <p className="rotulo-secao mb-5 anima-subir">Quem sou</p>
            <h1 className="type-display text-gelo anima-subir" style={i(1)}>
              {p.hero.titulo}
            </h1>
            <p className="type-lead mt-5 max-w-[48ch] text-gelo/75 anima-subir" style={i(2)}>
              {p.hero.subtitulo}
            </p>
          </div>
          <div className="md:col-span-4 md:col-start-9">
            <Imagem
              src={p.hero.imagem}
              alt="Daniel Basso"
              prioridade
              larguraMax={900}
              className="aspect-[16/11] rounded-t-[2px] anima-imagem md:aspect-[4/5] md:max-h-[calc(100dvh-var(--header-h)-3rem)]"
              imgClassName="object-[50%_18%]"
              sizes="(min-width: 768px) 33vw, 100vw"
            />
          </div>
        </div>
      </section>

      {/* ── História ─────────────────────────────────────────────────────── */}
      <Secao>
        <div className="grade gap-y-6">
          <div className="col-span-12 lg:col-span-4" data-revelar-grupo>
            <p className="rotulo-secao mb-4">Trajetória</p>
            <Titulo as="h2" className="type-h1 text-petroleo">
              {p.historia.titulo}
            </Titulo>
          </div>
          <div className="col-span-12 lg:col-span-7 lg:col-start-6" data-revelar>
            <TextoExpansivel>
              <Markdown>{p.historia.texto}</Markdown>
            </TextoExpansivel>
          </div>
        </div>
      </Secao>

      {/* ── Citação ──────────────────────────────────────────────────────── */}
      {p.historia.citacao && (
        <Secao tom="suave" compacta>
          <figure className="mx-auto max-w-4xl text-center" data-revelar>
            <blockquote className="font-serif text-[clamp(1.35rem,1.1rem+1.1vw,2rem)] leading-[1.3] text-petroleo">
              <span aria-hidden className="text-ouro-texto">
                “
              </span>
              {p.historia.citacao}
              <span aria-hidden className="text-ouro-texto">
                ”
              </span>
            </blockquote>
            <figcaption className="rotulo-secao mt-6">Daniel Basso</figcaption>
          </figure>
        </Secao>
      )}

      {/* ── Marcos: linha do tempo ───────────────────────────────────────── */}
      <Secao>
        <CabecalhoSecao rotulo="Linha do tempo" titulo={p.marcos.titulo} />
        <ol
          className="trilho relative mt-conteudo md:grid md:grid-cols-5 md:gap-6"
          data-revelar-grupo
        >
          {p.marcos.itens.map((m, n) => (
            <li
              key={n}
              className="relative rounded-[2px] border border-linha bg-papel p-5 md:border-0 md:bg-transparent md:p-0 md:pt-8"
            >
              <span
                aria-hidden
                className="absolute top-0 left-0 hidden h-px w-full bg-linha-forte md:block"
              />
              <span
                aria-hidden
                className="absolute -top-[4.5px] left-0 hidden size-[10px] rounded-full bg-ouro md:block"
              />
              <span className="type-numeral text-[1.75rem] leading-none text-ouro-texto">
                {m.ano}
              </span>
              <h3 className="type-h3 mt-3 text-petroleo">{m.titulo}</h3>
              <p className="mt-2 text-[0.95rem] leading-relaxed text-cinza">{m.texto}</p>
            </li>
          ))}
        </ol>
      </Secao>

      {/* ── Convicções ───────────────────────────────────────────────────── */}
      <Secao tom="escuro">
        <CabecalhoSecao rotulo="Valores" titulo={p.conviccoes.titulo} />
        <div
          className="mt-conteudo grid gap-px overflow-hidden rounded-[2px] bg-gelo/10 sm:grid-cols-2 lg:grid-cols-4"
          data-revelar-grupo
        >
          {p.conviccoes.itens.map((c, n) => (
            <div key={n} className="bg-petroleo-900 p-6 md:p-7">
              <h3 className="type-h2 text-ouro">{c.titulo}</h3>
              <p className="mt-2 text-[0.95rem] leading-relaxed text-gelo/70">{c.texto}</p>
            </div>
          ))}
        </div>
      </Secao>

      {/* ── Formação ─────────────────────────────────────────────────────── */}
      <Secao tom="branco" compacta>
        <div className="grade items-center gap-y-5">
          <div className="col-span-12 flex items-center gap-4 lg:col-span-3" data-revelar>
            <span className="inline-flex size-11 items-center justify-center rounded-full bg-petroleo text-gelo">
              <GraduationCap className="size-5" weight="light" />
            </span>
            <h2 className="type-h2 text-petroleo">{p.formacao.titulo}</h2>
          </div>
          <ul
            className="col-span-12 grid gap-x-8 gap-y-2.5 sm:grid-cols-2 lg:col-span-8 lg:col-start-5"
            data-revelar-grupo
          >
            {p.formacao.itens.map((f) => (
              <li key={f} className="flex gap-3 text-grafite">
                <span aria-hidden className="mt-[0.7em] h-px w-3.5 shrink-0 bg-ouro" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      </Secao>

      <ChamadaFinal titulo={p.cta.titulo} cta={p.cta.cta} />
    </>
  );
}
