import type { ItemSemente } from "./tipos";

export const LIVROS: ItemSemente[] = [
  {
    collection: "livro",
    slug: "o-governo-de-si",
    title: "O Governo de Si",
    subtitle: "Ensaios sobre disciplina, liberdade e responsabilidade",
    excerpt:
      "Dez ensaios curtos sobre a arte de conduzir a própria vida, com exercícios práticos ao final de cada capítulo.",
    featured: true,
    sort_order: 1,
    body: `*O Governo de Si* reúne dez anos de anotações de campo sobre uma pergunta simples e difícil: o que faz uma pessoa cumprir aquilo que decidiu?

Cada capítulo parte de uma situação real, dialoga com autores clássicos e termina em um exercício prático. É um livro para ler devagar, com um lápis na mão.

## O que você vai encontrar

- Por que a força de vontade não é suficiente
- A diferença entre rigidez e disciplina
- Como a atenção se tornou o recurso mais disputado da vida adulta
- Rotinas de revisão que cabem em dez minutos`,
    data: {
      situacao: "lancado",
      cor: "petroleo",
      ano: "2016",
      editora: "Editora Exemplo",
      paginas: 224,
      isbn: "978-00-00000-00-0",
      etapa: "autogoverno",
      trecho:
        "Autogoverno não é rigidez. É a liberdade de escolher quem você será antes que as circunstâncias escolham por você.",
      sumario:
        "A vontade não basta\nRigidez não é disciplina\nO preço da atenção\nDecidir antes da tentação\nA revisão de dez minutos\nLiberdade com responsabilidade",
      abertura:
        "Toda pessoa que já prometeu a si mesma começar na segunda-feira conhece o problema: a decisão é tomada num dia calmo e cobrada num dia difícil. Este livro começa exatamente aí, no intervalo entre o que decidimos e o que de fato fazemos.",
      lojas: [],
    },
  },
  {
    collection: "livro",
    slug: "reconstruir",
    title: "Reconstruir",
    subtitle: "O que fazer com o que sobrou",
    excerpt: "Um guia honesto para recomeçar depois de perdas, demissões, separações e fracassos.",
    sort_order: 2,
    body: `Ninguém atravessa a vida sem rupturas. *Reconstruir* é um livro para o dia seguinte: quando a crise já aconteceu e a pergunta passa a ser o que fazer com o que ficou de pé.`,
    data: {
      situacao: "lancado",
      cor: "terracota",
      ano: "2021",
      editora: "Editora Exemplo",
      paginas: 192,
      etapa: "reconstrucao",
      trecho: "Reconstruir não é apagar o passado. É decidir o que dele merece virar alicerce.",
      lojas: [],
    },
  },
  {
    collection: "livro",
    slug: "liderar-a-partir-de-dentro",
    title: "Liderar a partir de Dentro",
    subtitle: "Autoridade, responsabilidade e sucessão",
    excerpt: "Em preparação. Um livro sobre a liderança que nasce do autogoverno e se mede pelo crescimento das pessoas.",
    sort_order: 3,
    body: `Livro em preparação. Cadastre-se para ser avisado do lançamento e receber um capítulo antes de todo mundo.`,
    data: {
      situacao: "em-breve",
      cor: "salvia",
      ano: "2027",
      etapa: "lideranca",
      trecho: "Um líder se mede menos pelo que entrega e mais por quem ele forma.",
      lojas: [],
    },
  },
];

const dep = (
  slug: string,
  title: string,
  subtitle: string,
  excerpt: string,
  origem: string,
  referencia: string,
  featured = true,
  sort_order = 0,
): ItemSemente => ({
  collection: "depoimento",
  slug,
  title,
  subtitle,
  excerpt,
  featured,
  sort_order,
  data: { origem, referencia },
});

export const DEPOIMENTOS: ItemSemente[] = [
  dep(
    "marina-toledo",
    "Marina Toledo",
    "Diretora de Operações, Grupo Vasconcellos",
    "Cheguei achando que precisava de mais produtividade. Saí entendendo que precisava de critério. A agenda mudou porque eu mudei.",
    "mentoria",
    "Mentoria Individual",
    true,
    1,
  ),
  dep(
    "rafael-quintela",
    "Rafael Quintela",
    "Fundador, Quintela Engenharia",
    "Depois da crise da empresa, eu só queria voltar ao que era. O processo me mostrou que dava para voltar melhor, e com menos peso.",
    "mentoria",
    "Mentoria para Líderes",
    true,
    2,
  ),
  dep(
    "beatriz-lemos",
    "Beatriz Andrade Lemos",
    "Gerente de RH, Indústrias Serrano",
    "O programa deu aos nossos coordenadores uma linguagem comum. Em seis meses, as conversas difíceis deixaram de ser adiadas.",
    "treinamento",
    "Liderança que Forma Pessoas",
    true,
    3,
  ),
  dep(
    "thiago-morais",
    "Thiago Morais",
    "Coordenador Comercial",
    "A revisão diária de dez minutos parece pouco. Um ano depois, é o hábito que sustenta todos os outros.",
    "curso",
    "Fundamentos do Autogoverno",
    true,
    4,
  ),
  dep(
    "luciana-prado",
    "Luciana Prado",
    "Médica e sócia de clínica",
    "Profundidade sem enrolação. Cada aula terminava em algo que eu conseguia aplicar na mesma semana.",
    "curso",
    "Fundamentos do Autogoverno",
    true,
    5,
  ),
  dep(
    "eduardo-fagundes",
    "Eduardo Fagundes",
    "CEO, Fagundes Alimentos",
    "A palestra abriu a convenção e virou o assunto dos três dias. Nossos gerentes ainda usam as perguntas que ele deixou.",
    "treinamento",
    "O Líder que se Governa",
    false,
    6,
  ),
  dep(
    "camila-arruda",
    "Camila Arruda",
    "Advogada",
    "Li O Governo de Si em uma semana difícil. Voltei a ele muitas vezes depois, sempre com o lápis na mão.",
    "livro",
    "O Governo de Si",
    false,
    7,
  ),
  dep(
    "henrique-salles",
    "Henrique Salles",
    "Gerente de Projetos",
    "O curso me ajudou a sair do modo apagar incêndios. Hoje sei dizer não sem culpa e com argumento.",
    "curso",
    "Fundamentos do Autogoverno",
    false,
    8,
  ),
  dep(
    "patricia-reis",
    "Patrícia Nogueira Reis",
    "Diretora Pedagógica",
    "Sigilo, escuta e firmeza na medida certa. Foi o acompanhamento que eu precisava para uma transição de carreira.",
    "mentoria",
    "Mentoria Individual",
    true,
    9,
  ),
];
