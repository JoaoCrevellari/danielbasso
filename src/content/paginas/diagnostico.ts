/**
 * Diagnóstico de Autogoverno: afirmações avaliadas de 1 a 5, agrupadas por etapa do método.
 * A etapa de menor média é a recomendada como próximo passo (empate: a que vem antes no método).
 */
import { ETAPAS, type FieldGroup } from "../fields";

export const DIAGNOSTICO_PADRAO = {
  intro: {
    titulo: "Diagnóstico de *Autogoverno*",
    subtitulo:
      "Quinze afirmações sobre a sua vida hoje. Responda pensando nos últimos três meses, não em como gostaria que fosse.",
    tempo: "5 minutos",
    botao: "Começar",
  },
  escala: {
    itens: ["Discordo totalmente", "Discordo", "Em parte", "Concordo", "Concordo totalmente"],
  },
  perguntas: {
    itens: [
      {
        texto: "Consigo olhar para a minha história sem me definir pelos erros que cometi.",
        etapa: "reconstrucao",
      },
      {
        texto: "Sei com clareza quais áreas da minha vida precisam ser reorganizadas agora.",
        etapa: "reconstrucao",
      },
      {
        texto: "Depois de perdas ou frustrações, retomo o rumo em pouco tempo.",
        etapa: "reconstrucao",
      },
      {
        texto: "Cumpro os compromissos que faço comigo mesmo, mesmo quando ninguém está cobrando.",
        etapa: "autogoverno",
      },
      {
        texto: "Minhas reações em momentos de tensão raramente me trazem arrependimento.",
        etapa: "autogoverno",
      },
      {
        texto: "Eu decido onde vai a minha atenção, em vez de deixar o urgente decidir por mim.",
        etapa: "autogoverno",
      },
      {
        texto: "Tenho hábitos diários que sustentam os objetivos que defini.",
        etapa: "transformacao",
      },
      {
        texto: "O ambiente em que vivo e trabalho favorece as decisões que tomei.",
        etapa: "transformacao",
      },
      {
        texto: "Quando começo algo importante, mantenho a constância por meses.",
        etapa: "transformacao",
      },
      {
        texto: "As pessoas ao meu redor crescem por causa da forma como eu conduzo as coisas.",
        etapa: "lideranca",
      },
      {
        texto: "Tenho conversas difíceis sem adiá-las e sem perder o respeito.",
        etapa: "lideranca",
      },
      { texto: "Delego com clareza e acompanho sem precisar controlar tudo.", etapa: "lideranca" },
      {
        texto: "Sei quais são as três prioridades mais importantes deste trimestre.",
        etapa: "performance",
      },
      {
        texto: "Entrego resultados consistentes sem sacrificar a saúde ou a família.",
        etapa: "performance",
      },
      { texto: "Acompanho indicadores que me mostram se estou avançando.", etapa: "performance" },
    ],
  },
  captura: {
    titulo: "Seu resultado está pronto",
    texto:
      "Informe seu nome e um contato para ver a análise completa. Seus dados ficam só comigo e você pode pedir a exclusão a qualquer momento.",
  },
  resultados: {
    itens: [
      {
        etapa: "reconstrucao",
        titulo: "Seu próximo passo é a *Reconstrução*",
        texto:
          "Suas respostas indicam capítulos da sua história pedindo reorganização antes de novos voos. Isso não é um retrocesso: é a base que sustenta todo o resto. Comece por um inventário honesto do que ficou de pé e do que precisa ser refeito.",
        recomendacao: "Curso Reconstrução Pessoal",
        link: "/cursos/reconstrucao-pessoal",
      },
      {
        etapa: "autogoverno",
        titulo: "Seu próximo passo é o *Autogoverno*",
        texto:
          "Você já tem clareza sobre o que quer, mas a execução ainda depende do humor do dia e das urgências dos outros. Fortalecer o autogoverno vai devolver a você o comando da agenda, da atenção e das reações.",
        recomendacao: "Curso Fundamentos do Autogoverno",
        link: "/cursos/fundamentos-do-autogoverno",
      },
      {
        etapa: "transformacao",
        titulo: "Seu próximo passo é a *Transformação*",
        texto:
          "As decisões estão tomadas; falta transformá-las em rotina. O trabalho agora é redesenhar hábitos, ambientes e relações para que a constância deixe de depender da força de vontade.",
        recomendacao: "Mentoria Individual",
        link: "/mentorias/mentoria-individual",
      },
      {
        etapa: "lideranca",
        titulo: "Seu próximo passo é a *Liderança*",
        texto:
          "Você governa bem a si mesmo, e isso já é raro. O desafio agora é fazer as pessoas ao seu redor crescerem: conversas que não podem mais ser adiadas, delegação real e formação de sucessores.",
        recomendacao: "Mentoria para Líderes",
        link: "/mentorias/mentoria-para-lideres",
      },
      {
        etapa: "performance",
        titulo: "Seu próximo passo é a *Performance*",
        texto:
          "A base está sólida. O próximo nível é transformar consistência em resultado mensurável, com prioridades claras, indicadores simples e um ritmo que não cobra o preço da saúde.",
        recomendacao: "Curso Alta Performance Sustentável",
        link: "/cursos/alta-performance-sustentavel",
      },
    ],
  },
};

export type DiagnosticoConteudo = typeof DIAGNOSTICO_PADRAO;

export const DIAGNOSTICO_CAMPOS: FieldGroup[] = [
  {
    key: "intro",
    label: "Apresentação",
    fields: [
      { key: "titulo", label: "Título", type: "text" },
      { key: "subtitulo", label: "Orientação", type: "textarea", rows: 3 },
      { key: "tempo", label: "Tempo estimado", type: "text", half: true },
      { key: "botao", label: "Texto do botão", type: "text", half: true },
    ],
  },
  {
    key: "perguntas",
    label: "Afirmações",
    help: "Cada afirmação é avaliada de 1 a 5 e soma pontos para a etapa escolhida. Mantenha o mesmo número de afirmações por etapa.",
    fields: [
      {
        key: "itens",
        label: "Afirmações",
        type: "repeater",
        itemLabel: "Afirmação",
        summaryKey: "texto",
        fields: [
          { key: "texto", label: "Afirmação", type: "textarea", rows: 2 },
          { key: "etapa", label: "Etapa", type: "select", options: ETAPAS },
        ],
      },
    ],
  },
  {
    key: "escala",
    label: "Escala de respostas",
    help: "Cinco opções, da discordância à concordância total.",
    fields: [{ key: "itens", label: "Opções", type: "list", itemLabel: "Opção" }],
  },
  {
    key: "captura",
    label: "Pedido de contato",
    fields: [
      { key: "titulo", label: "Título", type: "text" },
      { key: "texto", label: "Texto", type: "textarea", rows: 3 },
    ],
  },
  {
    key: "resultados",
    label: "Resultados por etapa",
    fields: [
      {
        key: "itens",
        label: "Resultados",
        type: "repeater",
        itemLabel: "Resultado",
        summaryKey: "etapa",
        fields: [
          { key: "etapa", label: "Etapa", type: "select", options: ETAPAS, half: true },
          { key: "titulo", label: "Título", type: "text", half: true },
          { key: "texto", label: "Análise", type: "textarea", rows: 4 },
          { key: "recomendacao", label: "Recomendação", type: "text", half: true },
          { key: "link", label: "Link da recomendação", type: "text", half: true },
        ],
      },
    ],
  },
];
