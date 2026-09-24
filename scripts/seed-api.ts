/**
 * Grava o conteúdo de exemplo pela API. Use com SUPABASE_SERVICE_ROLE_KEY no .env
 * (ou, só na primeira carga, com uma política temporária de inserção já removida depois).
 *
 * Uso: npx tsx --env-file=.env scripts/seed-api.ts
 */
import { createClient } from "@supabase/supabase-js";

import { CURSOS, MENTORIAS, TREINAMENTOS } from "./exemplo/cursos-mentorias-treinamentos";
import { DEPOIMENTOS, LIVROS } from "./exemplo/livros-depoimentos";
import { POSTS } from "./exemplo/posts";

const url = process.env.SUPABASE_URL!;
const chave = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY!;
const sb = createClient(url, chave, { auth: { persistSession: false } });

const todos = [...CURSOS, ...MENTORIAS, ...TREINAMENTOS, ...LIVROS, ...DEPOIMENTOS, ...POSTS];
const agora = Date.now();
const linhas = todos.map((it, n) => ({
  ...it,
  status: "published",
  featured: it.featured ?? false,
  sort_order: it.sort_order ?? 0,
  published_at: it.published_at ?? new Date(agora - n * 86_400_000).toISOString(),
}));

const { error, count } = await sb
  .from("content_items")
  .upsert(linhas, { onConflict: "collection,slug", count: "exact" });
if (error) {
  console.error(error);
  process.exit(1);
}
console.log(`ok: ${count ?? linhas.length} itens`);
