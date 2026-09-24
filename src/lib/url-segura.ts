/**
 * URL vinda do banco/painel antes de ir para href/src: só http(s) ou caminho do próprio
 * site. Bloqueia `javascript:`, `data:`, `vbscript:` e similares (XSS) e `//host`
 * (protocol-relative, que sai do site sem parecer).
 */
export function urlSegura(valor: unknown): string | undefined {
  if (typeof valor !== "string") return undefined;
  const u = valor.trim();
  if (!u) return undefined;
  if (u.startsWith("/") && !u.startsWith("//")) return u;
  try {
    const p = new URL(u);
    return p.protocol === "https:" || p.protocol === "http:" ? p.toString() : undefined;
  } catch {
    return undefined;
  }
}

/** Destino interno para redirecionar depois do login: só caminhos do site. */
export function caminhoInterno(valor: unknown, padrao: string): string {
  if (typeof valor !== "string") return padrao;
  const u = valor.trim();
  return u.startsWith("/") && !u.startsWith("//") && !u.startsWith("/\\") ? u : padrao;
}
