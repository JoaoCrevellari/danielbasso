/**
 * Servidor das LPs de lançamento: tudo que chega em lp.<domínio> passa por aqui e NUNCA
 * pelo site principal (o painel e a sessão de login não existem neste subdomínio).
 *
 *   /                   → volta para o site principal
 *   /_lp/lp.js          → script de medição e formulários (src/lp/cliente.js)
 *   /_lp/evento  (POST) → lote de eventos → função track_lp_events
 *   /_lp/lead    (POST) → resposta de formulário → função submit_lp_lead
 *   /<slug>             → 301 para /<slug>/ (os caminhos relativos da LP dependem da barra)
 *   /<slug>/…           → arquivos da versão publicada (bucket privado "lps"), com CSP
 *
 * Rascunhos e versões novas abrem com ?previa=<token> (link gerado no painel).
 */
import clienteJs from "./cliente.js?raw";
import { limparPixels, politicaLp, scriptsPixels } from "./pixels";
import { previaValida } from "./previa";
import { tipoDoArquivo } from "./tipos-arquivo";

type Arquivo = { caminho: string; tamanho: number; tipo: string };
type Lp = {
  id: string;
  slug: string;
  titulo: string;
  status: string;
  versao: number;
  arquivos: Arquivo[];
  pixels: unknown;
  dominios_extras: string[];
  inicio: string | null;
  fim: string | null;
  url_encerrada: string | null;
};

const SITE_PRINCIPAL = "https://danielbasso.com.br";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

const SEGURANCA: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  "Strict-Transport-Security": "max-age=31536000",
};

// Cache curto por isolate: publicar/trocar versão aparece em até 20 s.
const cacheLps = new Map<string, { lp: Lp | null; em: number }>();

async function buscarLp(slug: string): Promise<Lp | null> {
  const guardado = cacheLps.get(slug);
  if (guardado && Date.now() - guardado.em < 20_000) return guardado.lp;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("landing_pages")
    .select(
      "id, slug, titulo, status, versao, arquivos, pixels, dominios_extras, inicio, fim, url_encerrada",
    )
    .eq("slug", slug)
    .maybeSingle();
  if (error) console.error("[lp] buscar:", error);
  const lp = data ? ({ ...data, arquivos: (data.arquivos ?? []) as Arquivo[] } as Lp) : null;
  cacheLps.set(slug, { lp, em: Date.now() });
  return lp;
}

async function lerArquivo(lp: Lp, caminho: string): Promise<ArrayBuffer | null> {
  const chave = `https://lp-cache.interno/${lp.id}/v${lp.versao}/${caminho}`;
  const cache =
    typeof caches !== "undefined" ? (caches as unknown as { default?: Cache }).default : undefined;
  if (cache) {
    const achado = await cache.match(chave);
    if (achado) return achado.arrayBuffer();
  }
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.storage
    .from("lps")
    .download(`${lp.id}/v${lp.versao}/${caminho}`);
  if (error || !data) {
    console.error("[lp] arquivo:", caminho, error);
    return null;
  }
  const bytes = await data.arrayBuffer();
  if (cache) {
    await cache
      .put(chave, new Response(bytes, { headers: { "cache-control": "public, max-age=86400" } }))
      .catch(() => undefined);
  }
  return bytes;
}

function escapar(s: string) {
  return s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

/** Página simples do próprio servidor (não encontrada, encerrada, em breve). */
function pagina(status: number, titulo: string, texto: string) {
  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${escapar(titulo)} · Daniel Basso</title><link rel="icon" href="${SITE_PRINCIPAL}/favicon-48.png"><style>body{margin:0;min-height:100dvh;display:grid;place-items:center;background:#F5F5F2;color:#333;font:16px/1.6 system-ui,-apple-system,"Segoe UI",sans-serif;padding:24px}main{max-width:30rem;text-align:center}h1{font:400 2rem/1.15 Georgia,serif;color:#003F5C;margin:0 0 .6rem}p{color:#5B6166;margin:0 0 1.8rem}a{display:inline-block;background:#003F5C;color:#F5F5F2;text-decoration:none;padding:.8rem 1.5rem;border-radius:999px;font-weight:500}small{display:block;letter-spacing:.24em;text-transform:uppercase;color:#8A6A12;font-size:.7rem;margin-bottom:1.2rem}</style></head><body><main><small>Daniel Basso · Desenvolvimento Humano</small><h1>${escapar(titulo)}</h1><p>${escapar(texto)}</p><a href="${SITE_PRINCIPAL}">Ir para o site</a></main></body></html>`;
  return new Response(html, {
    status,
    headers: {
      ...SEGURANCA,
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
      "content-security-policy":
        "default-src 'none'; style-src 'unsafe-inline'; img-src https:; base-uri 'none'; frame-ancestors 'none'",
    },
  });
}

/** Injeta o script de medição, os pixels, o favicon e torna o og:image absoluto. */
function prepararHtml(html: string, lp: Lp, origem: string, previa: boolean) {
  const base = `${origem}/${lp.slug}/`;
  let saida = html.replace(
    /(<meta\b[^>]*\bproperty\s*=\s*["']og:image["'][^>]*\bcontent\s*=\s*["'])(?!https?:)([^"']+)/i,
    (_m, antes: string, rel: string) => {
      try {
        return antes + new URL(rel, base).href;
      } catch {
        return antes + rel;
      }
    },
  );
  const injecao = [
    /<link\b[^>]*\brel\s*=\s*["'][^"']*icon/i.test(html)
      ? ""
      : `<link rel="icon" href="${SITE_PRINCIPAL}/favicon-48.png">`,
    previa ? "" : scriptsPixels(limparPixels(lp.pixels)),
    `<script src="/_lp/lp.js?v=1" defer data-lp="${lp.id}"${previa ? ' data-previa="1"' : ""}></script>`,
  ].join("");
  if (/<\/head>/i.test(saida)) saida = saida.replace(/<\/head>/i, `${injecao}</head>`);
  else if (/<head\b[^>]*>/i.test(saida))
    saida = saida.replace(/<head\b[^>]*>/i, (m) => m + injecao);
  else saida = injecao + saida;
  return saida;
}

function ipDe(request: Request) {
  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "desconhecido"
  );
}

async function limite(binding: string, chave: string) {
  const { dentroDoLimite } = await import("@/lib/limite.server");
  return dentroDoLimite(binding, chave);
}

function mesmaOrigem(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true; // sendBeacon em alguns navegadores não manda Origin
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}

function dispositivo(ua: string) {
  const tablet = /ipad|tablet|(android(?!.*mobile))/i.test(ua);
  const mobile = !tablet && /mobi|iphone|ipod|android.+mobile|windows phone/i.test(ua);
  const browser = /edg\//i.test(ua)
    ? "Edge"
    : /opr\/|opera/i.test(ua)
      ? "Opera"
      : /samsungbrowser/i.test(ua)
        ? "Samsung"
        : /instagram/i.test(ua)
          ? "Instagram"
          : /fban|fbav/i.test(ua)
            ? "Facebook"
            : /chrome|crios/i.test(ua)
              ? "Chrome"
              : /firefox|fxios/i.test(ua)
                ? "Firefox"
                : /safari/i.test(ua)
                  ? "Safari"
                  : "Outro";
  const os = /iphone|ipad|ipod/i.test(ua)
    ? "iOS"
    : /android/i.test(ua)
      ? "Android"
      : /windows/i.test(ua)
        ? "Windows"
        : /mac os/i.test(ua)
          ? "macOS"
          : /linux/i.test(ua)
            ? "Linux"
            : "Outro";
  return { device: tablet ? "tablet" : mobile ? "mobile" : "desktop", browser, os };
}

const ROBO = /bot|crawl|spider|slurp|facebookexternalhit|whatsapp|preview|headless|lighthouse/i;

function decodificar(v: unknown): string | undefined {
  if (typeof v !== "string" || !v) return undefined;
  try {
    return decodeURIComponent(v);
  } catch {
    return v;
  }
}

async function receberEventos(request: Request) {
  const vazio = new Response(null, { status: 204, headers: SEGURANCA });
  const ua = request.headers.get("user-agent") ?? "";
  if (!ua || ROBO.test(ua) || !mesmaOrigem(request)) return vazio;
  if (!(await limite("LIMITE_ANALYTICS", `lpev:${ipDe(request)}`))) return vazio;
  let corpo: { lp?: unknown; eventos?: unknown };
  try {
    const texto = await request.text();
    if (texto.length > 30_000) return vazio;
    corpo = JSON.parse(texto);
  } catch {
    return vazio;
  }
  if (typeof corpo.lp !== "string" || !UUID.test(corpo.lp) || !Array.isArray(corpo.eventos))
    return vazio;
  const cf = (request as unknown as { cf?: Record<string, unknown> }).cf ?? {};
  const extra = {
    ...dispositivo(ua),
    country: (cf.country as string) ?? request.headers.get("cf-ipcountry") ?? undefined,
    region: decodificar(cf.region),
    city: decodificar(cf.city),
  };
  const eventos = corpo.eventos
    .slice(0, 30)
    .filter((e) => e && typeof e === "object")
    .map((e) => ({ ...(e as Record<string, unknown>), ...extra }));
  try {
    const { supabasePublic } = await import("@/integrations/supabase/client.server");
    const { error } = await supabasePublic.rpc("track_lp_events", {
      p_lp: corpo.lp,
      p: eventos as never,
    });
    if (error) console.error("[lp] eventos:", error);
  } catch (err) {
    console.error("[lp] eventos:", err);
  }
  return vazio;
}

function json(status: number, dados: unknown) {
  return new Response(JSON.stringify(dados), {
    status,
    headers: { ...SEGURANCA, "content-type": "application/json", "cache-control": "no-store" },
  });
}

async function receberLead(request: Request) {
  if (!mesmaOrigem(request)) return json(403, { erro: "origem" });
  if (!(await limite("LIMITE_FORMULARIO", `lplead:${ipDe(request)}`))) {
    return json(429, { erro: "Muitos envios seguidos. Aguarde um minuto." });
  }
  let c: Record<string, unknown>;
  try {
    const texto = await request.text();
    if (texto.length > 30_000) return json(413, { erro: "Envio grande demais." });
    c = JSON.parse(texto);
  } catch {
    return json(400, { erro: "Envio inválido." });
  }
  // Campo-isca preenchido: robô. Responde "ok" sem gravar.
  if (typeof c._site === "string" && c._site.trim()) return json(200, { ok: true });
  if (typeof c.lp !== "string" || !UUID.test(c.lp)) return json(400, { erro: "Página inválida." });

  const texto = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  const campos: Record<string, string> = {};
  if (c.campos && typeof c.campos === "object") {
    for (const [k, v] of Object.entries(c.campos as Record<string, unknown>).slice(0, 40)) {
      if (["nome", "email", "whatsapp", "_site"].includes(k)) continue;
      const chave = k
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, "_")
        .slice(0, 60);
      if (chave) campos[chave] = texto(v, 2000);
    }
  }
  if (campos.consentimento) campos.consentimento_em = new Date().toISOString();
  const utm: Record<string, string> = {};
  if (c.utm && typeof c.utm === "object") {
    for (const k of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]) {
      const v = texto((c.utm as Record<string, unknown>)[k], 100);
      if (v) utm[k] = v;
    }
  }
  const email = texto(c.email, 200);
  const telefone = texto(c.whatsapp, 40);
  if (!email && !telefone) return json(400, { erro: "Informe e-mail ou WhatsApp." });

  const { supabasePublic } = await import("@/integrations/supabase/client.server");
  const { error } = await supabasePublic.rpc("submit_lp_lead", {
    p: {
      lp_id: c.lp,
      form: texto(c.form, 60) || "formulario",
      name: texto(c.nome, 160),
      email,
      phone: telefone,
      data: campos,
      utm,
      source_path: texto(c.path, 300),
      referrer: texto(c.referrer, 300),
      visitor_id: texto(c.visitor_id, 64),
    } as never,
  });
  if (error) {
    console.error("[lp] lead:", error);
    const msg = /e-mail inválido/.test(error.message)
      ? "Confira o e-mail informado."
      : /indisponível/.test(error.message)
        ? "As inscrições desta página foram encerradas."
        : "Não foi possível enviar agora. Tente de novo.";
    return json(400, { erro: msg });
  }
  return json(200, { ok: true });
}

function caminhoSeguro(bruto: string) {
  let c: string;
  try {
    c = decodeURIComponent(bruto);
  } catch {
    return null;
  }
  if (!c || c.endsWith("/")) c += "index.html";
  if (c.includes("..") || c.startsWith("/") || c.includes("\\") || !/^[\w\-./ ()@]+$/.test(c))
    return null;
  return c;
}

export async function atenderLp(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const partes = url.pathname.split("/").filter(Boolean);

  if (url.pathname === "/_lp/lp.js") {
    return new Response(clienteJs, {
      headers: {
        ...SEGURANCA,
        "content-type": "text/javascript; charset=utf-8",
        "cache-control": "public, max-age=600",
      },
    });
  }
  if (url.pathname === "/_lp/evento" && request.method === "POST") return receberEventos(request);
  if (url.pathname === "/_lp/lead" && request.method === "POST") return receberLead(request);
  if (url.pathname === "/robots.txt") {
    return new Response("User-agent: *\nDisallow: /_lp/\n", {
      headers: { "content-type": "text/plain" },
    });
  }
  if (request.method !== "GET" && request.method !== "HEAD")
    return new Response(null, { status: 405 });
  if (!partes.length) return Response.redirect(SITE_PRINCIPAL, 302);

  const slug = partes[0].toLowerCase();
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug))
    return pagina(404, "Página não encontrada", "Confira o endereço.");
  if (partes.length === 1 && !url.pathname.endsWith("/")) {
    return Response.redirect(`${url.origin}/${slug}/${url.search}`, 301);
  }

  const lp = await buscarLp(slug);
  if (!lp || !lp.versao)
    return pagina(404, "Página não encontrada", "Confira o endereço ou volte ao site.");

  const previa = await previaValida(lp.id, lp.versao, url.searchParams.get("previa"));
  const agora = Date.now();
  if (!previa) {
    if (lp.status === "rascunho")
      return pagina(404, "Página não encontrada", "Confira o endereço ou volte ao site.");
    const encerrada = lp.status === "encerrada" || (lp.fim && new Date(lp.fim).getTime() <= agora);
    if (encerrada) {
      if (lp.url_encerrada) return Response.redirect(lp.url_encerrada, 302);
      return pagina(
        410,
        "Inscrições encerradas",
        "Esta página não está mais disponível. Veja as novidades no site.",
      );
    }
    if (lp.inicio && new Date(lp.inicio).getTime() > agora) {
      return pagina(404, "Em breve", "Esta página ainda não está no ar. Volte mais tarde.");
    }
  }

  const resto = partes.slice(1).join("/");
  const caminho = caminhoSeguro(resto && url.pathname.endsWith("/") ? `${resto}/` : resto);
  if (!caminho || !lp.arquivos.some((a) => a.caminho === caminho)) {
    return pagina(404, "Arquivo não encontrado", "Confira o endereço ou volte ao site.");
  }
  const bytes = await lerArquivo(lp, caminho);
  if (!bytes) return pagina(502, "Página indisponível", "Tente de novo em instantes.");

  const tipo = tipoDoArquivo(caminho);
  const cabecalhos: Record<string, string> = { ...SEGURANCA, "content-type": tipo };
  if (previa) cabecalhos["x-robots-tag"] = "noindex, nofollow";

  if (tipo.startsWith("text/html")) {
    const html = prepararHtml(new TextDecoder().decode(bytes), lp, url.origin, previa);
    return new Response(request.method === "HEAD" ? null : html, {
      headers: {
        ...cabecalhos,
        "content-security-policy": politicaLp(
          limparPixels(lp.pixels),
          lp.dominios_extras ?? [],
          url.protocol === "https:",
        ),
        "cache-control": previa ? "no-store" : "public, max-age=60",
      },
    });
  }
  return new Response(request.method === "HEAD" ? null : bytes, {
    headers: {
      ...cabecalhos,
      "cache-control": previa ? "no-store" : "public, max-age=300, stale-while-revalidate=86400",
      ...(tipo === "image/svg+xml"
        ? { "content-security-policy": "default-src 'none'; style-src 'unsafe-inline'" }
        : {}),
    },
  });
}
