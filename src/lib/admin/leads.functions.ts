/**
 * Leads no painel: listar com filtros (paginado), abrir um lead, atualizar status/anotações,
 * excluir (conforme as permissões, garantido pela RLS) e resumo do diagnóstico.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import type { LeadRow } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { checar } from "./erros";
import type { Dados } from "./tipos";

export type LeadItemRef = { title: string; collection: string; slug: string } | null;
export type Lead = Omit<LeadRow, "data" | "utm"> & {
  data: Dados;
  utm: Record<string, string> | null;
  item: LeadItemRef;
};

const TIPOS = ["contato", "interesse", "corporativo", "diagnostico", "lp"] as const;
const STATUS = ["novo", "em_contato", "convertido", "arquivado"] as const;

function objeto(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
}

function normalizar(row: Record<string, unknown>): Lead {
  const utmBruto = objeto(row.utm);
  const utm = Object.fromEntries(
    Object.entries(utmBruto).filter(([, v]) => typeof v === "string" && v) as [string, string][],
  );
  const item = objeto(row.item);
  return {
    ...(row as unknown as LeadRow),
    data: objeto(row.data) as Dados,
    utm: Object.keys(utm).length ? utm : null,
    item: item.title
      ? { title: String(item.title), collection: String(item.collection), slug: String(item.slug) }
      : null,
  };
}

/** Remove caracteres que têm significado na sintaxe de filtros do PostgREST. */
function termoSeguro(q: string) {
  return q
    .replace(/[,()*%\\:"']/g, " ")
    .trim()
    .slice(0, 80);
}

export const listarLeadsFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator(
    z.object({
      tipo: z.enum(TIPOS).optional(),
      status: z.enum(STATUS).optional(),
      busca: z.string().max(120).optional(),
      ordem: z.enum(["recentes", "antigos"]).default("recentes"),
      pagina: z.number().int().min(0).default(0),
      porPagina: z.number().int().min(1).max(1000).default(100),
    }),
  )
  .handler(async ({ data, context }): Promise<{ leads: Lead[]; total: number }> => {
    const inicio = data.pagina * data.porPagina;
    let q = context.supabase
      .from("leads")
      .select("*, item:content_items(title, collection, slug)", { count: "exact" })
      .order("created_at", { ascending: data.ordem === "antigos" })
      .order("id", { ascending: true })
      .range(inicio, inicio + data.porPagina - 1);
    if (data.tipo) q = q.eq("kind", data.tipo);
    if (data.status) q = q.eq("status", data.status);
    const termo = data.busca ? termoSeguro(data.busca) : "";
    if (termo) {
      const t = `%${termo}%`;
      q = q.or(`name.ilike.${t},email.ilike.${t},company.ilike.${t}`);
    }
    const { data: rows, error, count } = await q;
    checar(error, "listar leads");
    return {
      leads: (rows ?? []).map((r) => normalizar(r as unknown as Record<string, unknown>)),
      total: count ?? 0,
    };
  });

/** Um lead só (para abrir pelo link quando ele não está na página carregada). */
export const obterLeadFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data, context }): Promise<Lead | null> => {
    const { data: row, error } = await context.supabase
      .from("leads")
      .select("*, item:content_items(title, collection, slug)")
      .eq("id", data.id)
      .maybeSingle();
    checar(error, "abrir lead");
    return row ? normalizar(row as unknown as Record<string, unknown>) : null;
  });

export const atualizarLeadFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(
    z.object({
      id: z.string().uuid(),
      status: z.enum(STATUS).optional(),
      notes: z.string().max(10_000).nullable().optional(),
    }),
  )
  .handler(async ({ data, context }): Promise<Lead> => {
    const patch: { status?: string; notes?: string | null } = {};
    if (data.status) patch.status = data.status;
    if (data.notes !== undefined) patch.notes = data.notes?.trim() ? data.notes : null;
    const { data: row, error } = await context.supabase
      .from("leads")
      .update(patch)
      .eq("id", data.id)
      .select("*, item:content_items(title, collection, slug)")
      .single();
    checar(error, "atualizar lead");
    return normalizar(row as unknown as Record<string, unknown>);
  });

export const excluirLeadFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    const { count, error } = await context.supabase
      .from("leads")
      .delete({ count: "exact" })
      .eq("id", data.id);
    checar(error, "excluir lead");
    // A RLS não gera erro quando nega: a exclusão simplesmente não acontece.
    if (!count) throw new Error("Você não tem permissão para excluir este lead.");
    return { ok: true };
  });

export type ResumoDiagnostico = {
  total: number;
  focos: Record<string, number>;
  medias: Record<string, number | null>;
  recentes: {
    id: string;
    name: string;
    email: string | null;
    status: string;
    created_at: string;
    foco: string | null;
    pontuacao: Record<string, number>;
  }[];
};

export const resumoDiagnosticoFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ResumoDiagnostico> => {
    // Calculado no banco sobre todas as respostas (função diagnostico_resumo).
    const { data, error } = await context.supabase.rpc("diagnostico_resumo");
    checar(error, "resumo diagnóstico");
    const r = objeto(data);
    const numeros = (v: unknown) =>
      Object.fromEntries(
        Object.entries(objeto(v)).map(([k, n]) => [k, n === null ? null : Number(n)]),
      );
    return {
      total: Number(r.total ?? 0),
      focos: numeros(r.focos) as Record<string, number>,
      medias: numeros(r.medias),
      recentes: (Array.isArray(r.recentes) ? r.recentes : []).map((x) => {
        const o = objeto(x);
        return {
          id: String(o.id),
          name: String(o.name ?? ""),
          email: (o.email as string | null) ?? null,
          status: String(o.status ?? "novo"),
          created_at: String(o.created_at),
          foco: (o.foco as string | null) ?? null,
          pontuacao: numeros(o.pontuacao) as Record<string, number>,
        };
      }),
    };
  });
