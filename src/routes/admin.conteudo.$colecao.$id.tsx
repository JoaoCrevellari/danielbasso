/**
 * Editor de um item de coleção (id = "novo" cria).
 *
 * Colunas comuns (título, slug, subtítulo, resumo, corpo, capa, destaque, status, data,
 * SEO) + campos próprios da coleção (`fields`, gravados em `data`) pelo editor genérico.
 * Aviso de alterações não salvas, Ctrl/Cmd+S para salvar, "Ver no site" quando publicado.
 */
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowSquareOut,
  FloppyDisk,
  Stack,
  Trash,
  WarningCircle,
} from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useId, useMemo, useRef, useState } from "react";

import { EditorCampos, validarCampos, type Erros } from "@/components/admin/campos/EditorCampos";
import { AreaTexto, Contador, Moldura, ariaCampo } from "@/components/admin/campos/base";
import { QK } from "@/components/admin/contexto";
import { useConfirmar } from "@/components/admin/Dialogo";
import { AvisoSaida, useProtecaoSaida } from "@/components/admin/ProtecaoSaida";
import { useToast } from "@/components/admin/Toast";
import {
  Cartao,
  Esqueleto,
  EstadoErro,
  EstadoVazio,
  Girando,
  Interruptor,
  TituloCartao,
  acao,
  classeCampo,
} from "@/components/admin/ui";
import { getCollection, type CollectionConfig } from "@/content/collections";
import type { Field, Values } from "@/content/fields";
import {
  excluirItemFn,
  obterItemAdminFn,
  salvarItemFn,
  type ItemAdmin,
} from "@/lib/admin/conteudo.functions";
import {
  SLUG_REGEX,
  hora,
  isoParaLocal,
  localParaIso,
  mensagemErro,
  relativo,
  slugificar,
} from "@/lib/admin/formato";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/conteudo/$colecao/$id")({
  head: ({ params }) => {
    const col = getCollection(params.colecao);
    const t =
      params.id === "novo"
        ? `${col?.genero === "a" ? "Nova" : "Novo"} ${col?.singular.toLowerCase() ?? "item"}`
        : `Editar ${col?.singular.toLowerCase() ?? "item"}`;
    return { meta: [{ title: `${t} | Painel` }, { name: "robots", content: "noindex, nofollow" }] };
  },
  component: EditorItemPagina,
});

type Form = {
  title: string;
  slug: string;
  subtitle: string;
  excerpt: string;
  body: string;
  cover_url: string;
  status: "draft" | "published";
  featured: boolean;
  published_at: string | null;
  seo_title: string;
  seo_description: string;
  data: Values;
};

function formDe(item: ItemAdmin | null): Form {
  return {
    title: item?.title ?? "",
    slug: item?.slug ?? "",
    subtitle: item?.subtitle ?? "",
    excerpt: item?.excerpt ?? "",
    body: item?.body ?? "",
    cover_url: item?.cover_url ?? "",
    status: item?.status === "published" ? "published" : "draft",
    featured: item?.featured ?? false,
    published_at: item?.published_at ?? null,
    seo_title: item?.seo_title ?? "",
    seo_description: item?.seo_description ?? "",
    data: item?.data ?? {},
  };
}

function camposColunas(col: CollectionConfig): Field[] {
  const c = col.columns;
  const out: Field[] = [];
  if (c.subtitle)
    out.push({
      key: "subtitle",
      type: "text",
      label: c.subtitle.label,
      help: c.subtitle.help,
      max: 200,
    });
  if (c.excerpt)
    out.push({
      key: "excerpt",
      type: "textarea",
      rows: 3,
      label: c.excerpt.label,
      help: c.excerpt.help,
      max: 400,
    });
  if (c.cover_url)
    out.push({
      key: "cover_url",
      type: "image",
      label: c.cover_url.label,
      help: c.cover_url.help,
      aspect: col.key === "livro" ? "2/3" : col.key === "depoimento" ? "1/1" : "16/9",
    });
  if (c.body) out.push({ key: "body", type: "markdown", label: c.body.label, help: c.body.help });
  return out;
}

function EditorItemPagina() {
  const { colecao, id } = Route.useParams();
  const col = getCollection(colecao);
  if (!col) {
    return (
      <EstadoVazio
        icone={<Stack />}
        titulo="Coleção não encontrada"
        acao={
          <Link to="/admin" className={acao("secundario")}>
            Voltar à visão geral
          </Link>
        }
      />
    );
  }
  // key: trocar de item (ou criar e ganhar id) remonta o editor com estado limpo.
  return <CarregarItem key={id} col={col} id={id} />;
}

function CarregarItem({ col, id }: { col: CollectionConfig; id: string }) {
  const novo = id === "novo";
  const q = useQuery({
    queryKey: QK.item(id),
    queryFn: () => obterItemAdminFn({ data: { id } }),
    enabled: !novo,
    staleTime: 0,
  });

  if (!novo && q.isPending) return <EsqueletoEditor />;
  if (!novo && q.isError)
    return <EstadoErro mensagem={mensagemErro(q.error)} onTentar={() => q.refetch()} />;
  if (!novo && !q.data) {
    return (
      <EstadoVazio
        icone={<Stack />}
        titulo="Item não encontrado"
        texto="Ele pode ter sido excluído por outra pessoa."
        acao={
          <Link
            to="/admin/conteudo/$colecao"
            params={{ colecao: col.key }}
            className={acao("secundario")}
          >
            Voltar para {col.plural.toLowerCase()}
          </Link>
        }
      />
    );
  }
  return <Editor col={col} item={novo ? null : (q.data ?? null)} />;
}

function EsqueletoEditor() {
  return (
    <div aria-hidden>
      <Esqueleto className="h-4 w-24" />
      <Esqueleto className="mt-4 h-10 w-2/3 max-w-md" />
      <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-5 rounded-[2px] border border-linha bg-papel p-6">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i}>
              <Esqueleto className="h-3.5 w-28" />
              <Esqueleto className={cn("mt-2", i === 3 ? "h-40" : "h-11")} />
            </div>
          ))}
        </div>
        <div className="space-y-3 rounded-[2px] border border-linha bg-papel p-6">
          <Esqueleto className="h-11" />
          <Esqueleto className="h-11" />
          <Esqueleto className="h-11" />
        </div>
      </div>
    </div>
  );
}

function Editor({ col, item }: { col: CollectionConfig; item: ItemAdmin | null }) {
  const novo = !item;
  const qc = useQueryClient();
  const toast = useToast();
  const confirmar = useConfirmar();
  const navigate = useNavigate();
  const idBase = useId();

  const [form, setForm] = useState<Form>(() => formDe(item));
  const [base, setBase] = useState(() => JSON.stringify(formDe(item)));
  const [slugManual, setSlugManual] = useState(!novo);
  const [erros, setErros] = useState<Erros>({});
  const [salvoEm, setSalvoEm] = useState<string | null>(item?.updated_at ?? null);
  const [salvoStatus, setSalvoStatus] = useState(item?.status ?? "draft");
  const [salvoSlug, setSalvoSlug] = useState(item?.slug ?? "");

  const sujo = useMemo(() => JSON.stringify(form) !== base, [form, base]);
  const { bloqueio, liberar } = useProtecaoSaida(sujo);

  const colunas = useMemo(() => camposColunas(col), [col]);
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  function mudarTitulo(t: string) {
    setForm((f) => ({ ...f, title: t, slug: slugManual ? f.slug : slugificar(t) }));
  }

  function validar(): Erros {
    const e: Erros = {};
    if (!form.title.trim()) e.title = `Informe ${col.titleLabel.toLowerCase()}.`;
    if (!form.slug) e.slug = "Informe o endereço.";
    else if (!SLUG_REGEX.test(form.slug))
      e.slug = "Use só letras minúsculas, números e hífens (ex.: meu-curso).";
    Object.assign(
      e,
      validarCampos(colunas, form as unknown as Values),
      validarCampos(col.fields, form.data, "data"),
    );
    return e;
  }

  const salvar = useMutation({
    mutationFn: (f: Form) =>
      salvarItemFn({
        data: {
          id: item?.id,
          collection: col.key,
          title: f.title,
          slug: f.slug,
          subtitle: f.subtitle,
          excerpt: f.excerpt,
          body: f.body,
          cover_url: f.cover_url,
          status: f.status,
          featured: f.featured,
          published_at: f.published_at,
          seo_title: f.seo_title,
          seo_description: f.seo_description,
          data: f.data,
        },
      }),
    onSuccess: (salvo) => {
      const novoForm = formDe(salvo);
      qc.setQueryData(QK.item(salvo.id), salvo);
      qc.invalidateQueries({ queryKey: QK.itens(col.key) });
      setForm(novoForm);
      setBase(JSON.stringify(novoForm));
      setSalvoEm(salvo.updated_at);
      setSalvoStatus(salvo.status);
      setSalvoSlug(salvo.slug);
      setSlugManual(true);
      toast.sucesso(novo ? `${col.singular} criad${col.genero}.` : "Alterações salvas.");
      if (novo) {
        liberar();
        navigate({
          to: "/admin/conteudo/$colecao/$id",
          params: { colecao: col.key, id: salvo.id },
          replace: true,
        });
      }
    },
    onError: (e) => {
      const msg = mensagemErro(e);
      if (/slug|endereço/i.test(msg)) setErros((x) => ({ ...x, slug: msg }));
      toast.erro(msg);
    },
  });

  function tentarSalvar() {
    if (salvar.isPending) return;
    const e = validar();
    setErros(e);
    if (Object.keys(e).length) {
      toast.erro("Há campos a corrigir antes de salvar.");
      requestAnimationFrame(() => {
        const alvo = document.querySelector<HTMLElement>("[aria-invalid='true']");
        alvo?.focus();
        alvo?.scrollIntoView({ block: "center", behavior: "smooth" });
      });
      return;
    }
    salvar.mutate(form);
  }

  // Ctrl/Cmd+S
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

  const excluir = useMutation({
    mutationFn: () => excluirItemFn({ data: { id: item!.id } }),
    onSuccess: () => {
      qc.removeQueries({ queryKey: QK.item(item!.id) });
      qc.invalidateQueries({ queryKey: QK.itens(col.key) });
      toast.sucesso("Excluído.");
      liberar();
      navigate({ to: "/admin/conteudo/$colecao", params: { colecao: col.key }, replace: true });
    },
    onError: (e) => toast.erro(mensagemErro(e)),
  });

  const urlPublica = col.path && salvoSlug ? `${col.path}/${salvoSlug}` : null;
  const artigo = col.genero;

  return (
    <>
      <AvisoSaida bloqueio={bloqueio} />

      {/* Barra superior fixa: voltar, título, estado e salvar */}
      <div className="sticky top-14 z-30 -mx-4 mb-6 border-b border-linha bg-gelo/90 px-4 py-3 backdrop-blur-md md:-mx-8 md:px-8 lg:top-0">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/conteudo/$colecao"
            params={{ colecao: col.key }}
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-full text-petroleo transition-colors hover:bg-petroleo/[0.07] md:size-9"
            aria-label={`Voltar para ${col.plural.toLowerCase()}`}
          >
            <ArrowLeft aria-hidden className="size-5" />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-cinza">{col.plural}</p>
            <p className="truncate font-serif text-lg leading-tight text-petroleo md:text-xl">
              {form.title.trim() ||
                (novo
                  ? `${artigo === "a" ? "Nova" : "Novo"} ${col.singular.toLowerCase()}`
                  : "Sem título")}
            </p>
          </div>
          <span className="hidden text-xs text-cinza sm:block" aria-live="polite">
            {salvar.isPending
              ? "Salvando…"
              : sujo
                ? "Alterações não salvas"
                : salvoEm
                  ? `Salvo ${relativo(salvoEm) === "agora" ? "agora" : `às ${hora(salvoEm)}`}`
                  : ""}
          </span>
          {salvoStatus === "published" && urlPublica && (
            <a
              href={urlPublica}
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
            disabled={salvar.isPending || (!sujo && !novo)}
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

      {Object.keys(erros).length > 0 && (
        <p
          role="alert"
          className="mb-5 flex items-start gap-2 rounded-[2px] border border-terracota/35 bg-terracota/[0.06] px-4 py-3 text-sm text-terracota-texto"
        >
          <WarningCircle aria-hidden weight="bold" className="mt-0.5 size-4 shrink-0" />
          {Object.keys(erros).length === 1
            ? "Há 1 campo a corrigir."
            : `Há ${Object.keys(erros).length} campos a corrigir.`}{" "}
          Os campos estão marcados abaixo.
        </p>
      )}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_21rem] lg:items-start">
        {/* Coluna principal */}
        <div className="space-y-5">
          <Cartao>
            <div className="space-y-6 p-5 md:p-6">
              <Moldura
                id={`${idBase}-title`}
                rotulo={col.titleLabel}
                obrigatorio
                erro={erros.title}
              >
                <input
                  {...ariaCampo(`${idBase}-title`, { erro: erros.title, obrigatorio: true })}
                  type="text"
                  value={form.title}
                  onChange={(e) => mudarTitulo(e.target.value)}
                  className={cn(classeCampo, "font-serif text-[1.35rem] md:text-[1.5rem]")}
                  autoFocus={novo}
                />
              </Moldura>

              <Moldura
                id={`${idBase}-slug`}
                rotulo="Endereço (slug)"
                obrigatorio
                erro={erros.slug}
                ajuda={
                  col.path
                    ? slugManual && !novo && salvoStatus === "published"
                      ? "Mudar o endereço de algo já publicado quebra links antigos."
                      : "Gerado a partir do título. Pode editar."
                    : "Identificador interno, gerado a partir do nome."
                }
              >
                <div className="flex items-stretch">
                  {col.path && (
                    <span className="hidden items-center rounded-l-[2px] border border-r-0 border-linha-forte bg-gelo-2 px-3 text-sm text-cinza sm:flex">
                      {col.path}/
                    </span>
                  )}
                  <input
                    {...ariaCampo(`${idBase}-slug`, {
                      erro: erros.slug,
                      obrigatorio: true,
                      ajuda: true,
                    })}
                    type="text"
                    value={form.slug}
                    autoCapitalize="none"
                    spellCheck={false}
                    onChange={(e) => {
                      setSlugManual(true);
                      set(
                        "slug",
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9-]/g, "-")
                          .replace(/-{2,}/g, "-"),
                      );
                    }}
                    onBlur={() => set("slug", form.slug.replace(/^-+|-+$/g, ""))}
                    className={cn(
                      classeCampo,
                      "font-mono text-sm",
                      col.path && "sm:rounded-l-none",
                    )}
                  />
                </div>
              </Moldura>

              {colunas.length > 0 && (
                <EditorCampos
                  campos={colunas}
                  valores={form as unknown as Values}
                  onChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      subtitle: String(v.subtitle ?? ""),
                      excerpt: String(v.excerpt ?? ""),
                      body: String(v.body ?? ""),
                      cover_url: String(v.cover_url ?? ""),
                    }))
                  }
                  erros={erros}
                />
              )}
            </div>
          </Cartao>

          {col.fields.length > 0 && (
            <Cartao>
              <TituloCartao
                titulo={`Detalhes d${artigo} ${col.singular.toLowerCase()}`}
                descricao="Informações específicas desta coleção."
              />
              <div className="p-5 md:p-6">
                <EditorCampos
                  campos={col.fields}
                  valores={form.data}
                  onChange={(v) => set("data", v)}
                  erros={erros}
                  caminho="data"
                />
              </div>
            </Cartao>
          )}
        </div>

        {/* Lateral: publicação e SEO */}
        <div className="space-y-5 lg:sticky lg:top-24">
          <Cartao>
            <TituloCartao titulo="Publicação" />
            <div className="space-y-4 p-5 md:p-6">
              <div role="radiogroup" aria-label="Status" className="grid grid-cols-2 gap-2">
                {(
                  [
                    ["draft", "Rascunho"],
                    ["published", "Publicado"],
                  ] as const
                ).map(([v, r]) => (
                  <button
                    key={v}
                    type="button"
                    role="radio"
                    aria-checked={form.status === v}
                    onClick={() => set("status", v)}
                    className={cn(
                      "min-h-11 rounded-full border text-sm font-medium transition-colors md:min-h-10",
                      form.status === v
                        ? v === "published"
                          ? "border-salvia-texto bg-salvia-texto text-gelo"
                          : "border-petroleo bg-petroleo text-gelo"
                        : "border-linha-forte bg-papel text-cinza hover:border-petroleo hover:text-petroleo",
                    )}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <p className="text-xs text-cinza">
                {form.status === "published"
                  ? "Visível no site depois de salvar."
                  : "Rascunhos ficam só no painel, fora do site."}
              </p>

              <div className="border-t border-linha pt-3">
                <Interruptor
                  id={`${idBase}-destaque`}
                  ligado={form.featured}
                  onChange={(v) => set("featured", v)}
                  rotulo="Em destaque"
                  descricao="Aparece nas seções de destaque do site."
                />
              </div>

              <Moldura
                id={`${idBase}-data`}
                rotulo="Data de publicação"
                ajuda="Em branco, usa o momento em que for publicado. Horário de Brasília."
              >
                <input
                  {...ariaCampo(`${idBase}-data`, { ajuda: true })}
                  type="datetime-local"
                  value={isoParaLocal(form.published_at)}
                  onChange={(e) => set("published_at", localParaIso(e.target.value))}
                  className={classeCampo}
                />
              </Moldura>

              {salvoStatus === "published" && urlPublica && (
                <a
                  href={urlPublica}
                  target="_blank"
                  rel="noopener"
                  className={acao("secundario", "sm", "w-full md:hidden")}
                >
                  <ArrowSquareOut aria-hidden className="size-4" />
                  Ver no site
                </a>
              )}
            </div>
          </Cartao>

          <CartaoSeo col={col} form={form} set={set} idBase={idBase} />

          {!novo && (
            <div className="px-1">
              <button
                type="button"
                className={acao("perigo", "sm")}
                disabled={excluir.isPending}
                onClick={async () => {
                  const ok = await confirmar({
                    titulo: `Excluir ${artigo} ${col.singular.toLowerCase()}?`,
                    descricao: (
                      <>
                        <strong>{item?.title}</strong> será apagad{artigo} de vez
                        {salvoStatus === "published" ? " e sai do site imediatamente" : ""}. Não dá
                        para desfazer.
                      </>
                    ),
                    confirmar: "Excluir",
                    perigo: true,
                  });
                  if (ok) excluir.mutate();
                }}
              >
                {excluir.isPending ? <Girando /> : <Trash aria-hidden className="size-4" />}
                Excluir {col.singular.toLowerCase()}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function CartaoSeo({
  col,
  form,
  set,
  idBase,
}: {
  col: CollectionConfig;
  form: Form;
  set: <K extends keyof Form>(k: K, v: Form[K]) => void;
  idBase: string;
}) {
  const titulo = (form.seo_title || form.title || "Título da página").trim();
  const tituloCompleto = titulo.includes(SITE.shortName) ? titulo : `${titulo} | ${SITE.name}`;
  const descricao = (form.seo_description || form.excerpt || "").trim();
  const dominio = SITE.url.replace(/^https?:\/\//, "");
  const trilha = [dominio, ...(col.path ? col.path.split("/").filter(Boolean) : []), form.slug]
    .filter(Boolean)
    .join(" › ");

  return (
    <Cartao>
      <TituloCartao
        titulo="Busca e compartilhamento"
        descricao="Como aparece no Google e ao compartilhar."
      />
      <div className="space-y-5 p-5 md:p-6">
        <Moldura
          id={`${idBase}-seo-t`}
          rotulo="Título para o Google"
          ajuda="Em branco, usa o título."
          contador={<Contador atual={form.seo_title.length} max={60} />}
        >
          <input
            {...ariaCampo(`${idBase}-seo-t`, { ajuda: true })}
            type="text"
            value={form.seo_title}
            placeholder={form.title}
            onChange={(e) => set("seo_title", e.target.value)}
            className={classeCampo}
          />
        </Moldura>
        <Moldura
          id={`${idBase}-seo-d`}
          rotulo="Descrição para o Google"
          ajuda="Em branco, usa o resumo. Ideal: entre 120 e 160 caracteres."
          contador={<Contador atual={form.seo_description.length} max={160} />}
        >
          <AreaTexto
            {...ariaCampo(`${idBase}-seo-d`, { ajuda: true })}
            value={form.seo_description}
            rows={3}
            placeholder={form.excerpt}
            onChange={(e) => set("seo_description", e.target.value)}
          />
        </Moldura>

        <div>
          <p className="mb-2 text-xs font-medium tracking-[0.12em] text-cinza uppercase">Prévia</p>
          <div
            className="rounded-[2px] border border-linha bg-white px-4 py-3.5"
            aria-label="Prévia do resultado de busca"
          >
            <p className="truncate text-xs text-[#4d5156]">{trilha}</p>
            <p className="mt-1 line-clamp-2 text-[1.05rem] leading-snug text-[#1a0dab]">
              {tituloCompleto}
            </p>
            <p className="mt-1 line-clamp-2 text-[0.8125rem] leading-snug text-[#4d5156]">
              {descricao || "Sem descrição. O Google vai escolher um trecho da página."}
            </p>
          </div>
        </div>
      </div>
    </Cartao>
  );
}
