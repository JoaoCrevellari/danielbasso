/**
 * LPs de lançamento no painel: cadastro, versões enviadas, publicação, relatório e
 * respostas. Tudo com o token de quem chama (RLS: módulo "lps" ver/editar/apagar).
 * Os arquivos sobem direto do navegador para o bucket privado "lps" (também com RLS);
 * aqui só se registra a versão nova e se limpa a anterior.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Json } from "@/integrations/supabase/types";
import { dominioValido, limparPixels, type Pixels } from "@/lp/pixels";
import { checar } from "./erros";

export type ArquivoLp = { caminho: string; tamanho: number; tipo: string };
export type ItemConformidade = { nivel: "erro" | "aviso" | "ok"; texto: string };
export type StatusLp = "rascunho" | "publicada" | "encerrada";

export type Lp = {
  id: string;
  slug: string;
  titulo: string;
  status: StatusLp;
  versao: number;
  arquivos: ArquivoLp[];
  conformidade: ItemConformidade[];
  pixels: Pixels;
  dominiosExtras: string[];
  inicio: string | null;
  fim: string | null;
  urlEncerrada: string | null;
  notas: string | null;
  publicadaEm: string | null;
  criadaEm: string;
  atualizadaEm: string;
};

export type LpNaLista = Lp & { visitantes: number; respostas: number; cliques: number };

type Linha = {
  id: string;
  slug: string;
  titulo: string;
  status: string;
  versao: number;
  arquivos: Json;
  conformidade: Json;
  pixels: Json;
  dominios_extras: string[];
  inicio: string | null;
  fim: string | null;
  url_encerrada: string | null;
  notas: string | null;
  publicada_em: string | null;
  created_at: string;
  updated_at: string;
};

const COLUNAS =
  "id, slug, titulo, status, versao, arquivos, conformidade, pixels, dominios_extras, inicio, fim, url_encerrada, notas, publicada_em, created_at, updated_at";

function paraLp(l: Linha): Lp {
  return {
    id: l.id,
    slug: l.slug,
    titulo: l.titulo,
    status: l.status as StatusLp,
    versao: l.versao,
    arquivos: (Array.isArray(l.arquivos) ? l.arquivos : []) as ArquivoLp[],
    conformidade: (Array.isArray(l.conformidade) ? l.conformidade : []) as ItemConformidade[],
    pixels: limparPixels(l.pixels),
    dominiosExtras: l.dominios_extras ?? [],
    inicio: l.inicio,
    fim: l.fim,
    urlEncerrada: l.url_encerrada,
    notas: l.notas,
    publicadaEm: l.publicada_em,
    criadaEm: l.created_at,
    atualizadaEm: l.updated_at,
  };
}

async function origens() {
  const { getRequest } = await import("@tanstack/react-start/server");
  const { origemLps } = await import("@/lp/previa");
  const req = getRequest();
  const site = req?.url ? new URL(req.url).origin : "https://danielbasso.com.br";
  return { site, lps: origemLps(site) };
}

const slug = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Endereço: use letras minúsculas, números e hífen.")
  .max(80);

function periodo(dias: number) {
  const ate = new Date();
  const de = new Date(ate.getTime() - dias * 86_400_000);
  return { de: de.toISOString(), ate: ate.toISOString() };
}

export const listarLpsFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator(z.object({ dias: z.number().int().min(1).max(365) }))
  .handler(async ({ data, context }): Promise<{ lps: LpNaLista[]; origemLps: string }> => {
    const { de, ate } = periodo(data.dias);
    const [lista, resumo] = await Promise.all([
      context.supabase
        .from("landing_pages")
        .select(COLUNAS)
        .order("updated_at", { ascending: false }),
      context.supabase.rpc("lps_resumo", { p_from: de, p_to: ate }),
    ]);
    checar(lista.error, "listar LPs");
    checar(resumo.error, "resumo das LPs");
    const porId = new Map((resumo.data ?? []).map((r) => [r.lp_id, r]));
    return {
      origemLps: (await origens()).lps,
      lps: (lista.data ?? []).map((l) => {
        const r = porId.get(l.id);
        return {
          ...paraLp(l as Linha),
          visitantes: Number(r?.visitantes ?? 0),
          respostas: Number(r?.respostas ?? 0),
          cliques: Number(r?.cliques ?? 0),
        };
      }),
    };
  });

export const obterLpFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator(z.object({ id: z.string().uuid() }))
  .handler(
    async ({ data, context }): Promise<{ lp: Lp; origemLps: string; previa: string | null }> => {
      const { data: l, error } = await context.supabase
        .from("landing_pages")
        .select(COLUNAS)
        .eq("id", data.id)
        .maybeSingle();
      checar(error, "abrir LP");
      if (!l) throw new Error("LP não encontrada.");
      const lp = paraLp(l as Linha);
      const { lps } = await origens();
      let previa: string | null = null;
      if (lp.versao > 0 && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const { tokenPrevia } = await import("@/lp/previa");
        previa = `${lps}/${lp.slug}/?previa=${await tokenPrevia(lp.id, lp.versao)}`;
      }
      return { lp, origemLps: lps, previa };
    },
  );

export const criarLpFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(z.object({ titulo: z.string().trim().min(2, "Informe o nome da LP.").max(160), slug }))
  .handler(async ({ data, context }): Promise<{ id: string }> => {
    const { data: criada, error } = await context.supabase
      .from("landing_pages")
      .insert({
        titulo: data.titulo,
        slug: data.slug,
        created_by: context.userId,
        updated_by: context.userId,
      })
      .select("id")
      .single();
    if (error?.code === "23505")
      throw new Error("Já existe uma LP com este endereço. Escolha outro.");
    checar(error, "criar LP");
    return { id: criada!.id };
  });

const esquemaArquivo = z.object({
  caminho: z
    .string()
    .max(300)
    .regex(/^[\w\-./ ()@]+$/)
    .refine((c) => !c.includes("..") && !c.startsWith("/"), "Caminho inválido."),
  tamanho: z
    .number()
    .int()
    .min(0)
    .max(30 * 1024 * 1024),
  tipo: z.string().max(80),
});

/** Depois do envio dos arquivos para <id>/v<versao>/: registra a versão e limpa as antigas. */
export const registrarVersaoFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(
    z.object({
      id: z.string().uuid(),
      versao: z.number().int().min(1),
      arquivos: z.array(esquemaArquivo).min(1).max(400),
      conformidade: z
        .array(z.object({ nivel: z.enum(["erro", "aviso", "ok"]), texto: z.string().max(400) }))
        .max(60),
    }),
  )
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    if (!data.arquivos.some((a) => a.caminho === "index.html")) {
      throw new Error("O pacote precisa ter um index.html.");
    }
    const { data: atual, error: e1 } = await context.supabase
      .from("landing_pages")
      .select("versao")
      .eq("id", data.id)
      .maybeSingle();
    checar(e1, "conferir versão");
    if (!atual) throw new Error("LP não encontrada.");
    if (data.versao !== atual.versao + 1) {
      throw new Error(
        "Outra pessoa enviou uma versão ao mesmo tempo. Recarregue a página e tente de novo.",
      );
    }
    // O index.html precisa ter chegado ao armazenamento.
    const { data: lista, error: e2 } = await context.supabase.storage
      .from("lps")
      .list(`${data.id}/v${data.versao}`, { search: "index.html" });
    checar(e2, "conferir arquivos");
    if (!lista?.some((o) => o.name === "index.html")) {
      throw new Error("O envio dos arquivos não terminou. Tente de novo.");
    }
    const { error: e3 } = await context.supabase
      .from("landing_pages")
      .update({
        versao: data.versao,
        arquivos: data.arquivos as unknown as Json,
        conformidade: data.conformidade as unknown as Json,
        updated_by: context.userId,
      })
      .eq("id", data.id)
      .eq("versao", atual.versao);
    checar(e3, "registrar versão");

    // Limpa versões antigas (melhor esforço: não bloqueia a publicação).
    for (let v = 1; v < data.versao; v++) {
      await apagarPasta(context, `${data.id}/v${v}`).catch((err) =>
        console.error("[lps] limpar versão antiga:", err),
      );
    }
    return { ok: true };
  });

type Ctx = { supabase: import("@supabase/supabase-js").SupabaseClient };

async function apagarPasta(ctx: Ctx, pasta: string) {
  const caminhos: string[] = [];
  async function varrer(p: string) {
    const { data } = await ctx.supabase.storage.from("lps").list(p, { limit: 1000 });
    for (const o of data ?? []) {
      if (o.id === null)
        await varrer(`${p}/${o.name}`); // subpasta
      else caminhos.push(`${p}/${o.name}`);
    }
  }
  await varrer(pasta);
  for (let i = 0; i < caminhos.length; i += 100) {
    await ctx.supabase.storage.from("lps").remove(caminhos.slice(i, i + 100));
  }
}

export const salvarLpFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(
    z.object({
      id: z.string().uuid(),
      titulo: z.string().trim().min(2, "Informe o nome da LP.").max(160),
      slug,
      pixels: z.record(z.string(), z.string()),
      dominiosExtras: z.array(z.string().trim().toLowerCase()).max(20),
      inicio: z.string().datetime().nullable(),
      fim: z.string().datetime().nullable(),
      urlEncerrada: z
        .string()
        .trim()
        .max(500)
        .refine(
          (u) => !u || /^https:\/\/[^\s]+$/.test(u),
          "O link após encerrar precisa começar com https://",
        )
        .transform((u) => u || null),
      notas: z
        .string()
        .max(4000)
        .transform((n) => n.trim() || null),
    }),
  )
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    const invalidos = Object.entries(data.pixels).filter(
      ([k, v]) => v.trim() && !(k in limparPixels({ [k]: v })),
    );
    if (invalidos.length) {
      throw new Error("Confira os IDs dos pixels: cole só o número/código, não o script inteiro.");
    }
    const dominios = data.dominiosExtras.filter(Boolean);
    const ruins = dominios.filter((d) => !dominioValido(d));
    if (ruins.length)
      throw new Error(`Domínio inválido: ${ruins.join(", ")}. Use só o endereço, ex.: exemplo.com`);
    if (data.inicio && data.fim && new Date(data.fim) <= new Date(data.inicio)) {
      throw new Error("A data de encerramento precisa ser depois do início.");
    }
    const { error } = await context.supabase
      .from("landing_pages")
      .update({
        titulo: data.titulo,
        slug: data.slug,
        pixels: limparPixels(data.pixels) as Json,
        dominios_extras: [...new Set(dominios)],
        inicio: data.inicio,
        fim: data.fim,
        url_encerrada: data.urlEncerrada,
        notas: data.notas,
        updated_by: context.userId,
      })
      .eq("id", data.id);
    if (error?.code === "23505")
      throw new Error("Já existe uma LP com este endereço. Escolha outro.");
    checar(error, "salvar LP");
    return { ok: true };
  });

export const mudarStatusLpFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(
    z.object({ id: z.string().uuid(), status: z.enum(["rascunho", "publicada", "encerrada"]) }),
  )
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    const { data: atual, error: e1 } = await context.supabase
      .from("landing_pages")
      .select("versao, publicada_em")
      .eq("id", data.id)
      .maybeSingle();
    checar(e1, "conferir LP");
    if (!atual) throw new Error("LP não encontrada.");
    if (data.status === "publicada" && !atual.versao) {
      throw new Error("Envie os arquivos da LP antes de publicar.");
    }
    const { error } = await context.supabase
      .from("landing_pages")
      .update({
        status: data.status,
        updated_by: context.userId,
        ...(data.status === "publicada" && !atual.publicada_em
          ? { publicada_em: new Date().toISOString() }
          : {}),
      })
      .eq("id", data.id);
    checar(error, "mudar status");
    return { ok: true };
  });

export const excluirLpFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    const { data: lp } = await context.supabase
      .from("landing_pages")
      .select("versao")
      .eq("id", data.id)
      .maybeSingle();
    const { error } = await context.supabase.from("landing_pages").delete().eq("id", data.id);
    checar(error, "excluir LP");
    for (let v = 1; v <= (lp?.versao ?? 0); v++) {
      await apagarPasta(context, `${data.id}/v${v}`).catch(() => undefined);
    }
    return { ok: true };
  });

// ── Relatório e respostas ─────────────────────────────────────────────────────────────
export type RelatorioLp = {
  visitas: number;
  visitantes: number;
  sessoes: number;
  respostas: number;
  conversao: number | null;
  tempo_medio: number | null;
  rolagem_media: number | null;
  cliques: number;
  diario: { dia: string; visitantes: number; respostas: number }[];
  secoes: { label: string; ordem: number; sessoes: number; pct: number | null }[];
  rolagem: { marco: number; pct: number | null }[];
  ctas: { label: string; tipo: "cta" | "link"; cliques: number; sessoes: number }[];
  formularios: { form: string; inicios: number; respostas: number }[];
  origens: { label: string; visitantes: number }[];
  campanhas: {
    source: string;
    medium: string | null;
    campaign: string | null;
    visitantes: number;
    respostas: number;
  }[];
  dispositivos: { label: string; value: number }[];
  cidades: { label: string; value: number }[];
};

export const relatorioLpFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator(z.object({ id: z.string().uuid(), dias: z.number().int().min(1).max(365) }))
  .handler(async ({ data, context }): Promise<RelatorioLp & { de: string; ate: string }> => {
    const { de, ate } = periodo(data.dias);
    const { data: r, error } = await context.supabase.rpc("lp_relatorio", {
      p_lp: data.id,
      p_from: de,
      p_to: ate,
    });
    checar(error, "relatório da LP");
    return { ...(r as unknown as RelatorioLp), de, ate };
  });

export type RespostaLp = {
  id: string;
  criadaEm: string;
  formulario: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  status: string;
  campos: Record<string, string>;
  utm: Record<string, string>;
};

export const respostasLpFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator(z.object({ id: z.string().uuid(), pagina: z.number().int().min(0).default(0) }))
  .handler(async ({ data, context }): Promise<{ respostas: RespostaLp[]; total: number }> => {
    const inicio = data.pagina * 1000;
    const {
      data: linhas,
      error,
      count,
    } = await context.supabase
      .from("leads")
      .select("id, created_at, subject, name, email, phone, status, data, utm", { count: "exact" })
      .eq("lp_id", data.id)
      .order("created_at", { ascending: false })
      .order("id", { ascending: true })
      .range(inicio, inicio + 999);
    checar(error, "respostas da LP");
    const respostas = (linhas ?? []).map((l) => ({
      id: l.id,
      criadaEm: l.created_at,
      formulario: l.subject ?? "formulario",
      nome: l.name,
      email: l.email,
      telefone: l.phone,
      status: l.status,
      campos: (l.data && typeof l.data === "object" && !Array.isArray(l.data)
        ? l.data
        : {}) as Record<string, string>,
      utm: (l.utm && typeof l.utm === "object" && !Array.isArray(l.utm) ? l.utm : {}) as Record<
        string,
        string
      >,
    }));
    return { respostas, total: count ?? respostas.length };
  });
