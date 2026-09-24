/**
 * Editor de markdown: barra de formatação (negrito, itálico, título, lista, link,
 * citação) e abas Escrever/Visualizar. A prévia usa o mesmo estilo de prosa do site.
 */
import {
  LinkSimple,
  ListBullets,
  Quotes,
  TextB,
  TextHTwo,
  TextItalic,
  type Icon,
} from "@phosphor-icons/react";
import { useId, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/utils";
import { AreaTexto, ariaCampo } from "./base";

type Acao = { chave: string; rotulo: string; icone: Icon; atalho?: string };
const ACOES: Acao[] = [
  { chave: "negrito", rotulo: "Negrito", icone: TextB, atalho: "Ctrl+B" },
  { chave: "italico", rotulo: "Itálico", icone: TextItalic, atalho: "Ctrl+I" },
  { chave: "titulo", rotulo: "Intertítulo", icone: TextHTwo },
  { chave: "lista", rotulo: "Lista", icone: ListBullets },
  { chave: "link", rotulo: "Link", icone: LinkSimple, atalho: "Ctrl+K" },
  { chave: "citacao", rotulo: "Citação", icone: Quotes },
];

function aplicar(
  texto: string,
  ini: number,
  fim: number,
  acao: string,
): { texto: string; sel: [number, number] } {
  const sel = texto.slice(ini, fim);
  const envolver = (a: string, b = a, padrao = "texto") => {
    const miolo = sel || padrao;
    const novo = texto.slice(0, ini) + a + miolo + b + texto.slice(fim);
    return {
      texto: novo,
      sel: [ini + a.length, ini + a.length + miolo.length] as [number, number],
    };
  };
  const prefixarLinhas = (prefixo: string) => {
    const inicioLinha = texto.lastIndexOf("\n", ini - 1) + 1;
    const fimLinha = (() => {
      const i = texto.indexOf("\n", fim);
      return i === -1 ? texto.length : i;
    })();
    const bloco = texto.slice(inicioLinha, fimLinha);
    const linhas = bloco.split("\n");
    const todas = linhas.every((l) => l.startsWith(prefixo));
    const novoBloco = linhas
      .map((l) => (todas ? l.slice(prefixo.length) : l ? prefixo + l : l))
      .join("\n");
    const novo = texto.slice(0, inicioLinha) + (novoBloco || prefixo) + texto.slice(fimLinha);
    return {
      texto: novo,
      sel: [inicioLinha, inicioLinha + (novoBloco || prefixo).length] as [number, number],
    };
  };
  switch (acao) {
    case "negrito":
      return envolver("**");
    case "italico":
      return envolver("*");
    case "titulo":
      return prefixarLinhas("## ");
    case "lista":
      return prefixarLinhas("- ");
    case "citacao":
      return prefixarLinhas("> ");
    case "link": {
      const miolo = sel || "texto do link";
      const url = "https://";
      const novo = `${texto.slice(0, ini)}[${miolo}](${url})${texto.slice(fim)}`;
      const inicioUrl = ini + miolo.length + 3;
      return { texto: novo, sel: [inicioUrl, inicioUrl + url.length] };
    }
    default:
      return { texto, sel: [ini, fim] };
  }
}

export function CampoMarkdown({
  id,
  valor,
  onChange,
  ajuda,
  erro,
  obrigatorio,
}: {
  id: string;
  valor: string;
  onChange: (v: string) => void;
  ajuda?: unknown;
  erro?: string;
  obrigatorio?: boolean;
}) {
  const [aba, setAba] = useState<"escrever" | "ver">("escrever");
  const ref = useRef<HTMLTextAreaElement>(null);
  const idAbas = useId();

  function executar(acao: string) {
    const el = ref.current;
    if (!el) return;
    const r = aplicar(valor, el.selectionStart, el.selectionEnd, acao);
    onChange(r.texto);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(r.sel[0], r.sel[1]);
    });
  }

  return (
    <div className="rounded-[2px] border border-linha-forte bg-papel focus-within:border-petroleo">
      <div className="flex flex-wrap items-center justify-between gap-1 border-b border-linha px-1.5 py-1">
        <div role="tablist" aria-label="Modo do editor" className="flex">
          {(["escrever", "ver"] as const).map((a) => (
            <button
              key={a}
              type="button"
              role="tab"
              id={`${idAbas}-${a}`}
              aria-selected={aba === a}
              aria-controls={`${idAbas}-painel`}
              onClick={() => setAba(a)}
              className={cn(
                "min-h-10 rounded-full px-3.5 text-sm transition-colors md:min-h-8",
                aba === a
                  ? "bg-petroleo-50 font-medium text-petroleo"
                  : "text-cinza hover:text-petroleo",
              )}
            >
              {a === "escrever" ? "Escrever" : "Visualizar"}
            </button>
          ))}
        </div>
        {aba === "escrever" && (
          <div role="toolbar" aria-label="Formatação" aria-controls={id} className="flex flex-wrap">
            {ACOES.map((a) => {
              const Icone = a.icone;
              return (
                <button
                  key={a.chave}
                  type="button"
                  onClick={() => executar(a.chave)}
                  aria-label={a.rotulo}
                  title={a.atalho ? `${a.rotulo} (${a.atalho})` : a.rotulo}
                  className="inline-flex size-10 items-center justify-center rounded-full text-cinza transition-colors hover:bg-petroleo/[0.07] hover:text-petroleo md:size-8"
                >
                  <Icone aria-hidden weight="bold" className="size-4" />
                </button>
              );
            })}
          </div>
        )}
      </div>
      <div id={`${idAbas}-painel`} role="tabpanel" aria-labelledby={`${idAbas}-${aba}`}>
        {aba === "escrever" ? (
          <AreaTexto
            ref={ref}
            {...ariaCampo(id, { ajuda, erro, obrigatorio })}
            value={valor}
            rows={8}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (!(e.ctrlKey || e.metaKey)) return;
              const k = e.key.toLowerCase();
              if (k === "b" || k === "i" || k === "k") {
                e.preventDefault();
                executar(k === "b" ? "negrito" : k === "i" ? "italico" : "link");
              }
            }}
            className="min-h-48 border-0 font-mono text-[0.875rem] focus:shadow-none"
          />
        ) : (
          <div className="prosa min-h-48 px-4 py-3 text-[0.9375rem]">
            {valor.trim() ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{valor}</ReactMarkdown>
            ) : (
              <p className="text-cinza">Nada para visualizar ainda.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
