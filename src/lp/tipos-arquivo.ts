/** Tipos de arquivo aceitos nas LPs (servidor e painel usam a mesma tabela). */
const TIPOS: Record<string, string> = {
  html: "text/html; charset=utf-8",
  htm: "text/html; charset=utf-8",
  css: "text/css; charset=utf-8",
  js: "text/javascript; charset=utf-8",
  mjs: "text/javascript; charset=utf-8",
  json: "application/json",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
  gif: "image/gif",
  svg: "image/svg+xml",
  ico: "image/x-icon",
  mp4: "video/mp4",
  webm: "video/webm",
  woff: "font/woff",
  woff2: "font/woff2",
  pdf: "application/pdf",
};

export function tipoDoArquivo(caminho: string) {
  return TIPOS[caminho.split(".").pop()?.toLowerCase() ?? ""] ?? "application/octet-stream";
}
