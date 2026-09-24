import { Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, WhatsappLogo } from "@phosphor-icons/react";
import type { ComponentProps, ReactNode } from "react";

import { useConfig } from "@/components/layout/ConfigContext";
import { registrar } from "@/lib/analytics";
import { linkWhatsApp } from "@/lib/site";
import { urlSegura } from "@/lib/url-segura";
import { cn } from "@/lib/utils";

export type VarianteBotao =
  "primario" | "ouro" | "contorno" | "contorno-claro" | "texto" | "texto-claro";

const BASE =
  "group/botao relative inline-flex min-h-12 items-center justify-center gap-2.5 whitespace-nowrap rounded-full px-6 text-[0.9375rem] font-medium tracking-[0.005em] transition-[background-color,color,border-color,transform,box-shadow] duration-300 ease-[var(--ease-out)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50";

const VARIANTES: Record<VarianteBotao, string> = {
  primario:
    "bg-petroleo text-gelo hover:bg-petroleo-700 shadow-[0_1px_0_rgb(255_255_255/0.08)_inset,0_10px_30px_-12px_rgb(0_63_92/0.55)]",
  ouro: "bg-ouro text-petroleo-950 hover:bg-ouro-claro shadow-[0_10px_30px_-12px_rgb(212_167_44/0.55)]",
  contorno:
    "border border-linha-forte text-petroleo hover:border-petroleo hover:bg-petroleo/[0.04]",
  "contorno-claro": "border border-gelo/30 text-gelo hover:border-gelo/70 hover:bg-gelo/[0.06]",
  texto: "min-h-11 rounded-none px-0 text-petroleo hover:text-ouro-texto",
  "texto-claro": "min-h-11 rounded-none px-0 text-gelo hover:text-ouro",
};

export function classeBotao(variante: VarianteBotao = "primario", className?: string) {
  return cn(BASE, VARIANTES[variante], className);
}

function Seta({ externo }: { externo?: boolean }) {
  const Icone = externo ? ArrowUpRight : ArrowRight;
  return (
    <Icone
      aria-hidden
      weight="regular"
      className={cn(
        "size-4 shrink-0 transition-transform duration-300 ease-[var(--ease-out)]",
        externo
          ? "group-hover/botao:-translate-y-0.5 group-hover/botao:translate-x-0.5"
          : "group-hover/botao:translate-x-1",
      )}
    />
  );
}

type Props = {
  /** Caminho interno (/contato), URL completa ou "whatsapp". */
  href: string;
  children: ReactNode;
  variante?: VarianteBotao;
  className?: string;
  seta?: boolean;
  /** Rótulo para o analytics (padrão: o texto do botão). */
  rastrear?: string;
  mensagemWhatsApp?: string;
} & Omit<ComponentProps<"a">, "href" | "children">;

/**
 * Botão/link único do site. Decide sozinho entre rota interna, link externo e WhatsApp,
 * e registra o clique no analytics.
 */
export function Botao({
  href,
  children,
  variante = "primario",
  className,
  seta = true,
  rastrear,
  mensagemWhatsApp,
  ...rest
}: Props) {
  const config = useConfig();
  const rotulo = rastrear ?? (typeof children === "string" ? children : undefined);
  const classe = classeBotao(variante, className);

  if (href === "whatsapp") {
    const url = linkWhatsApp(
      config.contato.whatsapp,
      mensagemWhatsApp ?? config.contato.whatsappMensagem,
    );
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={classe}
        onClick={() => registrar("whatsapp", { label: rotulo })}
        {...rest}
      >
        <WhatsappLogo aria-hidden weight="regular" className="size-[1.15rem] shrink-0" />
        {children}
      </a>
    );
  }

  if (href.startsWith("#")) {
    return (
      <a
        href={href}
        className={classe}
        onClick={() => registrar("cta", { label: rotulo })}
        {...rest}
      >
        {children}
        {seta && <Seta />}
      </a>
    );
  }

  if (href.startsWith("/") && !href.startsWith("//")) {
    return (
      <Link
        to={href}
        className={classe}
        onClick={() => registrar("cta", { label: rotulo })}
        {...(rest as object)}
      >
        {children}
        {seta && <Seta />}
      </Link>
    );
  }

  const seguro = urlSegura(href);
  return (
    <a
      href={seguro ?? "#"}
      target="_blank"
      rel="noopener noreferrer"
      className={classe}
      onClick={() => registrar("cta", { label: rotulo })}
      {...rest}
    >
      {children}
      {seta && <Seta externo />}
    </a>
  );
}
