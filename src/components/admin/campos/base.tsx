/**
 * Peças comuns dos campos: moldura (rótulo acima, ajuda e erro abaixo), atributos de
 * acessibilidade e textarea que cresce com o conteúdo.
 */
import {
  useEffect,
  useLayoutEffect,
  useRef,
  type ComponentProps,
  type ReactNode,
  type Ref,
} from "react";

import { cn } from "@/lib/utils";
import { classeCampo } from "../ui";

export const useLayoutSeguro = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function ariaCampo(
  id: string,
  opts: { ajuda?: unknown; erro?: string; obrigatorio?: boolean },
) {
  const desc = [opts.ajuda ? `${id}-ajuda` : null, opts.erro ? `${id}-erro` : null]
    .filter(Boolean)
    .join(" ");
  return {
    id,
    "aria-describedby": desc || undefined,
    "aria-invalid": opts.erro ? (true as const) : undefined,
    "aria-required": opts.obrigatorio || undefined,
  };
}

export function Moldura({
  id,
  rotulo,
  obrigatorio,
  ajuda,
  erro,
  contador,
  children,
  className,
  comoGrupo,
}: {
  id: string;
  rotulo: ReactNode;
  obrigatorio?: boolean;
  ajuda?: ReactNode;
  erro?: string;
  contador?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Para campos compostos (listas, imagem): rótulo vira legenda de um fieldset. */
  comoGrupo?: boolean;
}) {
  const Rotulo = (
    <span className="flex items-baseline justify-between gap-3">
      <span className="text-sm font-medium text-grafite">
        {rotulo}
        {obrigatorio && (
          <>
            <span aria-hidden className="ml-0.5 text-terracota-texto">
              *
            </span>
            <span className="sr-only"> (obrigatório)</span>
          </>
        )}
      </span>
      {contador}
    </span>
  );
  const rodape = (
    <>
      {ajuda && (
        <p id={`${id}-ajuda`} className="mt-1.5 text-[0.8125rem] leading-snug text-cinza">
          {ajuda}
        </p>
      )}
      {erro && (
        <p
          id={`${id}-erro`}
          role="alert"
          className="mt-1.5 text-[0.8125rem] font-medium text-terracota-texto"
        >
          {erro}
        </p>
      )}
    </>
  );
  if (comoGrupo) {
    return (
      <fieldset
        className={cn("min-w-0", className)}
        aria-describedby={ajuda ? `${id}-ajuda` : undefined}
      >
        <legend className="mb-1.5 w-full">{Rotulo}</legend>
        {children}
        {rodape}
      </fieldset>
    );
  }
  return (
    <div className={cn("min-w-0", className)}>
      <label htmlFor={id} className="mb-1.5 block">
        {Rotulo}
      </label>
      {children}
      {rodape}
    </div>
  );
}

export function Contador({ atual, max }: { atual: number; max: number }) {
  const passou = atual > max;
  return (
    <span
      className={cn(
        "text-xs tabular-nums",
        passou ? "font-medium text-terracota-texto" : "text-cinza",
      )}
      aria-live="polite"
    >
      {atual}/{max}
    </span>
  );
}

/** Textarea com altura automática (cresce com o texto, sem barra de rolagem interna). */
export function AreaTexto({
  value,
  rows = 3,
  className,
  ref: refExterno,
  ...rest
}: Omit<ComponentProps<"textarea">, "value" | "ref"> & {
  value: string;
  ref?: Ref<HTMLTextAreaElement>;
}) {
  const ref = useRef<HTMLTextAreaElement | null>(null);
  const ligarRef = (el: HTMLTextAreaElement | null) => {
    ref.current = el;
    if (typeof refExterno === "function") refExterno(el);
    else if (refExterno) (refExterno as { current: HTMLTextAreaElement | null }).current = el;
  };
  useLayoutSeguro(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight + 2}px`;
  }, [value]);
  return (
    <textarea
      ref={ligarRef}
      rows={rows}
      value={value}
      className={cn(classeCampo, "resize-none overflow-hidden leading-relaxed", className)}
      {...rest}
    />
  );
}

export function texto(v: unknown): string {
  return typeof v === "string" ? v : typeof v === "number" ? String(v) : "";
}
