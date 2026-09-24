import { CaretDown } from "@phosphor-icons/react";
import { useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * No celular, textos longos começam recolhidos (a seção cabe numa tela) com um botão para
 * ler tudo. Do tablet em diante, o texto aparece inteiro.
 */
export function TextoExpansivel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const [aberto, setAberto] = useState(false);
  return (
    <div className={className}>
      <div
        className={cn(
          "relative",
          !aberto &&
            "max-md:max-h-[16rem] max-md:overflow-hidden max-md:after:absolute max-md:after:inset-x-0 max-md:after:bottom-0 max-md:after:h-24 max-md:after:bg-gradient-to-t max-md:after:from-gelo max-md:after:to-transparent",
        )}
      >
        {children}
      </div>
      {!aberto && (
        <button
          type="button"
          onClick={() => setAberto(true)}
          className="mt-3 inline-flex min-h-11 items-center gap-2 text-[0.9375rem] font-medium text-petroleo md:hidden"
        >
          Ler descrição completa <CaretDown className="size-4" />
        </button>
      )}
    </div>
  );
}
