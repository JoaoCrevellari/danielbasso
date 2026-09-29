/**
 * LPs de lançamento: lista com os números do período, criação de LP nova (envio do
 * pacote gerado pelo time de lançamentos) e download do padrão que eles seguem.
 */
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, DownloadSimple, Megaphone, Plus } from "@phosphor-icons/react";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";

import padraoLps from "../../docs/prompt-landing-pages.md?raw";
import { ExigePermissao, QK, useAdmin } from "@/components/admin/contexto";
import { Modal } from "@/components/admin/Dialogo";
import { EscolherPacote, type PacoteLido } from "@/components/admin/lps/EnvioPacote";
import { ROTULO_STATUS } from "@/components/admin/lps/status";
import { useEnviarVersao } from "@/components/admin/lps/useEnviarVersao";
import {
  Cartao,
  Esqueleto,
  EstadoErro,
  Girando,
  Segmentado,
  Selo,
  TopoPagina,
  acao,
  classeCampo,
} from "@/components/admin/ui";
import {
  baixarArquivo,
  mensagemErro,
  numero,
  porcentagem,
  relativo,
  slugificar,
} from "@/lib/admin/formato";
import { criarLpFn, listarLpsFn, type LpNaLista } from "@/lib/admin/lps.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/lps/")({
  head: () => ({
    meta: [{ title: "LPs | Painel" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: () => (
    <ExigePermissao modulo="lps">
      <ListaLps />
    </ExigePermissao>
  ),
});

type Dias = 7 | 30 | 90;
const PERIODOS: { value: Dias; label: string }[] = [
  { value: 7, label: "7 dias" },
  { value: 30, label: "30 dias" },
  { value: 90, label: "90 dias" },
];

function ListaLps() {
  const { pode } = useAdmin();
  const [dias, setDias] = useState<Dias>(30);
  const [nova, setNova] = useState(false);
  const q = useQuery({
    queryKey: [...QK.lps, dias],
    queryFn: () => listarLpsFn({ data: { dias } }),
    placeholderData: keepPreviousData,
  });
  const lps = q.data?.lps ?? [];

  return (
    <>
      <TopoPagina
        titulo="LPs de lançamento"
        descricao="Páginas criadas pelo time de lançamentos, publicadas em lp.danielbasso.com.br, com visitas, cliques e respostas de cada uma."
        acoes={
          <>
            <Segmentado rotulo="Período" opcoes={PERIODOS} valor={dias} onChange={setDias} />
            <button
              type="button"
              className={acao("secundario")}
              onClick={() =>
                baixarArquivo("padrao-landing-pages.md", padraoLps, "text/markdown;charset=utf-8")
              }
              title="Regras que o time de lançamentos segue ao gerar as LPs"
            >
              <DownloadSimple aria-hidden className="size-4" />
              Padrão das LPs
            </button>
            {pode("lps", "editar") && (
              <button type="button" className={acao("primario")} onClick={() => setNova(true)}>
                <Plus aria-hidden weight="bold" className="size-4" />
                Nova LP
              </button>
            )}
          </>
        }
      />

      {q.isError && !q.data ? (
        <EstadoErro mensagem={mensagemErro(q.error)} onTentar={() => q.refetch()} />
      ) : q.isPending ? (
        <Cartao aria-hidden>
          {Array.from({ length: 3 }, (_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 border-b border-linha px-5 py-5 last:border-0"
            >
              <div className="flex-1">
                <Esqueleto className="h-4 w-56" />
                <Esqueleto className="mt-2 h-3 w-40" />
              </div>
              <Esqueleto className="h-8 w-64" />
            </div>
          ))}
        </Cartao>
      ) : lps.length === 0 ? (
        <ComoFunciona onNova={pode("lps", "editar") ? () => setNova(true) : undefined} />
      ) : (
        <Cartao
          className={cn("transition-opacity", q.isFetching && q.isPlaceholderData && "opacity-60")}
        >
          <div className="hidden grid-cols-[minmax(0,1fr)_repeat(4,6.5rem)_1.5rem] gap-4 border-b border-linha px-5 py-2.5 text-xs font-medium text-cinza lg:grid">
            <span>LP</span>
            <span className="text-right">Visitantes</span>
            <span className="text-right">Respostas</span>
            <span className="text-right">Conversão</span>
            <span className="text-right">Cliques</span>
            <span />
          </div>
          <ul>
            {lps.map((lp) => (
              <LinhaLp key={lp.id} lp={lp} origem={q.data!.origemLps} />
            ))}
          </ul>
        </Cartao>
      )}

      <ModalNovaLp aberto={nova} onFechar={() => setNova(false)} origem={q.data?.origemLps} />
    </>
  );
}

function LinhaLp({ lp, origem }: { lp: LpNaLista; origem: string }) {
  const s = ROTULO_STATUS[lp.status];
  const conversao = lp.visitantes ? (lp.respostas / lp.visitantes) * 100 : null;
  const numeros = [
    { rotulo: "Visitantes", valor: numero(lp.visitantes) },
    { rotulo: "Respostas", valor: numero(lp.respostas) },
    { rotulo: "Conversão", valor: conversao === null ? "–" : porcentagem(conversao) },
    { rotulo: "Cliques", valor: numero(lp.cliques) },
  ];
  return (
    <li className="border-b border-linha last:border-0">
      <Link
        to="/admin/lps/$id"
        params={{ id: lp.id }}
        className="group grid gap-3 px-4 py-4 transition-colors hover:bg-petroleo/[0.03] md:px-5 lg:grid-cols-[minmax(0,1fr)_repeat(4,6.5rem)_1.5rem] lg:items-center lg:gap-4"
      >
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2">
            <span className="truncate font-medium text-grafite">{lp.titulo}</span>
            <Selo tom={s.tom} ponto>
              {s.texto}
            </Selo>
            {lp.conformidade.some((c) => c.nivel === "erro") && (
              <Selo tom="terracota">Fora do padrão</Selo>
            )}
          </p>
          <p className="mt-0.5 truncate text-xs text-cinza">
            {origem.replace(/^https?:\/\//, "")}/{lp.slug} ·{" "}
            {lp.versao ? `versão ${lp.versao}` : "sem arquivos"} · atualizada{" "}
            {relativo(lp.atualizadaEm)}
          </p>
        </div>
        <dl className="grid grid-cols-4 gap-2 lg:contents">
          {numeros.map((n) => (
            <div key={n.rotulo} className="lg:text-right">
              <dt className="text-[0.6875rem] text-cinza lg:sr-only">{n.rotulo}</dt>
              <dd className="font-semibold text-grafite tabular-nums">{n.valor}</dd>
            </div>
          ))}
        </dl>
        <ArrowRight
          aria-hidden
          className="hidden size-4 text-petroleo transition-transform group-hover:translate-x-0.5 lg:block"
        />
      </Link>
    </li>
  );
}

function ComoFunciona({ onNova }: { onNova?: () => void }) {
  const passos = [
    {
      titulo: "O time gera a LP",
      texto: "Seguindo o padrão (botão “Padrão das LPs”): formulários, marcação e segurança.",
    },
    {
      titulo: "Você envia o .zip aqui",
      texto: "O painel confere o pacote e aponta o que estiver fora do padrão.",
    },
    {
      titulo: "Confere a prévia e publica",
      texto: "A LP entra no ar em lp.danielbasso.com.br com a medição ligada.",
    },
  ];
  return (
    <Cartao className="px-5 py-8 md:px-8 md:py-10">
      <div className="flex items-center gap-3">
        <span className="inline-flex size-11 items-center justify-center rounded-full bg-petroleo-50 text-petroleo">
          <Megaphone aria-hidden className="size-5" />
        </span>
        <h2 className="font-serif text-2xl text-petroleo">Nenhuma LP ainda</h2>
      </div>
      <ol className="mt-6 grid gap-4 md:grid-cols-3">
        {passos.map((p, i) => (
          <li key={p.titulo} className="rounded-[2px] border border-linha bg-gelo/50 p-4">
            <span className="font-serif text-2xl text-ouro-texto">{i + 1}</span>
            <p className="mt-1 font-medium text-grafite">{p.titulo}</p>
            <p className="mt-1 text-sm text-cinza">{p.texto}</p>
          </li>
        ))}
      </ol>
      {onNova && (
        <button type="button" className={acao("primario", "md", "mt-6")} onClick={onNova}>
          <Plus aria-hidden weight="bold" className="size-4" />
          Criar a primeira LP
        </button>
      )}
    </Cartao>
  );
}

function ModalNovaLp({
  aberto,
  onFechar,
  origem,
}: {
  aberto: boolean;
  onFechar: () => void;
  origem?: string;
}) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { enviar, progresso } = useEnviarVersao();
  const [titulo, setTitulo] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTocado, setSlugTocado] = useState(false);
  const [pacote, setPacote] = useState<PacoteLido | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  function fechar() {
    if (salvando) return;
    setTitulo("");
    setSlug("");
    setSlugTocado(false);
    setPacote(null);
    setErro(null);
    onFechar();
  }

  async function criar(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    if (titulo.trim().length < 2) return setErro("Dê um nome para a LP.");
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug))
      return setErro("Endereço: use letras minúsculas, números e hífen.");
    if (!pacote) return setErro("Escolha o arquivo da LP.");
    setSalvando(true);
    let id: string | null = null;
    try {
      id = (await criarLpFn({ data: { titulo: titulo.trim(), slug } })).id;
      await enviar(id, 0, pacote);
      await qc.invalidateQueries({ queryKey: QK.lps });
      setSalvando(false);
      fechar();
      navigate({ to: "/admin/lps/$id", params: { id } });
    } catch (err) {
      setSalvando(false);
      if (id) {
        // A LP foi criada, só o envio falhou: segue para a página dela para tentar de novo.
        await qc.invalidateQueries({ queryKey: QK.lps });
        fechar();
        navigate({ to: "/admin/lps/$id", params: { id } });
      } else {
        setErro(mensagemErro(err));
      }
    }
  }

  const base = (origem ?? "https://lp.danielbasso.com.br").replace(/^https?:\/\//, "");

  return (
    <Modal
      aberto={aberto}
      onFechar={fechar}
      largura="max-w-2xl"
      titulo="Nova LP"
      descricao="A LP é criada como rascunho. Depois de conferir a prévia, você publica."
      rodape={
        <>
          <button type="button" className={acao("secundario")} onClick={fechar} disabled={salvando}>
            Cancelar
          </button>
          <button
            type="submit"
            form="form-nova-lp"
            className={acao("primario")}
            disabled={salvando}
          >
            {salvando && <Girando />}
            {progresso
              ? `Enviando ${progresso.feitos}/${progresso.total}…`
              : salvando
                ? "Criando…"
                : "Criar rascunho"}
          </button>
        </>
      }
    >
      <form id="form-nova-lp" onSubmit={criar} noValidate className="space-y-5">
        <div>
          <label htmlFor="lp-titulo" className="mb-1.5 block text-sm font-medium text-grafite">
            Nome da LP
          </label>
          <input
            id="lp-titulo"
            value={titulo}
            placeholder="Ex.: Imersão Liderança · abril"
            onChange={(e) => {
              setTitulo(e.target.value);
              if (!slugTocado) setSlug(slugificar(e.target.value, 60));
            }}
            className={classeCampo}
          />
        </div>
        <div>
          <label htmlFor="lp-slug" className="mb-1.5 block text-sm font-medium text-grafite">
            Endereço
          </label>
          <div className="flex items-stretch overflow-hidden rounded-[2px] border border-linha-forte bg-papel focus-within:border-petroleo">
            <span className="flex items-center bg-gelo-2 px-3 text-sm text-cinza">{base}/</span>
            <input
              id="lp-slug"
              value={slug}
              onChange={(e) => {
                setSlugTocado(true);
                setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
              }}
              className="min-h-11 w-full min-w-0 bg-transparent px-3 text-[0.9375rem] text-grafite focus:outline-none"
            />
          </div>
        </div>
        <div>
          <p className="mb-1.5 text-sm font-medium text-grafite">Arquivo da LP</p>
          <EscolherPacote pacote={pacote} onPacote={setPacote} desabilitado={salvando} />
        </div>
        {erro && (
          <p role="alert" className="text-sm font-medium text-terracota-texto">
            {erro}
          </p>
        )}
      </form>
    </Modal>
  );
}
