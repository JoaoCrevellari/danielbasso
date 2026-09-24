/**
 * Coleções no painel (content_items): listar, abrir, salvar, publicar, duplicar,
 * reordenar e excluir. A RLS garante que só a equipe (admin/editor) escreve.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import type { ContentItemRow, Json } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { checar } from "./erros";
import type { Dados } from "./tipos";

export type ItemAdmin = Omit<ContentItemRow, "data"> & { data: Dados };
export type ItemLista = Omit<ItemAdmin, "body">;

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const colecao = z.string().regex(/^[a-z0-9_-]{1,40}$/);

const COLUNAS_LISTA =
  "id, collection, slug, title, subtitle, excerpt, cover_url, status, featured, sort_order, data, seo_title, seo_description, published_at, created_at, updated_at, updated_by";

function normalizar<T extends { data: Json }>(row: T): Omit<T, "data"> & { data: Dados } {
  const data =
    row.data && typeof row.data === "object" && !Array.isArray(row.data) ? (row.data as Dados) : {};
  return { ...row, data };
}

async function ordemManual(collection: string): Promise<boolean> {
  const { getCollection } = await import("@/content/collections");
  return getCollection(collection)?.ordem !== "data";
}

export const listarItensAdminFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator(z.object({ collection: colecao }))
  .handler(async ({ data, context }): Promise<ItemLista[]> => {
    const manual = await ordemManual(data.collection);
    let q = context.supabase
      .from("content_items")
      .select(COLUNAS_LISTA)
      .eq("collection", data.collection);
    q = manual
      ? q.order("sort_order", { ascending: true }).order("created_at", { ascending: false })
      : q
          .order("published_at", { ascending: false, nullsFirst: true })
          .order("created_at", { ascending: false });
    const { data: rows, error } = await q.limit(1000);
    checar(error, "listar itens");
    return ((rows ?? []) as unknown as Omit<ContentItemRow, "body">[]).map(normalizar);
  });

export const obterItemAdminFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data, context }): Promise<ItemAdmin | null> => {
    const { data: row, error } = await context.supabase
      .from("content_items")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    checar(error, "obter item");
    return row ? normalizar(row) : null;
  });

const texto = (max: number) => z.string().max(max).nullable().optional();

export const salvarItemFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(
    z.object({
      id: z.string().uuid().optional(),
      collection: colecao,
      title: z.string().trim().min(1, "Informe o título.").max(300),
      slug: z
        .string()
        .trim()
        .min(1, "Informe o endereço (slug).")
        .max(120)
        .regex(SLUG, "O endereço só pode ter letras minúsculas, números e hífens."),
      subtitle: texto(500),
      excerpt: texto(2000),
      body: texto(200_000),
      cover_url: texto(1000),
      status: z.enum(["draft", "published"]),
      featured: z.boolean(),
      published_at: z.string().datetime({ offset: true }).nullable().optional(),
      seo_title: texto(200),
      seo_description: texto(400),
      data: z.record(z.unknown()),
    }),
  )
  .handler(async ({ data, context }): Promise<ItemAdmin> => {
    if (JSON.stringify(data.data).length > 300_000)
      throw new Error("Conteúdo grande demais para salvar.");
    const vazio = (v?: string | null) => (v && v.trim() ? v : null);
    const publishedAt =
      data.status === "published" && !data.published_at
        ? new Date().toISOString()
        : (data.published_at ?? null);

    const campos = {
      collection: data.collection,
      title: data.title.trim(),
      slug: data.slug,
      subtitle: vazio(data.subtitle),
      excerpt: vazio(data.excerpt),
      body: vazio(data.body),
      cover_url: vazio(data.cover_url),
      status: data.status,
      featured: data.featured,
      published_at: publishedAt,
      seo_title: vazio(data.seo_title),
      seo_description: vazio(data.seo_description),
      data: data.data as Json,
      updated_by: context.userId,
    };

    if (data.id) {
      const { data: row, error } = await context.supabase
        .from("content_items")
        .update(campos)
        .eq("id", data.id)
        .select("*")
        .single();
      checar(error, "atualizar item");
      return normalizar(row!);
    }

    // Item novo: entra no fim da ordem manual.
    const { data: ultimo } = await context.supabase
      .from("content_items")
      .select("sort_order")
      .eq("collection", data.collection)
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    const { data: row, error } = await context.supabase
      .from("content_items")
      .insert({ ...campos, sort_order: (ultimo?.sort_order ?? 0) + 10 })
      .select("*")
      .single();
    checar(error, "criar item");
    return normalizar(row!);
  });

export const alterarStatusItemFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(z.object({ id: z.string().uuid(), status: z.enum(["draft", "published"]) }))
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    const patch: { status: string; updated_by: string; published_at?: string } = {
      status: data.status,
      updated_by: context.userId,
    };
    if (data.status === "published") {
      const { data: atual } = await context.supabase
        .from("content_items")
        .select("published_at")
        .eq("id", data.id)
        .maybeSingle();
      if (!atual?.published_at) patch.published_at = new Date().toISOString();
    }
    const { error } = await context.supabase.from("content_items").update(patch).eq("id", data.id);
    checar(error, "alterar status");
    return { ok: true };
  });

export const duplicarItemFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data, context }): Promise<{ id: string }> => {
    const { data: orig, error } = await context.supabase
      .from("content_items")
      .select("*")
      .eq("id", data.id)
      .single();
    checar(error, "duplicar (ler)");
    if (!orig) throw new Error("Item não encontrado.");

    const { data: existentes } = await context.supabase
      .from("content_items")
      .select("slug, sort_order")
      .eq("collection", orig.collection);
    const usados = new Set((existentes ?? []).map((e) => e.slug));
    const base = `${orig.slug}-copia`.slice(0, 110);
    let slug = base;
    for (let i = 2; usados.has(slug); i++) slug = `${base}-${i}`;
    const maxOrdem = Math.max(0, ...(existentes ?? []).map((e) => e.sort_order));

    const { id: _id, created_at: _c, updated_at: _u, ...resto } = orig;
    const { data: novo, error: e2 } = await context.supabase
      .from("content_items")
      .insert({
        ...resto,
        slug,
        title: `${orig.title} (cópia)`,
        status: "draft",
        featured: false,
        published_at: null,
        sort_order: maxOrdem + 10,
        updated_by: context.userId,
      })
      .select("id")
      .single();
    checar(e2, "duplicar (gravar)");
    return { id: novo!.id };
  });

export const reordenarItensFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(
    z.object({
      itens: z.array(z.object({ id: z.string().uuid(), sort_order: z.number().int() })).max(500),
    }),
  )
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    const resultados = await Promise.all(
      data.itens.map((i) =>
        context.supabase.from("content_items").update({ sort_order: i.sort_order }).eq("id", i.id),
      ),
    );
    for (const r of resultados) checar(r.error, "reordenar");
    return { ok: true };
  });

export const excluirItemFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    const { count, error } = await context.supabase
      .from("content_items")
      .delete({ count: "exact" })
      .eq("id", data.id);
    checar(error, "excluir item");
    if (!count) throw new Error("Não foi possível excluir: item não encontrado ou sem permissão.");
    return { ok: true };
  });

/** Contagem por coleção e status (para o hub de conteúdo). */
export const contarItensFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Record<string, { total: number; publicados: number }>> => {
    const { data: rows, error } = await context.supabase
      .from("content_items")
      .select("collection, status");
    checar(error, "contar itens");
    const out: Record<string, { total: number; publicados: number }> = {};
    for (const r of rows ?? []) {
      out[r.collection] ??= { total: 0, publicados: 0 };
      out[r.collection].total += 1;
      if (r.status === "published") out[r.collection].publicados += 1;
    }
    return out;
  });
