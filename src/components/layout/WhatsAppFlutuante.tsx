import { useRouterState } from "@tanstack/react-router";
import { WhatsappLogo } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

import { registrar } from "@/lib/analytics";
import { linkWhatsApp } from "@/lib/site";
import { cn } from "@/lib/utils";
import { useConfig } from "./ConfigContext";
import { useRolagem } from "./useRolagem";

/**
 * Atalho fixo para o WhatsApp. Aparece depois da primeira dobra (na abertura já existe
 * um botão principal) e se recolhe sobre formulários e rodapé ([data-sem-flutuante]),
 * para nunca cobrir um botão de envio ou o contato que já está visível.
 */
export function WhatsAppFlutuante() {
  const { contato } = useConfig();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const passouAbertura = useRolagem(() => window.innerHeight * 0.7);
  const [bloqueado, setBloqueado] = useState(false);

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

  // Entrada/saída em CSS (curva com leve "salto", como a mola que havia antes).
  return (
    <a
      href={linkWhatsApp(contato.whatsapp, contato.whatsappMensagem)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Conversar pelo WhatsApp"
      aria-hidden={!visivel || undefined}
      tabIndex={visivel ? undefined : -1}
      onClick={() => registrar("whatsapp", { label: "Botão flutuante" })}
      className={cn(
        "fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-[var(--z-fab)] inline-flex size-14 items-center justify-center rounded-full bg-petroleo text-gelo shadow-[0_14px_36px_-10px_rgb(0_31_46/0.6)] ring-1 ring-gelo/10 md:right-6 md:bottom-6",
        "transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-[1.06] active:scale-[0.94]",
        visivel
          ? "opacity-100"
          : "pointer-events-none translate-y-3 scale-[0.7] opacity-0 duration-200 ease-[var(--ease-out)]",
      )}
    >
      <WhatsappLogo className="size-7" weight="regular" />
    </a>
  );
}
