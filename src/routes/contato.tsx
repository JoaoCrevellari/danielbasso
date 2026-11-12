import { createFileRoute } from "@tanstack/react-router";
import {
  Clock,
  EnvelopeSimple,
  FacebookLogo,
  InstagramLogo,
  MapPin,
  TiktokLogo,
  WhatsappLogo,
  YoutubeLogo,
} from "@phosphor-icons/react";

import { useConfig } from "@/components/layout/ConfigContext";
import { Abertura } from "@/components/site/Abertura";
import { FormularioLead } from "@/components/site/FormularioLead";
import { Secao } from "@/components/site/Secao";
import { registrar } from "@/lib/analytics";
import { carregarPagina } from "@/lib/conteudo";
import { buildMeta, canonical } from "@/lib/seo";
import { linkWhatsApp } from "@/lib/site";
import { urlSegura } from "@/lib/url-segura";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/contato")({
  loader: () => carregarPagina("contato"),
  head: ({ loaderData }) => ({
    meta: buildMeta({
      title: "Contato",
      description:
        "Fale com Daniel Basso sobre cursos, mentorias, palestras, treinamentos, entrevistas ou convites. Resposta em até dois dias úteis.",
      path: "/contato",
    }),
    links: canonical("/contato"),
  }),
  component: Contato,
});

/** "https://instagram.com/fulano/" → "@fulano" (o perfil sai do link das Configurações). */
function arroba(url: string | undefined) {
  if (!url) return undefined;
  const parte =
    url
      .replace(/[?#].*$/, "")
      .replace(/\/+$/, "")
      .split("/")
      .pop() ?? "";
  return parte ? `@${parte.replace(/^@/, "")}` : undefined;
}

function formatarTelefone(n: string) {
  const d = n.replace(/\D/g, "").replace(/^55/, "");
  return d.length === 11 ? `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}` : n;
}

function Contato() {
  const p = Route.useLoaderData();
  const { contato } = useConfig();
  const canais = [
    {
      Icone: WhatsappLogo,
      rotulo: "WhatsApp",
      valor: formatarTelefone(contato.whatsapp),
      href: linkWhatsApp(contato.whatsapp, contato.whatsappMensagem),
      evento: "whatsapp",
      destaque: true,
    },
    {
      Icone: EnvelopeSimple,
      rotulo: "E-mail",
      valor: contato.email,
      href: contato.email ? `mailto:${contato.email}` : undefined,
      evento: "email",
    },
    {
      Icone: InstagramLogo,
      rotulo: "Instagram",
      valor: arroba(urlSegura(contato.instagram)),
      href: urlSegura(contato.instagram),
      evento: "social",
    },
    {
      Icone: YoutubeLogo,
      rotulo: "YouTube",
      valor: arroba(urlSegura(contato.youtube)),
      href: urlSegura(contato.youtube),
      evento: "social",
    },
    {
      Icone: TiktokLogo,
      rotulo: "TikTok",
      valor: arroba(urlSegura(contato.tiktok)),
      href: urlSegura(contato.tiktok),
      evento: "social",
    },
    {
      Icone: FacebookLogo,
      rotulo: "Facebook",
      valor: arroba(urlSegura(contato.facebook)),
      href: urlSegura(contato.facebook),
      evento: "social",
    },
  ].filter((c) => c.href && c.valor);

  return (
    <>
      <Abertura rotulo="Contato" titulo={p.hero.titulo} subtitulo={p.hero.subtitulo}>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {canais.map(({ Icone, rotulo, valor, href, evento, destaque }) => (
            <li key={rotulo}>
              <a
                href={href}
                target={href?.startsWith("mailto:") ? undefined : "_blank"}
                rel="noopener noreferrer"
                onClick={() => registrar(evento, { label: `${rotulo} (contato)` })}
                className={cn(
                  "group flex min-h-16 items-center gap-3 rounded-[2px] border px-4 py-3 transition-colors duration-300",
                  destaque
                    ? "border-petroleo bg-petroleo text-gelo hover:bg-petroleo-700"
                    : "border-linha-forte bg-papel text-petroleo hover:border-petroleo",
                )}
              >
                <span
                  className={cn(
                    "inline-flex size-10 shrink-0 items-center justify-center rounded-full",
                    destaque ? "bg-gelo/10 text-ouro" : "bg-petroleo-50 text-petroleo",
                  )}
                >
                  <Icone className="size-5" />
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className={cn("type-meta", destaque ? "text-gelo/65" : "text-cinza")}>
                    {rotulo}
                  </span>
                  <span className="truncate text-[0.95rem] font-medium">{valor}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </Abertura>

      <Secao tom="branco" semFlutuante>
        <div className="grade gap-y-8">
          <div className="col-span-12 lg:col-span-4" data-revelar-grupo>
            <p className="rotulo-secao mb-4">Mensagem</p>
            <h2 className="type-h1 text-petroleo">Prefere escrever?</h2>
            <p className="mt-4 max-w-[40ch] text-[1.0625rem] leading-relaxed text-cinza max-md:hidden">
              Conte o assunto em poucas linhas. Quanto mais contexto, mais precisa a resposta.
            </p>
            <ul className="mt-6 flex flex-col gap-3 text-[0.95rem] text-grafite max-md:hidden">
              <li className="flex items-center gap-3">
                <Clock className="size-5 text-ouro-texto" /> Resposta em até dois dias úteis
              </li>
              {contato.cidade && (
                <li className="flex items-center gap-3">
                  <MapPin className="size-5 shrink-0 text-ouro-texto" /> {contato.cidade} ·
                  atendimento presencial e online em todo o Brasil e no exterior
                </li>
              )}
            </ul>
          </div>
          <div className="col-span-12 lg:col-span-7 lg:col-start-6" data-revelar>
            <FormularioLead
              tipo="contato"
              assuntos={p.assuntos.itens}
              mensagem="obrigatoria"
              empresa
              botao="Enviar mensagem"
            />
          </div>
        </div>
      </Secao>
    </>
  );
}
