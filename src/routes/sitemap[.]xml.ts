import { createFileRoute } from "@tanstack/react-router";

import { COLLECTIONS } from "@/content/collections";
import { listarItens } from "@/lib/conteudo";
import { SITE } from "@/lib/site";

/** /sitemap.xml gerado a cada pedido (cache de 1 h). Painel e login ficam de fora. */
const PAGINAS: Array<[string, string]> = [
  ["/", "1.0"],
  ["/metodo", "0.9"],
  ["/quem-sou", "0.8"],
  ["/cursos", "0.8"],
  ["/mentorias", "0.8"],
  ["/treinamentos", "0.8"],
  ["/livros", "0.7"],
  ["/diagnostico", "0.8"],
  ["/blog", "0.7"],
  ["/depoimentos", "0.6"],
  ["/contato", "0.6"],
  ["/privacidade", "0.2"],
];

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

async function gerar() {
  const linhas = PAGINAS.map(
    ([p, pr]) => `  <url><loc>${esc(SITE.url + p)}</loc><priority>${pr}</priority></url>`,
  );
  for (const col of Object.values(COLLECTIONS)) {
    if (!col.path) continue;
    const itens = await listarItens(col.key);
    for (const it of itens) {
      const data = (it.updated_at ?? it.published_at ?? "").slice(0, 10);
      linhas.push(
        `  <url><loc>${esc(`${SITE.url}${col.path}/${it.slug}`)}</loc>${data ? `<lastmod>${data}</lastmod>` : ""}<priority>0.5</priority></url>`,
      );
    }
  }
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${linhas.join("\n")}\n</urlset>\n`;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () =>
        new Response(await gerar(), {
          headers: {
            "content-type": "application/xml; charset=utf-8",
            "cache-control": "public, max-age=3600",
          },
        }),
    },
  },
});
