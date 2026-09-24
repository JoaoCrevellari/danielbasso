/**
 * Campo de imagem: enviar (otimiza para WebP no navegador), escolher da biblioteca,
 * colar URL, trocar e remover. Guarda só a URL pública.
 */
import {
  Image as IconeImagem,
  Images,
  LinkSimple,
  Trash,
  UploadSimple,
} from "@phosphor-icons/react";
import { useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";

import { enviarArquivo } from "@/lib/admin/midia";
import { mensagemErro } from "@/lib/admin/formato";
import { urlSegura } from "@/lib/url-segura";
import { cn } from "@/lib/utils";
import { BibliotecaMidia } from "../BibliotecaMidia";
import { QK } from "../contexto";
import { useToast } from "../Toast";
import { Girando, acao, classeCampo } from "../ui";

export function CampoImagem({
  id,
  valor,
  onChange,
  aspecto,
  erro,
}: {
  id: string;
  valor: string;
  onChange: (v: string) => void;
  aspecto?: string;
  erro?: string;
}) {
  const [enviando, setEnviando] = useState(false);
  const [biblioteca, setBiblioteca] = useState(false);
  const [colar, setColar] = useState(false);
  const [url, setUrl] = useState("");
  const [arrastando, setArrastando] = useState(false);
  const [quebrada, setQuebrada] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const qc = useQueryClient();

  async function enviar(f?: File | null) {
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      toast.erro("Escolha um arquivo de imagem (JPG, PNG, WebP, AVIF, GIF ou SVG).");
      return;
    }
    setEnviando(true);
    try {
      const novo = await enviarArquivo(f);
      setQuebrada(false);
      onChange(novo.url);
      qc.invalidateQueries({ queryKey: QK.midia });
      toast.sucesso("Imagem enviada.");
    } catch (e) {
      toast.erro(mensagemErro(e));
    } finally {
      setEnviando(false);
      if (input.current) input.current.value = "";
    }
  }

  function aplicarUrl() {
    const segura = urlSegura(url);
    if (!segura) {
      toast.erro("Cole um link que comece com https:// ou um caminho do site (/imagem.jpg).");
      return;
    }
    setQuebrada(false);
    onChange(segura);
    setUrl("");
    setColar(false);
  }

  const ratio = aspecto?.replace(":", "/") ?? "16/9";

  return (
    <div>
      <div
        className={cn(
          "relative flex max-w-md items-center justify-center overflow-hidden rounded-[2px] border bg-gelo-2 transition-colors",
          arrastando
            ? "border-petroleo border-dashed bg-petroleo-50"
            : erro
              ? "border-terracota"
              : "border-linha",
        )}
        style={{ aspectRatio: ratio }}
        onDragOver={(e) => {
          e.preventDefault();
          setArrastando(true);
        }}
        onDragLeave={() => setArrastando(false)}
        onDrop={(e) => {
          e.preventDefault();
          setArrastando(false);
          enviar(e.dataTransfer.files?.[0]);
        }}
      >
        {valor && !quebrada ? (
          <img
            src={valor}
            alt="Prévia da imagem escolhida"
            className="size-full object-cover"
            onError={() => setQuebrada(true)}
          />
        ) : (
          <div className="flex flex-col items-center gap-2 px-6 text-center text-sm text-cinza">
            <IconeImagem aria-hidden className="size-7 text-petroleo/50" />
            {quebrada
              ? "Não foi possível carregar esta imagem. Confira o link."
              : "Arraste uma imagem para cá ou use os botões abaixo."}
          </div>
        )}
        {enviando && (
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-papel/80 text-sm text-petroleo">
            <Girando /> Otimizando e enviando…
          </div>
        )}
      </div>

      <div className="mt-2.5 flex flex-wrap gap-2">
        <button
          id={id}
          type="button"
          className={acao("secundario", "sm")}
          onClick={() => input.current?.click()}
          disabled={enviando}
        >
          <UploadSimple aria-hidden className="size-4" />
          {valor ? "Trocar" : "Enviar"}
        </button>
        <button
          type="button"
          className={acao("fantasma", "sm")}
          onClick={() => setBiblioteca(true)}
        >
          <Images aria-hidden className="size-4" />
          Biblioteca
        </button>
        <button
          type="button"
          className={acao("fantasma", "sm")}
          onClick={() => setColar((c) => !c)}
          aria-expanded={colar}
        >
          <LinkSimple aria-hidden className="size-4" />
          Colar link
        </button>
        {valor && (
          <button
            type="button"
            className={acao("fantasma", "sm", "text-terracota-texto")}
            onClick={() => onChange("")}
          >
            <Trash aria-hidden className="size-4" />
            Remover
          </button>
        )}
      </div>

      {colar && (
        <div className="mt-2.5 flex max-w-md gap-2">
          <label className="sr-only" htmlFor={`${id}-url`}>
            Link da imagem
          </label>
          <input
            id={`${id}-url`}
            type="url"
            inputMode="url"
            placeholder="https://"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                aplicarUrl();
              }
            }}
            className={classeCampo}
            autoFocus
          />
          <button type="button" className={acao("primario", "sm")} onClick={aplicarUrl}>
            Usar
          </button>
        </div>
      )}

      <input
        ref={input}
        type="file"
        accept="image/*"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => enviar(e.target.files?.[0])}
      />
      <BibliotecaMidia
        aberto={biblioteca}
        onFechar={() => setBiblioteca(false)}
        selecionado={valor}
        onEscolher={(a) => {
          setQuebrada(false);
          onChange(a.url);
        }}
      />
    </div>
  );
}
