/**
 * Peças básicas do painel. Seguem a regra do site: ações em pílula, superfícies e
 * campos com raio de 2px; petróleo como cor de ação, ouro só como acento.
 */
import { CircleNotch, WarningCircle } from "@phosphor-icons/react";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

export const EASE = [0.16, 1, 0.3, 1] as const;

export type VarianteAcao = "primario" | "secundario" | "fantasma" | "perigo" | "ouro";
export type TamanhoAcao = "md" | "sm";

const BASE_ACAO =
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-[background-color,color,border-color,transform,opacity] duration-200 ease-[var(--ease-out)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50";

const VARIANTES_ACAO: Record<VarianteAcao, string> = {
  primario: "bg-petroleo text-gelo hover:bg-petroleo-700",
  ouro: "bg-ouro text-petroleo-950 hover:bg-ouro-claro",
  secundario:
    "border border-linha-forte bg-papel text-petroleo hover:border-petroleo hover:bg-petroleo-50",
  fantasma: "text-petroleo hover:bg-petroleo/[0.06]",
  perigo:
    "border border-terracota/40 bg-papel text-terracota-texto hover:border-terracota hover:bg-terracota/[0.08]",
};

const TAMANHOS_ACAO: Record<TamanhoAcao, string> = {
  md: "min-h-11 px-5 text-[0.9375rem]",
  // Menor no desktop; no celular mantém o alvo de toque de 44 px.
  sm: "min-h-11 px-4 text-sm md:min-h-9 md:px-3.5",
};

export function acao(
  variante: VarianteAcao = "primario",
  tamanho: TamanhoAcao = "md",
  className?: string,
) {
  return cn(BASE_ACAO, VARIANTES_ACAO[variante], TAMANHOS_ACAO[tamanho], className);
}

/** Botão só com ícone: 44 px no celular, 36 px no desktop quando `compacto`. */
export function acaoIcone(compacto = false, className?: string) {
  return cn(
    "inline-flex shrink-0 items-center justify-center rounded-full text-petroleo transition-colors duration-200 hover:bg-petroleo/[0.07] disabled:pointer-events-none disabled:opacity-40",
    compacto ? "size-11 md:size-9" : "size-11",
    className,
  );
}

export const classeCampo =
  "block w-full min-h-11 rounded-[2px] border border-linha-forte bg-papel px-3.5 py-2.5 text-[0.9375rem] leading-snug text-grafite placeholder:text-cinza-claro transition-[border-color,box-shadow] duration-200 hover:border-petroleo/45 focus:border-petroleo focus:shadow-[0_0_0_3px_rgb(212_167_44/0.25)] focus:outline-none aria-[invalid=true]:border-terracota disabled:bg-gelo-2 disabled:text-cinza";

export function Girando({ className }: { className?: string }) {
  return <CircleNotch aria-hidden className={cn("size-4 animate-spin", className)} />;
}

export function Esqueleto({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span
      aria-hidden
      style={style}
      className={cn(
        "block animate-pulse rounded-[2px] bg-petroleo/[0.07] motion-reduce:animate-none",
        className,
      )}
    />
  );
}

export function Cartao({ className, children, ...rest }: ComponentProps<"section">) {
  return (
    <section className={cn("rounded-[2px] border border-linha bg-papel", className)} {...rest}>
      {children}
    </section>
  );
}

export function TituloCartao({
  titulo,
  descricao,
  acoes,
  className,
}: {
  titulo: ReactNode;
  descricao?: ReactNode;
  acoes?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-4 px-5 pt-5 md:px-6", className)}>
      <div className="min-w-0">
        <h2 className="text-[0.95rem] font-semibold text-petroleo-900">{titulo}</h2>
        {descricao && <p className="mt-0.5 text-sm text-cinza">{descricao}</p>}
      </div>
      {acoes}
    </div>
  );
}

/** Cabeçalho de cada tela do painel. */
export function TopoPagina({
  titulo,
  descricao,
  acoes,
  antes,
}: {
  titulo: ReactNode;
  descricao?: ReactNode;
  acoes?: ReactNode;
  antes?: ReactNode;
}) {
  return (
    <header className="mb-6 md:mb-8">
      {antes}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <h1 className="font-serif text-[2rem] leading-[1.1] font-[420] tracking-[-0.015em] text-petroleo md:text-[2.4rem]">
            {titulo}
          </h1>
          {descricao && <p className="mt-2 max-w-2xl text-[0.9375rem] text-cinza">{descricao}</p>}
        </div>
        {acoes && <div className="flex flex-wrap items-center gap-2">{acoes}</div>}
      </div>
    </header>
  );
}

export function EstadoVazio({
  icone,
  titulo,
  texto,
  acao: acaoNo,
  className,
}: {
  icone?: ReactNode;
  titulo: string;
  texto?: ReactNode;
  acao?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center px-6 py-14 text-center", className)}>
      {icone && (
        <span className="mb-4 inline-flex size-12 items-center justify-center rounded-full bg-petroleo-50 text-petroleo [&>svg]:size-6">
          {icone}
        </span>
      )}
      <p className="font-serif text-xl text-petroleo">{titulo}</p>
      {texto && <p className="mt-2 max-w-sm text-sm text-cinza">{texto}</p>}
      {acaoNo && <div className="mt-6">{acaoNo}</div>}
    </div>
  );
}

export function EstadoErro({
  mensagem,
  onTentar,
  className,
}: {
  mensagem: string;
  onTentar?: () => void;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col gap-3 rounded-[2px] border border-terracota/35 bg-terracota/[0.06] px-4 py-3.5 text-sm text-terracota-texto sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <p className="flex items-start gap-2">
        <WarningCircle aria-hidden weight="bold" className="mt-0.5 size-4 shrink-0" />
        {mensagem}
      </p>
      {onTentar && (
        <button type="button" onClick={onTentar} className={acao("perigo", "sm")}>
          Tentar de novo
        </button>
      )}
    </div>
  );
}

export type TomSelo = "neutro" | "petroleo" | "salvia" | "ouro" | "terracota";
const TONS: Record<TomSelo, string> = {
  neutro: "bg-gelo-2 text-cinza",
  petroleo: "bg-petroleo-50 text-petroleo",
  salvia: "bg-salvia/[0.14] text-salvia-texto",
  ouro: "bg-ouro/[0.16] text-ouro-texto",
  terracota: "bg-terracota/[0.14] text-terracota-texto",
};

export function Selo({
  tom = "neutro",
  ponto,
  children,
  className,
}: {
  tom?: TomSelo;
  ponto?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        TONS[tom],
        className,
      )}
    >
      {ponto && <span aria-hidden className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

/** Controle segmentado (período, abas). Cada opção é um botão com aria-pressed. */
export function Segmentado<T extends string | number>({
  opcoes,
  valor,
  onChange,
  rotulo,
  className,
}: {
  opcoes: { value: T; label: string }[];
  valor: T;
  onChange: (v: T) => void;
  rotulo: string;
  className?: string;
}) {
  return (
    <div
      role="group"
      aria-label={rotulo}
      className={cn("inline-flex rounded-full border border-linha bg-papel p-1", className)}
    >
      {opcoes.map((o) => {
        const ativo = o.value === valor;
        return (
          <button
            key={String(o.value)}
            type="button"
            aria-pressed={ativo}
            onClick={() => onChange(o.value)}
            className={cn(
              "min-h-10 shrink-0 rounded-full px-3 text-sm font-medium whitespace-nowrap transition-colors duration-200 sm:px-4 md:min-h-8",
              ativo ? "bg-petroleo text-gelo" : "text-cinza hover:text-petroleo",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** Interruptor acessível (role="switch"). */
export function Interruptor({
  id,
  ligado,
  onChange,
  rotulo,
  descricao,
  disabled,
}: {
  id: string;
  ligado: boolean;
  onChange: (v: boolean) => void;
  rotulo: ReactNode;
  descricao?: ReactNode;
  disabled?: boolean;
}) {
  return (
    <div className="flex min-h-11 items-center justify-between gap-4">
      <div className="min-w-0">
        <label htmlFor={id} className="cursor-pointer text-sm font-medium text-grafite">
          {rotulo}
        </label>
        {descricao && <p className="text-xs text-cinza">{descricao}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={ligado}
        disabled={disabled}
        onClick={() => onChange(!ligado)}
        className={cn(
          "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition-colors duration-200 ease-[var(--ease-out)] disabled:opacity-50",
          "before:absolute before:-inset-2 before:content-['']",
          ligado ? "border-petroleo bg-petroleo" : "border-linha-forte bg-gelo-2",
        )}
      >
        <span
          aria-hidden
          className={cn(
            "inline-block size-5 rounded-full bg-papel shadow-[0_1px_3px_rgb(0_20_30/0.25)] transition-transform duration-200 ease-[var(--ease-out)]",
            ligado ? "translate-x-[1.45rem]" : "translate-x-[0.2rem]",
          )}
        />
      </button>
    </div>
  );
}

/** Campo de busca com ícone. */
export function CampoBusca({
  valor,
  onChange,
  rotulo,
  placeholder,
  className,
}: {
  valor: string;
  onChange: (v: string) => void;
  rotulo: string;
  placeholder?: string;
  className?: string;
}) {
  return (
    <label className={cn("relative block", className)}>
      <span className="sr-only">{rotulo}</span>
      <svg
        aria-hidden
        viewBox="0 0 256 256"
        className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 fill-cinza"
      >
        <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z" />
      </svg>
      <input
        type="search"
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? rotulo}
        className={cn(classeCampo, "pl-10")}
      />
    </label>
  );
}

export function SelectFiltro({
  rotulo,
  valor,
  onChange,
  opcoes,
  todos = "Todos",
  className,
}: {
  rotulo: string;
  valor: string;
  onChange: (v: string) => void;
  opcoes: readonly { value: string; label: string }[];
  todos?: string;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="sr-only">{rotulo}</span>
      <select
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        className={classeSelect}
        style={estiloSelect}
      >
        <option value="">
          {rotulo}: {todos.toLowerCase()}
        </option>
        {opcoes.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export const estiloSelect: React.CSSProperties = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 256 256'%3E%3Cpath fill='%235b6166' d='M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z'/%3E%3C/svg%3E\")",
  backgroundSize: "12px",
  backgroundPosition: "right 0.9rem center",
  backgroundRepeat: "no-repeat",
};
export const classeSelect = cn(classeCampo, "appearance-none pr-9");
