/**
 * Seletor da biblioteca de mídia (modal): buscar, enviar e escolher uma imagem.
 */
import { Check, Images, UploadSimple } from "@phosphor-icons/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useRef, useState } from "react";

import { enviarArquivo, listarMidia, type ArquivoMidia } from "@/lib/admin/midia";
import { mensagemErro } from "@/lib/admin/formato";
import { cn } from "@/lib/utils";
import { QK } from "./contexto";
import { Modal } from "./Dialogo";
import { useToast } from "./Toast";
import { CampoBusca, Esqueleto, EstadoErro, EstadoVazio, Girando, acao } from "./ui";

export function useMidia(ativo = true) {
  return useQuery({ queryKey: QK.midia, queryFn: listarMidia, enabled: ativo, staleTime: 60_000 });
}

export function BibliotecaMidia({
  aberto,
  onFechar,
  onEscolher,
  selecionado,
}: {
  aberto: boolean;
  onFechar: () => void;
  onEscolher: (arquivo: ArquivoMidia) => void;
  selecionado?: string;
}) {
  const q = useMidia(aberto);
  const qc = useQueryClient();
  const toast = useToast();
  const [busca, setBusca] = useState("");
  const [enviando, setEnviando] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const imagens = useMemo(() => {
    const t = busca.trim().toLowerCase();
    return (q.data ?? []).filter((a) => a.imagem && (!t || a.caminho.toLowerCase().includes(t)));
  }, [q.data, busca]);

  async function enviar(arquivos: FileList | null) {
    if (!arquivos?.length) return;
    setEnviando(true);
    try {
      const f = arquivos[0];
      const novo = await enviarArquivo(f);
      await qc.invalidateQueries({ queryKey: QK.midia });
      onEscolher(novo);
      toast.sucesso("Imagem enviada.");
      onFechar();
    } catch (e) {
      toast.erro(mensagemErro(e));
    } finally {
      setEnviando(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <Modal
      aberto={aberto}
      onFechar={onFechar}
      titulo="Biblioteca de mídia"
      descricao="Escolha uma imagem já enviada ou envie uma nova."
      largura="max-w-3xl"
    >
      <div className="flex flex-col gap-3 sm:flex-row">
        <CampoBusca valor={busca} onChange={setBusca} rotulo="Buscar por nome" className="flex-1" />
        <button
          type="button"
          className={acao("secundario")}
          onClick={() => input.current?.click()}
          disabled={enviando}
        >
          {enviando ? <Girando /> : <UploadSimple aria-hidden className="size-4" />}
          {enviando ? "Enviando…" : "Enviar imagem"}
        </button>
        <input
          ref={input}
          type="file"
          accept="image/*"
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onChange={(e) => enviar(e.target.files)}
        />
      </div>

      <div className="mt-4">
        {q.isPending ? (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
            {Array.from({ length: 10 }, (_, i) => (
              <Esqueleto key={i} className="aspect-square" />
            ))}
          </div>
        ) : q.isError ? (
          <EstadoErro mensagem={mensagemErro(q.error)} onTentar={() => q.refetch()} />
        ) : imagens.length === 0 ? (
          <EstadoVazio
            icone={<Images />}
            titulo={busca ? "Nenhuma imagem com esse nome" : "A biblioteca está vazia"}
            texto={busca ? "Tente outro termo." : "Envie a primeira imagem pelo botão acima."}
          />
        ) : (
          <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
            {imagens.map((a) => {
              const marcado = a.url === selecionado;
              return (
                <li key={a.caminho}>
                  <button
                    type="button"
                    onClick={() => {
                      onEscolher(a);
                      onFechar();
                    }}
                    aria-label={`Escolher ${a.nome}`}
                    aria-pressed={marcado}
                    className={cn(
                      "group relative block aspect-square w-full overflow-hidden rounded-[2px] bg-gelo-2 ring-offset-2 transition-shadow",
                      marcado ? "ring-2 ring-petroleo" : "hover:ring-2 hover:ring-petroleo/40",
                    )}
                  >
                    <img
                      src={a.url}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                    {marcado && (
                      <span className="absolute top-1.5 right-1.5 inline-flex size-6 items-center justify-center rounded-full bg-petroleo text-gelo">
                        <Check aria-hidden weight="bold" className="size-3.5" />
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Modal>
  );
}
