import { CaretDown } from "@phosphor-icons/react";
import { useId, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Conteúdo que abre e fecha em qualquer tamanho de tela, com altura animada
 * (grid-template-rows 0fr → 1fr, sem medir em JavaScript). Fechado, o conteúdo sai da
 * ordem de leitura (`inert`), então leitor de tela e Tab só o alcançam quando aberto.
 */
export function Expansivel({
  rotulo,
  rotuloAberto = "Fechar",
  children,
  escuro,
  className,
}: {
  rotulo: string;
  rotuloAberto?: string;
  children: ReactNode;
  escuro?: boolean;
  className?: string;
}) {
  const [aberto, setAberto] = useState(false);
  const id = useId();
  return (
    <div className={className}>
      <button
        type="button"
        aria-expanded={aberto}
        aria-controls={id}
        onClick={() => setAberto((a) => !a)}
        className={cn(
          "group inline-flex min-h-11 items-center gap-2.5 rounded-full text-[0.9375rem] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ouro",
          escuro ? "text-gelo hover:text-ouro-claro" : "text-petroleo hover:text-petroleo-700",
        )}
      >
        <span
          aria-hidden
          className={cn(
            "inline-flex size-8 items-center justify-center rounded-full border transition-[transform,background-color,border-color] duration-300 ease-[var(--ease-out)]",
            escuro ? "border-gelo/30" : "border-linha-forte",
            aberto && "rotate-180",
            aberto && (escuro ? "border-ouro bg-ouro/10" : "border-petroleo bg-petroleo-50"),
          )}
        >
          <CaretDown className="size-4" />
        </span>
        {aberto ? rotuloAberto : rotulo}
      </button>
      <div
        id={id}
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-500 ease-[var(--ease-out)] motion-reduce:transition-none",
          aberto ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
        inert={!aberto}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="pt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
