import { Link, createFileRoute } from "@tanstack/react-router";
import { CaretRight, Check, LinkSimple, LinkedinLogo, WhatsappLogo } from "@phosphor-icons/react";
import { motion, useScroll, useSpring } from "motion/react";
import { useState } from "react";

import { ChamadaFinal } from "@/components/site/ChamadaFinal";
import { metaPost, PostLinha } from "@/components/site/CartaoPost";
import { Imagem } from "@/components/site/Imagem";
import { Markdown } from "@/components/site/Markdown";
import { CabecalhoSecao, Secao } from "@/components/site/Secao";
import { registrar } from "@/lib/analytics";
import { tempoLeitura } from "@/lib/conteudo";
import { carregarDetalhe, headDetalhe } from "@/lib/rotas-conteudo";
import { SITE } from "@/lib/site";

const i = (n: number) => ({ "--i": n }) as React.CSSProperties;

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => carregarDetalhe("post", params.slug, 2),
  head: ({ loaderData }) => headDetalhe(loaderData?.item, "article"),
  component: Post,
});

function Compartilhar({ titulo, url }: { titulo: string; url: string }) {
  const [copiado, setCopiado] = useState(false);
  const alvo =
    "inline-flex size-11 items-center justify-center rounded-full border border-linha-forte text-petroleo transition-colors hover:border-petroleo hover:bg-petroleo hover:text-gelo";
  return (
    <div className="flex items-center gap-2">
      <span className="type-meta mr-2 text-cinza">Compartilhar</span>
      <a
        className={alvo}
        aria-label="Compartilhar no WhatsApp"
        target="_blank"
        rel="noopener noreferrer"
        href={`https://wa.me/?text=${encodeURIComponent(`${titulo} ${url}`)}`}
        onClick={() => registrar("compartilhar", { label: "WhatsApp" })}
      >
        <WhatsappLogo className="size-5" />
      </a>
      <a
        className={alvo}
        aria-label="Compartilhar no LinkedIn"
        target="_blank"
        rel="noopener noreferrer"
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
        onClick={() => registrar("compartilhar", { label: "LinkedIn" })}
      >
        <LinkedinLogo className="size-5" />
      </a>
      <button
        type="button"
        className={alvo}
        aria-label={copiado ? "Link copiado" : "Copiar link"}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url);
            setCopiado(true);
            registrar("compartilhar", { label: "Copiar link" });
            setTimeout(() => setCopiado(false), 2000);
          } catch {
            /* sem permissão de área de transferência */
          }
        }}
      >
        {copiado ? <Check className="size-5" /> : <LinkSimple className="size-5" />}
      </button>
    </div>
  );
}

function Post() {
  const { item: post, relacionados } = Route.useLoaderData();
  const { scrollYProgress } = useScroll();
  const progresso = useSpring(scrollYProgress, { stiffness: 200, damping: 30, restDelta: 0.001 });
  const url = `${SITE.url}/blog/${post.slug}`;

  return (
    <>
      {/* Progresso de leitura */}
      <motion.div
        aria-hidden
        style={{ scaleX: progresso }}
        className="fixed inset-x-0 top-0 z-[calc(var(--z-header)+1)] h-[3px] origin-left bg-ouro"
      />

      <article>
        <header className="pt-cabecalho">
          <div className="container-texto pt-10 pb-8 md:pt-14 md:pb-10">
            <nav
              aria-label="Você está em"
              className="flex items-center gap-2 text-[0.8125rem] text-cinza anima-subir"
            >
              <Link to="/blog" className="transition-colors hover:text-petroleo">
                Blog
              </Link>
              <CaretRight className="size-3" aria-hidden />
              <span>{metaPost(post)}</span>
            </nav>
            <h1 className="type-display mt-5 text-petroleo anima-subir" style={i(1)}>
              {post.title}
            </h1>
            {post.subtitle && (
              <p
                className="mt-4 font-serif text-[1.25rem] leading-snug text-cinza italic anima-subir"
                style={i(2)}
              >
                {post.subtitle}
              </p>
            )}
            <p className="type-meta mt-5 text-cinza anima-subir" style={i(3)}>
              Por Daniel Basso · {tempoLeitura(post.body)} min de leitura
            </p>
          </div>
          {post.cover_url && (
            <div className="container-site">
              <Imagem
                src={post.cover_url}
                alt=""
                prioridade
                className="mx-auto aspect-[16/9] max-w-4xl rounded-[2px] anima-imagem md:aspect-[21/9]"
                sizes="(min-width: 1024px) 1024px, 100vw"
              />
            </div>
          )}
        </header>

        <div className="container-texto section-y">
          <Markdown className="text-[1.125rem]">{post.body}</Markdown>

          <footer className="mt-16 flex flex-col gap-8 border-t border-linha pt-8">
            <Compartilhar titulo={post.title} url={url} />
            <div className="flex items-center gap-4">
              <img
                src="/exemplo/daniel-retrato.jpg"
                alt=""
                width={56}
                height={56}
                loading="lazy"
                className="size-14 rounded-full object-cover object-[50%_20%]"
              />
              <div>
                <p className="font-serif text-lg text-petroleo">Daniel Basso</p>
                <p className="text-sm text-cinza">Mentor, escritor e treinador de líderes</p>
              </div>
            </div>
          </footer>
        </div>
      </article>

      {relacionados.length > 0 && (
        <Secao tom="branco">
          <CabecalhoSecao rotulo="Blog" titulo="Continue lendo" />
          <div className="mt-conteudo">
            <div className="grid gap-x-12 border-t border-linha md:grid-cols-2" data-revelar-grupo>
              {relacionados.map((p) => (
                <div key={p.id} className="border-b border-linha">
                  <PostLinha post={p} />
                </div>
              ))}
            </div>
          </div>
        </Secao>
      )}

      <ChamadaFinal
        titulo="Quer aplicar isso *na sua vida*?"
        texto="O diagnóstico mostra em qual etapa do método está o seu próximo passo."
        cta={{ rotulo: "Fazer o diagnóstico", link: "/diagnostico" }}
      />
    </>
  );
}
