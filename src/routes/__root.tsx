import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  useMatches,
  useRouter,
  useRouterState,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { Cabecalho } from "@/components/layout/Cabecalho";
import { ConfigProvider } from "@/components/layout/ConfigContext";
import { Rodape } from "@/components/layout/Rodape";
import { WhatsAppFlutuante } from "@/components/layout/WhatsAppFlutuante";
import { Botao, classeBotao } from "@/components/site/Botao";
import { useRevelar } from "@/components/site/useRevelar";
import { instalarAnalytics, registrar } from "@/lib/analytics";
import { carregarPagina } from "@/lib/conteudo";
import { SITE } from "@/lib/site";

function NaoEncontrada() {
  return (
    <section className="pt-cabecalho">
      <div className="container-site flex min-h-[70dvh] flex-col justify-center py-24">
        <p className="type-eyebrow text-ouro-texto anima-subir">Página não encontrada</p>
        <h1
          className="type-display mt-6 max-w-[14ch] text-petroleo anima-subir"
          style={{ "--i": 1 } as React.CSSProperties}
        >
          Este caminho <em className="destaque">não leva</em> a lugar nenhum.
        </h1>
        <p
          className="type-lead mt-6 max-w-xl text-cinza anima-subir"
          style={{ "--i": 2 } as React.CSSProperties}
        >
          O endereço pode ter mudado ou o conteúdo ainda não foi publicado.
        </p>
        <div
          className="mt-10 flex flex-wrap gap-3 anima-subir"
          style={{ "--i": 3 } as React.CSSProperties}
        >
          <Botao href="/">Voltar ao início</Botao>
          <Botao href="/contato" variante="contorno">
            Falar com a equipe
          </Botao>
        </div>
      </div>
    </section>
  );
}

function ErroPagina({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  return (
    <section className="pt-cabecalho">
      <div className="container-site flex min-h-[60dvh] flex-col justify-center py-24" role="alert">
        <p className="type-eyebrow text-ouro-texto">Algo deu errado</p>
        <h1 className="type-h1 mt-5 max-w-[18ch] text-petroleo">
          Esta página não pôde ser carregada
        </h1>
        <p className="type-lead mt-5 max-w-xl text-cinza">
          Tente de novo em instantes ou volte ao início.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className={classeBotao("primario")}
          >
            Tentar novamente
          </button>
          <a href="/" className={classeBotao("contorno")}>
            Início
          </a>
        </div>
      </div>
    </section>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  loader: () => carregarPagina("settings"),
  staleTime: 60_000,
  head: ({ loaderData }) => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#001F2E" },
      { title: `${SITE.name} | ${SITE.tagline}` },
      { name: "description", content: loaderData?.seo.descricao ?? SITE.description },
      { name: "author", content: SITE.name },
      { property: "og:site_name", content: SITE.name },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "pt_BR" },
      { property: "og:image", content: `${SITE.url}/compartilhamento.jpg` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/site.webmanifest" },
      { rel: "preconnect", href: "https://images.unsplash.com" },
    ],
    scripts: [
      // Marca que há JS antes da pintura: só então o conteúdo com [data-revelar] começa oculto.
      { children: "document.documentElement.classList.add('js')" },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Person",
              "@id": `${SITE.url}/#pessoa`,
              name: SITE.name,
              url: SITE.url,
              jobTitle: SITE.role,
              description: SITE.description,
              sameAs: [loaderData?.contato.instagram, loaderData?.contato.youtube].filter(Boolean),
            },
            {
              "@type": "WebSite",
              "@id": `${SITE.url}/#site`,
              url: SITE.url,
              name: `${SITE.name} | ${SITE.tagline}`,
              inLanguage: "pt-BR",
              publisher: { "@id": `${SITE.url}/#pessoa` },
            },
          ],
        }),
      },
    ],
  }),
  shellComponent: Documento,
  component: Aplicacao,
  notFoundComponent: NaoEncontrada,
  errorComponent: ErroPagina,
});

function Documento({ children }: { children: ReactNode }) {
  return (
    // suppressHydrationWarning: o script inline adiciona a classe "js" antes do React hidratar.
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

/** Uma página vista por navegação (inclusive a primeira). */
function usePaginaVista(ativo: boolean) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => {
    instalarAnalytics();
  }, []);
  useEffect(() => {
    if (ativo) registrar("pageview", { path: pathname });
  }, [pathname, ativo]);
}

function Aplicacao() {
  const { queryClient } = Route.useRouteContext();
  const config = Route.useLoaderData();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const matches = useMatches();
  const painel = ["/admin", "/entrar", "/redefinir-senha"].some((p) => pathname.startsWith(p));
  const semFlutuante = matches.some((m) => m.staticData?.semFlutuante);

  useRevelar();
  usePaginaVista(!painel);

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider value={config}>
        {painel ? (
          <Outlet />
        ) : (
          <div
            data-aviso={config.apresentacao.aviso_exemplo ? "1" : undefined}
            className="flex min-h-dvh flex-col"
          >
            <a
              href="#conteudo"
              className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[var(--z-toast)] focus:rounded-full focus:bg-petroleo focus:px-5 focus:py-3 focus:text-gelo"
            >
              Pular para o conteúdo
            </a>
            <Cabecalho />
            <main id="conteudo" className="flex-1">
              <Outlet />
            </main>
            <Rodape />
            {!semFlutuante && <WhatsAppFlutuante />}
          </div>
        )}
      </ConfigProvider>
    </QueryClientProvider>
  );
}
