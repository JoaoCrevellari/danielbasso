import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { Imagem } from "./Imagem";
import { Titulo } from "./Titulo";

const i = (n: number) => ({ "--i": n }) as React.CSSProperties;

/**
 * Abertura das páginas internas. Sempre na mesma estrutura, para o visitante se localizar:
 * rótulo da página (fio dourado), título em até duas linhas, texto curto e ações.
 * Com imagem, vira duas colunas (texto 7 · imagem 5) e a imagem tem altura contida.
 */
export function Abertura({
  rotulo,
  titulo,
  subtitulo,
  imagem,
  altImagem = "",
  children,
  className,
}: {
  rotulo?: string;
  titulo: string;
  subtitulo?: string;
  imagem?: string | null;
  altImagem?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("border-b border-linha pt-cabecalho", className)}>
      <div
        className={cn(
          "container-site grid items-center gap-8 pt-10 pb-12 md:pt-16 md:pb-16",
          imagem && "md:grid-cols-12 md:gap-10",
        )}
      >
        <div className={cn(imagem && "md:col-span-7")}>
          {rotulo && <p className="rotulo-secao mb-5 anima-subir">{rotulo}</p>}
          <Titulo as="h1" className="type-display pb-1 text-petroleo anima-subir" style={i(1)}>
            {titulo}
          </Titulo>
          {subtitulo && (
            <p className="type-lead mt-5 max-w-[58ch] text-cinza anima-subir" style={i(2)}>
              {subtitulo}
            </p>
          )}
          {children && (
            <div className="mt-8 anima-subir" style={i(3)}>
              {children}
            </div>
          )}
        </div>
        {imagem && (
          <div className="md:col-span-5">
            <Imagem
              src={imagem}
              alt={altImagem}
              prioridade
              className="aspect-[16/10] rounded-[2px] anima-imagem md:aspect-[4/3]"
              sizes="(min-width: 768px) 40vw, 100vw"
              larguraMax={1000}
            />
          </div>
        )}
      </div>
    </section>
  );
}
