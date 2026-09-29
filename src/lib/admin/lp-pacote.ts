/**
 * Pacote de LP no navegador: lê o .zip (ou um .html solto), confere o conteúdo contra o
 * padrão combinado com o time de lançamentos (docs/prompt-landing-pages.md) e envia os
 * arquivos para o bucket privado "lps" com a sessão de quem está no painel.
 */
import { unzipSync } from "fflate";

import { tipoDoArquivo } from "@/lp/tipos-arquivo";
import type { ArquivoLp, ItemConformidade } from "./lps.functions";

export type ArquivoPacote = ArquivoLp & { dados: Uint8Array };

const EXTENSOES = new Set([
  "html",
  "css",
  "js",
  "mjs",
  "json",
  "jpg",
  "jpeg",
  "png",
  "webp",
  "avif",
  "gif",
  "svg",
  "ico",
  "mp4",
  "webm",
  "woff",
  "woff2",
  "pdf",
]);
const MAX_ARQUIVO = 25 * 1024 * 1024;
const MAX_TOTAL = 80 * 1024 * 1024;
const DOMINIOS_PADRAO = [
  "fonts.googleapis.com",
  "fonts.gstatic.com",
  "cdn.jsdelivr.net",
  "cdnjs.cloudflare.com",
  "www.youtube-nocookie.com",
  "www.youtube.com",
  "player.vimeo.com",
];

export function tamanhoLegivel(b: number) {
  return b < 1024
    ? `${b} B`
    : b < 1024 ** 2
      ? `${(b / 1024).toFixed(0)} KB`
      : `${(b / 1024 ** 2).toFixed(1)} MB`;
}

/** Lê o arquivo escolhido e devolve a lista normalizada (sem pasta-raiz, sem lixo do sistema). */
export async function lerPacote(arquivo: File): Promise<ArquivoPacote[]> {
  const nome = arquivo.name.toLowerCase();
  const bytes = new Uint8Array(await arquivo.arrayBuffer());
  if (nome.endsWith(".html") || nome.endsWith(".htm")) {
    return [{ caminho: "index.html", tamanho: bytes.length, tipo: "text/html", dados: bytes }];
  }
  if (!nome.endsWith(".zip"))
    throw new Error("Envie um arquivo .zip (com index.html e assets/) ou um .html.");
  if (bytes.length > MAX_TOTAL)
    throw new Error("O pacote passa de 80 MB. Comprima as imagens e vídeos.");

  let entradas: Record<string, Uint8Array>;
  try {
    entradas = unzipSync(bytes);
  } catch {
    throw new Error("Não foi possível abrir o .zip. Gere o arquivo de novo e tente outra vez.");
  }
  let lista = Object.entries(entradas)
    .filter(([c, d]) => !c.endsWith("/") && d.length > 0)
    .filter(([c]) => !/(^|\/)(__MACOSX|\.DS_Store|Thumbs\.db|\.git)(\/|$)/i.test(c))
    .map(([c, d]) => ({ caminho: c.replace(/\\/g, "/").replace(/^\.\//, ""), dados: d }));

  // Tudo dentro de uma pasta só (ex.: "minha-lp/index.html"): tira a pasta.
  const raizes = new Set(lista.map((a) => a.caminho.split("/")[0]));
  if (raizes.size === 1 && lista.every((a) => a.caminho.includes("/"))) {
    const raiz = [...raizes][0] + "/";
    lista = lista.map((a) => ({ ...a, caminho: a.caminho.slice(raiz.length) }));
  }
  if (!lista.some((a) => a.caminho === "index.html")) {
    throw new Error("Não encontrei o index.html na raiz do pacote.");
  }
  if (lista.length > 400) throw new Error("O pacote tem arquivos demais (máximo 400).");

  const saida: ArquivoPacote[] = [];
  let total = 0;
  for (const a of lista) {
    const ext = a.caminho.split(".").pop()?.toLowerCase() ?? "";
    if (!EXTENSOES.has(ext)) throw new Error(`Tipo de arquivo não aceito: ${a.caminho}`);
    if (a.caminho.includes("..") || !/^[\w\-./ ()@]+$/.test(a.caminho)) {
      throw new Error(
        `Nome de arquivo inválido: ${a.caminho}. Use letras sem acento, números e hífen.`,
      );
    }
    if (a.dados.length > MAX_ARQUIVO) throw new Error(`${a.caminho} passa de 25 MB.`);
    total += a.dados.length;
    saida.push({
      caminho: a.caminho,
      tamanho: a.dados.length,
      tipo: tipoDoArquivo(a.caminho).split(";")[0],
      dados: a.dados,
    });
  }
  if (total > MAX_TOTAL) throw new Error("O pacote passa de 80 MB. Comprima as imagens e vídeos.");
  return saida.sort((a, b) =>
    a.caminho === "index.html"
      ? -1
      : b.caminho === "index.html"
        ? 1
        : a.caminho.localeCompare(b.caminho),
  );
}

function host(url: string) {
  try {
    return new URL(url, "https://lp.local/x/").host;
  } catch {
    return "";
  }
}

/** Confere o index.html contra as regras do padrão. Erros travam a publicação na conversa com o time; avisos, não. */
export function conferirPacote(
  arquivos: ArquivoPacote[],
  dominiosExtras: string[] = [],
): ItemConformidade[] {
  const index = arquivos.find((a) => a.caminho === "index.html")!;
  const html = new TextDecoder().decode(index.dados);
  const doc = new DOMParser().parseFromString(html, "text/html");
  const itens: ItemConformidade[] = [];
  const ok = (texto: string) => itens.push({ nivel: "ok", texto });
  const aviso = (texto: string) => itens.push({ nivel: "aviso", texto });
  const erro = (texto: string) => itens.push({ nivel: "erro", texto });
  const permitidos = new Set([...DOMINIOS_PADRAO, ...dominiosExtras.map((d) => d.toLowerCase())]);
  const liberado = (h: string) =>
    permitidos.has(h) ||
    /\.tv\.pandavideo\.com\.br$/.test(h) ||
    [...permitidos].some((p) => p.startsWith("*.") && h.endsWith(p.slice(1)));

  // Estrutura básica
  if (doc.querySelector('meta[name="viewport"]')) ok("Pronta para celular (viewport).");
  else erro('Falta <meta name="viewport">: a página não vai se ajustar ao celular.');
  if (doc.title.trim()) ok(`Título: “${doc.title.trim().slice(0, 70)}”.`);
  else aviso("Falta <title> (aparece na aba e no Google).");
  if (!doc.querySelector('meta[name="description"]')) aviso('Falta <meta name="description">.');
  const og = doc.querySelector('meta[property="og:image"]')?.getAttribute("content");
  if (!og) aviso("Falta og:image: o link fica sem imagem ao ser compartilhado no WhatsApp.");
  else if (!/^https?:/.test(og) && !arquivos.some((a) => a.caminho === og.replace(/^\.\//, ""))) {
    aviso(`A imagem de compartilhamento (${og}) não está no pacote.`);
  }
  if (doc.querySelectorAll("h1").length !== 1)
    aviso(`A página tem ${doc.querySelectorAll("h1").length} títulos <h1> (o ideal é 1).`);

  // Proibidos
  if (doc.querySelector("base")) erro("Remova a tag <base>: ela quebra os caminhos da página.");
  if (doc.querySelector('meta[http-equiv="refresh" i]'))
    erro('Remova o <meta http-equiv="refresh">.');
  if (/\beval\s*\(|new\s+Function\s*\(|document\.write\s*\(/.test(html)) {
    aviso("O código usa eval/new Function/document.write, que não são permitidos.");
  }

  // Scripts externos e rastreadores colados
  const externos = [...doc.querySelectorAll("script[src]")]
    .map((s) => s.getAttribute("src") ?? "")
    .filter((s) => /^(https?:)?\/\//.test(s))
    .map(host)
    .filter((h) => h && !liberado(h));
  if (externos.length) {
    erro(
      `Scripts de domínios não liberados (vão ser bloqueados): ${[...new Set(externos)].join(", ")}. ` +
        "Libere o domínio em Configurações se for necessário.",
    );
  }
  if (
    /fbq\s*\(|connect\.facebook\.net|gtag\s*\(|googletagmanager\.com|ttq\.|analytics\.tiktok|hotjar|clarity\.ms/i.test(
      html,
    )
  ) {
    aviso(
      "Há pixel ou rastreador colado no código. Remova e informe o ID em Configurações → Pixels (o site injeta).",
    );
  }
  const iframes = [...doc.querySelectorAll("iframe[src]")]
    .map((f) => host(f.getAttribute("src") ?? ""))
    .filter((h) => h && !liberado(h));
  if (iframes.length)
    erro(`Vídeos/iframes de domínios não liberados: ${[...new Set(iframes)].join(", ")}.`);

  // Formulários
  const forms = [...doc.querySelectorAll("form")];
  if (forms.length) {
    const semMarca = forms.filter((f) => !f.hasAttribute("data-lp-form"));
    if (semMarca.length)
      erro(
        `${semMarca.length} formulário(s) sem data-lp-form: as respostas não serão registradas.`,
      );
    const comAcao = forms.filter((f) => {
      const a = f.getAttribute("action");
      return a && /^(https?:)?\/\//.test(a);
    });
    if (comAcao.length)
      erro("Há formulário enviando para outro site (action externo). Remova o action.");
    const semContato = forms.filter(
      (f) => !f.querySelector('[name="email"], [name="whatsapp"], [name="telefone"]'),
    );
    if (semContato.length)
      erro("Formulário sem campo email ou whatsapp: a resposta não pode ser salva.");
    const semConsentimento = forms.filter((f) => !f.querySelector('[name="consentimento"]'));
    if (semConsentimento.length)
      aviso('Formulário sem a caixa de consentimento (LGPD) com name="consentimento".');
    if (
      forms.some((f) =>
        f.querySelector('[type="password"], [name*="cpf" i], [name*="cartao" i], [name*="card" i]'),
      )
    ) {
      erro("O formulário pede senha, CPF ou cartão. Isso não é permitido.");
    }
    if (!semMarca.length && !comAcao.length)
      ok(
        `${forms.length} formulário(s) marcados: ${forms.map((f) => f.getAttribute("data-lp-form")).join(", ")}.`,
      );
  } else {
    aviso("A página não tem formulário: só cliques e visitas serão medidos.");
  }

  // Marcação para relatórios
  const secoes = doc.querySelectorAll("[data-lp-secao]").length;
  if (secoes) ok(`${secoes} seções marcadas para o funil de leitura.`);
  else aviso("Nenhuma seção com data-lp-secao: o funil de leitura fica vazio.");
  const ctas = doc.querySelectorAll("[data-lp-cta]").length;
  if (ctas) ok(`${ctas} botões com data-lp-cta.`);
  else aviso("Nenhum botão com data-lp-cta: os cliques aparecem sem nome.");

  // Caminhos
  const refs = [...doc.querySelectorAll("[src], link[href], [poster]")]
    .map((e) => e.getAttribute("src") ?? e.getAttribute("href") ?? e.getAttribute("poster") ?? "")
    .filter((r) => r && !/^(https?:|data:|blob:|mailto:|tel:|#|\/\/)/.test(r));
  const absolutos = refs.filter((r) => r.startsWith("/"));
  if (absolutos.length)
    erro(
      `Caminhos começando com "/" não funcionam aqui: ${absolutos.slice(0, 3).join(", ")}. Use ./assets/…`,
    );
  const faltando = refs
    .filter((r) => !r.startsWith("/"))
    .map((r) => r.replace(/^\.\//, "").split(/[?#]/)[0])
    .filter((r) => !arquivos.some((a) => a.caminho === decodeURIComponent(r)));
  if (faltando.length)
    aviso(
      `Arquivos citados que não estão no pacote: ${[...new Set(faltando)].slice(0, 4).join(", ")}.`,
    );

  // Peso
  const imagensPesadas = arquivos.filter(
    (a) => /\.(jpe?g|png)$/i.test(a.caminho) && a.tamanho > 300 * 1024,
  );
  if (imagensPesadas.length)
    aviso(`${imagensPesadas.length} imagem(ns) JPG/PNG acima de 300 KB: prefira WebP/AVIF.`);
  const pesoInicial = arquivos
    .filter((a) => !/\.(mp4|webm|pdf)$/i.test(a.caminho))
    .reduce((s, a) => s + a.tamanho, 0);
  if (pesoInicial > 1.5 * 1024 * 1024)
    aviso(`Página pesada: ${tamanhoLegivel(pesoInicial)} sem contar vídeos (meta: até 1,5 MB).`);

  return itens;
}

/** Envia os arquivos para lps/<id>/v<versao>/, 4 por vez. */
export async function enviarPacote(
  lpId: string,
  versao: number,
  arquivos: ArquivoPacote[],
  progresso: (feitos: number, total: number) => void,
) {
  const { supabase } = await import("@/integrations/supabase/client");
  let i = 0;
  let feitos = 0;
  async function trabalhador() {
    while (i < arquivos.length) {
      const a = arquivos[i++];
      const { error } = await supabase.storage
        .from("lps")
        .upload(
          `${lpId}/v${versao}/${a.caminho}`,
          new Blob([a.dados as Uint8Array<ArrayBuffer>], { type: a.tipo }),
          {
            contentType: a.tipo,
            upsert: true,
            cacheControl: "300",
          },
        );
      if (error) throw new Error(`Falha ao enviar ${a.caminho}: ${error.message}`);
      progresso(++feitos, arquivos.length);
    }
  }
  await Promise.all(Array.from({ length: Math.min(4, arquivos.length) }, trabalhador));
  return arquivos.map(({ caminho, tamanho, tipo }) => ({ caminho, tamanho, tipo }));
}
