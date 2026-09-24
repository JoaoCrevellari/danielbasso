import {
  EnvelopeSimple,
  InstagramLogo,
  LinkedinLogo,
  WhatsappLogo,
  YoutubeLogo,
} from "@phosphor-icons/react";

import { registrar } from "@/lib/analytics";
import { linkWhatsApp } from "@/lib/site";
import { urlSegura } from "@/lib/url-segura";
import { cn } from "@/lib/utils";
import { useConfig } from "./ConfigContext";

export function RedesSociais({ claro, className }: { claro?: boolean; className?: string }) {
  const { contato } = useConfig();
  const redes = [
    {
      nome: "WhatsApp",
      href: linkWhatsApp(contato.whatsapp, contato.whatsappMensagem),
      Icone: WhatsappLogo,
      evento: "whatsapp",
    },
    {
      nome: "Instagram",
      href: urlSegura(contato.instagram),
      Icone: InstagramLogo,
      evento: "social",
    },
    { nome: "YouTube", href: urlSegura(contato.youtube), Icone: YoutubeLogo, evento: "social" },
    { nome: "LinkedIn", href: urlSegura(contato.linkedin), Icone: LinkedinLogo, evento: "social" },
    {
      nome: "E-mail",
      href: contato.email ? `mailto:${contato.email}` : undefined,
      Icone: EnvelopeSimple,
      evento: "email",
    },
  ].filter((r) => !!r.href);

  return (
    <ul className={cn("flex items-center gap-1", className)}>
      {redes.map(({ nome, href, Icone, evento }) => (
        <li key={nome}>
          <a
            href={href}
            target={href?.startsWith("mailto:") ? undefined : "_blank"}
            rel="noopener noreferrer"
            aria-label={nome}
            onClick={() => registrar(evento, { label: `${nome} (rodapé)` })}
            className={cn(
              "inline-flex size-11 items-center justify-center rounded-full transition-colors",
              claro
                ? "text-gelo/70 hover:bg-gelo/10 hover:text-gelo"
                : "text-petroleo/70 hover:bg-petroleo/5 hover:text-petroleo",
            )}
          >
            <Icone className="size-[1.35rem]" weight="light" />
          </a>
        </li>
      ))}
    </ul>
  );
}
