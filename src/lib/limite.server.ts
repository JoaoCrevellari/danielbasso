/**
 * Limite de requisições por chave (ex.: IP), usando o binding de Rate Limiting do
 * Workers declarado em wrangler.jsonc (`ratelimits`). Gratuito e sem banco.
 *
 * Fora do Worker (npm run dev) o binding não existe: libera tudo, para não travar o
 * desenvolvimento. O limite é por colo (datacenter) da Cloudflare — suficiente contra
 * rajadas de robô, não é uma contagem global exata.
 */
import { getRequest } from "@tanstack/react-start/server";

type Limitador = { limit: (opts: { key: string }) => Promise<{ success: boolean }> };

export async function dentroDoLimite(binding: string, chave: string): Promise<boolean> {
  let limitador: Limitador | undefined;
  try {
    // Especificador em variável: o Vite não tenta resolver "cloudflare:workers" no dev.
    const modulo = "cloudflare:workers";
    const { env } = (await import(/* @vite-ignore */ modulo)) as { env: Record<string, unknown> };
    limitador = env?.[binding] as Limitador | undefined;
  } catch {
    return true; // fora do Worker
  }
  if (!limitador) return true;
  try {
    const { success } = await limitador.limit({ key: chave });
    return success;
  } catch (err) {
    // Libera para não derrubar o formulário, mas deixa rastro nos logs do Worker:
    // o simulador local do wrangler (4.137, Windows) falha aqui com "internal error".
    console.error(`[limite] ${binding} falhou, liberando a requisição:`, err);
    return true;
  }
}

/** IP de quem fez a requisição (cabeçalho da Cloudflare); "desconhecido" fora dela. */
export function ipDaRequisicao(): string {
  const h = getRequest()?.headers;
  return (
    h?.get("cf-connecting-ip") ?? h?.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "desconhecido"
  );
}
