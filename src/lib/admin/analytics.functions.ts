/**
 * Visão geral do painel: resumo de navegação (RPC analytics_overview, security invoker)
 * do período escolhido e do período anterior (para as variações), mais os leads recentes.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { checar } from "./erros";

export type ItemRanking = { label: string; value: number; visitors?: number; type?: string };
export type DiaAnalytics = { day: string; pageviews: number; visitors: number };

export type ResumoAnalytics = {
  pageviews: number;
  visitors: number;
  sessions: number;
  bounce: number | null;
  avg_duration: number | null;
  leads: number;
  daily: DiaAnalytics[];
  pages: ItemRanking[];
  referrers: ItemRanking[];
  devices: ItemRanking[];
  cities: ItemRanking[];
  events: ItemRanking[];
  ctas: ItemRanking[];
};

export type LeadResumo = {
  id: string;
  kind: string;
  name: string;
  email: string | null;
  company: string | null;
  subject: string | null;
  status: string;
  created_at: string;
};

export type VisaoGeral = {
  atual: ResumoAnalytics;
  anterior: ResumoAnalytics;
  de: string;
  ate: string;
  leadsRecentes: LeadResumo[];
};

const num = (v: unknown) =>
  typeof v === "number" ? v : typeof v === "string" ? Number(v) || 0 : 0;
const lista = (v: unknown): ItemRanking[] =>
  Array.isArray(v)
    ? v.map((x) => {
        const o = (x ?? {}) as Record<string, unknown>;
        return {
          label: String(o.label ?? ""),
          value: num(o.value),
          visitors: o.visitors === undefined ? undefined : num(o.visitors),
          type: typeof o.type === "string" ? o.type : undefined,
        };
      })
    : [];

function normalizar(raw: unknown): ResumoAnalytics {
  const o = (raw ?? {}) as Record<string, unknown>;
  return {
    pageviews: num(o.pageviews),
    visitors: num(o.visitors),
    sessions: num(o.sessions),
    bounce: o.bounce === null || o.bounce === undefined ? null : num(o.bounce),
    avg_duration:
      o.avg_duration === null || o.avg_duration === undefined ? null : num(o.avg_duration),
    leads: num(o.leads),
    daily: Array.isArray(o.daily)
      ? o.daily.map((d) => {
          const x = (d ?? {}) as Record<string, unknown>;
          return {
            day: String(x.day ?? ""),
            pageviews: num(x.pageviews),
            visitors: num(x.visitors),
          };
        })
      : [],
    pages: lista(o.pages),
    referrers: lista(o.referrers),
    devices: lista(o.devices),
    cities: lista(o.cities),
    events: lista(o.events),
    ctas: lista(o.ctas),
  };
}

export const visaoGeralFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator(z.object({ dias: z.union([z.literal(7), z.literal(30), z.literal(90)]) }))
  .handler(async ({ data, context }): Promise<VisaoGeral> => {
    const DIA = 86_400_000;
    const agora = new Date();
    // Início do período: meia-noite de São Paulo (UTC−3) de (dias − 1) dias atrás.
    const hojeSP = agora.toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
    const inicioHoje = new Date(`${hojeSP}T00:00:00-03:00`).getTime();
    const de = new Date(inicioHoje - (data.dias - 1) * DIA);
    const ate = new Date(agora.getTime() + 60_000);
    const deAnterior = new Date(de.getTime() - data.dias * DIA);

    const [atual, anterior, recentes] = await Promise.all([
      context.supabase.rpc("analytics_overview", {
        p_from: de.toISOString(),
        p_to: ate.toISOString(),
      }),
      context.supabase.rpc("analytics_overview", {
        p_from: deAnterior.toISOString(),
        p_to: de.toISOString(),
      }),
      context.supabase
        .from("leads")
        .select("id, kind, name, email, company, subject, status, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);
    checar(atual.error, "analytics atual");
    checar(anterior.error, "analytics anterior");
    checar(recentes.error, "leads recentes");

    return {
      atual: normalizar(atual.data),
      anterior: normalizar(anterior.data),
      de: de.toISOString(),
      ate: agora.toISOString(),
      leadsRecentes: recentes.data ?? [],
    };
  });
