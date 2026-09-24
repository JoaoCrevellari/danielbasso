import { ETAPAS, type FieldGroup } from "../fields";
import { CTA, grupoAbertura } from "./comum";

export const METODO_PADRAO = {
  hero: {
    titulo: "Um método para quem prefere *profundidade* a atalhos.",
    subtitulo:
      "Cinco etapas que organizam o desenvolvimento humano do inventário pessoal à alta performance, sem pular a parte difícil.",
  },
  etapas: {
    titulo: "As cinco etapas",
    itens: [
      {
        chave: "reconstrucao",
        nome: "Reconstrução",
        pergunta: "O que precisa ser reconstruído antes de ser ampliado?",
        descricao:
          "Todo crescimento sério começa por um inventário honesto da história, das escolhas, das perdas e dos hábitos que nos trouxeram até aqui. Reconstruir não é apagar o passado: é reorganizar o que ficou de pé e assumir o que precisa ser refeito.",
        praticas: [
          "Inventário de trajetória",
          "Mapa de perdas e de recursos",
          "Reconciliação com as próprias escolhas",
        ],
        sinais: [
          "Você está recomeçando depois de uma ruptura",
          "As conquistas não se traduzem em sentido",
          "Os mesmos padrões voltam apesar do esforço",
        ],
      },
      {
        chave: "autogoverno",
        nome: "Autogoverno",
        pergunta: "Quem está no comando das suas decisões?",
        descricao:
          "Autogoverno é a capacidade de conduzir a si mesmo: emoções, atenção, tempo e palavra. Sem ele, qualquer talento fica refém do humor do dia. É a etapa central do método, porque tudo o que vem depois depende dela.",
        praticas: [
          "Revisão diária de decisões",
          "Gestão de atenção e de energia",
          "Compromissos pequenos, cumpridos sempre",
        ],
        sinais: [
          "A agenda é tomada pelo urgente",
          "Você reage de formas das quais se arrepende",
          "Decisões importantes não se sustentam por muito tempo",
        ],
      },
      {
        chave: "transformacao",
        nome: "Transformação",
        pergunta: "Que hábitos sustentam a pessoa que você decidiu ser?",
        descricao:
          "Transformação é o que acontece quando o autogoverno encontra constância. O trabalho deixa o campo da intenção e passa ao da prática: hábitos, ambientes e relações redesenhados para favorecer quem você quer se tornar.",
        praticas: [
          "Desenho de hábitos e rituais",
          "Ambientes que favorecem a disciplina",
          "Revisão de relações e influências",
        ],
        sinais: [
          "Você sabe o que fazer, mas não faz com constância",
          "O ambiente trabalha contra as suas decisões",
          "Os recomeços ficaram frequentes demais",
        ],
      },
      {
        chave: "lideranca",
        nome: "Liderança",
        pergunta: "Quem cresce quando você cresce?",
        descricao:
          "Liderar é assumir responsabilidade pelo desenvolvimento de outras pessoas. Quem governa a si mesmo ganha autoridade para conduzir equipes, famílias e organizações sem depender apenas do cargo.",
        praticas: [
          "Conversas difíceis bem conduzidas",
          "Delegação com responsabilidade",
          "Formação de sucessores",
        ],
        sinais: [
          "A equipe depende demais de você",
          "Conversas importantes vêm sendo adiadas",
          "Você tem o cargo, mas sente falta de autoridade",
        ],
      },
      {
        chave: "performance",
        nome: "Performance",
        pergunta: "Como produzir mais sem se perder no caminho?",
        descricao:
          "Performance, aqui, não é pressa nem exaustão. É resultado consistente, sustentado por prioridades claras e por uma vida que não desmorona fora do trabalho. É a colheita das etapas anteriores.",
        praticas: [
          "Prioridades trimestrais",
          "Indicadores pessoais e de equipe",
          "Ritmo sustentável de trabalho e descanso",
        ],
        sinais: [
          "Muito esforço, pouco resultado visível",
          "O crescimento profissional custa a saúde ou a família",
          "Faltam critérios claros para dizer não",
        ],
      },
    ],
  },
  principios: {
    titulo: "Princípios que atravessam as cinco etapas",
    itens: [
      {
        titulo: "Profundidade antes de velocidade",
        texto:
          "Mudanças rápidas costumam ser rasas. Preferimos entender a raiz antes de mexer nos sintomas.",
      },
      {
        titulo: "Responsabilidade antes de desempenho",
        texto:
          "Ninguém entrega de forma sustentável aquilo pelo qual não se responsabiliza por inteiro.",
      },
      {
        titulo: "Prática antes de discurso",
        texto:
          "Cada conceito vira exercício, rotina ou conversa. O que não se pratica não se aprende.",
      },
      {
        titulo: "Constância antes de intensidade",
        texto:
          "Um passo pequeno, repetido por meses, vale mais que um impulso grande que dura uma semana.",
      },
    ],
  },
  aplicacao: {
    titulo: "Como o método chega até você",
    texto:
      "Nos cursos, as etapas viram trilhas de estudo. Nas mentorias, viram um plano pessoal acompanhado de perto. Nas empresas, viram programas para lideranças e equipes.",
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
