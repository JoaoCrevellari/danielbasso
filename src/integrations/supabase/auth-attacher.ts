import { createMiddleware } from "@tanstack/react-start";

/**
 * Anexa o token de login às chamadas de server function (painel /cms).
 *
 * Registrado como `functionMiddleware` global em `src/start.ts`; sem ele o navegador
 * nunca envia o bearer token nas RPCs.
 *
 * O cliente do Supabase (~250 KB com auth e realtime) só é carregado se houver sessão
 * salva no navegador. Visitantes do site público — que nunca fazem login — não baixam
 * a biblioteca, e as chamadas públicas (busca, sermões) não esperam por ela.
 */
function temSessaoSalva(): boolean {
  try {
    // Chave padrão do supabase-js: "sb-<ref do projeto>-auth-token"
    return Object.keys(window.localStorage).some(
      (k) => k.startsWith("sb-") && k.endsWith("-auth-token"),
    );
  } catch {
    return false; // navegador bloqueando o armazenamento: trata como sem sessão
  }
}

export const attachSupabaseAuth = createMiddleware({ type: "function" }).client(
  async ({ next }) => {
    if (typeof window === "undefined" || !temSessaoSalva()) return next();
    const { supabase } = await import("./client");
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    return next({
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },
);
