import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (import.meta.env.DEV) {
    return import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }

  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry")
      .then((m) => (m.default ?? m) as ServerEntry)
      .catch((error) => {
        serverEntryPromise = undefined;
        throw error;
      });
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!body.includes('"unhandled":true') || !body.includes('"message":"HTTPError"')) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    // Um endereço só (canonical, sitemap e login usam https sem www):
    // http → https e www → sem www, num único 301. Local (localhost) fica em http.
    const url = new URL(request.url);
    const local =
      url.hostname === "localhost" ||
      url.hostname.endsWith(".localhost") ||
      url.hostname === "127.0.0.1";
    const semWww = url.hostname.startsWith("www.");
    if (semWww || (url.protocol === "http:" && !local)) {
      if (semWww) url.hostname = url.hostname.slice(4);
      if (!local) url.protocol = "https:";
      return Response.redirect(url.toString(), 301);
    }
    // LPs de lançamento: subdomínio próprio, isolado do site e do painel.
    if (url.hostname.startsWith("lp.")) {
      try {
        const { atenderLp } = await import("./lp/servidor");
        return await atenderLp(request);
      } catch (error) {
        console.error("[lp]", error);
        return new Response("Página indisponível no momento.", {
          status: 500,
          headers: { "content-type": "text/plain; charset=utf-8" },
        });
      }
    }
    const renderizar = async () => {
      try {
        const handler = await getServerEntry();
        const response = await handler.fetch(request, env, ctx);
        return await normalizeCatastrophicSsrResponse(response);
      } catch (error) {
        console.error(error);
        return new Response(renderErrorPage(), {
          status: 500,
          headers: { "content-type": "text/html; charset=utf-8" },
        });
      }
    };
    const chave = chaveDeCache(request, url);
    return chave ? comCache(chave, renderizar, ctx) : renderizar();
  },
};

// ── Cache das páginas públicas na borda da Cloudflare ───────────────────────────────
// Cada página pública é montada no servidor com dados do banco (~0,5–0,9 s). Guardamos o
// HTML por 60 s e, depois disso, entregamos a cópia guardada enquanto uma nova é montada
// em segundo plano. Mudanças feitas no painel aparecem em até ~1 minuto.
const CACHE_SEGUNDOS = 60;
const SEM_CACHE = /^\/(admin|entrar|redefinir-senha|convite|api|_serverFn|_lp)(\/|$)/;
const PARAMS_DE_CAMPANHA = /^(utm_|fbclid$|gclid$|gbraid$|wbraid$|ttclid$|msclkid$|_gl$)/;

type Contexto = { waitUntil?: (p: Promise<unknown>) => void };

function cacheDaBorda(): Cache | undefined {
  return typeof caches !== "undefined"
    ? (caches as unknown as { default?: Cache }).default
    : undefined;
}

function chaveDeCache(request: Request, url: URL): Request | null {
  if (request.method !== "GET" || !cacheDaBorda()) return null;
  if (SEM_CACHE.test(url.pathname) || request.headers.has("authorization")) return null;
  // Parâmetros de campanha não mudam o conteúdo: ficam fora da chave.
  const limpa = new URL(url);
  for (const k of [...limpa.searchParams.keys()]) {
    if (PARAMS_DE_CAMPANHA.test(k)) limpa.searchParams.delete(k);
  }
  // O build entra na chave: depois de um deploy, o cache recomeça do zero.
  const build = (import.meta.env as { BUILD_ID?: string }).BUILD_ID ?? "dev";
  return new Request(`https://cache.interno/${build}${limpa.pathname}${limpa.search}`);
}

async function comCache(
  chave: Request,
  renderizar: () => Promise<Response>,
  ctx: unknown,
): Promise<Response> {
  const cache = cacheDaBorda()!;
  const guardar = async () => {
    const resposta = await renderizar();
    const tipo = resposta.headers.get("content-type") ?? "";
    const privada = /no-store|private/i.test(resposta.headers.get("cache-control") ?? "");
    if (
      resposta.status === 200 &&
      tipo.includes("text/html") &&
      !privada &&
      !resposta.headers.has("set-cookie")
    ) {
      const copia = new Response(resposta.clone().body, resposta);
      copia.headers.set("x-guardado-em", String(Date.now()));
      copia.headers.set("cache-control", "public, max-age=86400");
      await cache.put(chave, copia);
    }
    return resposta;
  };

  const guardada = await cache.match(chave);
  if (guardada) {
    const idade = (Date.now() - Number(guardada.headers.get("x-guardado-em") ?? 0)) / 1000;
    if (idade > CACHE_SEGUNDOS) (ctx as Contexto)?.waitUntil?.(guardar().catch(() => undefined));
    const resposta = new Response(guardada.body, guardada);
    resposta.headers.delete("x-guardado-em");
    resposta.headers.set("cache-control", "no-cache");
    resposta.headers.set("x-cache", idade > CACHE_SEGUNDOS ? "STALE" : "HIT");
    return resposta;
  }
  const resposta = await guardar();
  const saida = new Response(resposta.body, resposta);
  saida.headers.set("x-cache", "MISS");
  return saida;
}
