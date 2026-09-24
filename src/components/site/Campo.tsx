import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";

import { cn } from "@/lib/utils";

const CAIXA =
  "block w-full rounded-[2px] border bg-papel px-4 text-[1rem] text-grafite transition-[border-color,box-shadow] duration-200 placeholder:text-cinza-claro focus:border-petroleo focus:shadow-[0_0_0_3px_rgb(0_63_92/0.12)] focus:outline-none disabled:opacity-60 aria-[invalid=true]:border-terracota-texto";

type Base = {
  rotulo: string;
  erro?: string;
  ajuda?: ReactNode;
  opcional?: boolean;
  escuro?: boolean;
};

function Moldura({
  id,
  rotulo,
  erro,
  ajuda,
  opcional,
  escuro,
  children,
}: Base & { id: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={id}
        className={cn("text-[0.875rem] font-medium", escuro ? "text-gelo/85" : "text-petroleo-900")}
      >
        {rotulo}
        {opcional && (
          <span className={cn("ml-1.5 font-normal", escuro ? "text-gelo/50" : "text-cinza")}>
            (opcional)
          </span>
        )}
      </label>
      {children}
      {erro ? (
        <p id={`${id}-erro`} role="alert" className="text-[0.8125rem] text-terracota-texto">
          {erro}
        </p>
      ) : ajuda ? (
        <p
          id={`${id}-ajuda`}
          className={cn("text-[0.8125rem]", escuro ? "text-gelo/55" : "text-cinza")}
        >
          {ajuda}
        </p>
      ) : null}
    </div>
  );
}

export const CampoTexto = forwardRef<
  HTMLInputElement,
  Base & InputHTMLAttributes<HTMLInputElement>
>(function CampoTexto({ rotulo, erro, ajuda, opcional, escuro, className, id, ...rest }, ref) {
  const gerado = useId();
  const cid = id ?? gerado;
  return (
    <Moldura id={cid} rotulo={rotulo} erro={erro} ajuda={ajuda} opcional={opcional} escuro={escuro}>
      <input
        ref={ref}
        id={cid}
        aria-invalid={!!erro}
        aria-describedby={erro ? `${cid}-erro` : ajuda ? `${cid}-ajuda` : undefined}
        className={cn(CAIXA, "h-11 border-linha-forte md:h-12", className)}
        {...rest}
      />
    </Moldura>
  );
});

export function CampoArea({
  rotulo,
  erro,
  ajuda,
  opcional,
  escuro,
  className,
  id,
  ...rest
}: Base & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const gerado = useId();
  const cid = id ?? gerado;
  return (
    <Moldura id={cid} rotulo={rotulo} erro={erro} ajuda={ajuda} opcional={opcional} escuro={escuro}>
      <textarea
        id={cid}
        aria-invalid={!!erro}
        aria-describedby={erro ? `${cid}-erro` : ajuda ? `${cid}-ajuda` : undefined}
        className={cn(
          CAIXA,
          "min-h-24 resize-y border-linha-forte py-3 leading-relaxed md:min-h-32",
          className,
        )}
        {...rest}
      />
    </Moldura>
  );
}

export function CampoSelecao({
  rotulo,
  erro,
  ajuda,
  opcional,
  escuro,
  className,
  id,
  opcoes,
  ...rest
}: Base & SelectHTMLAttributes<HTMLSelectElement> & { opcoes: string[] }) {
  const gerado = useId();
  const cid = id ?? gerado;
  return (
    <Moldura id={cid} rotulo={rotulo} erro={erro} ajuda={ajuda} opcional={opcional} escuro={escuro}>
      <select
        id={cid}
        aria-invalid={!!erro}
        className={cn(
          CAIXA,
          "h-11 appearance-none border-linha-forte md:h-12 bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='none'%3E%3Cpath stroke='%23003F5C' stroke-width='1.4' d='m1 1.5 5 5 5-5'/%3E%3C/svg%3E\")] bg-[length:12px_8px] bg-[position:right_1rem_center] bg-no-repeat pr-10",
          className,
        )}
        {...rest}
      >
        {opcoes.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </Moldura>
  );
}

/** Máscara leve de telefone brasileiro: (11) 97211-9531 */
export function mascararTelefone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}
