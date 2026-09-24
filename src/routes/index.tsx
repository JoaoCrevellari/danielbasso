import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, BookOpenText, Footprints, HandHeart } from "@phosphor-icons/react";

import { FaixaPalavras } from "@/components/home/FaixaPalavras";
import { MetodoEtapas } from "@/components/home/MetodoEtapas";
import { Botao } from "@/components/site/Botao";
import { CapaLivro } from "@/components/site/CapaLivro";
import { PostDestaque, PostLinha } from "@/components/site/CartaoPost";
import { ChamadaFinal } from "@/components/site/ChamadaFinal";
import { CarrosselDepoimentos } from "@/components/site/Depoimentos";
import { Imagem } from "@/components/site/Imagem";
import { LinkInterno } from "@/components/site/LinkInterno";
import { CabecalhoSecao, Secao } from "@/components/site/Secao";
import { Titulo, semDestaque } from "@/components/site/Titulo";
import { carregarPaginas, listarItens, obterItem, txt } from "@/lib/conteudo";
import { buildMeta, canonical } from "@/lib/seo";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  staticData: { cabecalho: "escuro" },
  loader: async () => {
    const [paginas, depoimentos, posts] = await Promise.all([
      carregarPaginas(["home", "metodo"]),
      listarItens("depoimento", { destaque: true, limite: 9 }),
      listarItens("post", { limite: 3 }),
    ]);
    const livro = await obterItem("livro", paginas.home.livro.slug).catch(() => null);
    return { ...paginas, depoimentos, posts, livro };
  },
  head: ({ loaderData }) => ({
    meta: buildMeta({
      title: `${SITE.name} | ${SITE.tagline}`,
      description: semDestaque(loaderData?.home.hero.subtitulo) || SITE.description,
      path: "/",
    }),
    links: canonical("/"),
  }),
  component: Home,
});

const i = (n: number) => ({ "--i": n }) as React.CSSProperties;
const ICONES_PILARES = [BookOpenText, Footprints, HandHeart];
const PASSOS_DIAGNOSTICO = [
  "Responda 15 afirmações",
  "Veja seu perfil nas cinco etapas",
  "Receba a indicação do próximo passo",
];

function Home() {
  const { home, metodo, depoimentos, posts, livro } = Route.useLoaderData();
  const [postPrincipal, ...outrosPosts] = posts;

  return (
    <>
      {/* ── Abertura ───────────────────────────────────────────────────────── */}
      <section className="superficie-escura grao relative overflow-hidden pt-cabecalho">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_70%_at_85%_40%,rgb(10_79_112/0.55),transparent_70%)]"
        />
        <div className="container-site relative grid items-center gap-8 pt-6 pb-10 md:min-h-[calc(100dvh-var(--header-h)-4.75rem)] md:grid-cols-12 md:gap-10 md:py-12">
          <div className="md:col-span-7">
            <Titulo as="h1" className="type-display pb-1 text-gelo anima-subir">
              {home.hero.titulo}
            </Titulo>
            <p
              className="type-lead mt-5 max-w-[46ch] text-gelo/75 anima-subir md:mt-6"
              style={i(1)}
            >
              {home.hero.subtitulo}
            </p>
            <div
              className="mt-7 flex flex-col gap-3 anima-subir sm:flex-row sm:items-center md:mt-9"
              style={i(2)}
            >
              <Botao href={home.hero.cta_primario.link} variante="ouro">
                {home.hero.cta_primario.rotulo}
              </Botao>
              <Botao href={home.hero.cta_secundario.link} variante="contorno-claro">
                {home.hero.cta_secundario.rotulo}
              </Botao>
            </div>
          </div>
          <div className="relative md:col-span-4 md:col-start-9">
            <div
              aria-hidden
              className="absolute inset-0 translate-x-3 translate-y-3 rounded-[2px] border border-ouro/40 anima-surgir md:translate-x-5 md:translate-y-5"
              style={i(4)}
            />
            <Imagem
              src={home.hero.imagem}
              alt="Retrato de Daniel Basso"
              prioridade
              larguraMax={900}
              sizes="(min-width: 768px) 33vw, 90vw"
              className="relative aspect-[16/10] rounded-[2px] anima-imagem md:aspect-[4/5]"
              imgClassName="object-[50%_22%]"
            />
          </div>
        </div>
      </section>

      <FaixaPalavras palavras={metodo.etapas.itens.map((e) => e.nome)} />

      {/* ── Por que este trabalho ──────────────────────────────────────────── */}
      <Secao>
        <div className="grade items-start">
          <div className="col-span-12 md:col-span-6" data-revelar-grupo>
            <p className="rotulo-secao mb-4">{home.manifesto.rotulo}</p>
            <Titulo as="h2" className="type-h1 text-petroleo">
              {home.manifesto.titulo}
            </Titulo>
            <p className="mt-5 max-w-[52ch] text-[1.0625rem] leading-relaxed text-cinza">
              {home.manifesto.texto}
            </p>
            <Botao href={home.manifesto.link.link} variante="texto" className="mt-5">
              {home.manifesto.link.rotulo}
            </Botao>
          </div>
          <ul className="col-span-12 flex flex-col md:col-span-5 md:col-start-8" data-revelar-grupo>
            {home.manifesto.pilares.map((p, n) => {
              const Icone = ICONES_PILARES[n % ICONES_PILARES.length];
              return (
                <li
                  key={p.titulo + n}
                  className="flex gap-5 border-t border-linha py-5 last:border-b md:py-6"
                >
                  <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-petroleo-50 text-petroleo">
                    <Icone className="size-5" weight="light" />
                  </span>
                  <div>
                    <h3 className="type-h3 text-petroleo">{p.titulo}</h3>
                    <p className="mt-1.5 text-[0.975rem] text-cinza">{p.texto}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </Secao>

      {/* ── Método ─────────────────────────────────────────────────────────── */}
      <Secao tom="escuro">
        <div className="grade">
          <div className="col-span-12 lg:col-span-5">
            <div className="lg:sticky lg:top-[calc(var(--header-h)+2.5rem)]" data-revelar-grupo>
              <p className="rotulo-secao mb-4">{home.metodo.rotulo}</p>
              <Titulo as="h2" className="type-h1 text-gelo">
                {home.metodo.titulo}
              </Titulo>
              <p className="mt-4 max-w-[46ch] text-[1.0625rem] leading-relaxed text-gelo/70">
                {home.metodo.texto}
              </p>
              <Botao
                href={home.metodo.link.link}
                variante="contorno-claro"
                className="mt-7 max-lg:hidden"
              >
                {home.metodo.link.rotulo}
              </Botao>
            </div>
          </div>
          <div className="col-span-12 lg:col-span-6 lg:col-start-7">
            <MetodoEtapas etapas={metodo.etapas.itens} />
          </div>
        </div>
      </Secao>

      {/* ── Diagnóstico ────────────────────────────────────────────────────── */}
      <Secao tom="branco">
        <div className="grade items-center">
          <div className="col-span-12 md:col-span-5" data-revelar="imagem">
            <Imagem
              src={home.diagnostico.imagem}
              alt="Daniel Basso em sua biblioteca"
              className="aspect-[16/10] rounded-[2px] md:aspect-[4/5] md:max-h-[min(30rem,calc(100dvh-var(--header-h)-7rem))] md:w-full"
              imgClassName="object-[50%_22%]"
              sizes="(min-width: 768px) 40vw, 100vw"
              larguraMax={1000}
            />
          </div>
          <div className="col-span-12 md:col-span-6 md:col-start-7" data-revelar-grupo>
            <p className="rotulo-secao mb-4">{home.diagnostico.rotulo}</p>
            <Titulo as="h2" className="type-h1 text-petroleo">
              {home.diagnostico.titulo}
            </Titulo>
            <p className="mt-4 max-w-[46ch] text-[1.0625rem] leading-relaxed text-cinza">
              {home.diagnostico.texto}
            </p>
            <ol className="mt-6 flex flex-col gap-2.5 text-[0.975rem] text-grafite">
              {PASSOS_DIAGNOSTICO.map((t, n) => (
                <li key={t} className="flex items-center gap-3">
                  <span className="type-numeral inline-flex size-7 shrink-0 items-center justify-center rounded-full border border-ouro/60 text-[0.95rem] text-ouro-texto">
                    {n + 1}
                  </span>
                  {t}
                </li>
              ))}
            </ol>
            <Botao href={home.diagnostico.cta.link} className="mt-8">
              {home.diagnostico.cta.rotulo}
            </Botao>
          </div>
        </div>
      </Secao>

      {/* ── Formas de caminhar junto ───────────────────────────────────────── */}
      <Secao>
        <CabecalhoSecao
          rotulo={home.caminhos.rotulo}
          titulo={home.caminhos.titulo}
          texto={home.caminhos.texto}
        />
        <ul
          className="mt-conteudo grid auto-rows-[10.5rem] grid-cols-2 gap-3 md:auto-rows-[13rem] md:grid-cols-6 md:gap-5"
          data-revelar-grupo
        >
          {home.caminhos.itens.map((c, n) => (
            <li
              key={c.titulo + n}
              className={cn(n % 4 === 0 || n % 4 === 3 ? "md:col-span-4" : "md:col-span-2")}
            >
              <LinkInterno
                to={c.link}
                className="group relative flex h-full flex-col justify-end overflow-hidden rounded-[2px] bg-petroleo-900 p-4 text-gelo md:p-7"
              >
                <Imagem
                  src={c.imagem}
                  alt=""
                  className="absolute inset-0 h-full bg-petroleo-900"
                  imgClassName="opacity-70 transition-transform duration-[1.4s] ease-[var(--ease-out)] group-hover:scale-[1.06]"
                  sizes="(min-width: 768px) 66vw, 50vw"
                />
                <span
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-petroleo-950/95 via-petroleo-950/45 to-petroleo-950/5"
                />
                <span className="relative flex items-end justify-between gap-6">
                  <span>
                    <span className="type-h2 block text-gelo">{c.titulo}</span>
                    <span className="mt-2 block max-w-[40ch] text-[0.95rem] leading-relaxed text-gelo/75 max-md:hidden">
                      {c.texto}
                    </span>
                  </span>
                  <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-gelo/30 transition-all duration-300 group-hover:rotate-45 group-hover:border-ouro group-hover:bg-ouro group-hover:text-petroleo-950 max-md:hidden">
                    <ArrowUpRight className="size-5" />
                  </span>
                </span>
              </LinkInterno>
            </li>
          ))}
        </ul>
      </Secao>

      {/* ── Depoimentos ────────────────────────────────────────────────────── */}
      {depoimentos.length > 0 && (
        <Secao tom="suave">
          <CabecalhoSecao
            rotulo={home.depoimentos.rotulo}
            titulo={home.depoimentos.titulo}
            acao={
              <Botao href="/depoimentos" variante="texto">
                Ler todos os depoimentos
              </Botao>
            }
          />
          <div className="mt-conteudo">
            <CarrosselDepoimentos itens={depoimentos} />
          </div>
        </Secao>
      )}

      {/* ── Livro em destaque ──────────────────────────────────────────────── */}
      {livro && (
        <Secao tom="branco">
          <div className="grade items-center">
            <div className="col-span-12 md:col-span-4 md:col-start-2" data-revelar="escala">
              <Link
                to="/livros/$slug"
                params={{ slug: livro.slug }}
                className="group mx-auto block w-[34%] max-w-[9rem] [perspective:1200px] md:w-[72%] md:max-w-[15rem]"
                aria-label={`Ver o livro ${livro.title}`}
              >
                <div className="transition-transform duration-700 ease-[var(--ease-out)] [transform:rotateY(-14deg)_rotateX(3deg)] group-hover:[transform:rotateY(-4deg)_rotateX(0deg)]">
                  <CapaLivro
                    titulo={livro.title}
                    subtitulo={livro.subtitle}
                    imagem={livro.cover_url}
                    cor={txt(livro, "cor")}
                    tamanho="lg"
                  />
                </div>
              </Link>
            </div>
            <div className="col-span-12 md:col-span-6 md:col-start-7" data-revelar-grupo>
              <p className="rotulo-secao mb-4">{home.livro.rotulo}</p>
              <h2 className="type-h1 text-petroleo">{livro.title}</h2>
              {livro.subtitle && (
                <p className="mt-2 font-serif text-lg text-cinza italic">{livro.subtitle}</p>
              )}
              {txt(livro, "trecho") && (
                <blockquote className="mt-5 border-l-2 border-ouro pl-5 font-serif text-[1.15rem] leading-relaxed text-petroleo-900 md:text-[1.25rem]">
                  {txt(livro, "trecho")}
                </blockquote>
              )}
              {livro.excerpt && (
                <p className="mt-5 max-w-[52ch] text-cinza max-md:hidden">{livro.excerpt}</p>
              )}
              <Botao href={`/livros/${livro.slug}`} className="mt-7">
                Conhecer o livro
              </Botao>
            </div>
          </div>
        </Secao>
      )}

      {/* ── Blog ───────────────────────────────────────────────────────────── */}
      {postPrincipal && (
        <Secao>
          <CabecalhoSecao
            rotulo={home.blog.rotulo}
            titulo={home.blog.titulo}
            acao={
              <Botao href={home.blog.link.link} variante="texto">
                {home.blog.link.rotulo}
              </Botao>
            }
          />
          <div className="mt-conteudo grade gap-y-6">
            <div className="col-span-12 lg:col-span-6" data-revelar-grupo>
              <PostDestaque post={postPrincipal} />
            </div>
            <div
              className="col-span-12 flex flex-col divide-y divide-linha border-y border-linha lg:col-span-6 lg:self-start"
              data-revelar-grupo
            >
              {outrosPosts.map((p) => (
                <PostLinha key={p.id} post={p} />
              ))}
            </div>
          </div>
        </Secao>
      )}

      <ChamadaFinal
        titulo={home.cta_final.titulo}
        texto={home.cta_final.texto}
        cta={home.cta_final.cta}
        secundario={home.cta_final.secundario}
      />
    </>
  );
}
