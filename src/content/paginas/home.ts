import type { FieldGroup } from "../fields";
import { CTA, HERO_IMAGEM, ROTULO } from "./comum";

/**
 * Convenção dos títulos: o trecho entre *asteriscos* vira o destaque em itálico dourado.
 */
export const HOME_PADRAO = {
  hero: {
    titulo: "Reconstruir-se é o *primeiro ato* de liderança.",
    subtitulo:
      "Formação humana com profundidade intelectual e aplicação prática, para quem lidera a própria vida, uma equipe ou uma empresa.",
    cta_primario: { rotulo: "Fazer o diagnóstico", link: "/diagnostico" },
    cta_secundario: { rotulo: "Conhecer o método", link: "/metodo" },
    imagem: "/exemplo/daniel-retrato.jpg",
  },
  manifesto: {
    rotulo: "Por que este trabalho",
    titulo: "Não falta informação. Falta *estrutura interior*.",
    texto:
      "Há vinte anos acompanho pessoas e organizações em momentos de virada. Mudança duradoura não nasce de motivação, mas de clareza, disciplina e responsabilidade assumida.",
    link: { rotulo: "Conheça minha trajetória", link: "/quem-sou" },
    pilares: [
      {
        titulo: "Profundidade",
        texto: "Ideias sérias, estudadas com calma, antes de qualquer fórmula pronta.",
      },
      {
        titulo: "Prática",
        texto: "Cada encontro termina em um passo concreto para a semana seguinte.",
      },
      {
        titulo: "Responsabilidade",
        texto: "Assumir a própria vida por inteiro é o ponto de partida de toda mudança.",
      },
    ],
  },
  metodo: {
    rotulo: "O Método",
    titulo: "Cinco movimentos, *uma direção*.",
    texto:
      "O Método organiza o desenvolvimento em etapas que se sustentam umas às outras. Não é uma escada que se sobe uma vez: é um ciclo que amadurece com o tempo.",
    link: { rotulo: "Ver o método completo", link: "/metodo" },
  },
  diagnostico: {
    rotulo: "Gratuito · 5 minutos",
    titulo: "Onde você está hoje?",
    texto:
      "Quinze afirmações, cinco minutos. O diagnóstico mostra em qual das cinco etapas está o seu próximo passo e o que faz sentido estudar agora.",
    cta: { rotulo: "Começar o diagnóstico", link: "/diagnostico" },
    imagem: "/exemplo/daniel-biblioteca.jpg",
  },
  caminhos: {
    rotulo: "Como trabalhar comigo",
    titulo: "Quatro formas de *caminhar junto*",
    texto:
      "Escolha pelo momento que você vive: estudo no seu ritmo, acompanhamento próximo, programas para empresas ou leitura.",
    itens: [
      {
        titulo: "Cursos",
        texto: "Formações com começo, meio e fim, para estudar no seu ritmo ou em turma.",
        link: "/cursos",
        imagem: "https://images.unsplash.com/photo-1638537690617-ebc561143de0",
      },
      {
        titulo: "Mentorias",
        texto: "Acompanhamento próximo para decisões que não cabem em um curso.",
        link: "/mentorias",
        imagem: "https://images.unsplash.com/photo-1681301865120-7c74657dc01a",
      },
      {
        titulo: "Empresas",
        texto: "Palestras, workshops e programas para lideranças e equipes.",
        link: "/treinamentos",
        imagem: "https://images.unsplash.com/photo-1544531586-fde5298cdd40",
      },
      {
        titulo: "Livros",
        texto: "As ideias do método em forma de leitura demorada.",
        link: "/livros",
        imagem: "https://images.unsplash.com/photo-1642160428828-334bf07023ec",
      },
    ],
  },
  depoimentos: {
    rotulo: "Depoimentos",
    titulo: "O que dizem as pessoas que *passaram por aqui*",
  },
  livro: {
    rotulo: "Livro em destaque",
    slug: "o-governo-de-si",
  },
  blog: {
    rotulo: "Blog",
    titulo: "Ensaios recentes",
    link: { rotulo: "Todos os textos", link: "/blog" },
  },
  cta_final: {
    titulo: "Toda reconstrução começa com *uma conversa honesta*.",
    texto: "Conte o seu momento. Respondo pessoalmente e indico o caminho que faz mais sentido.",
    cta: { rotulo: "Conversar pelo WhatsApp", link: "whatsapp" },
    secundario: { rotulo: "Enviar uma mensagem", link: "/contato" },
  },
};

export type HomeConteudo = typeof HOME_PADRAO;

export const HOME_CAMPOS: FieldGroup[] = [
  {
    key: "hero",
    label: "Abertura",
    help: "Primeira dobra da página inicial. Use *asteriscos* para destacar um trecho do título.",
    fields: [
      { key: "titulo", label: "Título", type: "textarea", rows: 2, required: true },
      {
        key: "subtitulo",
        label: "Texto de apoio",
        type: "textarea",
        rows: 3,
        help: "Até 20 palavras.",
      },
      { ...CTA, key: "cta_primario", label: "Botão principal" },
      { ...CTA, key: "cta_secundario", label: "Botão secundário" },
      { ...HERO_IMAGEM, key: "imagem", label: "Retrato" },
    ],
  },
  {
    key: "manifesto",
    label: "Manifesto",
    fields: [
      ROTULO,
      {
        key: "titulo",
        label: "Frase",
        type: "textarea",
        rows: 2,
        help: "Até duas linhas. Use *asteriscos* para o destaque.",
      },
      { key: "texto", label: "Texto", type: "textarea", rows: 4 },
      { ...CTA, key: "link", label: "Link" },
      {
        key: "pilares",
        label: "Pilares",
        type: "repeater",
        itemLabel: "Pilar",
        summaryKey: "titulo",
        help: "Três pilares funcionam melhor.",
        fields: [
          { key: "titulo", label: "Título", type: "text" },
          { key: "texto", label: "Texto", type: "textarea", rows: 2 },
        ],
      },
    ],
  },
  {
    key: "metodo",
    label: "Método (resumo)",
    help: "As cinco etapas vêm da página Método.",
    fields: [
      ROTULO,
      { key: "titulo", label: "Título", type: "text" },
      { key: "texto", label: "Texto", type: "textarea", rows: 3 },
      { ...CTA, key: "link", label: "Link" },
    ],
  },
  {
    key: "diagnostico",
    label: "Chamada do diagnóstico",
    fields: [
      ROTULO,
      { key: "titulo", label: "Título", type: "text" },
      { key: "texto", label: "Texto", type: "textarea", rows: 3 },
      { ...CTA, key: "cta", label: "Botão" },
      { ...HERO_IMAGEM, key: "imagem", label: "Imagem" },
    ],
  },
  {
    key: "caminhos",
    label: "Formas de caminhar junto",
    fields: [
      ROTULO,
      { key: "titulo", label: "Título", type: "text" },
      { key: "texto", label: "Texto de apoio", type: "textarea", rows: 2 },
      {
        key: "itens",
        label: "Cartões",
        type: "repeater",
        itemLabel: "Cartão",
        summaryKey: "titulo",
        fields: [
          { key: "titulo", label: "Título", type: "text", half: true },
          { key: "link", label: "Link", type: "text", half: true },
          { key: "texto", label: "Texto", type: "textarea", rows: 2 },
          { key: "imagem", label: "Imagem", type: "image" },
        ],
      },
    ],
  },
  {
    key: "depoimentos",
    label: "Depoimentos",
    help: "Os depoimentos marcados como destaque aparecem aqui.",
    fields: [ROTULO, { key: "titulo", label: "Título", type: "text" }],
  },
  {
    key: "livro",
    label: "Livro em destaque",
    fields: [
      { ...ROTULO, half: true },
      {
        key: "slug",
        label: "Endereço do livro",
        type: "text",
        half: true,
        help: "O final do link do livro, ex.: o-governo-de-si",
      },
    ],
  },
  {
    key: "blog",
    label: "Blog",
    fields: [
      ROTULO,
      { key: "titulo", label: "Título", type: "text" },
      { ...CTA, key: "link", label: "Link" },
    ],
  },
  {
    key: "cta_final",
    label: "Chamada final",
    fields: [
      { key: "titulo", label: "Título", type: "textarea", rows: 2 },
      { key: "texto", label: "Texto", type: "textarea", rows: 2 },
      {
        ...CTA,
        key: "cta",
        label: "Botão principal",
        help: 'Use o link "whatsapp" para abrir a conversa.',
      },
      { ...CTA, key: "secundario", label: "Botão secundário" },
    ],
  },
];
