/**
 * Gera supabase/seed.sql com o conteúdo de exemplo (cursos, mentorias, treinamentos,
 * livros, depoimentos e posts). Idempotente: atualiza itens existentes pelo slug.
 *
 * Uso: npx tsx scripts/gerar-seed-sql.ts
 * Depois aplique o SQL no banco (painel do Supabase → SQL, ou MCP execute_sql).
 */
import { writeFileSync } from "node:fs";

import { CURSOS, MENTORIAS, TREINAMENTOS } from "./exemplo/cursos-mentorias-treinamentos";
import { DEPOIMENTOS, LIVROS } from "./exemplo/livros-depoimentos";
import { POSTS } from "./exemplo/posts";

const todos = [...CURSOS, ...MENTORIAS, ...TREINAMENTOS, ...LIVROS, ...DEPOIMENTOS, ...POSTS];

const s = (v: unknown) => (v === undefined || v === null ? "NULL" : `'${String(v).replace(/'/g, "''")}'`);

const agora = Date.now();
const linhas = todos.map((it, n) => {
  const publicado = it.published_at ?? new Date(agora - n * 86_400_000).toISOString();
  return `(${[
    s(it.collection),
    s(it.slug),
    s(it.title),
    s(it.subtitle),
    s(it.excerpt),
    s(it.body),
    s(it.cover_url),
    "'published'",
    it.featured ? "true" : "false",
    String(it.sort_order ?? 0),
    `${s(JSON.stringify(it.data))}::jsonb`,
    s(publicado),
  ].join(", ")})`;
});

const sql = `-- Conteúdo de exemplo (gerado por scripts/gerar-seed-sql.ts). Não edite à mão.
INSERT INTO public.content_items
  (collection, slug, title, subtitle, excerpt, body, cover_url, status, featured, sort_order, data, published_at)
VALUES
${linhas.join(",\n")}
ON CONFLICT (collection, slug) DO UPDATE SET
  title = EXCLUDED.title, subtitle = EXCLUDED.subtitle, excerpt = EXCLUDED.excerpt,
  body = EXCLUDED.body, cover_url = EXCLUDED.cover_url, status = EXCLUDED.status,
  featured = EXCLUDED.featured, sort_order = EXCLUDED.sort_order, data = EXCLUDED.data,
  published_at = EXCLUDED.published_at;
`;

writeFileSync("supabase/seed.sql", sql);
console.log(`supabase/seed.sql: ${todos.length} itens`);
