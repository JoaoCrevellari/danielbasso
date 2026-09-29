import type { CSSProperties } from "react";

import { srcSetMidia } from "@/lib/imagens";
import { urlSegura } from "@/lib/url-segura";
import { cn } from "@/lib/utils";

const LARGURAS = [480, 768, 1080, 1440, 1920];

/**
 * Imagem responsiva. Gera srcset quando a origem permite redimensionar:
 * - Unsplash (parâmetros w/q/auto=format);
 * - Supabase Storage: imagens enviadas pelo painel têm versões de 480/960/1440 px.
 */
function montarSrcSet(src: string, max: number) {
  // Fotos enviadas pelo painel: versões menores geradas no envio (src/lib/imagens.ts).
  const midia = srcSetMidia(src, max);
  if (midia) return midia;
  if (src.includes("images.unsplash.com")) {
    const base = src.split("?")[0];
    const larguras = LARGURAS.filter((w) => w <= max * 2);
    return {
      src: `${base}?w=${Math.min(max, 1440)}&q=72&auto=format&fit=crop`,
      srcSet: larguras.map((w) => `${base}?w=${w}&q=70&auto=format&fit=crop ${w}w`).join(", "),
    };
  }
  return { src, srcSet: undefined };
}

export function Imagem({
  src,
  alt,
  sizes = "100vw",
  prioridade,
  className,
  imgClassName,
  larguraMax = 1440,
  style,
  proporcao,
}: {
  src?: string | null;
  alt: string;
  sizes?: string;
  prioridade?: boolean;
  className?: string;
  imgClassName?: string;
  larguraMax?: number;
  style?: CSSProperties;
  /** Ex.: "4/5", "16/9". Reserva o espaço e evita salto de layout. */
  proporcao?: string;
}) {
  const seguro = urlSegura(src);
  const estiloCaixa: CSSProperties = {
    ...style,
    ...(proporcao ? { aspectRatio: proporcao } : null),
  };

  if (!seguro) {
    return (
      <div
        className={cn("bg-petroleo-100", className)}
        style={estiloCaixa}
        role="img"
        aria-label={alt}
      />
    );
  }
  const { src: final, srcSet } = montarSrcSet(seguro, larguraMax);
  return (
    <div className={cn("overflow-hidden bg-petroleo-100", className)} style={estiloCaixa}>
      <img
        src={final}
        srcSet={srcSet}
        sizes={srcSet ? sizes : undefined}
        alt={alt}
        loading={prioridade ? "eager" : "lazy"}
        decoding={prioridade ? "sync" : "async"}
        fetchPriority={prioridade ? "high" : undefined}
        className={cn("block h-full w-full object-cover", imgClassName)}
      />
    </div>
  );
}
