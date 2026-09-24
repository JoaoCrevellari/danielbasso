/**
 * Leads no painel: listar com filtros, atualizar status/anotações, excluir (só admin,
 * garantido pela RLS) e resumo do diagnóstico.
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

const TIPOS = ["contato", "interesse", "corporativo", "diagnostico"] as const;
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
    }),
  )
  .handler(async ({ data, context }): Promise<Lead[]> => {
    let q = context.supabase
      .from("leads")
      .select("*, item:content_items(title, collection, slug)")
      .order("created_at", { ascending: data.ordem === "antigos" })
      .limit(1000);
    if (data.tipo) q = q.eq("kind", data.tipo);
    if (data.status) q = q.eq("status", data.status);
    const termo = data.busca ? termoSeguro(data.busca) : "";
    if (termo) {
      const t = `%${termo}%`;
      q = q.or(`name.ilike.${t},email.ilike.${t},company.ilike.${t}`);
    }
    const { data: rows, error } = await q;
    checar(error, "listar leads");
    return (rows ?? []).map((r) => normalizar(r as unknown as Record<string, unknown>));
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
    if (!count) throw new Error("Só administradores podem excluir leads.");
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
    const { data: rows, error } = await context.supabase
      .from("leads")
      .select("id, name, email, status, created_at, data")
      .eq("kind", "diagnostico")
      .order("created_at", { ascending: false })
      .limit(2000);
    checar(error, "resumo diagnóstico");

    const focos: Record<string, number> = {};
    const somas: Record<string, { s: number; n: number }> = {};
    const recentes: ResumoDiagnostico["recentes"] = [];

    for (const r of rows ?? []) {
      const d = objeto(r.data);
      const foco = typeof d.foco === "string" ? d.foco : null;
      const pont = objeto(d.pontuacao);
      const pontuacao: Record<string, number> = {};
      for (const [etapa, v] of Object.entries(pont)) {
        const n = typeof v === "number" ? v : Number(v);
        if (!Number.isFinite(n)) continue;
        pontuacao[etapa] = n;
        somas[etapa] ??= { s: 0, n: 0 };
        somas[etapa].s += n;
        somas[etapa].n += 1;
      }
      if (foco) focos[foco] = (focos[foco] ?? 0) + 1;
      if (recentes.length < 12) {
        recentes.push({
          id: r.id,
          name: r.name,
          email: r.email,
          status: r.status,
          created_at: r.created_at,
          foco,
          pontuacao,
        });
      }
    }

    const medias = Object.fromEntries(
      Object.entries(somas).map(([k, { s, n }]) => [k, n ? Math.round((s / n) * 100) / 100 : null]),
    );
    return { total: rows?.length ?? 0, focos, medias, recentes };
  });
