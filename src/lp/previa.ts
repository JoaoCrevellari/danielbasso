/**
 * Link de prévia de LP (rascunho ou versão nova antes de publicar): HMAC da LP + versão,
 * assinado com um segredo que só o servidor tem. Muda sozinho a cada versão enviada.
 */
async function hmac(msg: string) {
  const segredo = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!segredo) throw new Error("Segredo do servidor ausente.");
  const chave = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(`lp-previa:${segredo}`),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const assinatura = await crypto.subtle.sign("HMAC", chave, new TextEncoder().encode(msg));
  return [...new Uint8Array(assinatura)]
    .slice(0, 16)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function tokenPrevia(lpId: string, versao: number) {
  return hmac(`${lpId}:${versao}`);
}

export async function previaValida(lpId: string, versao: number, token: string | null) {
  if (!token || !/^[0-9a-f]{32}$/.test(token)) return false;
  const esperado = await tokenPrevia(lpId, versao);
  // Comparação em tempo constante.
  let dif = 0;
  for (let i = 0; i < esperado.length; i++) dif |= esperado.charCodeAt(i) ^ token.charCodeAt(i);
  return dif === 0;
}

/** Endereço base das LPs a partir do endereço do site (danielbasso.com.br → lp.…). */
export function origemLps(origemSite: string) {
  const u = new URL(origemSite);
  u.hostname = `lp.${u.hostname.replace(/^www\./, "")}`;
  return u.origin;
}
