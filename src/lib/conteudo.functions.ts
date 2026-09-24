/**
 * Leituras públicas do site (chave publishable + RLS: só conteúdo publicado).
 * Retornam dados brutos; a mesclagem com o conteúdo padrão fica em src/lib/conteudo.ts.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import type { ContentItemRow } from "@/integrations/supabase/types";

/** Campos próprios da coleção (jsonb). `any` porque o TanStack exige tipos serializáveis e o conteúdo é validado pelo registro. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DadosItem = Record<string, any>;

export type ItemConteudo = Omit<ContentItemRow, "data"> & { data: DadosItem };

const COLUNAS_LISTA =
  "id, collection, slug, title, subtitle, excerpt, cover_url, featured, sort_order, data, published_at, updated_at, status, seo_title, seo_description, created_at, updated_by";

function normalizar(row: ContentItemRow): ItemConteudo {
  const data =
    row.data && typeof row.data === "object" && !Array.isArray(row.data)
      ? (row.data as DadosItem)
      : {};
  return { ...row, body: row.body ?? null, data };
}

export const getPaginasFn = createServerFn({ method: "GET" })
  .validator(z.object({ keys: z.array(z.string().max(40)).max(12) }))
  .handler(async ({ data }): Promise<DadosItem> => {
    const { supabasePublic } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabasePublic
      .from("site_content")
      .select("key, data")
      .in("key", data.keys);
    if (error) throw error;
    return Object.fromEntries((rows ?? []).map((r) => [r.key, r.data]));
  });

export const listarItensFn = createServerFn({ method: "GET" })
  .validator(
    z.object({
      collection: z.string().max(40),
      limite: z.number().int().min(1).max(100).optional(),
      destaque: z.boolean().optional(),
      etapa: z.string().max(40).optional(),
      excluirSlug: z.string().max(120).optional(),
    }),
  )
  .handler(async ({ data }): Promise<ItemConteudo[]> => {
    const { supabasePublic } = await import("@/integrations/supabase/client.server");
    const { COLLECTIONS } = await import("@/content/collections");
    const cfg = COLLECTIONS[data.collection as keyof typeof COLLECTIONS];
    let q = supabasePublic
      .from("content_items")
      .select(COLUNAS_LISTA)
      .eq("collection", data.collection)
      .eq("status", "published");
    if (data.destaque) q = q.eq("featured", true);
    if (data.etapa) q = q.eq("data->>etapa", data.etapa);
    if (data.excluirSlug) q = q.neq("slug", data.excluirSlug);
    q =
      cfg?.ordem === "data"
        ? q.order("published_at", { ascending: false, nullsFirst: false })
        : q.order("sort_order", { ascending: true }).order("published_at", { ascending: false });
    if (data.limite) q = q.limit(data.limite);
    const { data: rows, error } = await q;
    if (error) throw error;
    return ((rows ?? []) as unknown as ContentItemRow[]).map(normalizar);
  });

export const obterItemFn = createServerFn({ method: "GET" })
  .validator(z.object({ collection: z.string().max(40), slug: z.string().max(120) }))
  .handler(async ({ data }): Promise<ItemConteudo | null> => {
    const { supabasePublic } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabasePublic
      .from("content_items")
      .select("*")
      .eq("collection", data.collection)
      .eq("slug", data.slug)
      .eq("status", "published")
      .maybeSingle();
    if (error) throw error;
    return row ? normalizar(row) : null;
  });
