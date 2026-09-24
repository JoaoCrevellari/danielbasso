/**
 * Editor de uma página do registro (também usado por Configurações e Diagnóstico).
 * Valores = conteúdo padrão mesclado com o que está salvo; salvar grava o objeto inteiro
 * em site_content. Cada grupo de campos é uma seção recolhível.
 */
import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowCounterClockwise,
  ArrowLeft,
  ArrowSquareOut,
  CaretDown,
  Files,
  FloppyDisk,
  WarningCircle,
} from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";

import { EditorCampos, validarCampos, type Erros } from "@/components/admin/campos/EditorCampos";
import { QK } from "@/components/admin/contexto";
import { useConfirmar } from "@/components/admin/Dialogo";
import { AvisoSaida, useProtecaoSaida } from "@/components/admin/ProtecaoSaida";
import { useToast } from "@/components/admin/Toast";
import {
  Cartao,
  EASE,
  Esqueleto,
  EstadoErro,
  EstadoVazio,
  Girando,
  acao,
} from "@/components/admin/ui";
import { mesclar, type FieldGroup, type Values } from "@/content/fields";
import { getPagina, type PaginaConfig } from "@/content/paginas";
import { dataHora, hora, mensagemErro, relativo } from "@/lib/admin/formato";
import { obterPaginaSalvaFn, salvarPaginaFn } from "@/lib/admin/paginas.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/paginas/$chave")({
  head: ({ params }) => ({
    meta: [
      { title: `${getPagina(params.chave)?.titulo ?? "Página"} | Painel` },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: EditorPaginaRota,
});

const DESCRICOES: Record<string, string> = {
  settings:
    "Contatos, redes sociais, rodapé, descrição padrão para buscas e o aviso de versão de apresentação.",
  diagnostico: "Textos, afirmações, escala e resultados do Diagnóstico de Autogoverno.",
};

function EditorPaginaRota() {
  const { chave } = Route.useParams();
  const pagina = getPagina(chave);
  if (!pagina) {
    return (
      <EstadoVazio
        icone={<Files />}
        titulo="Página não encontrada"
        acao={
          <Link to="/admin/paginas" className={acao("secundario")}>
            Ver páginas
          </Link>
        }
      />
    );
  }
  return <Carregar key={chave} pagina={pagina} />;
}

function Carregar({ pagina }: { pagina: PaginaConfig }) {
  const q = useQuery({
    queryKey: QK.pagina(pagina.key),
    queryFn: () => obterPaginaSalvaFn({ data: { key: pagina.key } }),
    staleTime: 0,
  });
  if (q.isPending) {
    return (
      <div aria-hidden className="space-y-4">
        <Esqueleto className="h-10 w-72" />
        {Array.from({ length: 3 }, (_, i) => (
          <Esqueleto key={i} className="h-16" />
        ))}
      </div>
    );
  }
  if (q.isError)
    return <EstadoErro mensagem={mensagemErro(q.error)} onTentar={() => q.refetch()} />;
  return <Editor pagina={pagina} salvo={q.data.data} atualizadoEm={q.data.updated_at} />;
}

function clonar<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}

function Editor({
  pagina,
  salvo,
  atualizadoEm,
}: {
  pagina: PaginaConfig;
  salvo: Record<string, unknown> | null;
  atualizadoEm: string | null;
}) {
  const qc = useQueryClient();
  const toast = useToast();
  const confirmar = useConfirmar();
  const reduzir = useReducedMotion();

  const inicial = useMemo(() => clonar(mesclar(pagina.padrao, salvo)) as Values, [pagina, salvo]);
  const [valores, setValores] = useState<Values>(inicial);
  const [base, setBase] = useState(() => JSON.stringify(inicial));
  const [erros, setErros] = useState<Erros>({});
  const [abertos, setAbertos] = useState<Set<string>>(() => new Set([pagina.campos[0]?.key]));
  const [salvoEm, setSalvoEm] = useState(atualizadoEm);

  const sujo = useMemo(() => JSON.stringify(valores) !== base, [valores, base]);
  const { bloqueio } = useProtecaoSaida(sujo);

  const salvar = useMutation({
    mutationFn: (v: Values) => salvarPaginaFn({ data: { key: pagina.key, data: v } }),
    onSuccess: (r, v) => {
      setBase(JSON.stringify(v));
      setSalvoEm(r.updated_at);
      qc.setQueryData(QK.pagina(pagina.key), { data: v, updated_at: r.updated_at });
      qc.invalidateQueries({ queryKey: QK.paginas });
      toast.sucesso("Alterações salvas e publicadas no site.");
    },
    onError: (e) => toast.erro(mensagemErro(e)),
  });

  function validar(): Erros {
    const e: Erros = {};
    for (const g of pagina.campos) {
      Object.assign(e, validarCampos(g.fields, (valores[g.key] ?? {}) as Values, g.key));
    }
    return e;
  }

  function tentarSalvar() {
    if (salvar.isPending) return;
    const e = validar();
    setErros(e);
    if (Object.keys(e).length) {
      const grupos = new Set(Object.keys(e).map((k) => k.split(".")[0]));
      setAbertos((s) => new Set([...s, ...grupos]));
      toast.erro("Há campos a corrigir antes de salvar.");
      requestAnimationFrame(() =>
        setTimeout(() => {
          const alvo = document.querySelector<HTMLElement>("[aria-invalid='true']");
          alvo?.focus();
          alvo?.scrollIntoView({ block: "center", behavior: "smooth" });
        }, 280),
      );
      return;
    }
    salvar.mutate(valores);
  }

  const salvarRef = useRef(tentarSalvar);
  salvarRef.current = tentarSalvar;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        salvarRef.current();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function restaurarGrupo(g: FieldGroup) {
    const ok = await confirmar({
      titulo: `Restaurar "${g.label}"?`,
      descricao:
        "Os campos desta seção voltam para o texto de exemplo. A mudança só vai para o site depois de salvar.",
      confirmar: "Restaurar",
    });
    if (!ok) return;
    setValores((v) => ({ ...v, [g.key]: clonar((pagina.padrao as Values)[g.key]) }));
    toast.info("Texto de exemplo restaurado. Salve para publicar.");
  }

  async function restaurarTudo() {
    const ok = await confirmar({
      titulo: "Restaurar a página inteira?",
      descricao:
        "Todas as seções voltam para o texto de exemplo. A mudança só vai para o site depois de salvar.",
      confirmar: "Restaurar tudo",
      perigo: true,
    });
    if (!ok) return;
    setValores(clonar(pagina.padrao) as Values);
    setErros({});
    toast.info("Página restaurada para o texto de exemplo. Salve para publicar.");
  }

  const alternar = (k: string) =>
    setAbertos((s) => {
      const n = new Set(s);
      if (n.has(k)) n.delete(k);
      else n.add(k);
      return n;
    });

  const todosAbertos = pagina.campos.every((g) => abertos.has(g.key));
  const voltar =
    pagina.key === "settings"
      ? null
      : pagina.key === "diagnostico"
        ? "/admin/diagnostico"
        : "/admin/paginas";

  return (
    <>
      <AvisoSaida bloqueio={bloqueio} />

      <div className="sticky top-14 z-30 -mx-4 mb-6 border-b border-linha bg-gelo/90 px-4 py-3 backdrop-blur-md md:-mx-8 md:px-8 lg:top-0">
        <div className="flex items-center gap-3">
          {voltar && (
            <Link
              to={voltar}
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-full text-petroleo transition-colors hover:bg-petroleo/[0.07] md:size-9"
              aria-label="Voltar"
            >
              <ArrowLeft aria-hidden className="size-5" />
            </Link>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-xs text-cinza">
              {pagina.grupo === "paginas" ? "Página" : "Sistema"}
            </p>
            <h1 className="truncate font-serif text-lg leading-tight text-petroleo md:text-xl">
              {pagina.titulo}
            </h1>
          </div>
          <span className="hidden text-xs text-cinza sm:block" aria-live="polite">
            {salvar.isPending
              ? "Salvando…"
              : sujo
                ? "Alterações não salvas"
                : salvoEm
                  ? `Salvo ${relativo(salvoEm) === "agora" ? "agora" : `às ${hora(salvoEm)}`}`
                  : "Usando texto de exemplo"}
          </span>
          {pagina.path && (
            <a
              href={pagina.path}
              target="_blank"
              rel="noopener"
              className={acao("secundario", "sm", "hidden md:inline-flex")}
            >
              <ArrowSquareOut aria-hidden className="size-4" />
              Ver no site
            </a>
          )}
          <button
            type="button"
            onClick={tentarSalvar}
            disabled={salvar.isPending || !sujo}
            className={acao("primario", "sm", "relative")}
            title="Salvar (Ctrl+S)"
          >
            {salvar.isPending ? <Girando /> : <FloppyDisk aria-hidden className="size-4" />}
            Salvar
            {sujo && !salvar.isPending && (
              <span
                aria-hidden
                className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full border-2 border-gelo bg-ouro"
              />
            )}
          </button>
        </div>
      </div>

      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="max-w-2xl text-[0.9375rem] text-cinza">
          {DESCRICOES[pagina.key] ??
            "Edite os textos por seção. Use *asteriscos* nos títulos para destacar uma palavra em dourado."}
          {salvoEm && (
            <span className="mt-1 block text-xs" title={dataHora(salvoEm)}>
              Última edição {relativo(salvoEm)}.
            </span>
          )}
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={acao("fantasma", "sm")}
            onClick={() =>
              setAbertos(todosAbertos ? new Set() : new Set(pagina.campos.map((g) => g.key)))
            }
          >
            {todosAbertos ? "Recolher tudo" : "Abrir tudo"}
          </button>
          <button type="button" className={acao("fantasma", "sm")} onClick={restaurarTudo}>
            <ArrowCounterClockwise aria-hidden className="size-4" />
            Restaurar tudo
          </button>
          {pagina.path && (
            <a
              href={pagina.path}
              target="_blank"
              rel="noopener"
              className={acao("secundario", "sm", "md:hidden")}
            >
              <ArrowSquareOut aria-hidden className="size-4" />
              Ver no site
            </a>
          )}
        </div>
      </div>

      {Object.keys(erros).length > 0 && (
        <p
          role="alert"
          className="mb-5 flex items-start gap-2 rounded-[2px] border border-terracota/35 bg-terracota/[0.06] px-4 py-3 text-sm text-terracota-texto"
        >
          <WarningCircle aria-hidden weight="bold" className="mt-0.5 size-4 shrink-0" />
          Há campos a corrigir. As seções com problema foram abertas.
        </p>
      )}

      <div className="space-y-3">
        {pagina.campos.map((g) => {
          const aberto = abertos.has(g.key);
          const temErro = Object.keys(erros).some((k) => k.startsWith(`${g.key}.`));
          const idPainel = `grupo-${g.key}`;
          return (
            <Cartao key={g.key} className={cn(temErro && "border-terracota/60")}>
              <h2>
                <button
                  type="button"
                  onClick={() => alternar(g.key)}
                  aria-expanded={aberto}
                  aria-controls={idPainel}
                  className="flex min-h-14 w-full items-center gap-3 px-5 py-3 text-left md:px-6"
                >
                  <CaretDown
                    aria-hidden
                    className={cn(
                      "size-4 shrink-0 text-cinza transition-transform duration-200",
                      !aberto && "-rotate-90",
                    )}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium text-grafite">{g.label}</span>
                    {g.help && !aberto && (
                      <span className="block truncate text-xs text-cinza">{g.help}</span>
                    )}
                  </span>
                  {temErro && (
                    <WarningCircle
                      aria-label="Tem campos a corrigir"
                      className="size-4 text-terracota-texto"
                    />
                  )}
                </button>
              </h2>
              <AnimatePresence initial={false}>
                {aberto && (
                  <motion.div
                    id={idPainel}
                    initial={reduzir ? { opacity: 0 } : { height: 0, opacity: 0 }}
                    animate={reduzir ? { opacity: 1 } : { height: "auto", opacity: 1 }}
                    exit={reduzir ? { opacity: 0 } : { height: 0, opacity: 0 }}
                    transition={{ duration: 0.26, ease: EASE }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-linha px-5 pt-5 pb-6 md:px-6">
                      {g.help && <p className="mb-5 text-sm text-cinza">{g.help}</p>}
                      <EditorCampos
                        campos={g.fields}
                        valores={(valores[g.key] ?? {}) as Values}
                        onChange={(v) => setValores((atual) => ({ ...atual, [g.key]: v }))}
                        erros={erros}
                        caminho={g.key}
                      />
                      <div className="mt-6 border-t border-linha pt-4">
                        <button
                          type="button"
                          className={acao("fantasma", "sm")}
                          onClick={() => restaurarGrupo(g)}
                        >
                          <ArrowCounterClockwise aria-hidden className="size-4" />
                          Restaurar texto de exemplo desta seção
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Cartao>
          );
        })}
      </div>
    </>
  );
}
