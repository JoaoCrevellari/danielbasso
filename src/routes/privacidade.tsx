import { createFileRoute } from "@tanstack/react-router";

import { useConfig } from "@/components/layout/ConfigContext";
import { Abertura } from "@/components/site/Abertura";
import { Markdown } from "@/components/site/Markdown";
import { buildMeta, canonical } from "@/lib/seo";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: buildMeta({
      title: "Política de Privacidade",
      description: "Como os dados enviados pelo site são coletados, usados e protegidos.",
      path: "/privacidade",
    }),
    links: canonical("/privacidade"),
  }),
  component: Privacidade,
});

function Privacidade() {
  const { contato } = useConfig();
  const texto = `*Texto de exemplo. Revise com a assessoria jurídica antes da publicação definitiva.*

## Quem somos

Este site é mantido por Daniel Basso para apresentar cursos, mentorias, treinamentos corporativos e livros. Dúvidas sobre privacidade podem ser enviadas para ${contato.email}.

## Dados que coletamos

- **Formulários** (contato, lista de interesse, proposta corporativa e diagnóstico): nome, e-mail, WhatsApp, empresa e a mensagem ou as respostas que você enviar.
- **Navegação**: páginas visitadas, origem da visita, tipo de dispositivo, navegador e cidade aproximada. Usamos um identificador aleatório guardado no seu navegador; não guardamos o seu endereço IP e não usamos cookies de publicidade.

## Para que usamos

- Responder ao seu contato e enviar as informações que você pediu.
- Entender quais conteúdos são mais úteis e melhorar o site.

Não vendemos nem compartilhamos seus dados com terceiros para fins de marketing.

## Por quanto tempo

Os dados de formulário ficam guardados enquanto forem necessários para o atendimento. Você pode pedir a exclusão a qualquer momento.

## Seus direitos

Conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018), você pode pedir acesso, correção ou exclusão dos seus dados pelo e-mail ${contato.email}.

## Onde os dados ficam

Os dados são armazenados em provedores de infraestrutura com padrões de segurança reconhecidos (Supabase e Cloudflare).`;

  return (
    <>
      <Abertura
        rotulo="Privacidade"
        titulo="Política de Privacidade"
        subtitulo="Como os dados enviados pelo site são coletados, usados e protegidos."
      />
      <section className="section-y">
        <div className="container-texto">
          <Markdown>{texto}</Markdown>
        </div>
      </section>
    </>
  );
}
