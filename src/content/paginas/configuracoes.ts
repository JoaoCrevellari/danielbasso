import type { FieldGroup } from "../fields";
import { CONTATO_PADRAO, SITE } from "@/lib/site";

export const CONFIG_PADRAO = {
  contato: { ...CONTATO_PADRAO, linkedin: "" },
  rodape: {
    frase: "Ajudo pessoas a retomar o comando da própria vida.",
  },
  conheca: {
    titulo: "Conheça também",
    itens: [
      { nome: "Pr. Daniel Basso", link: "https://prdanielbasso.com.br", nota: "" },
      {
        nome: "Instituto Via Educare",
        link: "https://viaeducare.com.br",
        nota: "em desenvolvimento",
      },
    ],
  },
  seo: {
    descricao: SITE.description as string,
  },
  apresentacao: {
    aviso_exemplo: false,
    aviso_texto: "Versão de apresentação: textos, imagens e números são exemplos.",
  },
};

export type ConfigConteudo = typeof CONFIG_PADRAO;

export const CONFIG_CAMPOS: FieldGroup[] = [
  {
    key: "contato",
    label: "Contato e redes",
    fields: [
      {
        key: "whatsapp",
        label: "WhatsApp (com DDI e DDD)",
        type: "text",
        half: true,
        placeholder: "5511999999999",
      },
      { key: "email", label: "E-mail", type: "text", half: true },
      { key: "whatsappMensagem", label: "Mensagem inicial do WhatsApp", type: "textarea", rows: 2 },
      { key: "instagram", label: "Instagram", type: "url", half: true },
      { key: "youtube", label: "YouTube", type: "url", half: true },
      { key: "linkedin", label: "LinkedIn", type: "url", half: true },
      { key: "tiktok", label: "TikTok", type: "url", half: true },
      { key: "facebook", label: "Facebook", type: "url", half: true },
      { key: "cidade", label: "Cidade e atendimento", type: "text", half: true },
    ],
  },
  {
    key: "rodape",
    label: "Rodapé",
    fields: [{ key: "frase", label: "Frase de assinatura", type: "text" }],
  },
  {
    key: "conheca",
    label: "Conheça também (rodapé)",
    help: "Links para os outros projetos do Daniel. Pedido do Daniel em 12/11/2026. Lista vazia = a linha some.",
    fields: [
      { key: "titulo", label: "Título", type: "text" },
      {
        key: "itens",
        label: "Links",
        type: "repeater",
        itemLabel: "Link",
        summaryKey: "nome",
        fields: [
          { key: "nome", label: "Nome", type: "text", half: true },
          { key: "link", label: "Endereço", type: "url", half: true },
          {
            key: "nota",
            label: "Observação",
            type: "text",
            placeholder: "em desenvolvimento",
            help: "Aparece entre parênteses ao lado do nome.",
          },
        ],
      },
    ],
  },
  {
    key: "seo",
    label: "Busca e compartilhamento",
    fields: [
      {
        key: "descricao",
        label: "Descrição padrão",
        type: "textarea",
        rows: 3,
        help: "Usada no Google e ao compartilhar páginas que não têm descrição própria. Até 160 caracteres.",
      },
    ],
  },
  {
    key: "apresentacao",
    label: "Aviso de versão de apresentação",
    help: "Faixa no topo do site avisando que o conteúdo é de exemplo. Desligue quando o conteúdo real estiver no ar.",
    fields: [
      { key: "aviso_exemplo", label: "Mostrar aviso", type: "boolean" },
      { key: "aviso_texto", label: "Texto do aviso", type: "text" },
    ],
  },
];
