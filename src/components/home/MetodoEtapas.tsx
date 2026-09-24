import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

import type { Etapa } from "@/content/paginas/metodo";

/**
 * As cinco etapas acendem uma a uma conforme chegam ao centro da tela: a leitura
 * acompanha a sequência do método. Com reduced-motion, todas aparecem acesas.
 */
function LinhaEtapa({ etapa, indice }: { etapa: Etapa; indice: number }) {
  const ref = useRef<HTMLLIElement>(null);
  const reduzir = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "start 40%"] });
  const opacidade = useTransform(scrollYProgress, [0, 1], [0.22, 1]);
  const x = useTransform(scrollYProgress, [0, 1], [-14, 0]);
  const linha = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <li ref={ref} className="relative border-b border-linha py-3.5 first:border-t md:py-5">
      <motion.span
        aria-hidden
        style={reduzir ? undefined : { scaleX: linha }}
        className="absolute -bottom-px left-0 h-px w-full origin-left bg-ouro"
      />
      <motion.div
        style={reduzir ? undefined : { opacity: opacidade, x }}
        className="flex items-baseline gap-5 md:gap-8"
      >
        <span className="type-numeral w-6 shrink-0 text-lg text-ouro md:text-xl">{indice + 1}</span>
        <div className="min-w-0">
          <h3 className="font-serif text-[clamp(1.8rem,1.3rem+2vw,3rem)] leading-none font-[380] tracking-[-0.025em] text-gelo">
            {etapa.nome}
          </h3>
          <p className="mt-2 max-w-md text-[0.95rem] leading-relaxed text-gelo/65 max-md:hidden">
            {etapa.pergunta}
          </p>
        </div>
      </motion.div>
    </li>
  );
}

export function MetodoEtapas({ etapas }: { etapas: Etapa[] }) {
  return (
    <ol className="flex flex-col">
      {etapas.map((e, i) => (
        <LinhaEtapa key={e.chave + i} etapa={e} indice={i} />
      ))}
    </ol>
  );
}
