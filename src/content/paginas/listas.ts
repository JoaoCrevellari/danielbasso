/**
 * Páginas de listagem (cursos, mentorias, treinamentos, livros, depoimentos, blog) e contato.
 */
import type { FieldGroup } from "../fields";
import { CTA, ROTULO, grupoAbertura, grupoAberturaComImagem } from "./comum";

export const CURSOS_PADRAO = {
  hero: {
    titulo: "Cursos para estudar *com método*",
    subtitulo:
      "Formações com começo, meio e fim. Cada curso aprofunda uma etapa do método e termina em práticas que você leva para a rotina.",
  },
  como: {
    rotulo: "Como funciona",
    titulo: "Do estudo à prática, em *três movimentos*",
    itens: [
      {
        titulo: "Escolha pela etapa",
        texto:
          "Cada curso aprofunda uma etapa do método. O diagnóstico ajuda a decidir por onde começar.",
      },
      {
        titulo: "Estude no seu ritmo",
        texto: "Aulas gravadas, exercícios semanais e encontros ao vivo para tirar dúvidas.",
      },
      {
        titulo: "Leve para a rotina",
        texto: "Todo módulo termina em uma prática concreta para a semana seguinte.",
      },
    ],
  },
  cta: {
    titulo: "Não sabe por onde começar?",
    texto: "O diagnóstico indica o curso mais adequado à etapa em que você está.",
    cta: { rotulo: "Fazer o diagnóstico", link: "/diagnostico" },
  },
};

export const MENTORIAS_PADRAO = {
  hero: {
    titulo: "Mentoria é para decisões que *não cabem* em um curso",
    subtitulo:
      "Acompanhamento próximo, com agenda definida e sigilo absoluto. Vagas limitadas por semestre para garantir presença de verdade.",
  },
  processo: {
    rotulo: "Como começa",
    titulo: "Quatro passos até o *primeiro encontro*",
    itens: [
      {
        titulo: "Conversa inicial",
        texto: "Trinta minutos para entender o momento e ver se faz sentido seguirmos juntos.",
      },
      {
        titulo: "Diagnóstico aprofundado",
        texto: "Um encontro dedicado a mapear a trajetória, os recursos e os bloqueios.",
      },
      {
        titulo: "Plano de trabalho",
        texto: "Metas, práticas e indicadores combinados por escrito.",
      },
      {
        titulo: "Acompanhamento",
        texto: "Encontros regulares, tarefas entre as sessões e revisões mensais.",
      },
    ],
  },
  cta: {
    titulo: "A primeira conversa não tem custo",
    texto: "Conte seu momento em poucas linhas. Retorno em até dois dias úteis.",
    cta: { rotulo: "Conversar pelo WhatsApp", link: "whatsapp" },
  },
};

export const TREINAMENTOS_PADRAO = {
  hero: {
    titulo: "Lideranças que se governam formam *equipes que respondem*",
    subtitulo:
      "Palestras, workshops e programas contínuos para empresas que querem desenvolver responsabilidade, clareza e consistência nas lideranças.",
    imagem: "https://images.unsplash.com/photo-1571624436279-b272aff752b5",
  },
  formatos: {
    rotulo: "Formatos",
    titulo: "Três formatos, conforme o *momento da empresa*",
    itens: [
      {
        titulo: "Palestra",
        texto:
          "Uma a duas horas para abrir conversas e alinhar linguagem. Ideal para convenções e encontros anuais.",
      },
      {
        titulo: "Workshop",
        texto:
          "Meio período ou dia inteiro com exercícios práticos, casos e plano de ação por participante.",
      },
      {
        titulo: "Programa contínuo",
        texto:
          "Três a doze meses com encontros, mentorias em grupo e indicadores acompanhados com o RH.",
      },
    ],
  },
  processo: {
    rotulo: "Como trabalhamos",
    titulo: "Do primeiro contato à *entrega*",
    itens: [
      {
        titulo: "Escuta",
        texto: "Reunião com RH e liderança para entender contexto, desafios e expectativas.",
      },
      {
        titulo: "Proposta",
        texto:
          "Desenho do formato, conteúdo, carga horária e investimento em até cinco dias úteis.",
      },
      {
        titulo: "Entrega",
        texto: "Execução presencial ou online, com materiais próprios para os participantes.",
      },
      {
        titulo: "Avaliação",
        texto: "Relatório de percepção dos participantes e recomendações para os próximos passos.",
      },
    ],
  },
  segmentos: {
    rotulo: "Experiência",
    titulo: "Setores atendidos",
    itens: [
      "Indústria",
      "Saúde",
      "Varejo",
      "Tecnologia",
      "Serviços financeiros",
      "Educação",
      "Agronegócio",
      "Construção civil",
    ],
  },
  formulario: {
    rotulo: "Proposta",
    titulo: "Solicitar proposta",
    texto:
      "Preencha os dados abaixo. Retorno em até dois dias úteis com as primeiras perguntas e uma sugestão de agenda.",
  },
};

export const LIVROS_PADRAO = {
  hero: {
    titulo: "Livros para uma *leitura demorada*",
    subtitulo: "As ideias do método em forma de ensaio, com exercícios ao final de cada capítulo.",
  },
};

export const DEPOIMENTOS_PADRAO = {
  hero: {
    titulo: "Histórias de quem *decidiu mudar*",
    subtitulo: "Alunos, mentorados e empresas contam o que mudou depois do trabalho com o método.",
  },
};

export const BLOG_PADRAO = {
  hero: {
    titulo: "Ensaios sobre *autogoverno*, liderança e vida prática",
    subtitulo: "Textos curtos para ler com calma e voltar a eles quando for preciso.",
  },
};

export const CONTATO_PAGINA_PADRAO = {
  hero: {
    titulo: "Vamos *conversar*",
    subtitulo:
      "Para cursos, mentorias, treinamentos, entrevistas ou convites. Respondo pessoalmente em até dois dias úteis.",
  },
  assuntos: {
    itens: [
      "Cursos",
      "Mentorias",
      "Treinamento para empresa",
      "Palestra ou evento",
      "Imprensa",
      "Outro assunto",
    ],
  },
};

const GRUPO_CTA: FieldGroup = {
  key: "cta",
  label: "Chamada final",
  fields: [
    { key: "titulo", label: "Título", type: "text" },
    { key: "texto", label: "Texto", type: "textarea", rows: 2 },
    CTA,
  ],
};

const grupoPassos = (key: string, label: string, itemLabel: string): FieldGroup => ({
  key,
  label,
  fields: [
    ROTULO,
    { key: "titulo", label: "Título", type: "text" },
    {
      key: "itens",
      label: label,
      type: "repeater",
      itemLabel,
      summaryKey: "titulo",
      fields: [
        { key: "titulo", label: "Título", type: "text" },
        { key: "texto", label: "Texto", type: "textarea", rows: 2 },
      ],
    },
  ],
});

export const CURSOS_CAMPOS: FieldGroup[] = [
  grupoAbertura(),
  grupoPassos("como", "Como funciona", "Passo"),
  GRUPO_CTA,
];
export const MENTORIAS_CAMPOS: FieldGroup[] = [
  grupoAbertura(),
  grupoPassos("processo", "Como começa", "Passo"),
  GRUPO_CTA,
];
export const TREINAMENTOS_CAMPOS: FieldGroup[] = [
  grupoAberturaComImagem(),
  grupoPassos("formatos", "Formatos", "Formato"),
  grupoPassos("processo", "Processo", "Passo"),
  {
    key: "segmentos",
    label: "Setores atendidos",
    fields: [
      ROTULO,
      { key: "titulo", label: "Título", type: "text" },
      { key: "itens", label: "Setores", type: "list", itemLabel: "Setor" },
    ],
  },
  {
    key: "formulario",
    label: "Formulário de proposta",
    fields: [
      ROTULO,
      { key: "titulo", label: "Título", type: "text" },
      { key: "texto", label: "Texto", type: "textarea", rows: 2 },
    ],
  },
];
export const LIVROS_CAMPOS: FieldGroup[] = [grupoAbertura()];
export const DEPOIMENTOS_CAMPOS: FieldGroup[] = [grupoAbertura()];
export const BLOG_CAMPOS: FieldGroup[] = [grupoAbertura()];
export const CONTATO_CAMPOS: FieldGroup[] = [
  grupoAbertura(),
  {
    key: "assuntos",
    label: "Assuntos do formulário",
    fields: [{ key: "itens", label: "Assuntos", type: "list", itemLabel: "Assunto" }],
  },
];
