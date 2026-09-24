/**
 * Peças comuns das rotas de detalhe (curso, mentoria, treinamento, livro, post):
 * loader com 404 de verdade e metadados de SEO a partir do item.
 */
import { notFound } from "@tanstack/react-router";

import { getCollection } from "@/content/collections";
import { listarItens, obterItem, type ItemConteudo } from "@/lib/conteudo";
import { artigoJsonLd, buildMeta, canonical } from "@/lib/seo";

export async function carregarDetalhe(collection: string, slug: string, relacionados = 3) {
  const item = await obterItem(collection, slug).catch((err) => {
    console.error(`[${collection}] falha ao carregar ${slug}:`, err);
    return null;
  });
  if (!item) throw notFound();
  const outros = relacionados
    ? await listarItens(collection, { limite: relacionados, excluirSlug: slug })
    : [];
  return { item, relacionados: outros };
}

export function headDetalhe(
  item: ItemConteudo | undefined,
  tipo: "website" | "article" = "website",
) {
  if (!item) return {};
  const col = getCollection(item.collection);
  const path = `${col?.path ?? ""}/${item.slug}`;
  const titulo = item.seo_title || item.title;
  const descricao = item.seo_description || item.excerpt || item.subtitle || "";
  return {
    meta: buildMeta({
      title: titulo,
      description: descricao,
      path,
      ogType: tipo,
      ogImage: item.cover_url ?? undefined,
      publishedTime: tipo === "article" ? (item.published_at ?? undefined) : undefined,
    }),
    links: canonical(path),
    scripts:
      tipo === "article"
        ? [
            artigoJsonLd({
              titulo: item.title,
              descricao,
              path,
              data: item.published_at ?? undefined,
              imagem: item.cover_url ?? undefined,
            }),
          ]
        : [],
  };
}
