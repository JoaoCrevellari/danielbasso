/**
 * Analytics próprio, anônimo e sem cookies de terceiros.
 *
 * - visitante: identificador aleatório no localStorage (sem dados pessoais);
 * - sessão: identificador no sessionStorage, renovado após 30 min sem atividade;
 * - eventos vão em lote para /api/evento via sendBeacon (não atrasam a navegação).
 *
 * Não rastreia o painel /admin nem visitas de quem está logado na equipe.
 */
type Evento = {
  type: string;
  path: string;
  label?: string;
  value?: number;
  visitor_id: string;
  session_id: string;
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
};

const CHAVE_VISITANTE = "db_v";
const CHAVE_SESSAO = "db_s";
const CHAVE_ORIGEM = "db_o";
const INATIVIDADE_MS = 30 * 60 * 1000;

const fila: Evento[] = [];
let timer: number | undefined;

function id() {
  const a = new Uint8Array(12);
  crypto.getRandomValues(a);
  return Array.from(a, (b) => b.toString(36).padStart(2, "0"))
    .join("")
    .slice(0, 22);
}

function ler(storage: Storage, chave: string) {
  try {
    return storage.getItem(chave);
  } catch {
    return null;
  }
}
function gravar(storage: Storage, chave: string, valor: string) {
  try {
    storage.setItem(chave, valor);
  } catch {
    /* modo privado: segue sem persistir */
  }
}

function visitante() {
  let v = ler(localStorage, CHAVE_VISITANTE);
  if (!v) {
    v = id();
    gravar(localStorage, CHAVE_VISITANTE, v);
  }
  return v;
}

type Sessao = { id: string; t: number; referrer?: string; utm?: Record<string, string> };

function sessao(): Sessao {
  const agora = Date.now();
  let s: Sessao | null = null;
  try {
    s = JSON.parse(ler(sessionStorage, CHAVE_SESSAO) ?? "null");
  } catch {
    s = null;
  }
  if (!s || agora - s.t > INATIVIDADE_MS) {
    // Sessão nova: registra a origem (site de referência e UTMs da URL de entrada).
    const params = new URLSearchParams(location.search);
    const utm: Record<string, string> = {};
    for (const k of ["utm_source", "utm_medium", "utm_campaign"]) {
      const v = params.get(k);
      if (v) utm[k] = v.slice(0, 100);
    }
    let referrer: string | undefined;
    try {
      const r = document.referrer ? new URL(document.referrer) : null;
      if (r && r.hostname !== location.hostname) referrer = r.hostname.replace(/^www\./, "");
    } catch {
      referrer = undefined;
    }
    s = { id: id(), t: agora, referrer, utm };
    gravar(localStorage, CHAVE_ORIGEM, JSON.stringify({ referrer, ...utm }));
  }
  s.t = agora;
  gravar(sessionStorage, CHAVE_SESSAO, JSON.stringify(s));
  return s;
}

function desativado() {
  if (typeof window === "undefined") return true;
  if (["/admin", "/entrar", "/redefinir-senha"].some((p) => location.pathname.startsWith(p)))
    return true;
  if (navigator.webdriver) return true;
  // Equipe logada não conta como visita.
  try {
    return Object.keys(localStorage).some((k) => k.startsWith("sb-") && k.endsWith("-auth-token"));
  } catch {
    return false;
  }
}

function enviar() {
  if (!fila.length) return;
  const lote = fila.splice(0, 20);
  const corpo = JSON.stringify(lote);
  const ok =
    typeof navigator.sendBeacon === "function" &&
    navigator.sendBeacon("/api/evento", new Blob([corpo], { type: "application/json" }));
  if (!ok) {
    fetch("/api/evento", { method: "POST", body: corpo, keepalive: true }).catch(() => {});
  }
  if (fila.length) enviar();
}

export function registrar(
  type: string,
  extra: { label?: string; value?: number; path?: string } = {},
) {
  if (desativado()) return;
  const s = sessao();
  fila.push({
    type,
    path: extra.path ?? location.pathname,
    label: extra.label?.slice(0, 200),
    value: extra.value,
    visitor_id: visitante(),
    session_id: s.id,
    referrer: s.referrer,
    utm_source: s.utm?.utm_source,
    utm_medium: s.utm?.utm_medium,
    utm_campaign: s.utm?.utm_campaign,
  });
  window.clearTimeout(timer);
  timer = window.setTimeout(enviar, 1500);
}

let instalado = false;
/** Envia o que estiver na fila quando a aba é escondida ou fechada. */
export function instalarAnalytics() {
  if (instalado || typeof window === "undefined") return;
  instalado = true;
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") enviar();
  });
  window.addEventListener("pagehide", enviar);
}

/** Origem e identificador do visitante para anexar aos leads. */
export function contextoDoVisitante() {
  if (typeof window === "undefined") return {};
  let origem: Record<string, string> = {};
  try {
    origem = JSON.parse(ler(localStorage, CHAVE_ORIGEM) ?? "{}");
  } catch {
    origem = {};
  }
  const { referrer, ...utm } = origem;
  return {
    visitor_id: ler(localStorage, CHAVE_VISITANTE) ?? undefined,
    referrer: referrer || undefined,
    utm: Object.keys(utm).length ? utm : undefined,
    source_path: location.pathname,
  };
}
