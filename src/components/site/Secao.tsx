import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { Titulo } from "./Titulo";

export type Tom = "claro" | "branco" | "suave" | "escuro" | "profundo";

const TONS: Record<Tom, string> = {
  claro: "bg-gelo",
  branco: "bg-papel",
  suave: "bg-gelo-2",
  escuro: "superficie-escura grao",
  profundo: "superficie-escura grao bg-petroleo-950",
};

/**
 * Seção padrão do site: define fundo (tom), ritmo vertical e divisor.
 * Seções vizinhas devem alternar de tom; quando duas seguidas tiverem o mesmo tom,
 * use `divisor` para marcar a troca de assunto com um fio.
 */
export function Secao({
  tom = "claro",
  compacta,
  divisor,
  id,
  className,
  children,
  rotuloAria,
  semFlutuante,
}: {
  tom?: Tom;
  compacta?: boolean;
  divisor?: boolean;
  id?: string;
  className?: string;
  children: ReactNode;
  rotuloAria?: string;
  /** Esconde o botão flutuante do WhatsApp enquanto a seção está na tela (formulários). */
  semFlutuante?: boolean;
}) {
  return (
    <section
      id={id}
      aria-label={rotuloAria}
      data-sem-flutuante={semFlutuante || undefined}
      className={cn(TONS[tom], id && "scroll-mt-16", className)}
    >
      <div className="container-site">
        <div
          className={cn(
            compacta ? "section-y-sm" : "section-y",
            divisor && "border-t border-linha",
          )}
        >
          {children}
        </div>
      </div>
    </section>
  );
}

/**
 * Cabeçalho de seção: rótulo (divisor com fio dourado), título em no máximo duas linhas,
 * texto de apoio e, opcionalmente, uma ação alinhada à direita no desktop.
 */
export function CabecalhoSecao({
  rotulo,
  titulo,
  texto,
  acao,
  centro,
  textoAoLado,
  className,
}: {
  rotulo?: string;
  titulo: string;
  texto?: string;
  acao?: ReactNode;
  centro?: boolean;
  /** No desktop, o texto de apoio vai para a direita, alinhado à base do título (seção mais baixa). */
  textoAoLado?: boolean;
  className?: string;
}) {
  if (textoAoLado && texto && !acao) {
    return (
      <header
        data-revelar-grupo
        className={cn("grid gap-4 lg:grid-cols-12 lg:items-end lg:gap-10", className)}
      >
        <div className="min-w-0 lg:col-span-7">
          {rotulo && <p className="rotulo-secao mb-4">{rotulo}</p>}
          <Titulo as="h2" className="type-h1 text-petroleo [.superficie-escura_&]:text-gelo">
            {titulo}
          </Titulo>
        </div>
        <p className="max-w-[52ch] text-[1.0625rem] leading-relaxed text-cinza lg:col-span-5 [.superficie-escura_&]:text-gelo/70">
          {texto}
        </p>
      </header>
    );
  }
  return (
    <header
      data-revelar-grupo
      className={cn(
        "flex flex-col gap-5 md:flex-row md:items-end md:justify-between md:gap-10",
        centro && "items-center text-center md:flex-col md:items-center",
        className,
      )}
    >
      <div className={cn("min-w-0", centro && "flex flex-col items-center")}>
        {rotulo && <p className="rotulo-secao mb-4">{rotulo}</p>}
        <Titulo
          as="h2"
          className={cn(
            "type-h1 text-petroleo [.superficie-escura_&]:text-gelo",
            centro && "mx-auto",
          )}
        >
          {titulo}
        </Titulo>
        {texto && (
          <p
            className={cn(
              "mt-4 max-w-[62ch] text-[1.0625rem] leading-relaxed text-cinza [.superficie-escura_&]:text-gelo/70",
              centro && "mx-auto",
            )}
          >
            {texto}
          </p>
        )}
      </div>
      {acao && <div className="shrink-0">{acao}</div>}
    </header>
  );
}
