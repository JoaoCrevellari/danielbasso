import { Link } from "@tanstack/react-router";

import { cn } from "@/lib/utils";

/**
 * Monograma "db" recortado do logo (public/marca/icone.png, gerado por
 * scripts/gerar-marca.mjs). É usado como máscara, então a cor vem do CSS e
 * acompanha o fundo (dourado claro no escuro, dourado de texto no claro).
 */
export function Monograma({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-block aspect-[316/301] bg-current [mask:url(/marca/icone.png)_center/contain_no-repeat]",
        className,
      )}
    />
  );
}

/** Assinatura do cabeçalho e do menu: monograma + nome. */
export function Logo({ claro, className }: { claro?: boolean; className?: string }) {
  return (
    <Link
      to="/"
      aria-label="Daniel Basso, Desenvolvimento Humano: página inicial"
      className={cn("group inline-flex items-center gap-3", className)}
    >
      <Monograma
        className={cn("h-9 transition-colors md:h-10", claro ? "text-ouro" : "text-ouro-texto")}
      />
      <span className="flex flex-col leading-none">
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
      </span>
    </Link>
  );
}

/** Logo completo (monograma + nome + linha), com fundo transparente, para fundos escuros. */
export function LogoCompleto({ className }: { className?: string }) {
  return (
    <Link to="/" aria-label="Daniel Basso, Desenvolvimento Humano: página inicial">
      <img
        src="/marca/logo.png"
        alt="Daniel Basso · Desenvolvimento Humano"
        width={954}
        height={499}
        loading="lazy"
        decoding="async"
        className={cn("h-auto w-56 md:w-64", className)}
      />
    </Link>
  );
}
