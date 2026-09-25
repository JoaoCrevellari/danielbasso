import { createFileRoute } from "@tanstack/react-router";

import { useConfig } from "@/components/layout/ConfigContext";
import { Abertura } from "@/components/site/Abertura";
import { Markdown } from "@/components/site/Markdown";
import { buildMeta, canonical } from "@/lib/seo";

export const Route = createFileRoute("/termos")({
  head: () => ({
    meta: buildMeta({
      title: "Termos de Uso",
      description: "Condições para usar o site e os conteúdos de Daniel Basso.",
      path: "/termos",
    }),
    links: canonical("/termos"),
  }),
  component: Termos,
});

function Termos() {
  const { contato } = useConfig();
  const texto = `*Texto de exemplo. Revise com a assessoria jurídica antes da publicação definitiva.*

## Aceite

Ao navegar neste site você concorda com estes termos. Se não concordar, pedimos que não utilize o site.

## Conteúdo

Textos, vídeos, imagens, materiais de cursos e livros apresentados aqui pertencem a Daniel Basso ou são usados com autorização. Você pode compartilhar links e citar trechos curtos com o devido crédito; reproduzir, vender ou distribuir o conteúdo exige autorização por escrito.

## Cursos, mentorias e treinamentos

As páginas de cursos, mentorias e treinamentos têm caráter informativo. Inscrever-se na lista de interesse não gera compra nem obrigação de pagamento. Condições de contratação, valores e datas são combinados diretamente, antes de qualquer pagamento.

## Diagnóstico de Autogoverno

O diagnóstico é uma autoavaliação de reflexão e não substitui acompanhamento psicológico, médico ou profissional.

## Responsabilidades

Buscamos manter as informações corretas e atualizadas, mas elas podem mudar sem aviso. Os resultados de cursos e mentorias dependem da dedicação de cada pessoa e não são garantidos.

## Links externos

Links para WhatsApp, Instagram, YouTube e outros sites seguem as regras de cada serviço.

## Privacidade

O tratamento dos seus dados está descrito na [Política de Privacidade](/privacidade).

## Contato

Dúvidas sobre estes termos podem ser enviadas para ${contato.email}.`;

  return (
    <>
      <Abertura
        rotulo="Termos"
        titulo="Termos de Uso"
        subtitulo="Condições para usar o site e os conteúdos de Daniel Basso."
      />
      <section className="section-y">
        <div className="container-texto">
          <Markdown>{texto}</Markdown>
        </div>
      </section>
    </>
  );
}
