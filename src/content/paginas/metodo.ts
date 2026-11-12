import { ETAPAS, type FieldGroup } from "../fields";
import { CTA, grupoAbertura } from "./comum";

export const METODO_PADRAO = {
  hero: {
    titulo: "A vida que você não governa, *governa você*.",
    subtitulo:
      "O Método Autogoverno ensina a retomar o comando daquilo que está sob a sua responsabilidade: decisões, rotina, emoções, dinheiro, casa, trabalho e futuro. Não promete controle de tudo. Ensina a governar o que cabe a você, em cinco etapas.",
  },
  etapas: {
    titulo: "As cinco etapas",
    itens: [
      {
        chave: "clareza",
        nome: "Clareza",
        pergunta: "Quem está governando a sua vida hoje?",
        descricao:
          "Toda retomada começa por enxergar o quadro inteiro. A maioria das pessoas sente a dor por uma janela só, o trabalho, o dinheiro, o casamento, e não percebe que a casa toda está desorganizada. Aqui você descobre, área por área, onde entregou o comando.",
        praticas: [
          "Mapa de quem governa cada área da vida",
          "Separação entre sintoma e causa",
          "Escolha da primeira área a retomar",
        ],
        sinais: [
          "Você sente que algo está errado, mas não sabe o quê",
          "Vive cansado, apagando incêndio",
          "Não sabe por onde começar",
        ],
        produto: "Diagnóstico Completo",
        link: "/cursos/diagnostico-completo",
      },
      {
        chave: "ordem",
        nome: "Ordem",
        pergunta: "O que precisa voltar para o lugar primeiro?",
        descricao:
          "Você retoma o comando de uma área de cada vez: a agenda, as finanças da casa, uma hora do dia que volta a ser sua. E aprende o princípio mais antigo da formação humana: o problema não é o que você ama, é a ordem em que ama. Quando os afetos voltam para o lugar, a vida volta junto.",
        praticas: [
          "Retomada de uma área por vez",
          "Rotina que funciona na vida real",
          "Ordem dos afetos e das prioridades",
        ],
        sinais: [
          "A vida saiu dos trilhos",
          "Você começa e não termina",
          "Diz sim para todo mundo e não sobra nada para você",
        ],
        produto: "Método Autogoverno",
        link: "/cursos/metodo-autogoverno",
      },
      {
        chave: "progresso",
        nome: "Progresso",
        pergunta: "Como transformar organização em resultado?",
        descricao:
          "Ordem sem execução vira mais um plano bonito. Nesta etapa você escolhe a área prioritária, define uma meta e constrói um plano de 90 dias com rotina de execução, revisão e correção de rota.",
        praticas: [
          "Área prioritária e meta definida",
          "Plano de 90 dias",
          "Rotina de execução e revisão",
        ],
        sinais: [
          "Você já tem alguma ordem, mas os resultados não vêm",
          "Planeja mais do que executa",
          "Trabalha muito e não avança",
        ],
        produto: "Assuma o Controle",
        link: "/cursos/assuma-o-controle",
      },
      {
        chave: "excelencia",
        nome: "Excelência",
        pergunta: "Como crescer sem perder o controle da vida?",
        descricao:
          "Crescer é uma coisa. Sustentar o crescimento por anos, sem perder a família, a saúde e a paz, é outra. Aqui você trabalha disciplina, mentalidade e constância para romper os limites internos que travam o próximo nível.",
        praticas: [
          "Plano de crescimento de três anos",
          "Superação de bloqueios internos",
          "Liderança e constância",
        ],
        sinais: [
          "Você já está crescendo e quer acelerar",
          "Esbarra em medo, culpa ou desgaste",
          "Teme que o próximo nível custe a família ou a saúde",
        ],
        produto: "Nada Pode Me Deter",
        link: "/cursos/nada-pode-me-deter",
      },
      {
        chave: "legado",
        nome: "Legado",
        pergunta: "O que você vai construir que permanece depois de você?",
        descricao:
          "Quem já venceu os problemas pessoais e profissionais passa a fazer outra pergunta. Nesta etapa, as decisões são estratégicas, o acompanhamento é próximo e o ambiente é formado por pessoas com o mesmo nível de responsabilidade.",
        praticas: [
          "Plano estratégico personalizado",
          "Decisões de alto impacto acompanhadas",
          "Ambiente de crescimento com seus pares",
        ],
        sinais: [
          "Você lidera pessoas, empresas ou instituições",
          "Tem decisões grandes pela frente",
          "Pensa no que vai deixar",
        ],
        produto: "Mentoria e Mastermind",
        link: "/mentorias",
      },
    ],
  },
  principios: {
    titulo: "Princípios que atravessam as cinco etapas",
    itens: [
      {
        titulo: "Causa antes de sintoma",
        texto:
          "Disciplina, foco e organização são sintomas. O método começa por quem está no comando.",
      },
      {
        titulo: "Responsabilidade, não culpa",
        texto:
          "Assumir a própria vida não é se condenar. É recuperar o poder de resposta sobre o que cabe a você.",
      },
      {
        titulo: "Prática antes de discurso",
        texto: "Cada etapa termina em uma decisão concreta para a semana seguinte.",
      },
      {
        titulo: "Constância antes de empolgação",
        texto: "A empolgação começa, mas não sustenta. Decisões pequenas e repetidas sustentam.",
      },
    ],
  },
  aplicacao: {
    titulo: "Como o método chega até você",
    texto:
      "Toda vida assume a forma daquilo que a governa. Nos cursos, as etapas viram programas com começo, meio e fim. Nas mentorias, viram um plano pessoal acompanhado de perto. Nas instituições, viram palestras, treinamentos e jornadas de capacitação.",
    cta: { rotulo: "Descobrir minha etapa", link: "/diagnostico" },
  },
};

export type MetodoConteudo = typeof METODO_PADRAO;
export type Etapa = MetodoConteudo["etapas"]["itens"][number];

export const METODO_CAMPOS: FieldGroup[] = [
  grupoAbertura(),
  {
    key: "etapas",
    label: "Etapas",
    help: "As cinco etapas aparecem na página inicial, no Método e no resultado do diagnóstico.",
    fields: [
      { key: "titulo", label: "Título da seção", type: "text" },
      {
        key: "itens",
        label: "Etapas",
        type: "repeater",
        itemLabel: "Etapa",
        summaryKey: "nome",
        fields: [
          { key: "chave", label: "Etapa", type: "select", options: ETAPAS, half: true },
          { key: "nome", label: "Nome exibido", type: "text", half: true },
          { key: "pergunta", label: "Pergunta central", type: "text" },
          { key: "descricao", label: "Descrição", type: "textarea", rows: 4 },
          { key: "praticas", label: "Práticas", type: "list", itemLabel: "Prática" },
          {
            key: "sinais",
            label: "Sinais de que é o seu momento",
            type: "list",
            itemLabel: "Sinal",
          },
          {
            key: "produto",
            label: "Produto desta etapa",
            type: "text",
            half: true,
            help: 'Aparece como "Para esta etapa: …".',
          },
          { key: "link", label: "Link do produto", type: "text", half: true },
        ],
      },
    ],
  },
  {
    key: "principios",
    label: "Princípios",
    fields: [
      { key: "titulo", label: "Título", type: "text" },
      {
        key: "itens",
        label: "Princípios",
        type: "repeater",
        itemLabel: "Princípio",
        summaryKey: "titulo",
        fields: [
          { key: "titulo", label: "Título", type: "text" },
          { key: "texto", label: "Texto", type: "textarea", rows: 2 },
        ],
      },
    ],
  },
  {
    key: "aplicacao",
    label: "Aplicação",
    fields: [
      { key: "titulo", label: "Título", type: "text" },
      { key: "texto", label: "Texto", type: "textarea", rows: 3 },
      CTA,
    ],
  },
];
