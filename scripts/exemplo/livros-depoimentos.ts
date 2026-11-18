import type { ItemSemente } from "./tipos";

// Livros do Daniel (textos de 12/11/2026; capas, contracapas e o Ruptura chegaram em 17/11/2026).
// As capas são a frente das capas completas que ele mandou (public/livros). Páginas e ISBN
// ficam vazios até ele mandar.
export const LIVROS: ItemSemente[] = [
  {
    collection: "livro",
    slug: "as-leis-do-autogoverno",
    cover_url: "https://volnctioztyylqsyiham.supabase.co/storage/v1/object/public/media/2026/11/capa-as-leis-do-autogoverno-b1xu1n-w1200.webp",
    title: "As Leis do Autogoverno",
    subtitle: "Os princípios que dão forma a uma vida",
    excerpt:
      "O fundamento de todo o método: por que algumas vidas se ordenam e outras se desfazem, e o que cabe a você governar.",
    sort_order: 1,
    body: `Governo é o princípio que dá unidade, direção e ordem a uma vida. Quando ele está fora de você, a vida toma a forma do que está fora: o medo, a culpa, a urgência dos outros. Quem não governa a si mesmo é governado pelas circunstâncias.

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
      editora: "Edições Attos",
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
    cover_url: "https://volnctioztyylqsyiham.supabase.co/storage/v1/object/public/media/2026/11/capa-ninguem-vai-fazer-por-voce-q4t3bj-w1200.webp",
    title: "Ninguém Vai Fazer Por Você",
    subtitle: "Assuma o Controle da Sua Vida Agora",
    excerpt:
      "O livro da retomada: como sair da reação, parar de terceirizar a própria vida e retomar o comando da agenda, do dinheiro e das decisões. Lançamento em 2026.",
    featured: true,
    sort_order: 2,
    body: `Em algum momento, sem assinar nada, você passou o comando da sua vida para outra pessoa: o chefe, a urgência, o medo, a opinião dos outros. Você não perdeu o controle. Você entregou, sem perceber.

Autogoverno é a capacidade de responder por si: decidir, agir e corrigir sem esperar que alguém faça por você. Neste livro de entrada, Daniel Basso mostra, de forma direta e prática, como retomar o comando da agenda, do dinheiro e das decisões, uma área de cada vez. E por que esperar é o caminho mais caro.

## O que você vai encontrar

- O momento exato em que entregamos o comando
- Por que o problema não é tempo, é prioridade
- Como retomar uma área de cada vez
- Como transformar culpa em responsabilidade`,
    data: {
      situacao: "em-breve",
      cor: "terracota",
      ano: "2026",
      editora: "Edições Attos",
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
    cover_url: "https://volnctioztyylqsyiham.supabase.co/storage/v1/object/public/media/2026/11/capa-nada-pode-me-deter-ggtgn3-w1200.webp",
    title: "Nada Pode Me Deter",
    subtitle: "Como perdi o que eu achava que era e reconstruí minha vida",
    excerpt:
      "Uma história real: como Daniel Basso perdeu o cargo, a renda e a própria identidade, e reconstruiu a vida por inteiro.",
    sort_order: 3,
    body: `Filho de família simples, aluno de escola pública em Jundiaí, Daniel Basso começou a empreender cedo e só voltou aos estudos na vida adulta. Construiu escolas, formou professores, liderou instituições. E acreditava que era exatamente isso: o cargo, o papel, o título.

Em setembro de 2024, perdeu posições que levou anos para construir e parte importante da renda da casa. Sem o cargo, descobriu que não sabia mais quem era. Casamento, filhos, amigos, trabalho: tudo esteve por um fio.

Esta é a história de como ele voltou. Não mais ou menos, mas por inteiro. E de como a reconstrução da própria vida deu origem ao Método Autogoverno, que hoje ajuda pessoas, empresas e instituições a retomar o comando.

**O que um homem faz, outro também faz.**

## O que você vai encontrar

- Como crescer sem perder a família, a saúde e a paz
- Disciplina que não depende de empolgação
- Como atravessar crises sem voltar ao ponto de partida
- O que significa ser uma pessoa reconstruída`,
    data: {
      situacao: "em-breve",
      cor: "salvia",
      ano: "2026",
      editora: "Edições Attos",
      paginas: null,
      isbn: "",
      etapa: "excelencia",
      trecho:
        "Nada pode deter uma pessoa reconstruída, não porque ela não sofre, mas porque não é mais governada pela dor.",
      sumario:
        "Crescer sem perder a família, a saúde e a paz\nDisciplina sem empolgação\nAtravessar crises\nUma pessoa reconstruída",
      abertura:
        "Em setembro de 2024, perdeu posições que levou anos para construir e parte importante da renda da casa. Sem o cargo, descobriu que não sabia mais quem era.",
      lojas: [],
    },
  },
  {
    collection: "livro",
    slug: "ruptura",
    cover_url: "https://volnctioztyylqsyiham.supabase.co/storage/v1/object/public/media/2026/11/capa-ruptura-qgm5cp-w1200.webp",
    title: "Ruptura",
    subtitle: "Quebre o personagem. Reconstrua quem você é.",
    excerpt:
      "Uma travessia em dez etapas. Não é um livro para quem quer se sentir melhor. É para quem decidiu ser outro.",
    sort_order: 4,
    body: `Há um dia em que a vida deixa de sussurrar e começa a gritar. O que você fingia controlar escapa pelas mãos, o chão desaparece e o personagem que você criou para sobreviver já não consegue sustentar o peso.

Neste livro, Daniel Basso conduz o leitor por uma travessia em dez etapas: aceitar a realidade como ela é, enterrar a persona, reencontrar o próprio lugar, lutar, forjar disciplina, construir uma vida que sustente o novo eu, escolher com quem caminhar, acertar as contas com o passado e vigiar a si mesmo. Não é um livro para quem quer se sentir melhor. É para quem decidiu ser outro.

**O que se quebra também pode ser reconstruído.**`,
    data: {
      situacao: "em-breve",
      cor: "terracota",
      ano: "2026",
      editora: "Edições Attos",
      paginas: null,
      isbn: "",
      etapa: "clareza",
      trecho: "A máscara que te salvou é a mesma que hoje te aprisiona.",
      sumario: "",
      abertura: "",
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
