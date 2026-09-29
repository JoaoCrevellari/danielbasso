/**
 * Escolha do pacote da LP (.zip com index.html + assets/, ou um .html) e o relatório de
 * conferência com o padrão. Não envia nada: devolve os arquivos lidos para quem usa.
 */
import {
  CheckCircle,
  FileZip,
  Info,
  UploadSimple,
  WarningCircle,
  XCircle,
} from "@phosphor-icons/react";
import { useRef, useState } from "react";

import { Girando } from "@/components/admin/ui";
import { mensagemErro } from "@/lib/admin/formato";
import {
  conferirPacote,
  lerPacote,
  tamanhoLegivel,
  type ArquivoPacote,
} from "@/lib/admin/lp-pacote";
import type { ItemConformidade } from "@/lib/admin/lps.functions";
import { cn } from "@/lib/utils";

export type PacoteLido = {
  nome: string;
  arquivos: ArquivoPacote[];
  conformidade: ItemConformidade[];
};

export function EscolherPacote({
  pacote,
  onPacote,
  dominiosExtras,
  desabilitado,
}: {
  pacote: PacoteLido | null;
  onPacote: (p: PacoteLido | null) => void;
  dominiosExtras?: string[];
  desabilitado?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [lendo, setLendo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [arrastando, setArrastando] = useState(false);

  async function ler(arquivo: File | undefined) {
    if (!arquivo) return;
    setErro(null);
    setLendo(true);
    onPacote(null);
    try {
      const arquivos = await lerPacote(arquivo);
      onPacote({
        nome: arquivo.name,
        arquivos,
        conformidade: conferirPacote(arquivos, dominiosExtras),
      });
    } catch (e) {
      setErro(mensagemErro(e));
    } finally {
      setLendo(false);
      if (input.current) input.current.value = "";
    }
  }

  const total = pacote?.arquivos.reduce((s, a) => s + a.tamanho, 0) ?? 0;

  return (
    <div className="space-y-3">
      <button
        type="button"
        disabled={desabilitado || lendo}
        onClick={() => input.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setArrastando(true);
        }}
        onDragLeave={() => setArrastando(false)}
        onDrop={(e) => {
          e.preventDefault();
          setArrastando(false);
          ler(e.dataTransfer.files[0]);
        }}
        className={cn(
          "flex w-full flex-col items-center justify-center gap-1.5 rounded-[2px] border border-dashed px-5 py-7 text-center transition-colors disabled:opacity-60",
          arrastando
            ? "border-petroleo bg-petroleo-50"
            : "border-linha-forte bg-papel/60 hover:border-petroleo/50",
        )}
      >
        {lendo ? (
          <Girando className="size-6 text-petroleo" />
        ) : pacote ? (
          <FileZip aria-hidden className="size-7 text-petroleo" />
        ) : (
          <UploadSimple aria-hidden className="size-7 text-petroleo" />
        )}
        <span className="text-sm font-medium text-grafite">
          {lendo
            ? "Lendo o pacote…"
            : pacote
              ? pacote.nome
              : "Arraste o .zip da LP ou clique para escolher"}
        </span>
        <span className="text-xs text-cinza">
          {pacote
            ? `${pacote.arquivos.length} arquivo(s) · ${tamanhoLegivel(total)} · clique para trocar`
            : ".zip com index.html e a pasta assets/, ou um único .html"}
        </span>
      </button>
      <input
        ref={input}
        type="file"
        accept=".zip,.html,.htm,application/zip,text/html"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => ler(e.target.files?.[0])}
      />
      {erro && (
        <p role="alert" className="flex items-start gap-2 text-sm font-medium text-terracota-texto">
          <XCircle aria-hidden weight="fill" className="mt-0.5 size-4 shrink-0" />
          {erro}
        </p>
      )}
      {pacote && <ListaConformidade itens={pacote.conformidade} />}
    </div>
  );
}

/** Resultado da conferência: erros primeiro, depois avisos, depois o que está certo. */
export function ListaConformidade({
  itens,
  compacta,
}: {
  itens: ItemConformidade[];
  compacta?: boolean;
}) {
  if (!itens.length) return null;
  const ordem = { erro: 0, aviso: 1, ok: 2 } as const;
  const lista = [...itens].sort((a, b) => ordem[a.nivel] - ordem[b.nivel]);
  const erros = itens.filter((i) => i.nivel === "erro").length;
  const avisos = itens.filter((i) => i.nivel === "aviso").length;
  return (
    <div className="rounded-[2px] border border-linha bg-papel">
      <p
        className={cn(
          "flex items-center gap-2 border-b border-linha px-4 py-2.5 text-sm font-medium",
          erros ? "text-terracota-texto" : avisos ? "text-ouro-texto" : "text-salvia-texto",
        )}
      >
        {erros ? (
          <XCircle aria-hidden weight="fill" className="size-4" />
        ) : avisos ? (
          <WarningCircle aria-hidden weight="fill" className="size-4" />
        ) : (
          <CheckCircle aria-hidden weight="fill" className="size-4" />
        )}
        {erros
          ? `${erros} problema(s) a corrigir com o time de lançamentos`
          : avisos
            ? `Dentro do padrão, com ${avisos} ponto(s) de atenção`
            : "Tudo dentro do padrão"}
      </p>
      <ul
        className={cn(
          "divide-y divide-linha text-sm",
          compacta ? "max-h-64 overflow-y-auto" : "max-h-80 overflow-y-auto",
        )}
      >
        {lista.map((i, k) => (
          <li key={k} className="flex items-start gap-2.5 px-4 py-2">
            {i.nivel === "erro" ? (
              <XCircle
                aria-label="Erro"
                weight="fill"
                className="mt-0.5 size-4 shrink-0 text-terracota"
              />
            ) : i.nivel === "aviso" ? (
              <Info
                aria-label="Atenção"
                weight="fill"
                className="mt-0.5 size-4 shrink-0 text-ouro"
              />
            ) : (
              <CheckCircle
                aria-label="Certo"
                weight="fill"
                className="mt-0.5 size-4 shrink-0 text-salvia"
              />
            )}
            <span className="text-grafite">{i.texto}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
