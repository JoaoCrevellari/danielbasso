/**
 * Editor genérico de campos.
 *
 * Recebe uma lista de `Field` (src/content/fields.ts) e os valores atuais, e devolve o
 * objeto inteiro alterado a cada mudança. Serve para coleções, páginas, configurações e
 * diagnóstico: um campo novo declarado no registro aparece aqui sem código extra.
 *
 * Erros vêm por caminho ("modulos.0.titulo"), gerados por `validarCampos`.
 */
import { ArrowDown, ArrowUp, CaretDown, CopySimple, Plus, Trash } from "@phosphor-icons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";

import { itemVazio, type Field, type Values } from "@/content/fields";
import { urlSegura } from "@/lib/url-segura";
import { cn } from "@/lib/utils";
import { useConfirmar } from "../Dialogo";
import { EASE, Interruptor, acao, acaoIcone, classeCampo, classeSelect, estiloSelect } from "../ui";
import { AreaTexto, Contador, Moldura, ariaCampo, texto } from "./base";
import { CampoImagem } from "./CampoImagem";
import { CampoMarkdown } from "./CampoMarkdown";

export type Erros = Record<string, string>;

// ── Validação ────────────────────────────────────────────────────────────────────
function vazio(v: unknown) {
  return (
    v === undefined ||
    v === null ||
    (typeof v === "string" && !v.trim()) ||
    (Array.isArray(v) && v.length === 0)
  );
}

export function validarCampos(campos: Field[], valores: Values, caminho = ""): Erros {
  const erros: Erros = {};
  for (const f of campos) {
    const p = caminho ? `${caminho}.${f.key}` : f.key;
    const v = valores?.[f.key];
    if (f.required && f.type !== "boolean" && vazio(v)) {
      erros[p] = "Preencha este campo.";
      continue;
    }
    if (
      (f.type === "text" || f.type === "textarea") &&
      f.max &&
      typeof v === "string" &&
      v.length > f.max
    ) {
      erros[p] = `Use no máximo ${f.max} caracteres.`;
    }
    if (f.type === "url" && typeof v === "string" && v.trim() && !urlSegura(v)) {
      erros[p] = "Informe um link completo (https://…) ou um caminho do site (/pagina).";
    }
    if (f.type === "number" && typeof v === "number") {
      if (f.min !== undefined && v < f.min) erros[p] = `O mínimo é ${f.min}.`;
      if (f.max !== undefined && v > f.max) erros[p] = `O máximo é ${f.max}.`;
    }
    if (f.type === "repeater" && Array.isArray(v)) {
      v.forEach((item, i) =>
        Object.assign(erros, validarCampos(f.fields, (item ?? {}) as Values, `${p}.${i}`)),
      );
    }
    if (f.type === "group") {
      Object.assign(erros, validarCampos(f.fields, (v ?? {}) as Values, p));
    }
  }
  return erros;
}

// ── Editor ───────────────────────────────────────────────────────────────────────
export function EditorCampos({
  campos,
  valores,
  onChange,
  erros = {},
  caminho = "",
}: {
  campos: Field[];
  valores: Values;
  onChange: (v: Values) => void;
  erros?: Erros;
  caminho?: string;
}) {
  const base = useId();
  return (
    <div className="grid grid-cols-1 gap-x-5 gap-y-6 md:grid-cols-2">
      {campos.map((f) => {
        const p = caminho ? `${caminho}.${f.key}` : f.key;
        return (
          <div key={f.key} className={cn("min-w-0", f.half ? "md:col-span-1" : "md:col-span-2")}>
            <Campo
              campo={f}
              id={`${base}-${f.key}`}
              valor={valores?.[f.key]}
              onChange={(v) => onChange({ ...valores, [f.key]: v })}
              erros={erros}
              caminho={p}
            />
          </div>
        );
      })}
    </div>
  );
}

function Campo({
  campo: f,
  id,
  valor,
  onChange,
  erros,
  caminho,
}: {
  campo: Field;
  id: string;
  valor: unknown;
  onChange: (v: unknown) => void;
  erros: Erros;
  caminho: string;
}) {
  const erro = erros[caminho];
  const a = ariaCampo(id, { ajuda: f.help, erro, obrigatorio: f.required });
  const moldura = { id, rotulo: f.label, obrigatorio: f.required, ajuda: f.help, erro };

  switch (f.type) {
    case "text": {
      const v = texto(valor);
      return (
        <Moldura
          {...moldura}
          contador={f.max ? <Contador atual={v.length} max={f.max} /> : undefined}
        >
          <input
            {...a}
            type="text"
            value={v}
            placeholder={f.placeholder}
            onChange={(e) => onChange(e.target.value)}
            className={classeCampo}
          />
        </Moldura>
      );
    }
    case "url":
      return (
        <Moldura {...moldura}>
          <input
            {...a}
            type="url"
            inputMode="url"
            value={texto(valor)}
            placeholder="https://"
            onChange={(e) => onChange(e.target.value)}
            className={classeCampo}
          />
        </Moldura>
      );
    case "number":
      return (
        <Moldura {...moldura}>
          <input
            {...a}
            type="number"
            inputMode="numeric"
            min={f.min}
            max={f.max}
            value={typeof valor === "number" ? valor : texto(valor)}
            onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
            className={classeCampo}
          />
        </Moldura>
      );
    case "date":
      return (
        <Moldura {...moldura}>
          <input
            {...a}
            type="date"
            value={texto(valor)}
            onChange={(e) => onChange(e.target.value)}
            className={classeCampo}
          />
        </Moldura>
      );
    case "textarea": {
      const v = texto(valor);
      return (
        <Moldura
          {...moldura}
          contador={f.max ? <Contador atual={v.length} max={f.max} /> : undefined}
        >
          <AreaTexto
            {...a}
            value={v}
            rows={f.rows ?? 3}
            onChange={(e) => onChange(e.target.value)}
          />
        </Moldura>
      );
    }
    case "markdown":
      return (
        <Moldura {...moldura}>
          <CampoMarkdown
            id={id}
            valor={texto(valor)}
            onChange={onChange}
            ajuda={f.help}
            erro={erro}
            obrigatorio={f.required}
          />
        </Moldura>
      );
    case "select":
      return (
        <Moldura {...moldura}>
          <select
            {...a}
            value={texto(valor)}
            onChange={(e) => onChange(e.target.value)}
            className={classeSelect}
            style={estiloSelect}
          >
            <option value="">{f.required ? "Selecione" : "Nenhum"}</option>
            {f.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Moldura>
      );
    case "boolean":
      return (
        <div className="rounded-[2px] border border-linha bg-papel px-4 py-2">
          <Interruptor
            id={id}
            ligado={valor === true}
            onChange={onChange}
            rotulo={f.label}
            descricao={f.help}
          />
        </div>
      );
    case "image":
      return (
        <Moldura {...moldura} comoGrupo>
          <CampoImagem
            id={id}
            valor={texto(valor)}
            onChange={onChange}
            aspecto={f.aspect}
            erro={erro}
          />
        </Moldura>
      );
    case "list":
      return (
        <Moldura {...moldura} comoGrupo>
          <CampoLista
            id={id}
            itens={Array.isArray(valor) ? valor.map(texto) : []}
            onChange={onChange}
            rotuloItem={f.itemLabel ?? "Item"}
          />
        </Moldura>
      );
    case "repeater":
      return (
        <Moldura {...moldura} comoGrupo>
          <CampoRepetidor
            campo={f}
            itens={Array.isArray(valor) ? (valor as Values[]) : []}
            onChange={onChange}
            erros={erros}
            caminho={caminho}
          />
        </Moldura>
      );
    case "group":
      return (
        <fieldset className="min-w-0 rounded-[2px] border border-linha bg-papel/60 px-4 pt-3 pb-5 md:px-5">
          <legend className="px-1.5 text-sm font-medium text-grafite">{f.label}</legend>
          {f.help && <p className="mb-4 text-[0.8125rem] text-cinza">{f.help}</p>}
          <EditorCampos
            campos={f.fields}
            valores={(valor && typeof valor === "object" ? valor : itemVazio(f.fields)) as Values}
            onChange={onChange}
            erros={erros}
            caminho={caminho}
          />
        </fieldset>
      );
  }
}

// ── Ids estáveis para listas (mantêm estado de abertura ao reordenar) ─────────────
let contadorIds = 0;
function novoId() {
  contadorIds += 1;
  return `i${contadorIds}`;
}
function useIds(tamanho: number) {
  const ids = useRef<string[]>([]);
  if (ids.current.length !== tamanho) {
    ids.current =
      ids.current.length < tamanho
        ? [...ids.current, ...Array.from({ length: tamanho - ids.current.length }, novoId)]
        : ids.current.slice(0, tamanho);
  }
  const mover = (de: number, para: number) => {
    const c = [...ids.current];
    const [x] = c.splice(de, 1);
    c.splice(para, 0, x);
    ids.current = c;
  };
  const inserir = (pos: number) => {
    const c = [...ids.current];
    const id = novoId();
    c.splice(pos, 0, id);
    ids.current = c;
    return id;
  };
  const remover = (pos: number) => {
    ids.current = ids.current.filter((_, i) => i !== pos);
  };
  return { ids: ids.current, mover, inserir, remover };
}

function mover<T>(lista: T[], de: number, para: number): T[] {
  const c = [...lista];
  const [x] = c.splice(de, 1);
  c.splice(para, 0, x);
  return c;
}

// ── Lista de textos ──────────────────────────────────────────────────────────────
function CampoLista({
  id,
  itens,
  onChange,
  rotuloItem,
}: {
  id: string;
  itens: string[];
  onChange: (v: string[]) => void;
  rotuloItem: string;
}) {
  const { ids, mover: moverId, inserir, remover } = useIds(itens.length);
  const reduzir = useReducedMotion();
  const refs = useRef<Record<string, HTMLInputElement | null>>({});
  const focar = useRef<string | null>(null);

  return (
    <div>
      {itens.length > 0 && (
        <ul className="space-y-2">
          <AnimatePresence initial={false}>
            {itens.map((item, i) => (
              <motion.li
                key={ids[i]}
                layout={!reduzir}
                initial={reduzir ? false : { opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduzir ? { opacity: 0 } : { opacity: 0, height: 0 }}
                transition={{ duration: 0.2, ease: EASE }}
                className="flex items-center gap-1"
              >
                <label htmlFor={`${id}-${ids[i]}`} className="sr-only">
                  {rotuloItem} {i + 1}
                </label>
                <input
                  id={`${id}-${ids[i]}`}
                  ref={(el) => {
                    refs.current[ids[i]] = el;
                    if (el && focar.current === ids[i]) {
                      el.focus();
                      focar.current = null;
                    }
                  }}
                  type="text"
                  value={item}
                  onChange={(e) => onChange(itens.map((x, k) => (k === i ? e.target.value : x)))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      focar.current = inserir(i + 1);
                      onChange([...itens.slice(0, i + 1), "", ...itens.slice(i + 1)]);
                    }
                  }}
                  className={classeCampo}
                />
                <div className="flex shrink-0">
                  <button
                    type="button"
                    className={acaoIcone(true)}
                    aria-label={`Subir ${rotuloItem.toLowerCase()} ${i + 1}`}
                    disabled={i === 0}
                    onClick={() => {
                      moverId(i, i - 1);
                      onChange(mover(itens, i, i - 1));
                    }}
                  >
                    <ArrowUp aria-hidden className="size-4" />
                  </button>
                  <button
                    type="button"
                    className={acaoIcone(true)}
                    aria-label={`Descer ${rotuloItem.toLowerCase()} ${i + 1}`}
                    disabled={i === itens.length - 1}
                    onClick={() => {
                      moverId(i, i + 1);
                      onChange(mover(itens, i, i + 1));
                    }}
                  >
                    <ArrowDown aria-hidden className="size-4" />
                  </button>
                  <button
                    type="button"
                    className={acaoIcone(true, "text-terracota-texto hover:bg-terracota/10")}
                    aria-label={`Remover ${rotuloItem.toLowerCase()} ${i + 1}`}
                    onClick={() => {
                      remover(i);
                      onChange(itens.filter((_, k) => k !== i));
                    }}
                  >
                    <Trash aria-hidden className="size-4" />
                  </button>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
      <button
        type="button"
        className={acao("secundario", "sm", itens.length ? "mt-3" : "")}
        onClick={() => {
          focar.current = inserir(itens.length);
          onChange([...itens, ""]);
        }}
      >
        <Plus aria-hidden className="size-4" />
        Adicionar {rotuloItem.toLowerCase()}
      </button>
    </div>
  );
}

// ── Repetidor (itens com subcampos) ────────────────────────────────────────────────
function resumoItem(campo: Extract<Field, { type: "repeater" }>, item: Values): string {
  const chave =
    campo.summaryKey ?? campo.fields.find((f) => f.type === "text" || f.type === "textarea")?.key;
  if (!chave) return "";
  const v = item?.[chave];
  const sub = campo.fields.find((f) => f.key === chave);
  if (sub?.type === "select") return sub.options.find((o) => o.value === v)?.label ?? "";
  return texto(v).replace(/\*/g, "").slice(0, 90);
}

function CampoRepetidor({
  campo,
  itens,
  onChange,
  erros,
  caminho,
}: {
  campo: Extract<Field, { type: "repeater" }>;
  itens: Values[];
  onChange: (v: Values[]) => void;
  erros: Erros;
  caminho: string;
}) {
  const { ids, mover: moverId, inserir, remover } = useIds(itens.length);
  const [abertos, setAbertos] = useState<Set<string>>(() => new Set());
  const reduzir = useReducedMotion();
  const confirmar = useConfirmar();
  const base = useId();
  const rotulo = campo.itemLabel;

  // Depois de validar, abre os itens que têm campos a corrigir.
  const assinaturaErros = Object.keys(erros)
    .filter((k) => k.startsWith(`${caminho}.`))
    .join("|");
  useEffect(() => {
    if (!assinaturaErros) return;
    const indices = new Set(
      assinaturaErros.split("|").map((k) => Number(k.slice(caminho.length + 1).split(".")[0])),
    );
    setAbertos((s) => {
      const n = new Set(s);
      indices.forEach((i) => ids[i] && n.add(ids[i]));
      return n;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assinaturaErros]);

  const alternar = (id: string) =>
    setAbertos((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const abrir = (id: string) => setAbertos((s) => new Set(s).add(id));

  return (
    <div>
      {itens.length === 0 && (
        <p className="mb-3 rounded-[2px] border border-dashed border-linha-forte px-4 py-5 text-center text-sm text-cinza">
          Lista vazia. Use o botão abaixo para adicionar.
        </p>
      )}
      <ul className="space-y-2">
        <AnimatePresence initial={false}>
          {itens.map((item, i) => {
            const id = ids[i];
            const aberto = abertos.has(id);
            const resumo = resumoItem(campo, item);
            const temErro = Object.keys(erros).some((k) => k.startsWith(`${caminho}.${i}.`));
            const idPainel = `${base}-${id}`;
            return (
              <motion.li
                key={id}
                layout={!reduzir}
                initial={reduzir ? false : { opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduzir ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.22, ease: EASE }}
                className={cn(
                  "rounded-[2px] border bg-papel",
                  temErro ? "border-terracota/60" : "border-linha",
                )}
              >
                <div className="flex items-center gap-1 pr-1">
                  <button
                    type="button"
                    onClick={() => alternar(id)}
                    aria-expanded={aberto}
                    aria-controls={idPainel}
                    className="flex min-h-12 min-w-0 flex-1 items-center gap-3 px-3.5 text-left"
                  >
                    <CaretDown
                      aria-hidden
                      className={cn(
                        "size-4 shrink-0 text-cinza transition-transform duration-200",
                        !aberto && "-rotate-90",
                      )}
                    />
                    <span className="shrink-0 text-xs font-medium text-cinza tabular-nums">
                      {i + 1}
                    </span>
                    <span
                      className={cn(
                        "min-w-0 truncate text-sm",
                        resumo ? "text-grafite" : "text-cinza italic",
                      )}
                    >
                      {resumo || `${rotulo} sem título`}
                    </span>
                    {temErro && <span className="sr-only">(tem campos a corrigir)</span>}
                  </button>
                  <div className="flex shrink-0">
                    <button
                      type="button"
                      className={acaoIcone(true, "hidden sm:inline-flex")}
                      aria-label={`Subir ${rotulo.toLowerCase()} ${i + 1}`}
                      disabled={i === 0}
                      onClick={() => {
                        moverId(i, i - 1);
                        onChange(mover(itens, i, i - 1));
                      }}
                    >
                      <ArrowUp aria-hidden className="size-4" />
                    </button>
                    <button
                      type="button"
                      className={acaoIcone(true, "hidden sm:inline-flex")}
                      aria-label={`Descer ${rotulo.toLowerCase()} ${i + 1}`}
                      disabled={i === itens.length - 1}
                      onClick={() => {
                        moverId(i, i + 1);
                        onChange(mover(itens, i, i + 1));
                      }}
                    >
                      <ArrowDown aria-hidden className="size-4" />
                    </button>
                    <button
                      type="button"
                      className={acaoIcone(true, "hidden sm:inline-flex")}
                      aria-label={`Duplicar ${rotulo.toLowerCase()} ${i + 1}`}
                      onClick={() => {
                        const novo = inserir(i + 1);
                        abrir(novo);
                        onChange([
                          ...itens.slice(0, i + 1),
                          structuredClone(item),
                          ...itens.slice(i + 1),
                        ]);
                      }}
                    >
                      <CopySimple aria-hidden className="size-4" />
                    </button>
                    <button
                      type="button"
                      className={acaoIcone(true, "text-terracota-texto hover:bg-terracota/10")}
                      aria-label={`Remover ${rotulo.toLowerCase()} ${i + 1}`}
                      onClick={async () => {
                        const temConteudo = Object.values(item ?? {}).some(
                          (v) => !vazio(v) && v !== false,
                        );
                        if (
                          temConteudo &&
                          !(await confirmar({
                            titulo: `Remover ${rotulo.toLowerCase()} ${i + 1}?`,
                            descricao: resumo
                              ? `"${resumo}" sai da lista. A mudança só vale depois de salvar.`
                              : "O item sai da lista. A mudança só vale depois de salvar.",
                            confirmar: "Remover",
                            perigo: true,
                          }))
                        )
                          return;
                        remover(i);
                        onChange(itens.filter((_, k) => k !== i));
                      }}
                    >
                      <Trash aria-hidden className="size-4" />
                    </button>
                  </div>
                </div>
                <AnimatePresence initial={false}>
                  {aberto && (
                    <motion.div
                      id={idPainel}
                      initial={reduzir ? { opacity: 0 } : { height: 0, opacity: 0 }}
                      animate={reduzir ? { opacity: 1 } : { height: "auto", opacity: 1 }}
                      exit={reduzir ? { opacity: 0 } : { height: 0, opacity: 0 }}
                      transition={{ duration: 0.24, ease: EASE }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-linha px-3.5 pt-4 pb-5 md:px-5">
                        <EditorCampos
                          campos={campo.fields}
                          valores={item ?? {}}
                          onChange={(v) => onChange(itens.map((x, k) => (k === i ? v : x)))}
                          erros={erros}
                          caminho={`${caminho}.${i}`}
                        />
                        {/* No celular, as ações de ordem ficam aqui dentro (a linha do título é estreita). */}
                        <div className="mt-5 flex flex-wrap gap-2 sm:hidden">
                          <button
                            type="button"
                            className={acao("secundario", "sm")}
                            disabled={i === 0}
                            onClick={() => {
                              moverId(i, i - 1);
                              onChange(mover(itens, i, i - 1));
                            }}
                          >
                            <ArrowUp aria-hidden className="size-4" /> Subir
                          </button>
                          <button
                            type="button"
                            className={acao("secundario", "sm")}
                            disabled={i === itens.length - 1}
                            onClick={() => {
                              moverId(i, i + 1);
                              onChange(mover(itens, i, i + 1));
                            }}
                          >
                            <ArrowDown aria-hidden className="size-4" /> Descer
                          </button>
                          <button
                            type="button"
                            className={acao("secundario", "sm")}
                            onClick={() => {
                              const novo = inserir(i + 1);
                              abrir(novo);
                              onChange([
                                ...itens.slice(0, i + 1),
                                structuredClone(item),
                                ...itens.slice(i + 1),
                              ]);
                            }}
                          >
                            <CopySimple aria-hidden className="size-4" /> Duplicar
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
      <button
        type="button"
        className={acao("secundario", "sm", "mt-3")}
        onClick={() => {
          const novo = inserir(itens.length);
          abrir(novo);
          onChange([...itens, itemVazio(campo.fields)]);
        }}
      >
        <Plus aria-hidden className="size-4" />
        Adicionar {rotulo.toLowerCase()}
      </button>
    </div>
  );
}
