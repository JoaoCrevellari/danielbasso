import type { ItemSemente } from "./tipos";

// Livros do Daniel (textos de 12/11/2026). Sem capa enviada, o site gera a capa tipográfica
// com o título; editora, páginas e ISBN ficam vazios até ele mandar.
export const LIVROS: ItemSemente[] = [
  {
    collection: "livro",
    slug: "as-leis-do-autogoverno",
    title: "As Leis do Autogoverno",
    subtitle: "Os princípios que dão forma a uma vida",
    excerpt:
      "O fundamento de todo o método: por que algumas vidas se ordenam e outras se desfazem, e o que cabe a você governar.",
    sort_order: 1,
    body: `Governo é o princípio que dá unidade, direção e ordem a uma vida. Quando ele está fora de você, a vida toma a forma do que está fora: o medo, a culpa, a urgência dos outros.

Neste livro, Daniel Basso reúne a tradição clássica da formação humana, de Agostinho à filosofia concreta de Mário Ferreira dos Santos, e a traduz em leis práticas para quem tem casa, trabalho e família para governar.

## O que você vai encontrar

- O que é governar a si mesmo
- A diferença entre controle, rigidez e autogoverno
- Ser, ter e fazer: a ordem que sustenta uma vida
- Por que a ordem dos afetos decide o rumo de tudo`,
    data: {
      situacao: "em-breve",
      cor: "petroleo",
      ano: "2026",
      editora: "",
      paginas: null,
      isbn: "",
      etapa: "clareza",
      trecho: "Toda vida assume a forma daquilo que a governa.",
      sumario:
        "O que é governar a si mesmo\nControle, rigidez e autogoverno\nSer, ter e fazer\nA ordem dos afetos",
      abertura:
        "Governo é o princípio que dá unidade, direção e ordem a uma vida. Quando ele está fora de você, a vida toma a forma do que está fora: o medo, a culpa, a urgência dos outros.",
      lojas: [],
    },
  },
  {
    collection: "livro",
    slug: "ninguem-vai-fazer-por-voce",
    title: "Ninguém Vai Fazer Por Você",
    subtitle: "Assuma o Controle da Sua Vida Agora",
    excerpt:
      "O livro da retomada: como sair da reação, parar de terceirizar a própria vida e retomar o comando da agenda, do dinheiro e das decisões. Lançamento em 2026.",
    featured: true,
    sort_order: 2,
    body: `Em algum momento, sem assinar nada, você passou o comando da sua vida para outra pessoa: o chefe, a urgência, o medo, a opinião dos outros. Este livro mostra como isso acontece e como retomar.

Não começa com grandes discursos. Começa com uma área, uma decisão pequena, repetida e sustentada. Porque ninguém vai fazer isso por você.

## O que você vai encontrar

- O momento exato em que entregamos o comando
- Por que o problema não é tempo, é prioridade
- Como retomar uma área de cada vez
- Como transformar culpa em responsabilidade`,
    data: {
      situacao: "em-breve",
      cor: "terracota",
      ano: "2026",
      editora: "",
      paginas: null,
      isbn: "",
      etapa: "ordem",
      trecho: "Você não perdeu o controle da sua vida. Você entregou, sem perceber.",
      // Provisório: o sumário e as primeiras linhas reais vêm com o livro.
      sumario:
        "O momento em que entregamos o comando\nO problema não é tempo, é prioridade\nUma área de cada vez\nDa culpa à responsabilidade",
      abertura:
        "Em algum momento, sem assinar nada, você passou o comando da sua vida para outra pessoa: o chefe, a urgência, o medo, a opinião dos outros.",
      lojas: [],
    },
  },
  {
    collection: "livro",
    slug: "nada-pode-me-deter",
    title: "Nada Pode Me Deter",
    subtitle: "Firmeza para atravessar as crises sem ser governado por elas",
    excerpt: "Para quem já se reconstruiu e quer permanecer firme diante das crises.",
    sort_order: 3,
    body: `Reconstruir é o começo. Permanecer é outra coisa. Este livro é para quem já retomou o comando e agora precisa sustentar o crescimento por anos, sem ser governado pelo medo, pela culpa, pelo passado ou pelas circunstâncias.

Não é sobre arrogância nem sobre uma vida sem dor. É sobre maturidade, constância e coragem.

## O que você vai encontrar

- Como crescer sem perder a família, a saúde e a paz
- Disciplina que não depende de empolgação
- Como atravessar crises sem voltar ao ponto de partida
- O que significa ser uma pessoa reconstruída`,
    data: {
      situacao: "em-breve",
      cor: "salvia",
      ano: "2026",
      editora: "",
      paginas: null,
      isbn: "",
      etapa: "excelencia",
      trecho:
        "Nada pode deter uma pessoa reconstruída, não porque ela não sofre, mas porque não é mais governada pela dor.",
      sumario:
        "Crescer sem perder a família, a saúde e a paz\nDisciplina sem empolgação\nAtravessar crises\nUma pessoa reconstruída",
      abertura:
        "Reconstruir é o começo. Permanecer é outra coisa. Este livro é para quem já retomou o comando e agora precisa sustentar o crescimento por anos.",
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
  status: "draft",
});

// Depoimentos de exemplo: ficam como rascunho (não aparecem no site) até chegarem os reais,
// com nome, cargo e autorização por escrito (pedido do Daniel, 12/11/2026; regra do CONAR).
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
