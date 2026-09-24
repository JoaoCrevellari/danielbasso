import { Link } from "@tanstack/react-router";
import type { AnchorHTMLAttributes } from "react";

/**
 * Link para caminhos montados em tempo de execução (vindos do painel ou do registro de
 * coleções). O roteador tipa `to` só com rotas conhecidas; aqui o caminho é livre,
 * mas continua com navegação sem recarregar e pré-carregamento.
 */
export function LinkInterno({
  to,
  ...rest
}: { to: string } & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <Link to={to as never} {...(rest as object)} />;
}
