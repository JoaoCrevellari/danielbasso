import { Plus } from "@phosphor-icons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useId, useState } from "react";

export type ItemFaq = { pergunta: string; resposta?: string };

function Item({ item }: { item: ItemFaq }) {
  const [aberto, setAberto] = useState(false);
  const id = useId();
  const reduzir = useReducedMotion();
  return (
    <li className="border-b border-linha">
      <h3>
        <button
          type="button"
          aria-expanded={aberto}
          aria-controls={id}
          onClick={() => setAberto((v) => !v)}
          className="group flex min-h-16 w-full items-center justify-between gap-6 py-5 text-left font-serif text-[1.2rem] leading-snug text-petroleo transition-colors hover:text-petroleo-700 md:text-[1.35rem]"
        >
          {item.pergunta}
          <Plus
            aria-hidden
            weight="light"
            className="size-5 shrink-0 text-ouro-texto transition-transform duration-300 ease-[var(--ease-out)] group-aria-expanded:rotate-45"
          />
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {aberto && (
          <motion.div
            id={id}
            role="region"
            initial={reduzir ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={reduzir ? { opacity: 1 } : { height: "auto", opacity: 1 }}
            exit={reduzir ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="max-w-2xl pb-6 text-cinza">{item.resposta}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

export function Faq({ itens }: { itens: ItemFaq[] }) {
  const validos = itens.filter((i) => i.pergunta?.trim());
  if (!validos.length) return null;
  return (
    <ul className="border-t border-linha">
      {validos.map((item, n) => (
        <Item key={n} item={item} />
      ))}
    </ul>
  );
}
