/**
 * Carregamento de conteúdo para as rotas (loaders). Nunca derruba a página:
 * se o banco falhar, cai no conteúdo padrão e em listas vazias.
 */
import { mesclar } from "@/content/fields";
import { PAGINAS, type ConteudoDe, type PaginaKey } from "@/content/paginas";
import {
  getPaginasFn,
  listarItensFn,
  obterItemFn,
  type ItemConteudo,
} from "@/lib/conteudo.functions";

export type { ItemConteudo };

export async function carregarPaginas<K extends PaginaKey>(
  keys: K[],
): Promise<{ [P in K]: ConteudoDe<P> }> {
  let salvo: Record<string, unknown> = {};
  try {
    salvo = await getPaginasFn({ data: { keys } });
  } catch (err) {
    console.error("[conteudo] falha ao ler páginas, usando padrão:", err);
  }
  return Object.fromEntries(keys.map((k) => [k, mesclar(PAGINAS[k].padrao, salvo[k])])) as {
    [P in K]: ConteudoDe<P>;
  };
}

export async function carregarPagina<K extends PaginaKey>(key: K): Promise<ConteudoDe<K>> {
  const r = await carregarPaginas([key]);
  return r[key];
}

export async function listarItens(
  collection: string,
  opts: { limite?: number; destaque?: boolean; etapa?: string; excluirSlug?: string } = {},
): Promise<ItemConteudo[]> {
  try {
    return await listarItensFn({ data: { collection, ...opts } });
  } catch (err) {
    console.error(`[conteudo] falha ao listar ${collection}:`, err);
    return [];
  }
}

export async function obterItem(collection: string, slug: string) {
  return obterItemFn({ data: { collection, slug } });
}

/** Lê um campo de `data` como texto. */
export function txt(item: ItemConteudo, key: string): string {
  const v = item.data[key];
  return typeof v === "string" ? v : typeof v === "number" ? String(v) : "";
}

export function lista(item: ItemConteudo, key: string): string[] {
  const v = item.data[key];
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && !!x.trim()) : [];
}

export function repeticao<T extends Record<string, unknown>>(item: ItemConteudo, key: string): T[] {
  const v = item.data[key];
  return Array.isArray(v) ? (v.filter((x) => x && typeof x === "object") as T[]) : [];
}

/** Tempo de leitura estimado (220 palavras por minuto). */
export function tempoLeitura(texto?: string | null): number {
  const palavras = (texto ?? "").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(palavras / 220));
}

export function dataExtenso(iso?: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Sao_Paulo",
  });
}
