/**
 * Linguagem de campos do painel.
 *
 * Todo formulário do admin (coleções, textos das páginas, configurações, diagnóstico)
 * é gerado a partir destas definições. Para um campo novo aparecer no painel e ficar
 * disponível para o site, basta declará-lo no registro da coleção ou da página:
 * não há migration nem tela nova a escrever.
 */
export type Option = { value: string; label: string };

type Base = {
  key: string;
  label: string;
  help?: string;
  required?: boolean;
  /** Ocupa meia largura no formulário (em telas largas). */
  half?: boolean;
};

export type Field =
  | (Base & { type: "text"; placeholder?: string; max?: number })
  | (Base & { type: "textarea"; rows?: number; max?: number })
  | (Base & { type: "markdown" })
  | (Base & { type: "image"; aspect?: string })
  | (Base & { type: "url" })
  | (Base & { type: "number"; min?: number; max?: number })
  | (Base & { type: "select"; options: Option[] })
  | (Base & { type: "boolean" })
  | (Base & { type: "date" })
  | (Base & { type: "list"; itemLabel?: string })
  | (Base & { type: "repeater"; fields: Field[]; itemLabel: string; summaryKey?: string })
  /** Objeto com subcampos (ex.: botão = rótulo + link). */
  | (Base & { type: "group"; fields: Field[] });

export type FieldGroup = {
  key: string;
  label: string;
  help?: string;
  fields: Field[];
};

export type Values = Record<string, unknown>;

/** Mescla valores salvos sobre o padrão: objetos campo a campo, listas por inteiro. */
export function mesclar<T>(padrao: T, salvo: unknown): T {
  if (salvo === undefined || salvo === null) return padrao;
  if (Array.isArray(padrao)) return (Array.isArray(salvo) ? salvo : padrao) as T;
  if (isObj(padrao) && isObj(salvo)) {
    const out: Record<string, unknown> = { ...padrao };
    for (const [k, v] of Object.entries(salvo)) {
      out[k] = k in padrao ? mesclar((padrao as Record<string, unknown>)[k], v) : v;
    }
    return out as T;
  }
  return (typeof salvo === typeof padrao || padrao === undefined ? salvo : padrao) as T;
}

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** Valor vazio para um campo (usado ao adicionar itens em listas e repetidores). */
export function valorVazio(field: Field): unknown {
  switch (field.type) {
    case "boolean":
      return false;
    case "number":
      return null;
    case "list":
      return [];
    case "repeater":
      return [];
    case "group":
      return itemVazio(field.fields);
    default:
      return "";
  }
}

export function itemVazio(fields: Field[]): Values {
  return Object.fromEntries(fields.map((f) => [f.key, valorVazio(f)]));
}

export const ETAPAS: Option[] = [
  { value: "reconstrucao", label: "Reconstrução" },
  { value: "autogoverno", label: "Autogoverno" },
  { value: "transformacao", label: "Transformação" },
  { value: "lideranca", label: "Liderança" },
  { value: "performance", label: "Performance" },
];

export function nomeEtapa(valor: unknown): string | undefined {
  return ETAPAS.find((e) => e.value === valor)?.label;
}
