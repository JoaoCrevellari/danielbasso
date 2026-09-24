/**
 * Formatação e utilidades do painel (datas em pt-BR no fuso de São Paulo, números,
 * slug, WhatsApp, CSV). Sem dependências de servidor: roda no navegador e no SSR.
 */
export const FUSO = "America/Sao_Paulo";

export function dataCurta(iso?: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: FUSO,
  });
}

export function dataHora(iso?: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: FUSO,
  });
}

export function hora(iso?: string | Date | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: FUSO,
  });
}

/** "há 5 min", "ontem", "12/03/2026" */
export function relativo(iso?: string | null): string {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.round(diff / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `há ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `há ${h} h`;
  const d = Math.round(h / 24);
  if (d === 1) return "ontem";
  if (d < 7) return `há ${d} dias`;
  return dataCurta(iso);
}

/** Dia "AAAA-MM-DD" → "12 mar" */
export function diaCurto(dia: string): string {
  const [a, m, d] = dia.split("-").map(Number);
  const dt = new Date(Date.UTC(a, m - 1, d, 12));
  return dt
    .toLocaleDateString("pt-BR", { day: "numeric", month: "short", timeZone: "UTC" })
    .replace(".", "");
}

export function diaLongo(dia: string): string {
  const [a, m, d] = dia.split("-").map(Number);
  const dt = new Date(Date.UTC(a, m - 1, d, 12));
  return dt.toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
}

/** Data de hoje em São Paulo, "AAAA-MM-DD". */
export function hojeSP(base = new Date()): string {
  return base.toLocaleDateString("en-CA", { timeZone: FUSO });
}

/** Lista contínua de dias entre dois "AAAA-MM-DD" (inclusive). */
export function diasEntre(inicio: string, fim: string): string[] {
  const out: string[] = [];
  const [a, m, d] = inicio.split("-").map(Number);
  const cur = new Date(Date.UTC(a, m - 1, d, 12));
  const [a2, m2, d2] = fim.split("-").map(Number);
  const end = Date.UTC(a2, m2 - 1, d2, 12);
  while (cur.getTime() <= end && out.length < 400) {
    out.push(cur.toISOString().slice(0, 10));
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return out;
}

/**
 * ISO → valor de <input type="datetime-local"> no horário de São Paulo.
 * (São Paulo não tem horário de verão desde 2019: UTC−3 fixo.)
 */
export function isoParaLocal(iso?: string | null): string {
  if (!iso) return "";
  const p = new Intl.DateTimeFormat("en-CA", {
    timeZone: FUSO,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(iso));
  const v = (t: string) => p.find((x) => x.type === t)?.value ?? "00";
  return `${v("year")}-${v("month")}-${v("day")}T${v("hour")}:${v("minute")}`;
}

export function localParaIso(local: string): string | null {
  if (!local) return null;
  const d = new Date(`${local}:00-03:00`);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

const NUM = new Intl.NumberFormat("pt-BR");
export function numero(n: number | null | undefined): string {
  return NUM.format(n ?? 0);
}

export function compacto(n: number): string {
  if (Math.abs(n) < 10000) return NUM.format(n);
  return new Intl.NumberFormat("pt-BR", { notation: "compact", maximumFractionDigits: 1 }).format(
    n,
  );
}

export function porcentagem(n: number | null | undefined, casas = 1): string {
  if (n === null || n === undefined || Number.isNaN(n)) return "0%";
  return `${n.toLocaleString("pt-BR", { maximumFractionDigits: casas, minimumFractionDigits: 0 })}%`;
}

export function duracao(segundos: number | null | undefined): string {
  const s = Math.round(segundos ?? 0);
  if (s <= 0) return "0 s";
  if (s < 60) return `${s} s`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  if (m < 60) return r ? `${m} min ${r} s` : `${m} min`;
  const h = Math.floor(m / 60);
  return `${h} h ${m % 60} min`;
}

export function tamanhoArquivo(bytes?: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024)
    return `${(bytes / 1024).toLocaleString("pt-BR", { maximumFractionDigits: 0 })} KB`;
  return `${(bytes / 1024 / 1024).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} MB`;
}

/** Texto → slug (minúsculas, sem acento, palavras separadas por hífen). */
export function slugificar(texto: string, max = 80): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, max)
    .replace(/-+$/g, "");
}

export const SLUG_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** Link do WhatsApp para um telefone digitado de qualquer jeito (adiciona 55 se faltar DDI). */
export function whatsappDe(telefone?: string | null): string | undefined {
  if (!telefone) return undefined;
  let n = telefone.replace(/\D/g, "");
  if (!n) return undefined;
  if (n.startsWith("0")) n = n.replace(/^0+/, "");
  if (n.length <= 11) n = `55${n}`;
  return `https://wa.me/${n}`;
}

/** CSV para Excel em pt-BR: separador ";", BOM UTF-8, proteção contra fórmulas. */
export function gerarCsv(
  cabecalho: string[],
  linhas: (string | number | null | undefined)[][],
): string {
  const cel = (v: string | number | null | undefined) => {
    let s = v === null || v === undefined ? "" : String(v);
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
    return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const corpo = [cabecalho, ...linhas].map((l) => l.map(cel).join(";")).join("\r\n");
  return String.fromCharCode(0xfeff) + corpo;
}

export function baixarArquivo(nome: string, conteudo: string, tipo = "text/csv;charset=utf-8") {
  const blob = new Blob([conteudo], { type: tipo });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nome;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Mensagem de erro amigável a partir de qualquer coisa lançada. */
export function mensagemErro(err: unknown, padrao = "Algo deu errado. Tente de novo."): string {
  const msg = err instanceof Error ? err.message : typeof err === "string" ? err : "";
  if (!msg) return padrao;
  if (/unauthorized|jwt|token/i.test(msg)) return "Sua sessão expirou. Entre de novo.";
  if (/failed to fetch|networkerror|load failed/i.test(msg))
    return "Sem conexão com o servidor. Verifique a internet.";
  if (/row-level security|permission denied|violates row-level/i.test(msg))
    return "Você não tem permissão para esta ação.";
  return msg;
}

export function ehErroDeSessao(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : "";
  return /^unauthorized/i.test(msg);
}
