/**
 * Biblioteca de mídia (bucket público "media"), usada no navegador com a sessão de quem
 * está logado. A RLS do Storage permite listar/enviar/excluir só para a equipe.
 *
 * Imagens rasterizadas são redimensionadas no navegador (máx. 2000 px no maior lado) e
 * convertidas para WebP (qualidade 0.82) antes do envio. SVG, GIF e PDF vão como estão.
 * Caminho: AAAA/MM/<slug-do-nome>-<aleatório>.<ext>. Fotos convertidas ganham a largura no
 * nome (…-w1600.webp) e versões menores ao lado (….480.webp, .960.webp, .1440.webp), que o
 * site usa no srcset (src/lib/imagens.ts). As versões menores não aparecem na biblioteca.
 */
import { supabase } from "@/integrations/supabase/client";
import { LARGURAS_MIDIA, ehVariante, variantesDe } from "@/lib/imagens";
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
type Otimizada = {
  blob: Blob;
  tipo: string;
  ext: string;
  /** Largura final (só para WebP gerado aqui). */
  largura?: number;
  /** Versões menores (480/960/1440 px), só as menores que a original. */
  variantes?: { largura: number; blob: Blob }[];
};

async function paraWebp(
  img: HTMLImageElement | ImageBitmap,
  w: number,
  h: number,
): Promise<Blob | null> {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, w, h);
  const blob = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, "image/webp", QUALIDADE));
  return blob && blob.type === "image/webp" ? blob : null;
}

export async function otimizarImagem(arquivo: File): Promise<Otimizada> {
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
    const blob = await paraWebp(img, cw, ch);
    // Safari antigo devolve PNG quando não sabe gerar WebP: nesse caso, fica o original.
    if (!blob) {
      if ("close" in img) img.close();
      return { blob: arquivo, tipo: arquivo.type, ext: extensaoDe(arquivo.type, arquivo.name) };
    }
    const variantes: { largura: number; blob: Blob }[] = [];
    for (const lv of LARGURAS_MIDIA) {
      if (lv >= cw) continue;
      const v = await paraWebp(img, lv, Math.max(1, Math.round((ch * lv) / cw)));
      if (v) variantes.push({ largura: lv, blob: v });
    }
    if ("close" in img) img.close();
    return { blob, tipo: "image/webp", ext: "webp", largura: cw, variantes };
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
  const { blob, tipo, ext, largura, variantes = [] } = await otimizarImagem(arquivo);
  if (blob.size > LIMITE_BYTES) {
    throw new Error(`"${arquivo.name}" passa de 10 MB mesmo depois de otimizado.`);
  }
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const base = slugificar(arquivo.name.replace(/\.[^.]+$/, ""), 60) || "arquivo";
  // Com versões menores, a largura vai no nome para o site montar o srcset.
  const sufixo = variantes.length && largura ? `-w${largura}` : "";
  const caminho = `${ano}/${mes}/${base}-${aleatorio()}${sufixo}.${ext}`;
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
  // Versões menores: se alguma falhar, desfaz o envio inteiro (o srcset supõe que todas
  // as larguras indicadas no nome existem).
  const semExt = caminho.replace(/\.webp$/, "");
  const envios = await Promise.all(
    variantes.map((v) =>
      supabase.storage.from(BUCKET).upload(`${semExt}.${v.largura}.webp`, v.blob, {
        contentType: "image/webp",
        cacheControl: "31536000",
        upsert: false,
      }),
    ),
  );
  if (envios.some((r) => r.error)) {
    await supabase.storage
      .from(BUCKET)
      .remove([caminho, ...variantes.map((v) => `${semExt}.${v.largura}.webp`)]);
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
      if (item.name === ".emptyFolderPlaceholder" || ehVariante(item.name)) continue;
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
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .remove([caminho, ...variantesDe(caminho).map((v) => v.caminho)]);
  if (error) throw new Error("Não foi possível excluir o arquivo.");
  if (!data?.length) throw new Error("Arquivo não encontrado ou sem permissão para excluir.");
}

export type UsoMidia =
  | { tipo: "conteudo"; colecao: string; id: string; titulo: string }
  | { tipo: "pagina"; chave: string; titulo: string };

/** Onde o arquivo aparece no site (itens de conteúdo e textos das páginas). */
export async function usoDaMidia(caminho: string): Promise<UsoMidia[]> {
  const { data, error } = await supabase.rpc("midia_em_uso", { p_caminho: caminho });
  if (error) throw new Error("Não foi possível conferir onde o arquivo é usado.");
  return Array.isArray(data) ? (data as UsoMidia[]) : [];
}
