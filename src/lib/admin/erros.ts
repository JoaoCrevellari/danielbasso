/**
 * Traduz erros do PostgREST/Postgres para mensagens em pt-BR que o painel mostra.
 * Usado dentro dos handlers das server functions do admin.
 */
type ErroBanco = { code?: string; message?: string; details?: string | null } | null | undefined;

export function traduzirErro(error: ErroBanco, contexto?: string): Error {
  const code = error?.code ?? "";
  const msg = error?.message ?? "";
  if (code === "23505")
    return new Error("Já existe um registro com este endereço (slug). Escolha outro.");
  if (code === "23514") {
    if (/slug/i.test(msg))
      return new Error("O endereço (slug) só pode ter letras minúsculas, números e hífens.");
    return new Error("Algum valor não é aceito pelo banco. Revise os campos.");
  }
  if (code === "42501" || /row-level security/i.test(msg)) {
    return new Error("Você não tem permissão para esta ação.");
  }
  if (code === "PGRST116") return new Error("Registro não encontrado.");
  console.error(`[admin]${contexto ? ` ${contexto}:` : ""}`, error);
  return new Error("Não foi possível concluir agora. Tente de novo em instantes.");
}

/** Lança o erro traduzido quando houver. */
export function checar(error: ErroBanco, contexto?: string): void {
  if (error) throw traduzirErro(error, contexto);
}
