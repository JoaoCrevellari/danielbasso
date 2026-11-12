import type { FieldGroup } from "../fields";
import { CTA, HERO_IMAGEM, ROTULO } from "./comum";

/**
 * Convenção dos títulos: o trecho entre *asteriscos* vira o destaque em itálico dourado.
 */
export const HOME_PADRAO = {
  hero: {
    titulo: "Você não perdeu o controle da sua vida. Você *entregou, sem perceber*.",
    subtitulo:
      "Aos poucos, sem perceber, você deixou que o chefe, as urgências, o medo e a opinião dos outros passassem a decidir por você. Eu ajudo pessoas comuns a retomar o comando da própria vida, colocar tudo em ordem e voltar a avançar.",
    cta_primario: { rotulo: "Fazer o diagnóstico", link: "/diagnostico" },
    cta_secundario: { rotulo: "Conhecer o método", link: "/metodo" },
    imagem: "/exemplo/daniel-retrato.jpg",
  },
  manifesto: {
    rotulo: "Por que este trabalho",
    titulo: "O problema não é tempo, nem dinheiro. É *quem está no comando*.",
    texto:
      "Por fora, tudo funciona: você trabalha, paga as contas, cuida de gente. Por dentro, a vida saiu dos trilhos. Quase todo mundo trata o sintoma, com um aplicativo, uma planilha ou um vídeo de motivação. A causa é outra: alguém ou alguma coisa está decidindo por você. E o que você entregou, você pode retomar.",
    link: { rotulo: "Conheça minha trajetória", link: "/quem-sou" },
    pilares: [
      {
        titulo: "Causa, não sintoma",
        texto:
          "Disciplina, foco e organização são sintomas. O método trata quem está governando a sua vida.",
      },
      {
        titulo: "Prática",
        texto: "Cada etapa termina em uma decisão concreta para a semana seguinte.",
      },
      {
        titulo: "Responsabilidade",
        texto: "Assumir a própria vida não é se condenar. É recuperar o poder de resposta.",
      },
    ],
    credenciais: [
      "Mestre em Educação, Arte e História da Cultura (Mackenzie)",
      "MDiv em Teologia Histórica (CPAJ)",
      "Licenciado em História (UNIRIO)",
      "Bacharel em Teologia e em Filosofia",
      "Professor na Grace School of Theology (EUA)",
      "Cidadão Vinhedense",
    ],
  },
  metodo: {
    rotulo: "O Método",
    titulo: "Cinco etapas, *uma direção*.",
    texto:
      "A vida que você não governa, governa você. O Método Autogoverno organiza a retomada em cinco etapas, do primeiro diagnóstico ao legado, uma área de cada vez.",
    link: { rotulo: "Ver o método completo", link: "/metodo" },
  },
  diagnostico: {
    rotulo: "Gratuito · 5 minutos",
    titulo: "Quem está *governando a sua vida* hoje?",
    texto:
      "Quinze afirmações, cinco minutos. O diagnóstico mostra em quais áreas você entregou o comando e qual é o seu próximo passo.",
    passos: [
      "Responda 15 afirmações",
      "Veja onde você entregou o comando",
      "Receba a indicação do próximo passo",
    ],
    cta: { rotulo: "Começar o diagnóstico", link: "/diagnostico" },
    imagem: "/exemplo/daniel-biblioteca.jpg",
  },
  caminhos: {
    rotulo: "Como trabalhar comigo",
    titulo: "Quatro formas de *caminhar junto*",
    texto:
      "Escolha pelo momento que você vive: colocar a vida em ordem, ter alguém ao lado nas grandes decisões, levar o método para a sua instituição ou começar pela leitura.",
    itens: [
      {
        titulo: "Cursos",
        texto:
          "Do diagnóstico ao programa avançado: Método Autogoverno, Assuma o Controle e Nada Pode Me Deter.",
        link: "/cursos",
        imagem: "https://images.unsplash.com/photo-1638537690617-ebc561143de0",
      },
      {
        titulo: "Mentorias",
        texto: "Acompanhamento individual e Mastermind para decisões que não cabem em um curso.",
        link: "/mentorias",
        imagem: "https://images.unsplash.com/photo-1681301865120-7c74657dc01a",
      },
      {
        titulo: "Instituições",
        texto: "Palestras, treinamentos e programas para prefeituras, escolas e empresas.",
        link: "/treinamentos",
        imagem: "https://images.unsplash.com/photo-1544531586-fde5298cdd40",
      },
      {
        titulo: "Livros",
        texto: "As Leis do Autogoverno, Ninguém Vai Fazer Por Você e Nada Pode Me Deter.",
        link: "/livros",
        imagem: "https://images.unsplash.com/photo-1642160428828-334bf07023ec",
      },
    ],
  },
  instituicoes: {
    rotulo: "Onde já trabalhamos",
    titulo: "Prefeituras, escolas e empresas que *já receberam o método*",
    link: { rotulo: "Ver os trabalhos", link: "/treinamentos#instituicoes" },
  },
  depoimentos: {
    rotulo: "Depoimentos",
    titulo: "O que dizem as pessoas que *passaram por aqui*",
  },
  livro: {
    rotulo: "Livro em destaque",
    slug: "ninguem-vai-fazer-por-voce",
    botao: "Quero ser avisado do lançamento",
  },
  blog: {
    rotulo: "Blog",
    titulo: "Ensaios recentes",
    link: { rotulo: "Todos os textos", link: "/blog" },
  },
  cta_final: {
    titulo: "Toda reconstrução começa com *uma conversa honesta*.",
    texto:
      "Conte o seu momento em poucas linhas. Eu leio e indico o caminho que faz mais sentido para você. O que um homem faz, outro também faz.",
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
      {
        key: "credenciais",
        label: "Faixa de credenciais",
        type: "list",
        itemLabel: "Credencial",
        help: "Linha discreta logo abaixo deste bloco. Vazia = a faixa some.",
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
      { key: "passos", label: "Passos", type: "list", itemLabel: "Passo" },
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
    key: "instituicoes",
    label: "Onde já trabalhamos",
    help: "A lista de instituições (nomes, escopo e logos) fica na página Instituições.",
    fields: [
      ROTULO,
      { key: "titulo", label: "Título", type: "text" },
      { ...CTA, key: "link", label: "Link" },
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
        help: "O final do link do livro, ex.: ninguem-vai-fazer-por-voce",
      },
      { key: "botao", label: "Texto do botão", type: "text" },
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
