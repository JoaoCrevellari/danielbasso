import { createFileRoute } from "@tanstack/react-router";

/**
 * POST /api/evento: recebe lotes de eventos de navegação (sendBeacon do navegador).
 * Completa cada evento com dispositivo, navegador e localização aproximada (cabeçalhos
 * da Cloudflare) e grava pela função track_events. Não guarda IP.
 */
type EventoEntrada = Record<string, unknown>;

function dispositivo(ua: string) {
  const tablet = /ipad|tablet|(android(?!.*mobile))/i.test(ua);
  const mobile = !tablet && /mobi|iphone|ipod|android.+mobile|windows phone/i.test(ua);
  const browser = /edg\//i.test(ua)
    ? "Edge"
    : /opr\/|opera/i.test(ua)
      ? "Opera"
      : /samsungbrowser/i.test(ua)
        ? "Samsung"
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

export const Route = createFileRoute("/api/evento")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const vazio = new Response(null, { status: 204 });
        const ua = request.headers.get("user-agent") ?? "";
        if (!ua || ROBO.test(ua)) return vazio;

        const { dentroDoLimite, ipDaRequisicao } = await import("@/lib/limite.server");
        if (!(await dentroDoLimite("LIMITE_ANALYTICS", `ev:${ipDaRequisicao()}`))) return vazio;

        let lote: EventoEntrada[] = [];
        try {
          const corpo = await request.text();
          if (corpo.length > 20_000) return vazio;
          const json = JSON.parse(corpo);
          lote = Array.isArray(json) ? json.slice(0, 20) : [];
        } catch {
          return vazio;
        }
        if (!lote.length) return vazio;

        // Localização aproximada: request.cf no Worker; cabeçalho cf-ipcountry como reserva.
        const cf = (request as unknown as { cf?: Record<string, unknown> }).cf ?? {};
        const geo = {
          country: (cf.country as string) ?? request.headers.get("cf-ipcountry") ?? undefined,
          region: decodificar(cf.region),
          city: decodificar(cf.city),
        };
        const d = dispositivo(ua);
        const eventos = lote.map((e) => ({ ...e, ...d, ...geo }));

        try {
          const { supabasePublic } = await import("@/integrations/supabase/client.server");
          const { error } = await supabasePublic.rpc("track_events", { p: eventos as never });
          if (error) console.error("[analytics] falha ao gravar:", error);
        } catch (err) {
          console.error("[analytics]", err);
        }
        return vazio;
      },
    },
  },
});
