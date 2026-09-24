import { Link } from "@tanstack/react-router";

import { cn } from "@/lib/utils";

/**
 * Assinatura tipográfica provisória (o logo definitivo ainda não existe).
 * Quando o logo chegar, basta trocar o conteúdo deste componente.
 */
export function Logo({ claro, className }: { claro?: boolean; className?: string }) {
  return (
    <Link
      to="/"
      aria-label="Daniel Basso, Desenvolvimento Humano: página inicial"
      className={cn("group inline-flex flex-col leading-none", className)}
    >
      <span
        className={cn(
          "font-serif text-[1.4rem] font-[420] tracking-[-0.015em] transition-colors md:text-[1.55rem]",
          claro ? "text-gelo" : "text-petroleo",
        )}
      >
        Daniel Basso
      </span>
      <span
        className={cn(
          "mt-1 text-[0.625rem] font-medium tracking-[0.24em] uppercase transition-colors",
          claro ? "text-ouro" : "text-ouro-texto",
        )}
      >
        Desenvolvimento Humano
      </span>
    </Link>
  );
}
