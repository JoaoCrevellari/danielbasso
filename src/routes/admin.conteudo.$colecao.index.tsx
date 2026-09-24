/**
 * Lista de uma coleção: busca, filtro de status, reordenação manual, publicar/despublicar,
 * duplicar e excluir.
 */
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowDown,
  ArrowSquareOut,
  ArrowUp,
  CopySimple,
  Eye,
  EyeSlash,
  Image as IconeImagem,
  Plus,
  Stack,
  Star,
  Trash,
} from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useMemo, useState } from "react";

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
  Segmentado,
  Selo,
  TopoPagina,
  acao,
  acaoIcone,
} from "@/components/admin/ui";
import { getCollection, type CollectionConfig } from "@/content/collections";
import {
  alterarStatusItemFn,
  duplicarItemFn,
  excluirItemFn,
  listarItensAdminFn,
  reordenarItensFn,
  type ItemLista,
} from "@/lib/admin/conteudo.functions";
import { dataCurta, mensagemErro } from "@/lib/admin/formato";

export const Route = createFileRoute("/admin/conteudo/$colecao/")({
  head: ({ params }) => ({
    meta: [
      { title: `${getCollection(params.colecao)?.plural ?? "Conteúdo"} | Painel` },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ListaColecao,
});

type FiltroStatus = "todos" | "published" | "draft";

function ListaColecao() {
  const { colecao } = Route.useParams();
  const col = getCollection(colecao);
  if (!col) {
    return (
      <EstadoVazio
        icone={<Stack />}
        titulo="Coleção não encontrada"
        texto="Este endereço não corresponde a nenhuma coleção do site."
        acao={
          <Link to="/admin" className={acao("secundario")}>
            Voltar à visão geral
          </Link>
        }
      />
    );
  }
  return <Lista col={col} />;
}

function Lista({ col }: { col: CollectionConfig }) {
  const qc = useQueryClient();
  const toast = useToast();
  const confirmar = useConfirmar();
  const navigate = useNavigate();
  const reduzir = useReducedMotion();
  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState<FiltroStatus>("todos");
  const chave = QK.itens(col.key);

  const q = useQuery({
    queryKey: chave,
    queryFn: () => listarItensAdminFn({ data: { collection: col.key } }),
  });
  const itens = useMemo(() => q.data ?? [], [q.data]);

  const visiveis = useMemo(() => {
    const t = busca.trim().toLowerCase();
    return itens.filter(
      (i) =>
        (status === "todos" || i.status === status) &&
        (!t ||
          i.title.toLowerCase().includes(t) ||
          i.slug.includes(t) ||
          (i.subtitle ?? "").toLowerCase().includes(t)),
    );
  }, [itens, busca, status]);

  const manual = col.ordem === "manual";
  const podeReordenar = manual && !busca.trim() && status === "todos";
  const contagem = {
    todos: itens.length,
    published: itens.filter((i) => i.status === "published").length,
    draft: itens.filter((i) => i.status === "draft").length,
  };

  const mudarStatus = useMutation({
    mutationFn: (v: { id: string; status: "draft" | "published" }) =>
      alterarStatusItemFn({ data: v }),
    onMutate: async (v) => {
      await qc.cancelQueries({ queryKey: chave });
      const antes = qc.getQueryData<ItemLista[]>(chave);
      qc.setQueryData<ItemLista[]>(chave, (l) =>
        l?.map((i) =>
          i.id === v.id
            ? {
                ...i,
                status: v.status,
                published_at:
                  i.published_at ?? (v.status === "published" ? new Date().toISOString() : null),
              }
            : i,
        ),
      );
      return { antes };
    },
    onError: (e, _v, ctx) => {
      if (ctx?.antes) qc.setQueryData(chave, ctx.antes);
      toast.erro(mensagemErro(e));
    },
    onSuccess: (_r, v) => {
      toast.sucesso(v.status === "published" ? "Publicado no site." : "Movido para rascunho.");
      qc.invalidateQueries({ queryKey: QK.item(v.id) });
    },
    onSettled: () => qc.invalidateQueries({ queryKey: chave }),
  });

  const duplicar = useMutation({
    mutationFn: (id: string) => duplicarItemFn({ data: { id } }),
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: chave });
      toast.sucesso("Cópia criada como rascunho.", {
        rotulo: "Abrir",
        onClick: () =>
          navigate({ to: "/admin/conteudo/$colecao/$id", params: { colecao: col.key, id: r.id } }),
      });
    },
    onError: (e) => toast.erro(mensagemErro(e)),
  });

  const excluir = useMutation({
    mutationFn: (id: string) => excluirItemFn({ data: { id } }),
    onSuccess: (_r, id) => {
      qc.setQueryData<ItemLista[]>(chave, (l) => l?.filter((i) => i.id !== id));
      qc.removeQueries({ queryKey: QK.item(id) });
      toast.sucesso("Excluído.");
    },
    onError: (e) => toast.erro(mensagemErro(e)),
  });

  const reordenar = useMutation({
    mutationFn: (mudancas: { id: string; sort_order: number }[]) =>
      reordenarItensFn({ data: { itens: mudancas } }),
    onError: (e) => {
      toast.erro(mensagemErro(e));
      qc.invalidateQueries({ queryKey: chave });
    },
  });

  function mover(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= itens.length) return;
    const nova = [...itens];
    [nova[i], nova[j]] = [nova[j], nova[i]];
    const comOrdem = nova.map((it, k) => ({ ...it, sort_order: (k + 1) * 10 }));
    const mudancas = comOrdem
      .filter((it) => itens.find((o) => o.id === it.id)?.sort_order !== it.sort_order)
      .map((it) => ({ id: it.id, sort_order: it.sort_order }));
    qc.setQueryData(chave, comOrdem);
    if (mudancas.length) reordenar.mutate(mudancas);
  }

  const artigo = col.genero === "a" ? "a" : "o";
  const novo = col.genero === "a" ? "Nova" : "Novo";

  return (
    <>
      <TopoPagina
        titulo={col.plural}
        descricao={col.descricao}
        acoes={
          <Link
            to="/admin/conteudo/$colecao/$id"
            params={{ colecao: col.key, id: "novo" }}
            className={acao("primario")}
          >
            <Plus aria-hidden weight="bold" className="size-4" />
            {novo} {col.singular.toLowerCase()}
          </Link>
        }
      />

      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <CampoBusca
          valor={busca}
          onChange={setBusca}
          rotulo="Buscar por título"
          className="md:max-w-sm md:flex-1"
        />
        <Segmentado<FiltroStatus>
          rotulo="Filtrar por status"
          valor={status}
          onChange={setStatus}
          className="sem-barra max-w-full self-start overflow-x-auto"
          opcoes={[
            { value: "todos", label: `Todos (${contagem.todos})` },
            { value: "published", label: `Publicados (${contagem.published})` },
            { value: "draft", label: `Rascunhos (${contagem.draft})` },
          ]}
        />
      </div>

      {manual && !podeReordenar && itens.length > 1 && (
        <p className="mb-3 text-xs text-cinza">
          Para reordenar, limpe a busca e mostre todos os itens.
        </p>
      )}

      {q.isError ? (
        <EstadoErro mensagem={mensagemErro(q.error)} onTentar={() => q.refetch()} />
      ) : q.isPending ? (
        <Cartao aria-hidden>
          {Array.from({ length: 5 }, (_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 border-b border-linha px-4 py-3 last:border-0"
            >
              <Esqueleto className="size-12 shrink-0" />
              <div className="flex-1">
                <Esqueleto className="h-4 w-2/3 max-w-xs" />
                <Esqueleto className="mt-2 h-3 w-1/3 max-w-40" />
              </div>
              <Esqueleto className="hidden h-5 w-20 rounded-full sm:block" />
            </div>
          ))}
        </Cartao>
      ) : itens.length === 0 ? (
        <Cartao>
          <EstadoVazio
            icone={<Stack />}
            titulo={`Nenhum ${col.singular.toLowerCase()} cadastrad${artigo} ainda`}
            texto={`Crie ${artigo === "a" ? "a primeira" : "o primeiro"} para ${artigo === "a" ? "ela" : "ele"} aparecer no site depois de publicad${artigo}.`}
            acao={
              <Link
                to="/admin/conteudo/$colecao/$id"
                params={{ colecao: col.key, id: "novo" }}
                className={acao("primario")}
              >
                <Plus aria-hidden weight="bold" className="size-4" />
                {novo} {col.singular.toLowerCase()}
              </Link>
            }
          />
        </Cartao>
      ) : visiveis.length === 0 ? (
        <Cartao>
          <EstadoVazio
            titulo="Nada encontrado"
            texto="Tente outro termo ou mude o filtro de status."
          />
        </Cartao>
      ) : (
        <Cartao>
          <ul>
            <AnimatePresence initial={false}>
              {visiveis.map((item) => {
                const idx = itens.findIndex((x) => x.id === item.id);
                const publicado = item.status === "published";
                return (
                  <motion.li
                    key={item.id}
                    layout={!reduzir ? "position" : false}
                    initial={reduzir ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.15 } }}
                    transition={{ duration: 0.25, ease: EASE }}
                    className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-linha px-3 py-3 last:border-0 sm:flex-nowrap md:px-4"
                  >
                    {podeReordenar && (
                      <div className="hidden shrink-0 flex-col sm:flex">
                        <button
                          type="button"
                          className={acaoIcone(true, "size-9 md:size-7")}
                          aria-label={`Subir ${item.title}`}
                          disabled={idx === 0 || reordenar.isPending}
                          onClick={() => mover(idx, -1)}
                        >
                          <ArrowUp aria-hidden className="size-4" />
                        </button>
                        <button
                          type="button"
                          className={acaoIcone(true, "size-9 md:size-7")}
                          aria-label={`Descer ${item.title}`}
                          disabled={idx === itens.length - 1 || reordenar.isPending}
                          onClick={() => mover(idx, 1)}
                        >
                          <ArrowDown aria-hidden className="size-4" />
                        </button>
                      </div>
                    )}
                    <Link
                      to="/admin/conteudo/$colecao/$id"
                      params={{ colecao: col.key, id: item.id }}
                      className="group flex min-w-0 flex-1 items-center gap-3.5"
                    >
                      <span className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-[2px] bg-gelo-2 text-petroleo/40">
                        {item.cover_url ? (
                          <img
                            src={item.cover_url}
                            alt=""
                            loading="lazy"
                            className="size-full object-cover"
                          />
                        ) : (
                          <IconeImagem aria-hidden className="size-5" />
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="flex items-center gap-1.5">
                          <span className="truncate font-medium text-grafite group-hover:text-petroleo group-hover:underline">
                            {item.title}
                          </span>
                          {item.featured && (
                            <Star
                              aria-label="Em destaque"
                              weight="fill"
                              className="size-3.5 shrink-0 text-ouro"
                            />
                          )}
                        </span>
                        <span className="block truncate text-xs text-cinza">
                          {col.path ? `${col.path}/${item.slug}` : item.subtitle || item.slug}
                        </span>
                      </span>
                    </Link>
                    <div className="flex w-full flex-wrap items-center justify-between gap-x-3 gap-y-1 sm:w-auto sm:flex-nowrap sm:justify-end">
                      <div className="flex items-center gap-3">
                        <Selo tom={publicado ? "salvia" : "neutro"} ponto>
                          {publicado ? "Publicado" : "Rascunho"}
                        </Selo>
                        <span
                          className="hidden w-20 text-right text-xs text-cinza tabular-nums md:inline"
                          title={publicado ? "Data de publicação" : "Última edição"}
                        >
                          {dataCurta(publicado ? item.published_at : item.updated_at)}
                        </span>
                      </div>
                      <div className="flex items-center">
                        {podeReordenar && (
                          <>
                            <button
                              type="button"
                              className={acaoIcone(true, "sm:hidden")}
                              aria-label={`Subir ${item.title}`}
                              disabled={idx === 0 || reordenar.isPending}
                              onClick={() => mover(idx, -1)}
                            >
                              <ArrowUp aria-hidden className="size-[1.1rem]" />
                            </button>
                            <button
                              type="button"
                              className={acaoIcone(true, "sm:hidden")}
                              aria-label={`Descer ${item.title}`}
                              disabled={idx === itens.length - 1 || reordenar.isPending}
                              onClick={() => mover(idx, 1)}
                            >
                              <ArrowDown aria-hidden className="size-[1.1rem]" />
                            </button>
                          </>
                        )}
                        <button
                          type="button"
                          className={acaoIcone(true)}
                          aria-label={
                            publicado ? `Despublicar ${item.title}` : `Publicar ${item.title}`
                          }
                          title={publicado ? "Despublicar" : "Publicar"}
                          onClick={() =>
                            mudarStatus.mutate({
                              id: item.id,
                              status: publicado ? "draft" : "published",
                            })
                          }
                        >
                          {publicado ? (
                            <EyeSlash aria-hidden className="size-[1.1rem]" />
                          ) : (
                            <Eye aria-hidden className="size-[1.1rem]" />
                          )}
                        </button>
                        {publicado && col.path && (
                          <a
                            href={`${col.path}/${item.slug}`}
                            target="_blank"
                            rel="noopener"
                            className={acaoIcone(true, "hidden sm:inline-flex")}
                            aria-label={`Ver ${item.title} no site (abre em nova aba)`}
                            title="Ver no site"
                          >
                            <ArrowSquareOut aria-hidden className="size-[1.1rem]" />
                          </a>
                        )}
                        <button
                          type="button"
                          className={acaoIcone(true)}
                          aria-label={`Duplicar ${item.title}`}
                          title="Duplicar"
                          disabled={duplicar.isPending}
                          onClick={() => duplicar.mutate(item.id)}
                        >
                          <CopySimple aria-hidden className="size-[1.1rem]" />
                        </button>
                        <button
                          type="button"
                          className={acaoIcone(true, "text-terracota-texto hover:bg-terracota/10")}
                          aria-label={`Excluir ${item.title}`}
                          title="Excluir"
                          onClick={async () => {
                            const ok = await confirmar({
                              titulo: `Excluir ${artigo} ${col.singular.toLowerCase()}?`,
                              descricao: (
                                <>
                                  <strong>{item.title}</strong> será apagad{artigo} de vez
                                  {publicado ? " e sai do site imediatamente" : ""}. Não dá para
                                  desfazer.
                                </>
                              ),
                              confirmar: "Excluir",
                              perigo: true,
                            });
                            if (ok) excluir.mutate(item.id);
                          }}
                        >
                          <Trash aria-hidden className="size-[1.1rem]" />
                        </button>
                      </div>
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        </Cartao>
      )}
    </>
  );
}
