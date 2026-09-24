import type { FieldGroup } from "../fields";
import { CTA, HERO_IMAGEM } from "./comum";

export const QUEM_SOU_PADRAO = {
  hero: {
    titulo: "Daniel Basso",
    subtitulo:
      "Mentor, escritor e treinador de líderes. Dedico meu trabalho a uma pergunta: como uma pessoa se torna capaz de governar a própria vida?",
    imagem: "/exemplo/daniel-biblioteca.jpg",
  },
  historia: {
    titulo: "Uma trajetória marcada por *recomeços*",
    texto: `Comecei a estudar desenvolvimento humano pela via mais difícil: precisando dele. Depois de uma ruptura profissional aos trinta anos, percebi que sabia muito sobre gestão e quase nada sobre governar a mim mesmo.

Desde então, dividi o tempo entre a sala de aula, a leitura dos clássicos e o acompanhamento de pessoas em momentos de virada. Estudei filosofia, psicologia do comportamento e gestão de pessoas, e fui testando cada ideia no único laboratório que conheço de verdade: a vida real.

Hoje trabalho com executivos, empreendedores, equipes e famílias. O fio que une tudo é o mesmo: **ninguém lidera bem aquilo que não aprendeu a conduzir dentro de si.**`,
    citacao:
      "Autogoverno não é rigidez. É a liberdade de escolher quem você será antes que as circunstâncias escolham por você.",
  },
  marcos: {
    titulo: "Alguns marcos",
    itens: [
      {
        ano: "2004",
        titulo: "Primeiras turmas",
        texto: "Início do trabalho com formação de líderes em empresas de médio porte.",
      },
      {
        ano: "2011",
        titulo: "Mentoria individual",
        texto: "Criação do programa de acompanhamento para executivos em transição.",
      },
      {
        ano: "2016",
        titulo: "Primeiro livro",
        texto: "Publicação de O Governo de Si, reunindo dez anos de anotações de campo.",
      },
      {
        ano: "2020",
        titulo: "Método em cinco etapas",
        texto: "Sistematização do método que hoje organiza cursos, mentorias e programas.",
      },
      {
        ano: "2025",
        titulo: "Programas corporativos",
        texto: "Programas contínuos de liderança em empresas de indústria, saúde e serviços.",
      },
    ],
  },
  conviccoes: {
    titulo: "Aquilo em que acredito",
    itens: [
      {
        titulo: "Responsabilidade",
        texto: "Assumir a própria vida por inteiro é o ponto de partida de qualquer mudança real.",
      },
      {
        titulo: "Estudo",
        texto: "Ideias sérias exigem leitura séria. Profundidade não é luxo, é método.",
      },
      {
        titulo: "Prática",
        texto:
          "O que não vira rotina não se sustenta. Cada encontro termina em um próximo passo concreto.",
      },
      {
        titulo: "Discrição",
        texto:
          "Histórias pessoais são tratadas com sigilo absoluto, em qualquer formato de trabalho.",
      },
    ],
  },
  formacao: {
    titulo: "Formação",
    itens: [
      "Graduação em Filosofia",
      "Especialização em Gestão de Pessoas",
      "Formação em Psicologia do Comportamento",
      "Certificação internacional em Coaching Executivo",
    ],
  },
  cta: {
    titulo: "Vamos conversar sobre o *seu momento*?",
    cta: { rotulo: "Conversar pelo WhatsApp", link: "whatsapp" },
  },
};

export type QuemSouConteudo = typeof QUEM_SOU_PADRAO;

export const QUEM_SOU_CAMPOS: FieldGroup[] = [
  {
    key: "hero",
    label: "Abertura",
    fields: [
      { key: "titulo", label: "Nome ou título", type: "text" },
      { key: "subtitulo", label: "Apresentação curta", type: "textarea", rows: 3 },
      { ...HERO_IMAGEM, label: "Foto principal" },
    ],
  },
  {
    key: "historia",
    label: "História",
    fields: [
      { key: "titulo", label: "Título", type: "text" },
      { key: "texto", label: "Texto", type: "markdown" },
      { key: "citacao", label: "Citação em destaque", type: "textarea", rows: 2 },
    ],
  },
  {
    key: "marcos",
    label: "Marcos",
    fields: [
      { key: "titulo", label: "Título", type: "text" },
      {
        key: "itens",
        label: "Marcos",
        type: "repeater",
        itemLabel: "Marco",
        summaryKey: "titulo",
        fields: [
          { key: "ano", label: "Ano", type: "text", half: true },
          { key: "titulo", label: "Título", type: "text", half: true },
          { key: "texto", label: "Texto", type: "textarea", rows: 2 },
        ],
      },
    ],
  },
  {
    key: "conviccoes",
    label: "Convicções",
    fields: [
      { key: "titulo", label: "Título", type: "text" },
      {
        key: "itens",
        label: "Convicções",
        type: "repeater",
        itemLabel: "Convicção",
        summaryKey: "titulo",
        fields: [
          { key: "titulo", label: "Título", type: "text" },
          { key: "texto", label: "Texto", type: "textarea", rows: 2 },
        ],
      },
    ],
  },
  {
    key: "formacao",
    label: "Formação",
    fields: [
      { key: "titulo", label: "Título", type: "text" },
      { key: "itens", label: "Itens", type: "list", itemLabel: "Formação" },
    ],
  },
  {
    key: "cta",
    label: "Chamada final",
    fields: [{ key: "titulo", label: "Título", type: "text" }, CTA],
  },
];
