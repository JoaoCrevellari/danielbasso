import { CaretRight, Check } from "@phosphor-icons/react";

import { getCollection, opcaoLabel, type CollectionConfig } from "@/content/collections";
import type { Field } from "@/content/fields";
import { lista, repeticao, txt, type ItemConteudo } from "@/lib/conteudo";
import { Botao } from "./Botao";
import { CartaoOferta } from "./CartaoOferta";
import { Faq, type ItemFaq } from "./Faq";
import { FormularioLead } from "./FormularioLead";
import { Imagem } from "./Imagem";
import { LinkInterno } from "./LinkInterno";
import { Markdown } from "./Markdown";
import { CabecalhoSecao, Secao } from "./Secao";
import { SeloEtapa, SeloStatus } from "./Selo";
import { TextoExpansivel } from "./TextoExpansivel";

const i = (n: number) => ({ "--i": n }) as React.CSSProperties;

/** Campos que ganham destaque próprio e não entram na ficha técnica. */
const FORA_DA_FICHA = new Set(["etapa", "status_oferta", "investimento", "situacao", "cor"]);

function valorFicha(col: CollectionConfig, f: Field, item: ItemConteudo) {
  if (f.type === "select") return opcaoLabel(col, f.key, txt(item, f.key));
  if (f.type === "text" || f.type === "number") return txt(item, f.key);
  return undefined;
}

/**
 * Página de detalhe de curso, mentoria ou treinamento, montada a partir do registro da
 * coleção: ficha técnica, listas e roteiros aparecem sozinhos quando preenchidos.
 * Ordem fixa para o visitante sempre saber onde está cada informação:
 * abertura → ficha → sobre → o que você leva → programa → dúvidas → interesse → veja também.
 */
export function PaginaOferta({
  item,
  relacionados,
}: {
  item: ItemConteudo;
  relacionados: ItemConteudo[];
}) {
  const col = getCollection(item.collection)!;
  const artigo = col.genero === "a" ? "a" : "o";
  const nome = col.singular.toLowerCase();
  const ficha = col.fields
    .filter((f) => !FORA_DA_FICHA.has(f.key))
    .map((f) => ({ rotulo: f.label, valor: valorFicha(col, f, item) }))
    .filter((x): x is { rotulo: string; valor: string } => !!x.valor);
  const listas = col.fields
    .filter((f) => f.type === "list")
    .map((f) => ({ f, itens: lista(item, f.key) }))
    .filter((l) => l.itens.length);
  const [publico, ...outrasListas] = listas;
  const roteiros = col.fields
    .filter((f) => f.type === "repeater" && f.key !== "faq")
    .map((f) => ({
      f,
      itens: repeticao<{ titulo?: string; descricao?: string }>(item, f.key).filter(
        (x) => x.titulo,
      ),
    }))
    .filter((r) => r.itens.length);
  const faq = repeticao<ItemFaq>(item, "faq").filter((f) => f.pergunta);
  const investimento = txt(item, "investimento");
  const corporativo = item.collection === "treinamento";
  const rotuloInteresse = col.interesse ?? "Quero saber mais";

  return (
    <>
      {/* ── Abertura ─────────────────────────────────────────────────────── */}
      <section className="pt-cabecalho">
        <div className="container-site grid items-center gap-8 pt-8 pb-12 md:grid-cols-12 md:gap-10 md:pt-12 md:pb-16">
          <div className="md:col-span-7">
            <nav
              aria-label="Você está em"
              className="flex flex-wrap items-center gap-2 text-[0.8125rem] text-cinza anima-subir"
            >
              <LinkInterno to={col.path ?? "/"} className="transition-colors hover:text-petroleo">
                {col.plural}
              </LinkInterno>
              <CaretRight className="size-3" aria-hidden />
              <span className="truncate text-petroleo">{item.title}</span>
            </nav>
            <div className="mt-6 flex flex-wrap gap-2 anima-subir" style={i(1)}>
              <SeloEtapa etapa={txt(item, "etapa")} />
              <SeloStatus status={txt(item, "status_oferta")} />
            </div>
            <h1 className="type-display mt-4 pb-1 text-petroleo anima-subir" style={i(1)}>
              {item.title}
            </h1>
            {item.subtitle && (
              <p
                className="mt-3 font-serif text-[1.25rem] leading-snug text-cinza italic anima-subir"
                style={i(2)}
              >
                {item.subtitle}
              </p>
            )}
            {item.excerpt && (
              <p
                className="mt-5 max-w-[56ch] text-[1.0625rem] leading-relaxed text-grafite anima-subir"
                style={i(3)}
              >
                {item.excerpt}
              </p>
            )}
            <div
              className="mt-8 flex flex-col gap-3 anima-subir sm:flex-row sm:items-center"
              style={i(4)}
            >
              <Botao href="#interesse">{rotuloInteresse}</Botao>
              <Botao
                href="whatsapp"
                variante="contorno"
                mensagemWhatsApp={`Olá, Daniel. Tenho interesse em: ${item.title}.`}
              >
                Tirar dúvidas
              </Botao>
            </div>
          </div>
          <div className="md:col-span-5">
            <Imagem
              src={item.cover_url}
              alt=""
              prioridade
              className="aspect-[21/9] rounded-[2px] anima-imagem md:aspect-[4/3]"
              sizes="(min-width: 768px) 40vw, 100vw"
              larguraMax={1000}
            />
          </div>
        </div>
      </section>

      {/* ── Ficha técnica ────────────────────────────────────────────────── */}
      {(ficha.length > 0 || investimento) && (
        <section className="border-y border-linha bg-papel" aria-label="Ficha técnica">
          <dl
            className="container-site grid grid-cols-2 gap-x-6 gap-y-5 py-7 sm:grid-cols-3 lg:grid-flow-col lg:grid-cols-none lg:auto-cols-fr"
            data-revelar-grupo
          >
            {ficha.map((d) => (
              <div
                key={d.rotulo}
                className="min-w-0 lg:border-l lg:border-linha lg:pl-6 lg:first:border-l-0 lg:first:pl-0"
              >
                <dt className="type-meta text-cinza">{d.rotulo}</dt>
                <dd className="mt-1 font-serif text-[1.15rem] leading-snug text-petroleo">
                  {d.valor}
                </dd>
              </div>
            ))}
            {investimento && (
              <div className="lg:border-l lg:border-linha lg:pl-6">
                <dt className="type-meta text-cinza">Investimento</dt>
                <dd className="mt-1 font-serif text-[1.15rem] text-petroleo">{investimento}</dd>
              </div>
            )}
          </dl>
        </section>
      )}

      {/* ── Sobre + público ──────────────────────────────────────────────── */}
      <Secao>
        <div className="grade gap-y-10">
          <div className="col-span-12 lg:col-span-7" data-revelar-grupo>
            <p className="rotulo-secao mb-4">{`Sobre ${artigo} ${nome}`}</p>
            <TextoExpansivel>
              <Markdown>{item.body}</Markdown>
            </TextoExpansivel>
          </div>
          {publico && (
            <aside className="col-span-12 lg:col-span-4 lg:col-start-9" data-revelar>
              <div className="rounded-[2px] border border-linha bg-papel p-6 md:p-8">
                <h2 className="type-h2 text-petroleo">{publico.f.label}</h2>
                <ul className="mt-5 flex flex-col gap-3.5">
                  {publico.itens.map((t) => (
                    <li key={t} className="flex gap-3 text-grafite">
                      <Check className="mt-1 size-4 shrink-0 text-ouro-texto" weight="bold" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          )}
        </div>
      </Secao>

      {/* ── Demais listas (o que você leva, objetivos, entregas) ─────────── */}
      {outrasListas.map(({ f, itens }) => (
        <Secao key={f.key} tom="branco" compacta>
          <CabecalhoSecao rotulo="Na prática" titulo={f.label} />
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" data-revelar-grupo>
            {itens.map((t) => (
              <li
                key={t}
                className="flex gap-3 rounded-[2px] border border-linha bg-gelo p-5 text-grafite"
              >
                <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-petroleo text-gelo">
                  <Check className="size-3.5" weight="bold" />
                </span>
                <span className="text-[0.975rem] leading-snug">{t}</span>
              </li>
            ))}
          </ul>
        </Secao>
      ))}

      {/* ── Programa (módulos, passos, roteiro) ──────────────────────────── */}
      {roteiros.map(({ f, itens }) => (
        <Secao key={f.key} tom="suave">
          <CabecalhoSecao
            rotulo="Programa"
            titulo={f.label}
            texto={`${itens.length} ${itens.length === 1 ? "etapa" : "etapas"}, na ordem em que acontecem.`}
          />
          <ol
            className="trilho mt-conteudo md:grid md:grid-cols-2 md:gap-4 lg:grid-cols-4"
            data-revelar-grupo
          >
            {itens.map((m, n) => (
              <li key={n} className="flex flex-col rounded-[2px] border border-linha bg-papel p-6">
                <span className="type-numeral text-[2rem] leading-none text-ouro-texto">
                  {String(n + 1).padStart(2, "0")}
                </span>
                <h3 className="type-h3 mt-4 text-petroleo">{m.titulo}</h3>
                {m.descricao && (
                  <p className="mt-2 text-[0.95rem] leading-relaxed text-cinza">{m.descricao}</p>
                )}
              </li>
            ))}
          </ol>
        </Secao>
      ))}

      {/* ── Dúvidas ──────────────────────────────────────────────────────── */}
      {faq.length > 0 && (
        <Secao>
          <div className="grade gap-y-8">
            <div className="col-span-12 lg:col-span-4" data-revelar-grupo>
              <p className="rotulo-secao mb-4">Dúvidas</p>
              <h2 className="type-h1 text-petroleo">Perguntas frequentes</h2>
              <p className="mt-4 text-cinza">
                Não encontrou sua pergunta? Fale comigo pelo WhatsApp.
              </p>
            </div>
            <div className="col-span-12 lg:col-span-7 lg:col-start-6" data-revelar>
              <Faq itens={faq} />
            </div>
          </div>
        </Secao>
      )}

      {/* ── Interesse ────────────────────────────────────────────────────── */}
      <Secao tom="escuro" id="interesse" semFlutuante>
        <div className="grade gap-y-8">
          <div className="col-span-12 lg:col-span-5" data-revelar-grupo>
            <p className="rotulo-secao mb-4">{corporativo ? "Proposta" : "Lista de interesse"}</p>
            <h2 className="type-h1 text-gelo">
              {corporativo ? "Vamos desenhar a proposta" : rotuloInteresse}
            </h2>
            <p className="mt-4 max-w-[44ch] text-[1.0625rem] leading-relaxed text-gelo/70 max-md:hidden">
              {corporativo
                ? "Conte um pouco sobre a empresa e a equipe. Retorno em até dois dias úteis com uma sugestão de formato."
                : "Deixe seu contato. Você recebe as datas, as condições e a resposta para qualquer dúvida antes de decidir."}
            </p>
          </div>
          <div className="col-span-12 lg:col-span-6 lg:col-start-7" data-revelar>
            <FormularioLead
              escuro
              tipo={corporativo ? "corporativo" : "interesse"}
              item={{ id: item.id, titulo: item.title }}
              empresa={corporativo ? "obrigatoria" : false}
              mensagem={corporativo ? true : false}
              rotuloMensagem="Contexto da equipe"
              botao={corporativo ? "Solicitar proposta" : "Enviar interesse"}
              sucesso={{
                titulo: "Interesse registrado",
                texto:
                  "Obrigado. Você vai receber as próximas informações pelo contato que deixou.",
              }}
            />
          </div>
        </div>
      </Secao>

      {/* ── Veja também ──────────────────────────────────────────────────── */}
      {relacionados.length > 0 && (
        <Secao>
          <CabecalhoSecao
            rotulo="Veja também"
            titulo={`Outr${artigo}s ${col.plural.toLowerCase()}`}
            acao={
              <Botao href={col.path ?? "/"} variante="texto">
                {`Ver ${col.genero === "a" ? "todas" : "todos"}`}
              </Botao>
            }
          />
          <div
            className="trilho mt-conteudo md:grid md:grid-cols-2 md:gap-8 lg:grid-cols-3"
            data-revelar-grupo
          >
            {relacionados.map((r) => (
              <CartaoOferta key={r.id} item={r} />
            ))}
          </div>
        </Secao>
      )}
    </>
  );
}
