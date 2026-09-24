import { cn } from "@/lib/utils";

/** Chips de filtro (etapa, categoria, origem). Rolam na horizontal no celular. */
export function Filtros({
  opcoes,
  valor,
  onChange,
  rotulo,
  className,
}: {
  opcoes: { value: string; label: string }[];
  valor: string;
  onChange: (v: string) => void;
  rotulo: string;
  className?: string;
}) {
  if (opcoes.length < 2) return null;
  return (
    <div
      role="group"
      aria-label={rotulo}
      className={cn(
        "sem-barra -mx-[var(--gutter)] flex gap-2 overflow-x-auto px-[var(--gutter)] md:mx-0 md:flex-wrap md:px-0",
        className,
      )}
    >
      {[{ value: "todos", label: "Todos" }, ...opcoes].map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={valor === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "h-10 shrink-0 rounded-full border px-4 text-[0.875rem] transition-colors duration-200",
            valor === o.value
              ? "border-petroleo bg-petroleo text-gelo"
              : "border-linha-forte text-petroleo hover:border-petroleo hover:bg-petroleo/[0.04]",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
