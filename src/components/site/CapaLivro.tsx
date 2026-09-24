import { Imagem } from "./Imagem";
import { semDestaque } from "./Titulo";
import { cn } from "@/lib/utils";

const CORES: Record<string, { fundo: string; texto: string; acento: string }> = {
  petroleo: { fundo: "#003F5C", texto: "#F5F5F2", acento: "#D4A72C" },
  salvia: { fundo: "#4E7866", texto: "#F5F5F2", acento: "#E6C36A" },
  terracota: { fundo: "#A9623A", texto: "#F5F5F2", acento: "#F2D48A" },
  grafite: { fundo: "#2B2B2B", texto: "#F5F5F2", acento: "#D4A72C" },
  gelo: { fundo: "#ECECE6", texto: "#003F5C", acento: "#8A6A12" },
};

/**
 * Capa de livro. Com imagem, mostra a capa real; sem ela, compõe uma capa tipográfica
 * com a cor escolhida no painel. Lombada e sombra dão volume ao objeto.
 */
export function CapaLivro({
  titulo,
  subtitulo,
  imagem,
  cor = "petroleo",
  className,
  tamanho = "md",
  prioridade,
}: {
  titulo: string;
  subtitulo?: string | null;
  imagem?: string | null;
  cor?: string;
  className?: string;
  tamanho?: "sm" | "md" | "lg";
  prioridade?: boolean;
}) {
  const c = CORES[cor] ?? CORES.petroleo;
  return (
    <div
      className={cn(
        "relative aspect-[2/3] w-full overflow-hidden rounded-[2px_4px_4px_2px] shadow-[0_2px_4px_rgb(0_20_30/0.2),0_24px_48px_-16px_rgb(0_20_30/0.45)]",
        className,
      )}
    >
      {imagem ? (
        <Imagem
          src={imagem}
          alt={`Capa do livro ${semDestaque(titulo)}`}
          className="h-full"
          larguraMax={600}
          sizes="(min-width: 768px) 320px, 60vw"
          prioridade={prioridade}
        />
      ) : (
        <div
          className="flex h-full flex-col justify-between p-[9%]"
          style={{ background: c.fundo, color: c.texto }}
          role="img"
          aria-label={`Capa do livro ${semDestaque(titulo)}`}
        >
          <span
            className={cn(
              "font-sans font-medium tracking-[0.28em] uppercase",
              tamanho === "sm"
                ? "text-[0.5rem]"
                : tamanho === "lg"
                  ? "text-[0.5rem] md:text-[0.625rem]"
                  : "text-[0.625rem]",
            )}
            style={{ color: c.acento }}
          >
            Daniel Basso
          </span>
          <div>
            <span className="mb-[8%] block h-px w-[28%]" style={{ background: c.acento }} />
            <p
              className={cn(
                tamanho === "sm"
                  ? "text-[1.1rem]"
                  : tamanho === "lg"
                    ? "text-[1.2rem] md:text-[clamp(1.7rem,1.2rem+1.6vw,2.4rem)]"
                    : "text-[1.6rem]",
                "font-serif leading-[1.04] font-[400] tracking-[-0.02em]",
              )}
            >
              {semDestaque(titulo)}
            </p>
            {subtitulo && tamanho !== "sm" && (
              <p
                className={cn(
                  "mt-3 font-serif text-[0.85rem] leading-snug italic opacity-75",
                  tamanho === "lg" && "max-md:hidden",
                )}
              >
                {subtitulo}
              </p>
            )}
          </div>
        </div>
      )}
      {/* Lombada e brilho de papel */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-[7%] bg-gradient-to-r from-black/25 via-white/10 to-transparent"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-white/10"
      />
    </div>
  );
}
