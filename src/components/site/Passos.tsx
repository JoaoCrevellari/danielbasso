import { cn } from "@/lib/utils";

/**
 * Sequência numerada (como funciona, processo, etapas). No desktop, linha do tempo
 * horizontal com os números ligados por um fio; no celular, lista vertical compacta.
 */
export function Passos({
  itens,
  escuro,
  className,
}: {
  itens: { titulo: string; texto?: string }[];
  escuro?: boolean;
  className?: string;
}) {
  const validos = itens.filter((p) => p.titulo?.trim());
  return (
    <ol
      data-revelar-grupo
      className={cn(
        "relative grid gap-6 md:gap-8",
        validos.length >= 4
          ? "md:grid-cols-4"
          : validos.length === 3
            ? "md:grid-cols-3"
            : "md:grid-cols-2",
        className,
      )}
    >
      {validos.map((p, n) => (
        <li key={p.titulo + n} className="relative flex gap-4 md:flex-col md:gap-0">
          {/* fio que liga ao próximo passo (desktop) */}
          {n < validos.length - 1 && (
            <span
              aria-hidden
              className={cn(
                "absolute top-5 left-12 hidden h-px w-[calc(100%-1rem)] md:block",
                escuro ? "bg-gelo/15" : "bg-linha-forte",
              )}
            />
          )}
          <span
            className={cn(
              "type-numeral relative inline-flex size-10 shrink-0 items-center justify-center rounded-full border text-[1.1rem]",
              escuro
                ? "border-ouro/60 bg-petroleo-900 text-ouro"
                : "border-ouro/70 bg-gelo text-ouro-texto",
            )}
          >
            {n + 1}
          </span>
          <div className="md:mt-5">
            <h3 className={cn("type-h3", escuro ? "text-gelo" : "text-petroleo")}>{p.titulo}</h3>
            {p.texto && (
              <p
                className={cn(
                  "mt-1.5 max-w-[36ch] text-[0.95rem] leading-relaxed",
                  escuro ? "text-gelo/65" : "text-cinza",
                )}
              >
                {p.texto}
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
