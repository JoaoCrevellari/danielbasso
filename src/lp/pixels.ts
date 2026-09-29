/**
 * Pixels das LPs (configurados no painel, injetados pelo servidor) e a política de
 * segurança (CSP) de cada página. Arquivo puro: usado pelo Worker e pelo painel.
 */
export type Pixels = {
  meta?: string;
  ga4?: string;
  gads?: string;
  tiktok?: string;
};

export const FORMATOS_PIXEL: Record<keyof Pixels, { rotulo: string; exemplo: string; re: RegExp }> =
  {
    meta: {
      rotulo: "Meta Pixel (Facebook/Instagram)",
      exemplo: "123456789012345",
      re: /^\d{8,20}$/,
    },
    ga4: { rotulo: "Google Analytics 4", exemplo: "G-ABC123XYZ9", re: /^G-[A-Z0-9]{4,14}$/ },
    gads: { rotulo: "Google Ads (conversão)", exemplo: "AW-123456789", re: /^AW-\d{6,14}$/ },
    tiktok: { rotulo: "TikTok Pixel", exemplo: "C1A2B3C4D5E6F7G8H9I0", re: /^[A-Z0-9]{10,30}$/ },
  };

/** Mantém só IDs no formato certo (nada de código colado no campo). */
export function limparPixels(p: unknown): Pixels {
  const saida: Pixels = {};
  if (!p || typeof p !== "object") return saida;
  for (const k of Object.keys(FORMATOS_PIXEL) as (keyof Pixels)[]) {
    const v = (p as Record<string, unknown>)[k];
    if (typeof v === "string" && FORMATOS_PIXEL[k].re.test(v.trim())) saida[k] = v.trim();
  }
  return saida;
}

/** Domínio extra liberado pelo painel: só host https, sem caminho nem curinga solto. */
export function dominioValido(d: string) {
  return /^(\*\.)?([a-z0-9-]+\.)+[a-z]{2,}$/i.test(d.trim());
}

/** Scripts dos pixels, montados só a partir de IDs já validados. */
export function scriptsPixels(p: Pixels): string {
  const partes: string[] = [];
  if (p.meta) {
    partes.push(
      `<script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${p.meta}');fbq('track','PageView');</script>`,
    );
  }
  const google = [p.ga4, p.gads].filter(Boolean) as string[];
  if (google.length) {
    partes.push(
      `<script async src="https://www.googletagmanager.com/gtag/js?id=${google[0]}"></script>`,
      `<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());${google
        .map((id) => `gtag('config','${id}');`)
        .join("")}</script>`,
    );
  }
  if (p.tiktok) {
    partes.push(
      `<script>!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=i;ttq._t=ttq._t||{};ttq._t[e]=+new Date;ttq._o=ttq._o||{};ttq._o[e]=n||{};var o=d.createElement("script");o.type="text/javascript";o.async=!0;o.src=i+"?sdkid="+e+"&lib="+t;var a=d.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};ttq.load('${p.tiktok}');ttq.page()}(window,document,'ttq');</script>`,
    );
  }
  return partes.join("");
}

/**
 * CSP da LP. 'unsafe-inline' é necessário (a LP é um arquivo único com CSS/JS embutidos),
 * mas o que realmente protege está aqui: scripts e conexões só para os domínios
 * listados, formulários só para o próprio site, nada de a página ser embutida em outro
 * site, e a LP roda num subdomínio separado do painel (não enxerga a sessão de ninguém).
 */
export function politicaLp(p: Pixels, extras: string[], https = true) {
  const ext = extras.filter(dominioValido).map((d) => `https://${d.trim().toLowerCase()}`);
  const script = [
    "'self'",
    "'unsafe-inline'",
    "https://cdn.jsdelivr.net",
    "https://cdnjs.cloudflare.com",
  ];
  const connect = ["'self'"];
  const frame = [
    "https://www.youtube-nocookie.com",
    "https://www.youtube.com",
    "https://player.vimeo.com",
    "https://*.tv.pandavideo.com.br",
  ];
  if (p.meta) {
    script.push("https://connect.facebook.net");
    connect.push("https://www.facebook.com", "https://connect.facebook.net");
  }
  if (p.ga4 || p.gads) {
    script.push(
      "https://www.googletagmanager.com",
      "https://www.google.com",
      "https://googleads.g.doubleclick.net",
    );
    connect.push(
      "https://www.googletagmanager.com",
      "https://*.google-analytics.com",
      "https://*.analytics.google.com",
      "https://*.g.doubleclick.net",
      "https://www.google.com",
      "https://googleads.g.doubleclick.net",
    );
    frame.push("https://td.doubleclick.net", "https://www.googletagmanager.com");
  }
  if (p.tiktok) {
    script.push("https://analytics.tiktok.com");
    connect.push("https://analytics.tiktok.com", "https://*.tiktok.com");
  }
  return [
    "default-src 'self'",
    `script-src ${[...script, ...ext].join(" ")}`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net https://cdnjs.cloudflare.com ${ext.join(" ")}`.trim(),
    `font-src 'self' data: https://fonts.gstatic.com https://cdn.jsdelivr.net https://cdnjs.cloudflare.com ${ext.join(" ")}`.trim(),
    "img-src 'self' data: blob: https:",
    "media-src 'self' blob: https:",
    `connect-src ${[...connect, ...ext].join(" ")}`,
    `frame-src ${[...frame, ...ext].join(" ")}`,
    "form-action 'self'",
    "base-uri 'none'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    https ? "upgrade-insecure-requests" : "",
  ]
    .filter(Boolean)
    .join("; ");
}
