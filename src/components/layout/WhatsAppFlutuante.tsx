import { useRouterState } from "@tanstack/react-router";
import { WhatsappLogo } from "@phosphor-icons/react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useEffect, useState } from "react";

import { registrar } from "@/lib/analytics";
import { linkWhatsApp } from "@/lib/site";
import { useConfig } from "./ConfigContext";

/**
 * Atalho fixo para o WhatsApp. Aparece depois da primeira dobra (na abertura já existe
 * um botão principal) e se recolhe sobre formulários e rodapé ([data-sem-flutuante]),
 * para nunca cobrir um botão de envio ou o contato que já está visível.
 */
export function WhatsAppFlutuante() {
  const { contato } = useConfig();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { scrollY } = useScroll();
  const [passouAbertura, setPassouAbertura] = useState(false);
  const [bloqueado, setBloqueado] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => setPassouAbertura(y > window.innerHeight * 0.7));

  useEffect(() => {
    const visiveis = new Set<Element>();
    const io = new IntersectionObserver((entradas) => {
      for (const e of entradas) {
        if (e.isIntersecting) visiveis.add(e.target);
        else visiveis.delete(e.target);
      }
      setBloqueado(visiveis.size > 0);
    });
    // Espera a nova página montar antes de procurar as áreas protegidas.
    const t = window.setTimeout(() => {
      document.querySelectorAll("[data-sem-flutuante]").forEach((el) => io.observe(el));
    }, 200);
    return () => {
      window.clearTimeout(t);
      io.disconnect();
      setBloqueado(false);
    };
  }, [pathname]);

  if (!contato.whatsapp) return null;
  const visivel = passouAbertura && !bloqueado;

  return (
    <AnimatePresence>
      {visivel && (
        <motion.a
          key="wpp"
          href={linkWhatsApp(contato.whatsapp, contato.whatsappMensagem)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Conversar pelo WhatsApp"
          onClick={() => registrar("whatsapp", { label: "Botão flutuante" })}
          initial={{ opacity: 0, scale: 0.6, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 12 }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          className="fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-[var(--z-fab)] inline-flex size-14 items-center justify-center rounded-full bg-petroleo text-gelo shadow-[0_14px_36px_-10px_rgb(0_31_46/0.6)] ring-1 ring-gelo/10 md:right-6 md:bottom-6"
        >
          <WhatsappLogo className="size-7" weight="regular" />
        </motion.a>
      )}
    </AnimatePresence>
  );
}
