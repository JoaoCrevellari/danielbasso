import { Link } from "@tanstack/react-router";

import { COLLECTIONS, opcaoLabel } from "@/content/collections";
import { dataExtenso, txt, type ItemConteudo } from "@/lib/conteudo";
import { cn } from "@/lib/utils";
import { Imagem } from "./Imagem";

export function metaPost(post: ItemConteudo) {
  const categoria = opcaoLabel(COLLECTIONS.post, "categoria", txt(post, "categoria"));
  return [categoria, dataExtenso(post.published_at)].filter(Boolean).join(" · ");
}

/** Post em destaque: imagem grande, título em serifa. */
export function PostDestaque({ post, className }: { post: ItemConteudo; className?: string }) {
  return (
    <Link
      to="/blog/$slug"
      params={{ slug: post.slug }}
      className={cn("group flex flex-col gap-4 md:gap-5", className)}
    >
      <Imagem
        src={post.cover_url}
        alt=""
        proporcao="16/9"
        className="rounded-[2px]"
        imgClassName="transition-transform duration-[1.2s] ease-[var(--ease-out)] group-hover:scale-[1.04]"
        sizes="(min-width: 1024px) 50vw, 100vw"
      />
      <div>
        <p className="type-meta text-cinza">{metaPost(post)}</p>
        <h3 className="type-h2 mt-2 text-petroleo transition-colors group-hover:text-petroleo-700">
          {post.title}
        </h3>
        {post.excerpt && <p className="mt-3 max-w-xl text-cinza max-md:hidden">{post.excerpt}</p>}
      </div>
    </Link>
  );
}

/** Post em lista: miniatura à esquerda, texto à direita. */
export function PostLinha({ post }: { post: ItemConteudo }) {
  return (
    <Link
      to="/blog/$slug"
      params={{ slug: post.slug }}
      className="group grid grid-cols-[4.5rem_1fr] items-start gap-4 py-4 sm:grid-cols-[7.5rem_1fr] sm:gap-6 sm:py-5"
    >
      <Imagem
        src={post.cover_url}
        alt=""
        proporcao="1/1"
        className="rounded-[2px]"
        imgClassName="transition-transform duration-[1.2s] ease-[var(--ease-out)] group-hover:scale-[1.06]"
        sizes="144px"
        larguraMax={320}
      />
      <div className="min-w-0">
        <p className="type-meta text-cinza">{metaPost(post)}</p>
        <h3 className="mt-1.5 font-serif text-[1.1rem] leading-snug text-petroleo transition-colors group-hover:text-petroleo-700 sm:text-[1.35rem]">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="mt-2 line-clamp-2 text-[0.9375rem] text-cinza max-sm:hidden">
            {post.excerpt}
          </p>
        )}
      </div>
    </Link>
  );
}
