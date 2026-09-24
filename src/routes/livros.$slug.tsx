import { Link, createFileRoute } from "@tanstack/react-router";
import { CaretRight } from "@phosphor-icons/react";

import { Botao } from "@/components/site/Botao";
import { CapaLivro } from "@/components/site/CapaLivro";
import { FormularioLead } from "@/components/site/FormularioLead";
import { Markdown } from "@/components/site/Markdown";
import { CabecalhoSecao, Secao } from "@/components/site/Secao";
import { SeloEtapa, SeloStatus } from "@/components/site/Selo";
import { TextoExpansivel } from "@/components/site/TextoExpansivel";
import { COLLECTIONS } from "@/content/collections";
import { repeticao, txt } from "@/lib/conteudo";
import { carregarDetalhe, headDetalhe } from "@/lib/rotas-conteudo";
import { urlSegura } from "@/lib/url-segura";

const i = (n: number) => ({ "--i": n }) as React.CSSProperties;

export const Route = createFileRoute("/livros/$slug")({
  loader: ({ params }) => carregarDetalhe("livro", params.slug),
  head: ({ loaderData }) => headDetalhe(loaderData?.item),
  component: Livro,
});

function Livro() {
  const { item: l, relacionados } = Route.useLoaderData();
  const lojas = repeticao<{ nome?: string; url?: string }>(l, "lojas").filter(
    (x) => x.nome && urlSegura(x.url),
  );
  const ficha = [
    ["Ano", txt(l, "ano")],
    ["Editora", txt(l, "editora")],
    ["Páginas", txt(l, "paginas")],
    ["ISBN", txt(l, "isbn")],
  ].filter(([, v]) => v);
  const emBreve = txt(l, "situacao") === "em-breve";

  return (
    <>
      {/* ── Abertura ─────────────────────────────────────────────────────── */}
      <section className="border-b border-linha pt-cabecalho">
        <div className="container-site grid items-center gap-8 pt-8 pb-12 md:grid-cols-12 md:gap-10 md:pt-12 md:pb-16">
          <div className="order-2 md:order-1 md:col-span-7">
            <nav
              aria-label="Você está em"
              className="flex items-center gap-2 text-[0.8125rem] text-cinza anima-subir"
            >
              <Link to="/livros" className="transition-colors hover:text-petroleo">
                Livros
              </Link>
              <CaretRight className="size-3" aria-hidden />
              <span className="truncate text-petroleo">{l.title}</span>
            </nav>
            <div className="mt-6 flex flex-wrap gap-2 anima-subir" style={i(1)}>
              <SeloStatus status={txt(l, "situacao")} />
              <SeloEtapa etapa={txt(l, "etapa")} />
            </div>
            <h1 className="type-display mt-4 pb-1 text-petroleo anima-subir" style={i(1)}>
              {l.title}
            </h1>
            {l.subtitle && (
              <p
                className="mt-3 font-serif text-[1.25rem] text-cinza italic anima-subir"
                style={i(2)}
              >
                {l.subtitle}
              </p>
            )}
            {l.excerpt && (
              <p
                className="mt-5 max-w-[56ch] text-[1.0625rem] leading-relaxed text-grafite anima-subir max-md:hidden"
                style={i(3)}
              >
                {l.excerpt}
              </p>
            )}
            <div
              className="mt-8 flex flex-col gap-3 anima-subir sm:flex-row sm:flex-wrap"
              style={i(4)}
            >
              {lojas.length > 0 ? (
                lojas.map((loja, n) => (
                  <Botao
                    key={loja.nome}
                    href={loja.url!}
                    variante={n === 0 ? "primario" : "contorno"}
                    rastrear={`Comprar: ${loja.nome}`}
                  >
                    {`Comprar na ${loja.nome}`}
                  </Botao>
                ))
              ) : (
                <Botao href="#interesse">
                  {COLLECTIONS.livro.interesse ?? "Quero ser avisado"}
                </Botao>
              )}
            </div>
            {ficha.length > 0 && (
              <dl
                className="mt-8 grid grid-cols-2 gap-4 border-t border-linha pt-5 sm:grid-cols-4 md:mt-10 md:gap-5 md:pt-6 anima-subir"
                style={i(5)}
              >
                {ficha.map(([k, v]) => (
                  <div key={k}>
                    <dt className="type-meta text-cinza">{k}</dt>
                    <dd className="mt-1 font-serif text-[1.1rem] text-petroleo">{v}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
          <div className="order-1 md:order-2 md:col-span-4 md:col-start-9">
            <div className="mx-auto w-[30%] max-w-[8rem] anima-surgir [perspective:1200px] md:w-[78%] md:max-w-[16rem]">
              <div className="[transform:rotateY(-10deg)_rotateX(2deg)]">
                <CapaLivro
                  titulo={l.title}
                  subtitulo={l.subtitle}
                  imagem={l.cover_url}
                  cor={txt(l, "cor")}
                  tamanho="lg"
                  prioridade
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trecho ───────────────────────────────────────────────────────── */}
      {txt(l, "trecho") && (
        <Secao tom="suave" compacta>
          <figure className="mx-auto max-w-3xl text-center" data-revelar>
            <blockquote className="font-serif text-[clamp(1.3rem,1.1rem+0.9vw,1.85rem)] leading-[1.35] text-petroleo italic">
              “{txt(l, "trecho")}”
            </blockquote>
            <figcaption className="rotulo-secao mt-5">Trecho do livro</figcaption>
          </figure>
        </Secao>
      )}

      {/* ── Sobre o livro ────────────────────────────────────────────────── */}
      {l.body && (
        <Secao>
          <div className="grade gap-y-6">
            <div className="col-span-12 lg:col-span-4" data-revelar-grupo>
              <p className="rotulo-secao mb-4">Sobre o livro</p>
              <h2 className="type-h1 text-petroleo">O que você vai encontrar</h2>
            </div>
            <div className="col-span-12 lg:col-span-7 lg:col-start-6" data-revelar>
              <TextoExpansivel>
                <Markdown>{l.body}</Markdown>
              </TextoExpansivel>
            </div>
          </div>
        </Secao>
      )}

      {/* ── Interesse ────────────────────────────────────────────────────── */}
      {lojas.length === 0 && (
        <Secao tom="escuro" id="interesse" semFlutuante>
          <div className="grade gap-y-8">
            <div className="col-span-12 lg:col-span-5" data-revelar-grupo>
              <p className="rotulo-secao mb-4">Lista de interesse</p>
              <h2 className="type-h1 text-gelo">
                {emBreve ? "Seja avisado do lançamento" : "Quero ser avisado"}
              </h2>
              <p className="mt-4 max-w-[44ch] text-[1.0625rem] leading-relaxed text-gelo/70">
                {emBreve
                  ? "Deixe seu contato e receba um capítulo antes do lançamento."
                  : "Deixe seu contato para receber as informações de compra e os próximos eventos do livro."}
              </p>
            </div>
            <div className="col-span-12 lg:col-span-6 lg:col-start-7" data-revelar>
              <FormularioLead
                escuro
                tipo="interesse"
                item={{ id: l.id, titulo: l.title }}
                mensagem={false}
                botao="Quero ser avisado"
                sucesso={{
                  titulo: "Combinado",
                  texto: "Você será avisado assim que houver novidades sobre o livro.",
                }}
              />
            </div>
          </div>
        </Secao>
      )}

      {/* ── Outros livros ────────────────────────────────────────────────── */}
      {relacionados.length > 0 && (
        <Secao>
          <CabecalhoSecao
            rotulo="Veja também"
            titulo="Outros livros"
            acao={
              <Botao href="/livros" variante="texto">
                Ver todos
              </Botao>
            }
          />
          <ul
            className="mt-conteudo grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8"
            data-revelar-grupo
          >
            {relacionados.map((r) => (
              <li key={r.id}>
                <Link to="/livros/$slug" params={{ slug: r.slug }} className="group block">
                  <div className="mx-auto w-[70%] transition-transform duration-500 ease-[var(--ease-out)] group-hover:-translate-y-1.5">
                    <CapaLivro
                      titulo={r.title}
                      imagem={r.cover_url}
                      cor={txt(r, "cor")}
                      tamanho="sm"
                    />
                  </div>
                  <p className="type-h3 mt-4 text-center text-petroleo">{r.title}</p>
                </Link>
              </li>
            ))}
          </ul>
        </Secao>
      )}
    </>
  );
}
