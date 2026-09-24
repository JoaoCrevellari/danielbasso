import type { Field, FieldGroup } from "../fields";

/** Botão/link editável: rótulo + destino. */
export const CTA: Field = {
  key: "cta",
  label: "Botão",
  type: "group",
  fields: [
    { key: "rotulo", label: "Texto do botão", type: "text", half: true },
    {
      key: "link",
      label: "Destino",
      type: "text",
      half: true,
      help: 'Caminho do site (/contato), link completo ou "whatsapp".',
    },
  ],
};

/** Rótulo curto acima do título da seção (o divisor com fio dourado). */
export const ROTULO: Field = {
  key: "rotulo",
  label: "Rótulo da seção",
  type: "text",
  help: "Duas ou três palavras, ex.: O Método",
};

export const HERO_IMAGEM: Field = { key: "imagem", label: "Imagem", type: "image" };

/** Abertura padrão das páginas internas. */
export function grupoAbertura(help?: string): FieldGroup {
  return {
    key: "hero",
    label: "Abertura",
    help: help ?? "Use *asteriscos* para destacar um trecho do título.",
    fields: [
      { key: "titulo", label: "Título", type: "textarea", rows: 2, required: true },
      { key: "subtitulo", label: "Texto de apoio", type: "textarea", rows: 3 },
    ],
  };
}

export function grupoAberturaComImagem(): FieldGroup {
  const g = grupoAbertura();
  return { ...g, fields: [...g.fields, HERO_IMAGEM] };
}
