/**
 * Biblioteca de mídia: enviar vários arquivos (arrastar e soltar ou botão), buscar,
 * copiar URL, abrir e excluir. Imagens são otimizadas para WebP no navegador.
 */
import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowSquareOut,
  CheckCircle,
  Copy,
  FilePdf,
  Images,
  Trash,
  UploadSimple,
  WarningCircle,
} from "@phosphor-icons/react";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";

import { useMidia } from "@/components/admin/BibliotecaMidia";
import { QK } from "@/components/admin/contexto";
import { useConfirmar } from "@/components/admin/Dialogo";
import { useToast } from "@/components/admin/Toast";
import {
  CampoBusca,
  Cartao,
  EASE,
  Esqueleto,
  EstadoErro,
  EstadoVazio,
  Girando,
  TopoPagina,
  acao,
  acaoIcone,
} from "@/components/admin/ui";
import { dataCurta, mensagemErro, tamanhoArquivo } from "@/lib/admin/formato";
import { enviarArquivo, excluirMidia, TIPOS_ACEITOS, type ArquivoMidia } from "@/lib/admin/midia";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/midia")({
  head: () => ({
    meta: [{ title: "Mídia | Painel" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: MidiaPagina,
});

type Envio = { id: number; nome: string; estado: "enviando" | "ok" | "erro"; erro?: string };

function MidiaPagina() {
  const q = useMidia();
  const qc = useQueryClient();
  const toast = useToast();
  const confirmar = useConfirmar();
  const reduzir = useReducedMotion();
  const [busca, setBusca] = useState("");
  const [envios, setEnvios] = useState<Envio[]>([]);
  const [arrastando, setArrastando] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const seq = useRef(0);
  const contadorArraste = useRef(0);

  const arquivos = useMemo(() => {
    const t = busca.trim().toLowerCase();
    return (q.data ?? []).filter((a) => !t || a.caminho.toLowerCase().includes(t));
  }, [q.data, busca]);

  const enviandoAgora = envios.some((e) => e.estado === "enviando");

  async function enviar(lista: FileList | File[] | null) {
    const fs = Array.from(lista ?? []);
    if (!fs.length) return;
    const novos = fs.map((f) => ({ id: ++seq.current, nome: f.name, estado: "enviando" as const }));
    setEnvios((e) => [...novos, ...e].slice(0, 12));
    // Envia até 3 por vez.
    let i = 0;
    let ok = 0;
    async function trabalhador() {
      while (i < fs.length) {
        const k = i++;
        const f = fs[k];
        const idEnvio = novos[k].id;
        try {
          await enviarArquivo(f);
          ok++;
          setEnvios((e) => e.map((x) => (x.id === idEnvio ? { ...x, estado: "ok" } : x)));
        } catch (err) {
          setEnvios((e) =>
            e.map((x) =>
              x.id === idEnvio ? { ...x, estado: "erro", erro: mensagemErro(err) } : x,
            ),
          );
        }
      }
    }
    await Promise.all(Array.from({ length: Math.min(3, fs.length) }, trabalhador));
    await qc.invalidateQueries({ queryKey: QK.midia });
    if (ok) toast.sucesso(ok === 1 ? "Arquivo enviado." : `${ok} arquivos enviados.`);
    if (ok < fs.length)
      toast.erro(`${fs.length - ok} arquivo(s) não foram enviados. Veja os detalhes na lista.`);
    if (input.current) input.current.value = "";
  }

  // Some com os envios concluídos depois de alguns segundos.
  useEffect(() => {
    if (!envios.length || enviandoAgora) return;
    const t = setTimeout(() => setEnvios((e) => e.filter((x) => x.estado === "erro")), 5000);
    return () => clearTimeout(t);
  }, [envios, enviandoAgora]);

  async function copiar(a: ArquivoMidia) {
    try {
      await navigator.clipboard.writeText(a.url);
      toast.sucesso("Link copiado.");
    } catch {
      toast.erro("Não foi possível copiar. Abra o arquivo e copie o endereço.");
    }
  }

  async function excluir(a: ArquivoMidia) {
    const ok = await confirmar({
      titulo: "Excluir este arquivo?",
      descricao: (
        <>
          <strong className="break-all">{a.nome}</strong> será apagado de vez. Se ele estiver em uso
          em alguma página ou item, a imagem deixa de aparecer no site.
        </>
      ),
      confirmar: "Excluir",
      perigo: true,
    });
    if (!ok) return;
    try {
      await excluirMidia(a.caminho);
      qc.setQueryData<ArquivoMidia[]>(QK.midia, (l) => l?.filter((x) => x.caminho !== a.caminho));
      toast.sucesso("Arquivo excluído.");
    } catch (e) {
      toast.erro(mensagemErro(e));
    }
  }

  return (
    <div
      onDragEnter={(e) => {
        if (!e.dataTransfer.types.includes("Files")) return;
        contadorArraste.current++;
        setArrastando(true);
      }}
      onDragOver={(e) => e.dataTransfer.types.includes("Files") && e.preventDefault()}
      onDragLeave={() => {
        contadorArraste.current = Math.max(0, contadorArraste.current - 1);
        if (!contadorArraste.current) setArrastando(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        contadorArraste.current = 0;
        setArrastando(false);
        enviar(e.dataTransfer.files);
      }}
      className="relative"
    >
      <TopoPagina
        titulo="Mídia"
        descricao="Imagens e PDFs do site. Fotos são reduzidas para no máximo 2000 px e convertidas para WebP antes do envio. Limite de 10 MB por arquivo."
        acoes={
          <button
            type="button"
            className={acao("primario")}
            onClick={() => input.current?.click()}
            disabled={enviandoAgora}
          >
            {enviandoAgora ? <Girando /> : <UploadSimple aria-hidden className="size-4" />}
            {enviandoAgora ? "Enviando…" : "Enviar arquivos"}
          </button>
        }
      />
      <input
        ref={input}
        type="file"
        multiple
        accept={TIPOS_ACEITOS.join(",")}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => enviar(e.target.files)}
      />

      {/* Zona de soltar (visível no desktop; no celular o botão resolve) */}
      <button
        type="button"
        onClick={() => input.current?.click()}
        className={cn(
          "mb-5 hidden w-full flex-col items-center justify-center gap-1 rounded-[2px] border border-dashed px-6 py-7 text-center transition-colors md:flex",
          arrastando
            ? "border-petroleo bg-petroleo-50"
            : "border-linha-forte bg-papel/50 hover:border-petroleo/50",
        )}
      >
        <UploadSimple aria-hidden className="size-6 text-petroleo" />
        <span className="text-sm text-grafite">
          Arraste arquivos para cá ou{" "}
          <span className="text-petroleo underline underline-offset-4">escolha no computador</span>
        </span>
        <span className="text-xs text-cinza">JPG, PNG, WebP, AVIF, GIF, SVG ou PDF</span>
      </button>

      {/* Progresso dos envios */}
      <AnimatePresence initial={false}>
        {envios.length > 0 && (
          <motion.ul
            initial={reduzir ? { opacity: 0 } : { opacity: 0, height: 0 }}
            animate={reduzir ? { opacity: 1 } : { opacity: 1, height: "auto" }}
            exit={reduzir ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="mb-5 overflow-hidden rounded-[2px] border border-linha bg-papel"
            aria-live="polite"
          >
            {envios.map((e) => (
              <li
                key={e.id}
                className="flex items-center gap-3 border-b border-linha px-4 py-2.5 text-sm last:border-0"
              >
                {e.estado === "enviando" && <Girando className="text-petroleo" />}
                {e.estado === "ok" && (
                  <CheckCircle aria-hidden weight="fill" className="size-4 text-salvia" />
                )}
                {e.estado === "erro" && (
                  <WarningCircle aria-hidden weight="fill" className="size-4 text-terracota" />
                )}
                <span className="min-w-0 flex-1 truncate text-grafite">{e.nome}</span>
                <span
                  className={cn(
                    "shrink-0 text-xs",
                    e.estado === "erro" ? "text-terracota-texto" : "text-cinza",
                  )}
                >
                  {e.estado === "enviando"
                    ? "Otimizando e enviando…"
                    : e.estado === "ok"
                      ? "Enviado"
                      : e.erro}
                </span>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <CampoBusca
          valor={busca}
          onChange={setBusca}
          rotulo="Buscar por nome"
          className="sm:max-w-sm sm:flex-1"
        />
        {q.data && (
          <p className="text-sm text-cinza">
            {arquivos.length} de {q.data.length} {q.data.length === 1 ? "arquivo" : "arquivos"}
          </p>
        )}
      </div>

      {q.isError ? (
        <EstadoErro mensagem={mensagemErro(q.error)} onTentar={() => q.refetch()} />
      ) : q.isPending ? (
        <ul
          aria-hidden
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
        >
          {Array.from({ length: 10 }, (_, i) => (
            <li key={i} className="rounded-[2px] border border-linha bg-papel">
              <Esqueleto className="aspect-[4/3] rounded-none" />
              <div className="p-3">
                <Esqueleto className="h-3.5 w-3/4" />
                <Esqueleto className="mt-2 h-3 w-1/2" />
              </div>
            </li>
          ))}
        </ul>
      ) : arquivos.length === 0 ? (
        <Cartao>
          <EstadoVazio
            icone={<Images />}
            titulo={busca ? "Nenhum arquivo com esse nome" : "A biblioteca está vazia"}
            texto={
              busca
                ? "Tente outro termo."
                : "Envie imagens e PDFs para usar nas páginas, cursos, livros e posts."
            }
            acao={
              !busca && (
                <button
                  type="button"
                  className={acao("primario")}
                  onClick={() => input.current?.click()}
                >
                  <UploadSimple aria-hidden className="size-4" />
                  Enviar arquivos
                </button>
              )
            }
          />
        </Cartao>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          <AnimatePresence initial={false}>
            {arquivos.map((a) => (
              <motion.li
                key={a.caminho}
                layout={!reduzir}
                initial={reduzir ? false : { opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={
                  reduzir
                    ? { opacity: 0 }
                    : { opacity: 0, scale: 0.95, transition: { duration: 0.15 } }
                }
                transition={{ duration: 0.25, ease: EASE }}
                className="group overflow-hidden rounded-[2px] border border-linha bg-papel"
              >
                <a
                  href={a.url}
                  target="_blank"
                  rel="noopener"
                  className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-gelo-2"
                  aria-label={`Abrir ${a.nome} (nova aba)`}
                >
                  {a.imagem ? (
                    <img
                      src={a.url}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <FilePdf aria-hidden className="size-10 text-terracota-texto" />
                  )}
                </a>
                <div className="px-3 pt-2.5">
                  <p className="truncate text-sm text-grafite" title={a.caminho}>
                    {a.nome}
                  </p>
                  <p className="text-xs text-cinza">
                    {[tamanhoArquivo(a.tamanho), dataCurta(a.criadoEm)].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <div className="flex items-center justify-between px-1.5 pb-1.5">
                  <button
                    type="button"
                    className={acaoIcone(true)}
                    aria-label={`Copiar link de ${a.nome}`}
                    title="Copiar link"
                    onClick={() => copiar(a)}
                  >
                    <Copy aria-hidden className="size-[1.1rem]" />
                  </button>
                  <a
                    href={a.url}
                    target="_blank"
                    rel="noopener"
                    className={acaoIcone(true)}
                    aria-label={`Abrir ${a.nome} (nova aba)`}
                    title="Abrir"
                  >
                    <ArrowSquareOut aria-hidden className="size-[1.1rem]" />
                  </a>
                  <button
                    type="button"
                    className={acaoIcone(true, "text-terracota-texto hover:bg-terracota/10")}
                    aria-label={`Excluir ${a.nome}`}
                    title="Excluir"
                    onClick={() => excluir(a)}
                  >
                    <Trash aria-hidden className="size-[1.1rem]" />
                  </button>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      {/* Véu de arrastar sobre a página inteira */}
      <AnimatePresence>
        {arrastando && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="pointer-events-none fixed inset-0 z-[var(--z-overlay)] flex items-center justify-center bg-petroleo-950/40 backdrop-blur-[1px]"
          >
            <p className="rounded-full bg-papel px-6 py-3 text-sm font-medium text-petroleo shadow-lg">
              Solte para enviar
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
