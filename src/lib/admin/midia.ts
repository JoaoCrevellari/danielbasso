/**
 * Biblioteca de mídia (bucket público "media"), usada no navegador com a sessão de quem
 * está logado. A RLS do Storage permite listar/enviar/excluir só para a equipe.
 *
 * Imagens rasterizadas são redimensionadas no navegador (máx. 2000 px no maior lado) e
 * convertidas para WebP (qualidade 0.82) antes do envio. SVG, GIF e PDF vão como estão.
 * Caminho: AAAA/MM/<slug-do-nome>-<aleatório>.<ext>
 */
import { supabase } from "@/integrations/supabase/client";
import { slugificar } from "./formato";

export const BUCKET = "media";
export const LIMITE_BYTES = 10 * 1024 * 1024;
export const TIPOS_ACEITOS = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
  "image/svg+xml",
  "application/pdf",
];
const CONVERTER = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const LADO_MAX = 2000;
const QUALIDADE = 0.82;

export type ArquivoMidia = {
  caminho: string;
  nome: string;
  url: string;
  tamanho: number | null;
  tipo: string | null;
  criadoEm: string | null;
  imagem: boolean;
};

export function urlPublica(caminho: string): string {
  return supabase.storage.from(BUCKET).getPublicUrl(caminho).data.publicUrl;
}

function aleatorio(n = 6) {
  const a = new Uint8Array(n);
  crypto.getRandomValues(a);
  return Array.from(a, (b) => (b % 36).toString(36)).join("");
}

function extensaoDe(tipo: string, nome: string) {
  const mapa: Record<string, string> = {
    "image/gif": "gif",
    "image/svg+xml": "svg",
    "application/pdf": "pdf",
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/avif": "avif",
  };
  return mapa[tipo] ?? nome.split(".").pop()?.toLowerCase() ?? "bin";
}

async function carregarImagem(arquivo: File): Promise<HTMLImageElement | ImageBitmap> {
  if ("createImageBitmap" in window) {
    try {
      return await createImageBitmap(arquivo);
    } catch {
      /* cai no <img> abaixo */
    }
  }
  const url = URL.createObjectURL(arquivo);
  try {
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    await img.decode();
    return img;
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}

/** Redimensiona e converte para WebP. Se o navegador não suportar, devolve o original. */
export async function otimizarImagem(
  arquivo: File,
): Promise<{ blob: Blob; tipo: string; ext: string }> {
  if (!CONVERTER.has(arquivo.type)) {
    return { blob: arquivo, tipo: arquivo.type, ext: extensaoDe(arquivo.type, arquivo.name) };
  }
  try {
    const img = await carregarImagem(arquivo);
    const w = "naturalWidth" in img ? img.naturalWidth : img.width;
    const h = "naturalHeight" in img ? img.naturalHeight : img.height;
    const escala = Math.min(1, LADO_MAX / Math.max(w, h));
    const cw = Math.max(1, Math.round(w * escala));
    const ch = Math.max(1, Math.round(h * escala));
    const canvas = document.createElement("canvas");
    canvas.width = cw;
    canvas.height = ch;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("sem canvas");
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, cw, ch);
    if ("close" in img) img.close();
    const blob = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, "image/webp", QUALIDADE));
    // Safari antigo devolve PNG quando não sabe gerar WebP: nesse caso, fica o original.
    if (!blob || blob.type !== "image/webp") {
      return { blob: arquivo, tipo: arquivo.type, ext: extensaoDe(arquivo.type, arquivo.name) };
    }
    return { blob, tipo: "image/webp", ext: "webp" };
  } catch {
    return { blob: arquivo, tipo: arquivo.type, ext: extensaoDe(arquivo.type, arquivo.name) };
  }
}

export function validarArquivo(arquivo: File): string | null {
  if (!TIPOS_ACEITOS.includes(arquivo.type)) {
    return `"${arquivo.name}": formato não aceito. Use JPG, PNG, WebP, AVIF, GIF, SVG ou PDF.`;
  }
  return null;
}

export async function enviarArquivo(arquivo: File): Promise<ArquivoMidia> {
  const erro = validarArquivo(arquivo);
  if (erro) throw new Error(erro);
  const { blob, tipo, ext } = await otimizarImagem(arquivo);
  if (blob.size > LIMITE_BYTES) {
    throw new Error(`"${arquivo.name}" passa de 10 MB mesmo depois de otimizado.`);
  }
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const base = slugificar(arquivo.name.replace(/\.[^.]+$/, ""), 60) || "arquivo";
  const caminho = `${ano}/${mes}/${base}-${aleatorio()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(caminho, blob, {
    contentType: tipo,
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) {
    if (/row-level security|unauthorized|403/i.test(error.message)) {
      throw new Error("Sem permissão para enviar arquivos.");
    }
    if (/exceeded|too large|413/i.test(error.message))
      throw new Error(`"${arquivo.name}" passa de 10 MB.`);
    throw new Error(`Falha ao enviar "${arquivo.name}". Tente de novo.`);
  }
  return {
    caminho,
    nome: caminho.split("/").pop()!,
    url: urlPublica(caminho),
    tamanho: blob.size,
    tipo,
    criadoEm: agora.toISOString(),
    imagem: tipo.startsWith("image/"),
  };
}

const EXT_IMAGEM = /\.(jpe?g|png|webp|avif|gif|svg)$/i;

/** Lista todos os arquivos (pastas AAAA/MM e raiz), mais recentes primeiro. */
export async function listarMidia(): Promise<ArquivoMidia[]> {
  const bucket = supabase.storage.from(BUCKET);
  const out: ArquivoMidia[] = [];

  async function varrer(prefixo: string, nivel: number) {
    const { data, error } = await bucket.list(prefixo, {
      limit: 1000,
      sortBy: { column: "created_at", order: "desc" },
    });
    if (error) throw new Error("Não foi possível listar a biblioteca de mídia.");
    const pastas: string[] = [];
    for (const item of data ?? []) {
      const caminho = prefixo ? `${prefixo}/${item.name}` : item.name;
      if (item.id === null) {
        if (nivel < 3) pastas.push(caminho);
        continue;
      }
      if (item.name === ".emptyFolderPlaceholder") continue;
      const meta = (item.metadata ?? {}) as { size?: number; mimetype?: string };
      out.push({
        caminho,
        nome: item.name,
        url: urlPublica(caminho),
        tamanho: meta.size ?? null,
        tipo: meta.mimetype ?? null,
        criadoEm: item.created_at ?? null,
        imagem: meta.mimetype ? meta.mimetype.startsWith("image/") : EXT_IMAGEM.test(item.name),
      });
    }
    await Promise.all(pastas.map((p) => varrer(p, nivel + 1)));
  }

  await varrer("", 0);
  return out.sort((a, b) => (b.criadoEm ?? "").localeCompare(a.criadoEm ?? ""));
}

export async function excluirMidia(caminho: string): Promise<void> {
  const { data, error } = await supabase.storage.from(BUCKET).remove([caminho]);
  if (error) throw new Error("Não foi possível excluir o arquivo.");
  if (!data?.length) throw new Error("Arquivo não encontrado ou sem permissão para excluir.");
}
