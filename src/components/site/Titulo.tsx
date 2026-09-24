import { Fragment, type ElementType, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Título com destaque: o trecho entre *asteriscos* vira itálico dourado (classe .destaque).
 * É a convenção usada em todos os campos de título do painel.
 */
export function comDestaque(texto: string | null | undefined): ReactNode {
  if (!texto) return null;
  const partes = texto.split(/\*([^*]+)\*/g);
  return partes.map((p, i) =>
    i % 2 === 1 ? (
      <em key={i} className="destaque">
        {semQuebrarHifen(p)}
      </em>
    ) : (
      <Fragment key={i}>{semQuebrarHifen(p)}</Fragment>
    ),
  );
}

/** Palavras com hífen ("reconstruir-se") não quebram no meio em títulos grandes. */
function semQuebrarHifen(texto: string): ReactNode {
  const partes = texto.split(/(\S+-\S+)/g);
  if (partes.length === 1) return texto;
  return partes.map((p, i) =>
    i % 2 === 1 ? (
      <span key={i} className="whitespace-nowrap">
        {p}
      </span>
    ) : (
      <Fragment key={i}>{p}</Fragment>
    ),
  );
}

/** Remove a marcação de destaque (para <title>, alt, meta). */
export function semDestaque(texto: string | null | undefined): string {
  return (texto ?? "").replace(/\*([^*]+)\*/g, "$1");
}

export function Titulo({
  as: Tag = "h2",
  children,
  className,
  ...rest
}: {
  as?: ElementType;
  children: string;
  className?: string;
  id?: string;
  style?: React.CSSProperties;
  "data-revelar"?: string | boolean;
}) {
  return (
    <Tag className={cn(className)} {...rest}>
      {comDestaque(children)}
    </Tag>
  );
}
