/**
 * Diagnóstico de Autogoverno: afirmações avaliadas de 1 a 5, agrupadas por etapa do método.
 * Desde 12/11/2026 as afirmações descrevem a situação da pessoa ("Planejo muito e executo
 * pouco"): a etapa de MAIOR média é o momento dela (empate: a que vem antes no método).
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
        texto: "Sinto que algo está errado na minha vida, mas não sei dizer o quê.",
        etapa: "clareza",
      },
      { texto: "Se eu perdesse meu cargo amanhã, não saberia dizer quem sou.", etapa: "clareza" },
      { texto: "Não sei qual é o próximo passo da minha vida.", etapa: "clareza" },
      {
        texto: "Meu dia é decidido pelas urgências dos outros, não pelas minhas prioridades.",
        etapa: "ordem",
      },
      { texto: "Chego ao fim do mês sem saber para onde foi o dinheiro.", etapa: "ordem" },
      { texto: "Digo sim quando queria dizer não, para não decepcionar alguém.", etapa: "ordem" },
      { texto: "Planejo muito e executo pouco.", etapa: "progresso" },
      {
        texto: "Começo projetos com empolgação e abandono quando ela passa.",
        etapa: "progresso",
      },
      { texto: "Trabalho muito e sinto que não avanço.", etapa: "progresso" },
      {
        texto: "Já tenho resultados, mas esbarro em medo, culpa ou insegurança para crescer.",
        etapa: "excelencia",
      },
      {
        texto: "Tenho medo de que crescer mais custe a minha família ou a minha saúde.",
        etapa: "excelencia",
      },
      { texto: "Só mantenho a disciplina quando estou empolgado.", etapa: "excelencia" },
      {
        texto: "Tomo decisões que afetam muitas pessoas e não tenho com quem pensá-las.",
        etapa: "legado",
      },
      { texto: "Penso com frequência no que vou deixar depois de mim.", etapa: "legado" },
      {
        texto: "Sinto falta de conviver com pessoas com o mesmo nível de responsabilidade.",
        etapa: "legado",
      },
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
        etapa: "clareza",
        titulo: "Seu momento é a *Clareza*",
        texto:
          "Hoje, boa parte da sua vida está sendo decidida fora de você, e você ainda não enxerga o quadro inteiro. Isso não é fraqueza; é o que acontece com quem sustenta muita coisa sem ter aprendido a governar a si mesmo. O primeiro passo é ver onde você entregou o comando.",
        recomendacao: "Fazer o Diagnóstico Completo",
        link: "/cursos/diagnostico-completo",
      },
      {
        etapa: "ordem",
        titulo: "Seu momento é a *Ordem*",
        texto:
          "Você já sabe que algo precisa mudar. Agora é hora de retomar o comando, começando por uma área: a agenda, o dinheiro, os seus sins e nãos.",
        recomendacao: "Conhecer o Método Autogoverno",
        link: "/cursos/metodo-autogoverno",
      },
      {
        etapa: "progresso",
        titulo: "Seu momento é o *Progresso*",
        texto:
          "A base existe. O que falta é transformar organização em resultado, com meta, plano e acompanhamento.",
        recomendacao: "Conhecer o Assuma o Controle",
        link: "/cursos/assuma-o-controle",
      },
      {
        etapa: "excelencia",
        titulo: "Seu momento é a *Excelência*",
        texto:
          "Você já governa a maior parte da sua vida e está crescendo. O desafio agora é sustentar esse crescimento por anos sem perder a família, a saúde e a paz.",
        recomendacao: "Conhecer o Nada Pode Me Deter",
        link: "/cursos/nada-pode-me-deter",
      },
      {
        etapa: "legado",
        titulo: "Seu momento é o *Legado*",
        texto:
          "Suas decisões já afetam muitas pessoas. O próximo passo é ter alguém ao lado e um ambiente à altura das suas responsabilidades.",
        recomendacao: "Conhecer as Mentorias",
        link: "/mentorias",
      },
    ],
  },
  complemento: {
    texto:
      "Quer o mapa inteiro? O Diagnóstico Completo avalia onze áreas da sua vida, com relatório, plano de prioridades e vídeo explicando o resultado. R$ 47.",
    rotulo: "Conhecer o Diagnóstico Completo",
    link: "/cursos/diagnostico-completo",
    aviso:
      "Este diagnóstico é uma ferramenta de autoconhecimento e não substitui avaliação médica ou psicológica.",
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
    help: "Cada afirmação é avaliada de 1 a 5 e soma pontos para a etapa escolhida; a etapa com maior média é o resultado. Escreva afirmações que descrevem a situação da pessoa (concordar = este é o meu momento) e mantenha o mesmo número por etapa.",
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
          { key: "recomendacao", label: "Texto do botão", type: "text", half: true },
          { key: "link", label: "Link do botão", type: "text", half: true },
        ],
      },
    ],
  },
  {
    key: "complemento",
    label: "Linha no fim de todos os resultados",
    fields: [
      { key: "texto", label: "Texto", type: "textarea", rows: 3 },
      { key: "rotulo", label: "Texto do link", type: "text", half: true },
      { key: "link", label: "Link", type: "text", half: true },
      { key: "aviso", label: "Aviso em letra pequena", type: "textarea", rows: 2 },
    ],
  },
];
