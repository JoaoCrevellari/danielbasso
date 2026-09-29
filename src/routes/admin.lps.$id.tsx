/**
 * Uma LP de lançamento: publicar/encerrar, prévia, resultados, respostas, arquivos (versões)
 * e configurações (endereço, datas, pixels, domínios liberados).
 */
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowSquareOut,
  Copy,
  Eye,
  FloppyDisk,
  Prohibit,
  RocketLaunch,
  Trash,
  UploadSimple,
} from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type FormEvent } from "react";

import { ExigePermissao, QK, useAdmin } from "@/components/admin/contexto";
import { useConfirmar } from "@/components/admin/Dialogo";
import {
  EscolherPacote,
  ListaConformidade,
  type PacoteLido,
} from "@/components/admin/lps/EnvioPacote";
import { RelatorioLp } from "@/components/admin/lps/RelatorioLp";
import { RespostasLp } from "@/components/admin/lps/RespostasLp";
import { ROTULO_STATUS } from "@/components/admin/lps/status";
import { useEnviarVersao } from "@/components/admin/lps/useEnviarVersao";
import { useToast } from "@/components/admin/Toast";
import {
  Cartao,
  Esqueleto,
  EstadoErro,
  Girando,
  Selo,
  TituloCartao,
  acao,
  classeCampo,
} from "@/components/admin/ui";
import {
  dataHora,
  isoParaLocal,
  localParaIso,
  mensagemErro,
  relativo,
  tamanhoArquivo,
} from "@/lib/admin/formato";
import {
  excluirLpFn,
  mudarStatusLpFn,
  obterLpFn,
  salvarLpFn,
  type Lp,
  type StatusLp,
} from "@/lib/admin/lps.functions";
import { FORMATOS_PIXEL, type Pixels } from "@/lp/pixels";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/lps/$id")({
  head: () => ({
    meta: [{ title: "LP | Painel" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: () => (
    <ExigePermissao modulo="lps">
      <PaginaLp />
    </ExigePermissao>
  ),
});

type Aba = "resultados" | "respostas" | "arquivos" | "configuracoes";
const ABAS: { value: Aba; label: string }[] = [
  { value: "resultados", label: "Resultados" },
  { value: "respostas", label: "Respostas" },
  { value: "arquivos", label: "Arquivos" },
  { value: "configuracoes", label: "Configurações" },
];

function PaginaLp() {
  const { id } = Route.useParams();
  const q = useQuery({ queryKey: QK.lp(id), queryFn: () => obterLpFn({ data: { id } }) });
  const [aba, setAba] = useState<Aba>("resultados");

  if (q.isError)
    return <EstadoErro mensagem={mensagemErro(q.error)} onTentar={() => q.refetch()} />;
  if (q.isPending) {
    return (
      <div aria-hidden className="space-y-4">
        <Esqueleto className="h-10 w-80" />
        <Esqueleto className="h-5 w-64" />
        <Esqueleto className="h-64" />
      </div>
    );
  }
  const { lp, origemLps, previa } = q.data;
  const semArquivos = lp.versao === 0;

  return (
    <>
      <Cabecalho lp={lp} origemLps={origemLps} previa={previa} />

      <div
        role="tablist"
        aria-label="Seções da LP"
        className="mb-5 flex gap-1 overflow-x-auto border-b border-linha"
      >
        {ABAS.map((a) => (
          <button
            key={a.value}
            type="button"
            role="tab"
            aria-selected={aba === a.value}
            onClick={() => setAba(a.value)}
            className={cn(
              "relative min-h-11 shrink-0 px-4 text-sm font-medium transition-colors",
              aba === a.value ? "text-petroleo" : "text-cinza hover:text-petroleo",
            )}
          >
            {a.label}
            {aba === a.value && (
              <span
                aria-hidden
                className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-ouro"
              />
            )}
          </button>
        ))}
      </div>

      <div role="tabpanel">
        {aba === "resultados" &&
          (semArquivos ? (
            <AvisoSemArquivos onEnviar={() => setAba("arquivos")} />
          ) : (
            <RelatorioLp lpId={lp.id} />
          ))}
        {aba === "respostas" && <RespostasLp lpId={lp.id} slug={lp.slug} />}
        {aba === "arquivos" && <ArquivosLp lp={lp} />}
        {aba === "configuracoes" && <ConfiguracoesLp lp={lp} />}
      </div>
    </>
  );
}

function AvisoSemArquivos({ onEnviar }: { onEnviar: () => void }) {
  return (
    <Cartao className="px-5 py-8 text-center md:px-8">
      <p className="font-serif text-2xl text-petroleo">A LP ainda não tem arquivos</p>
      <p className="mt-2 text-sm text-cinza">
        Envie o pacote gerado pelo time de lançamentos para ver a prévia e publicar.
      </p>
      <button type="button" className={acao("primario", "md", "mt-5")} onClick={onEnviar}>
        <UploadSimple aria-hidden className="size-4" />
        Enviar arquivos
      </button>
    </Cartao>
  );
}

function Cabecalho({
  lp,
  origemLps,
  previa,
}: {
  lp: Lp;
  origemLps: string;
  previa: string | null;
}) {
  const qc = useQueryClient();
  const toast = useToast();
  const confirmar = useConfirmar();
  const { pode } = useAdmin();
  const podeEditar = pode("lps", "editar");
  const url = `${origemLps}/${lp.slug}/`;
  const s = ROTULO_STATUS[lp.status];
  const erros = lp.conformidade.filter((c) => c.nivel === "erro").length;

  const status = useMutation({
    mutationFn: (novo: StatusLp) => mudarStatusLpFn({ data: { id: lp.id, status: novo } }),
    onSuccess: (_r, novo) => {
      qc.invalidateQueries({ queryKey: QK.lp(lp.id) });
      qc.invalidateQueries({ queryKey: QK.lps });
      toast.sucesso(
        novo === "publicada"
          ? "LP no ar."
          : novo === "encerrada"
            ? "LP encerrada."
            : "LP voltou para rascunho (fora do ar).",
      );
    },
    onError: (e) => toast.erro(mensagemErro(e)),
  });

  async function publicar() {
    if (erros) {
      const ok = await confirmar({
        titulo: "Publicar mesmo fora do padrão?",
        descricao: `A conferência encontrou ${erros} problema(s) (veja em Arquivos). Partes da página podem não funcionar ou não ser medidas.`,
        confirmar: "Publicar assim mesmo",
        perigo: true,
      });
      if (!ok) return;
    }
    status.mutate("publicada");
  }

  async function copiar() {
    try {
      await navigator.clipboard.writeText(url);
      toast.sucesso("Link copiado.");
    } catch {
      toast.erro("Não foi possível copiar o link.");
    }
  }

  return (
    <header className="mb-6">
      <Link
        to="/admin/lps"
        className="mb-3 inline-flex items-center gap-1.5 text-sm text-petroleo hover:underline"
      >
        <ArrowLeft aria-hidden className="size-4" />
        LPs
      </Link>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-serif text-[1.9rem] leading-[1.1] text-petroleo md:text-[2.3rem]">
              {lp.titulo}
            </h1>
            <Selo tom={s.tom} ponto>
              {s.texto}
            </Selo>
          </div>
          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-cinza">
            <span className="font-mono text-[0.8125rem] text-grafite">
              {url.replace(/^https?:\/\//, "")}
            </span>
            <button
              type="button"
              onClick={copiar}
              className="inline-flex items-center gap-1 text-petroleo hover:underline"
            >
              <Copy aria-hidden className="size-3.5" />
              Copiar
            </button>
            <span>
              {lp.versao ? `Versão ${lp.versao}` : "Sem arquivos"} · atualizada{" "}
              {relativo(lp.atualizadaEm)}
            </span>
          </p>
          {(lp.inicio || lp.fim) && (
            <p className="mt-1 text-xs text-cinza">
              {lp.inicio && `Entra no ar em ${dataHora(lp.inicio)}. `}
              {lp.fim && `Encerra em ${dataHora(lp.fim)}.`}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {previa && (
            <a href={previa} target="_blank" rel="noopener" className={acao("secundario", "sm")}>
              <Eye aria-hidden className="size-4" />
              Prévia
            </a>
          )}
          {lp.status === "publicada" && (
            <a href={url} target="_blank" rel="noopener" className={acao("secundario", "sm")}>
              <ArrowSquareOut aria-hidden className="size-4" />
              Ver no ar
            </a>
          )}
          {podeEditar && lp.status !== "publicada" && (
            <button
              type="button"
              className={acao("primario", "sm")}
              onClick={publicar}
              disabled={status.isPending || !lp.versao}
            >
              {status.isPending ? <Girando /> : <RocketLaunch aria-hidden className="size-4" />}
              {lp.status === "encerrada" ? "Reabrir" : "Publicar"}
            </button>
          )}
          {podeEditar && lp.status === "publicada" && (
            <>
              <button
                type="button"
                className={acao("secundario", "sm")}
                disabled={status.isPending}
                onClick={async () => {
                  const ok = await confirmar({
                    titulo: "Tirar do ar?",
                    descricao:
                      "A LP volta para rascunho e o endereço deixa de abrir. As respostas e os números ficam guardados.",
                    confirmar: "Tirar do ar",
                  });
                  if (ok) status.mutate("rascunho");
                }}
              >
                Tirar do ar
              </button>
              <button
                type="button"
                className={acao("perigo", "sm")}
                disabled={status.isPending}
                onClick={async () => {
                  const ok = await confirmar({
                    titulo: "Encerrar a campanha?",
                    descricao: lp.urlEncerrada
                      ? "Quem abrir o endereço será levado para o link definido em Configurações."
                      : "Quem abrir o endereço verá uma página de inscrições encerradas.",
                    confirmar: "Encerrar",
                    perigo: true,
                  });
                  if (ok) status.mutate("encerrada");
                }}
              >
                <Prohibit aria-hidden className="size-4" />
                Encerrar
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function ArquivosLp({ lp }: { lp: Lp }) {
  const qc = useQueryClient();
  const toast = useToast();
  const confirmar = useConfirmar();
  const { pode } = useAdmin();
  const { enviar, progresso } = useEnviarVersao();
  const [pacote, setPacote] = useState<PacoteLido | null>(null);
  const [enviando, setEnviando] = useState(false);
  const total = lp.arquivos.reduce((s, a) => s + a.tamanho, 0);

  async function publicarVersao() {
    if (!pacote) return;
    if (lp.status === "publicada") {
      const ok = await confirmar({
        titulo: `Colocar a versão ${lp.versao + 1} no ar?`,
        descricao:
          "A LP está publicada: a versão nova substitui a atual assim que o envio terminar.",
        confirmar: "Enviar e publicar",
      });
      if (!ok) return;
    }
    setEnviando(true);
    try {
      const v = await enviar(lp.id, lp.versao, pacote);
      setPacote(null);
      await qc.invalidateQueries({ queryKey: QK.lp(lp.id) });
      qc.invalidateQueries({ queryKey: QK.lps });
      toast.sucesso(`Versão ${v} enviada.`);
    } catch (e) {
      toast.erro(mensagemErro(e));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="grid gap-4 md:gap-5 lg:grid-cols-[1.1fr_1fr]">
      <div className="space-y-4">
        {pode("lps", "editar") && (
          <Cartao className="pb-5">
            <TituloCartao
              titulo={lp.versao ? "Enviar nova versão" : "Enviar arquivos"}
              descricao="O .zip gerado pelo time de lançamentos (index.html + pasta assets/)."
            />
            <div className="space-y-3 px-5 pt-4 md:px-6">
              <EscolherPacote
                pacote={pacote}
                onPacote={setPacote}
                dominiosExtras={lp.dominiosExtras}
                desabilitado={enviando}
              />
              {pacote && (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    className={acao("primario", "sm")}
                    onClick={publicarVersao}
                    disabled={enviando}
                  >
                    {enviando ? <Girando /> : <UploadSimple aria-hidden className="size-4" />}
                    {progresso
                      ? `Enviando ${progresso.feitos}/${progresso.total}…`
                      : `Enviar como versão ${lp.versao + 1}`}
                  </button>
                  <button
                    type="button"
                    className={acao("fantasma", "sm")}
                    onClick={() => setPacote(null)}
                    disabled={enviando}
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          </Cartao>
        )}

        {lp.versao > 0 && (
          <Cartao className="pb-5">
            <TituloCartao
              titulo={`Conferência da versão ${lp.versao}`}
              descricao="Resultado da checagem com o padrão das LPs."
            />
            <div className="px-5 pt-4 md:px-6">
              <ListaConformidade itens={lp.conformidade} compacta />
            </div>
          </Cartao>
        )}
      </div>

      {lp.versao > 0 && (
        <Cartao className="pb-3">
          <TituloCartao
            titulo={`Arquivos da versão ${lp.versao}`}
            descricao={`${lp.arquivos.length} arquivo(s) · ${tamanhoArquivo(total)}`}
          />
          <ul className="mt-3 max-h-[28rem] divide-y divide-linha overflow-y-auto text-sm">
            {lp.arquivos.map((a) => (
              <li
                key={a.caminho}
                className="flex items-center justify-between gap-3 px-5 py-2 md:px-6"
              >
                <span
                  className="min-w-0 truncate font-mono text-[0.8125rem] text-grafite"
                  title={a.caminho}
                >
                  {a.caminho}
                </span>
                <span className="shrink-0 text-xs text-cinza tabular-nums">
                  {tamanhoArquivo(a.tamanho)}
                </span>
              </li>
            ))}
          </ul>
        </Cartao>
      )}
    </div>
  );
}

function ConfiguracoesLp({ lp }: { lp: Lp }) {
  const qc = useQueryClient();
  const toast = useToast();
  const confirmar = useConfirmar();
  const navigate = useNavigate();
  const { pode } = useAdmin();
  const podeEditar = pode("lps", "editar");

  const [titulo, setTitulo] = useState(lp.titulo);
  const [slug, setSlug] = useState(lp.slug);
  const [inicio, setInicio] = useState(isoParaLocal(lp.inicio));
  const [fim, setFim] = useState(isoParaLocal(lp.fim));
  const [urlEncerrada, setUrlEncerrada] = useState(lp.urlEncerrada ?? "");
  const [pixels, setPixels] = useState<Record<string, string>>({ ...lp.pixels });
  const [dominios, setDominios] = useState(lp.dominiosExtras.join("\n"));
  const [notas, setNotas] = useState(lp.notas ?? "");
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    setTitulo(lp.titulo);
    setSlug(lp.slug);
  }, [lp.titulo, lp.slug]);

  const salvar = useMutation({
    mutationFn: () =>
      salvarLpFn({
        data: {
          id: lp.id,
          titulo,
          slug,
          pixels,
          dominiosExtras: dominios
            .split(/[\s,]+/)
            .map((d) => d.replace(/^https?:\/\//, "").replace(/\/.*$/, ""))
            .filter(Boolean),
          inicio: localParaIso(inicio),
          fim: localParaIso(fim),
          urlEncerrada,
          notas,
        },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.lp(lp.id) });
      qc.invalidateQueries({ queryKey: QK.lps });
      toast.sucesso("Configurações salvas. No ar em até 1 minuto.");
    },
    onError: (e) => setErro(mensagemErro(e)),
  });

  const excluir = useMutation({
    mutationFn: () => excluirLpFn({ data: { id: lp.id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.lps });
      toast.sucesso("LP excluída.");
      navigate({ to: "/admin/lps" });
    },
    onError: (e) => toast.erro(mensagemErro(e)),
  });

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    if (slug !== lp.slug && lp.status === "publicada") {
      const ok = await confirmar({
        titulo: "Trocar o endereço de uma LP no ar?",
        descricao:
          "Links já divulgados (anúncios, bio, WhatsApp) com o endereço antigo vão parar de funcionar.",
        confirmar: "Trocar endereço",
        perigo: true,
      });
      if (!ok) return;
    }
    salvar.mutate();
  }

  const rotulo = "mb-1.5 block text-sm font-medium text-grafite";
  return (
    <form onSubmit={enviar} noValidate className="space-y-4 md:space-y-5">
      <fieldset disabled={!podeEditar} className="grid gap-4 md:gap-5 lg:grid-cols-2">
        <Cartao className="pb-5">
          <TituloCartao titulo="Página" />
          <div className="space-y-4 px-5 pt-4 md:px-6">
            <div>
              <label htmlFor="cfg-titulo" className={rotulo}>
                Nome da LP
              </label>
              <input
                id="cfg-titulo"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className={classeCampo}
              />
            </div>
            <div>
              <label htmlFor="cfg-slug" className={rotulo}>
                Endereço
              </label>
              <input
                id="cfg-slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                className={cn(classeCampo, "font-mono text-[0.875rem]")}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="cfg-inicio" className={rotulo}>
                  Entra no ar em <span className="font-normal text-cinza">(opcional)</span>
                </label>
                <input
                  id="cfg-inicio"
                  type="datetime-local"
                  value={inicio}
                  onChange={(e) => setInicio(e.target.value)}
                  className={classeCampo}
                />
              </div>
              <div>
                <label htmlFor="cfg-fim" className={rotulo}>
                  Encerra em <span className="font-normal text-cinza">(opcional)</span>
                </label>
                <input
                  id="cfg-fim"
                  type="datetime-local"
                  value={fim}
                  onChange={(e) => setFim(e.target.value)}
                  className={classeCampo}
                />
              </div>
            </div>
            <div>
              <label htmlFor="cfg-url-fim" className={rotulo}>
                Depois de encerrar, levar para{" "}
                <span className="font-normal text-cinza">(opcional)</span>
              </label>
              <input
                id="cfg-url-fim"
                type="url"
                placeholder="https://… (sem link, aparece “Inscrições encerradas”)"
                value={urlEncerrada}
                onChange={(e) => setUrlEncerrada(e.target.value)}
                className={classeCampo}
              />
            </div>
            <div>
              <label htmlFor="cfg-notas" className={rotulo}>
                Anotações da equipe
              </label>
              <textarea
                id="cfg-notas"
                rows={3}
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                className={cn(classeCampo, "resize-y")}
              />
            </div>
          </div>
        </Cartao>

        <div className="space-y-4 md:space-y-5">
          <Cartao className="pb-5">
            <TituloCartao
              titulo="Pixels"
              descricao="Só o ID. O site injeta o código certo e dispara o evento de lead no envio do formulário."
            />
            <div className="space-y-4 px-5 pt-4 md:px-6">
              {(Object.keys(FORMATOS_PIXEL) as (keyof Pixels)[]).map((k) => (
                <div key={k}>
                  <label htmlFor={`px-${k}`} className={rotulo}>
                    {FORMATOS_PIXEL[k].rotulo}
                  </label>
                  <input
                    id={`px-${k}`}
                    value={pixels[k] ?? ""}
                    placeholder={FORMATOS_PIXEL[k].exemplo}
                    onChange={(e) => setPixels((p) => ({ ...p, [k]: e.target.value.trim() }))}
                    aria-invalid={
                      pixels[k] && !FORMATOS_PIXEL[k].re.test(pixels[k]) ? true : undefined
                    }
                    className={cn(classeCampo, "font-mono text-[0.875rem]")}
                  />
                </div>
              ))}
            </div>
          </Cartao>
          <Cartao className="pb-5">
            <TituloCartao
              titulo="Domínios liberados"
              descricao="Serviços externos que a LP precisa carregar além dos já liberados (Google Fonts, jsDelivr, cdnjs, YouTube, Vimeo, Panda Video). Um por linha."
            />
            <div className="px-5 pt-4 md:px-6">
              <label htmlFor="cfg-dominios" className="sr-only">
                Domínios liberados
              </label>
              <textarea
                id="cfg-dominios"
                rows={3}
                placeholder={"exemplo.com\n*.exemplo.com"}
                value={dominios}
                onChange={(e) => setDominios(e.target.value)}
                className={cn(classeCampo, "resize-y font-mono text-[0.875rem]")}
              />
            </div>
          </Cartao>
        </div>
      </fieldset>

      {erro && (
        <p role="alert" className="text-sm font-medium text-terracota-texto">
          {erro}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        {podeEditar ? (
          <button type="submit" className={acao("primario")} disabled={salvar.isPending}>
            {salvar.isPending ? <Girando /> : <FloppyDisk aria-hidden className="size-4" />}
            Salvar configurações
          </button>
        ) : (
          <p className="text-sm text-ouro-texto">Você tem acesso só para ver as configurações.</p>
        )}
        {pode("lps", "apagar") && (
          <button
            type="button"
            className={acao("perigo", "sm")}
            disabled={excluir.isPending}
            onClick={async () => {
              const ok = await confirmar({
                titulo: "Excluir esta LP?",
                descricao:
                  "Os arquivos e os números de visita são apagados de vez. As respostas dos formulários continuam na caixa de Leads.",
                confirmar: "Excluir LP",
                perigo: true,
              });
              if (ok) excluir.mutate();
            }}
          >
            {excluir.isPending ? <Girando /> : <Trash aria-hidden className="size-4" />}
            Excluir LP
          </button>
        )}
      </div>
    </form>
  );
}
