import { ArrowRight } from "@phosphor-icons/react";

import { getCollection, opcaoLabel } from "@/content/collections";
import { txt, type ItemConteudo } from "@/lib/conteudo";
import { cn } from "@/lib/utils";
import { Imagem } from "./Imagem";
import { LinkInterno } from "./LinkInterno";
import { SeloEtapa, SeloStatus } from "./Selo";

/** Linha de metadados curta: duração e formato. */
export function metaOferta(item: ItemConteudo) {
  const col = getCollection(item.collection);
  if (!col) return "";
  return [txt(item, "duracao"), opcaoLabel(col, "formato", txt(item, "formato"))]
    .filter(Boolean)
    .join(" · ");
}

/**
 * Cartão de curso, mentoria ou treinamento.
 * - vertical (padrão): imagem em cima, para grades de 3 colunas e trilhos no celular;
 * - horizontal: imagem à esquerda no desktop, para listas em 2 colunas que cabem numa tela.
 */
export function CartaoOferta({
  item,
  horizontal,
  className,
}: {
  item: ItemConteudo;
  horizontal?: boolean;
  className?: string;
}) {
  const col = getCollection(item.collection);
  if (!col?.path) return null;
  return (
    <LinkInterno
      to={`${col.path}/${item.slug}`}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-[2px] border border-linha bg-papel transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-1 hover:border-linha-forte hover:shadow-[0_24px_48px_-32px_rgb(0_31_46/0.45)]",
        horizontal && "md:flex-row",
        className,
      )}
    >
      <Imagem
        src={item.cover_url}
        alt=""
        className={cn("aspect-[16/10] shrink-0", horizontal && "md:aspect-auto md:w-[40%]")}
        imgClassName="transition-transform duration-[1.2s] ease-[var(--ease-out)] group-hover:scale-[1.05]"
        sizes={
          horizontal
            ? "(min-width: 1024px) 22vw, (min-width: 768px) 40vw, 82vw"
            : "(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 82vw"
        }
        larguraMax={800}
      />
      <div className="flex flex-1 flex-col p-5 md:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <SeloEtapa etapa={txt(item, "etapa")} />
          <SeloStatus status={txt(item, "status_oferta") || txt(item, "situacao")} />
        </div>
        <h3 className="type-h2 mt-3 text-petroleo transition-colors group-hover:text-petroleo-700">
          {item.title}
        </h3>
        {item.excerpt && (
          <p className="mt-2 line-clamp-2 text-[0.95rem] leading-relaxed text-cinza">
            {item.excerpt}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between gap-4 pt-5">
          <span className="type-meta text-cinza">{metaOferta(item)}</span>
          <span className="inline-flex items-center gap-1.5 text-[0.9rem] font-medium text-petroleo">
            Ver detalhes
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </LinkInterno>
  );
}
