/**
 * Textos das páginas, configurações e diagnóstico (site_content, uma linha por chave).
 * O painel mescla o que está salvo sobre o conteúdo padrão; salvar grava o objeto inteiro.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import type { Json } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { checar } from "./erros";
import type { Dados } from "./tipos";

const chave = z.string().regex(/^[a-z0-9_-]{1,40}$/);

export type PaginaSalva = { key: string; updated_at: string; updated_by: string | null };

export const listarPaginasSalvasFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<PaginaSalva[]> => {
    const { data, error } = await context.supabase
      .from("site_content")
      .select("key, updated_at, updated_by");
    checar(error, "listar páginas");
    return data ?? [];
  });

export const obterPaginaSalvaFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator(z.object({ key: chave }))
  .handler(
    async ({ data, context }): Promise<{ data: Dados | null; updated_at: string | null }> => {
      const { data: row, error } = await context.supabase
        .from("site_content")
        .select("data, updated_at")
        .eq("key", data.key)
        .maybeSingle();
      checar(error, "obter página");
      const d = row?.data;
      return {
        data: d && typeof d === "object" && !Array.isArray(d) ? (d as Dados) : null,
        updated_at: row?.updated_at ?? null,
      };
    },
  );

export const salvarPaginaFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(z.object({ key: chave, data: z.record(z.unknown()) }))
  .handler(async ({ data, context }): Promise<{ updated_at: string }> => {
    const { getPagina } = await import("@/content/paginas");
    if (!getPagina(data.key)) throw new Error("Página desconhecida.");
    if (JSON.stringify(data.data).length > 300_000)
      throw new Error("Conteúdo grande demais para salvar.");
    const { data: row, error } = await context.supabase
      .from("site_content")
      .upsert(
        { key: data.key, data: data.data as Json, updated_by: context.userId },
        { onConflict: "key" },
      )
      .select("updated_at")
      .single();
    checar(error, "salvar página");
    return { updated_at: row!.updated_at };
  });
