import { SITE } from "./site";

type MetaTag = Record<string, string>;

/** Caminho ou URL → URL absoluta no domínio do site (og:url, canonical, og:image exigem). */
export function absoluta(pathOuUrl: string): string {
  if (/^https?:\/\//.test(pathOuUrl)) return pathOuUrl;
  return `${SITE.url}${pathOuUrl.startsWith("/") ? "" : "/"}${pathOuUrl}`;
}

/**
 * Builder unificado de metadados (title, description, Open Graph, Twitter).
 * Sem ogImage, vale a imagem padrão do root (public/compartilhamento.jpg, 1200×630).
 */
export function buildMeta(opts: {
  title: string;
  description: string;
  path: string;
  ogType?: "website" | "article" | "profile";
  ogImage?: string;
  /** Só para ogType "article": data de publicação (ISO). */
  publishedTime?: string;
}): MetaTag[] {
  const fullTitle = opts.title.includes(SITE.shortName)
    ? opts.title
    : `${opts.title} | ${SITE.name}`;
  const imagem = absoluta(opts.ogImage ?? "/compartilhamento.jpg");

  const tags: MetaTag[] = [
    { title: fullTitle },
    { name: "description", content: opts.description },
    { property: "og:title", content: fullTitle },
    { property: "og:description", content: opts.description },
    { property: "og:type", content: opts.ogType ?? "website" },
    { property: "og:url", content: absoluta(opts.path) },
    { property: "og:site_name", content: SITE.name },
    { property: "og:locale", content: "pt_BR" },
    { property: "og:image", content: imagem },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: fullTitle },
    { name: "twitter:description", content: opts.description },
    { name: "twitter:image", content: imagem },
  ];

  if (opts.ogType === "article" && opts.publishedTime) {
    tags.push({ property: "article:published_time", content: opts.publishedTime });
    tags.push({ property: "article:author", content: SITE.name });
  }

  return tags;
}

export function canonical(path: string) {
  return [{ rel: "canonical", href: absoluta(path) }];
}

/** JSON-LD de uma página de leitura (artigo, curso, publicação). */
export function artigoJsonLd(opts: {
  titulo: string;
  descricao?: string;
  path: string;
  data?: string;
  autor?: string;
  imagem?: string;
}) {
  return {
    type: "application/ld+json",
    children: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: opts.titulo,
      description: opts.descricao,
      url: absoluta(opts.path),
      mainEntityOfPage: absoluta(opts.path),
      datePublished: opts.data,
      inLanguage: "pt-BR",
      image: absoluta(opts.imagem ?? "/compartilhamento.jpg"),
      author: { "@type": "Person", name: opts.autor ?? SITE.name, url: SITE.url },
      publisher: { "@type": "Person", name: SITE.name, url: SITE.url },
    }),
  };
}
