import type { FieldGroup } from "../fields";
import { CTA, HERO_IMAGEM } from "./comum";

export const QUEM_SOU_PADRAO = {
  hero: {
    titulo: "Daniel Basso",
    subtitulo:
      "Professor, pesquisador, escritor e mentor. Eu ajudo pessoas a retomar o comando da própria vida. Não porque eu sempre tive o meu, mas porque perdi e precisei aprender a voltar.",
    imagem: "/exemplo/daniel-biblioteca.jpg",
  },
  historia: {
    titulo: "Uma trajetória marcada por *recomeços*",
    texto: `Nasci em Jundiaí, em 1978, filho de família simples, aluno de escola pública. Comecei a empreender cedo e só voltei aos estudos na vida adulta. Desde então, nunca mais parei de estudar e de ensinar: sou graduado em Teologia, História e Filosofia, mestre pela Universidade Presbiteriana Mackenzie e professor no ensino superior, no Brasil e nos Estados Unidos, desde 2013.

Implantei escolas, formei professores e gestores, ajudei a plantar igrejas, fui diretor escolar e pedagógico. Também empreendi longe da sala de aula: distribuição de revistas, telemarketing, frutas congeladas, terceirização de serviços bancários, lavanderia industrial. Eu era o pastor, o diretor, o professor. E achava que era isso que eu era.

Em setembro de 2024, perdi posições que levei anos para construir e parte importante da renda da minha casa. Descobri que, sem o cargo, não sabia mais quem eu era. Foi aí que entendi a frase que hoje sustenta todo o meu trabalho: **quem não governa a própria vida é governado pelas circunstâncias.**`,
    completo: `Minha identidade não caiu porque tiraram meu cargo. Ela caiu porque nunca tinha sido governada por mim. Era governada pelo papel, pela instituição, pela expectativa dos outros. Eu não tinha perdido o controle. Eu tinha entregado.

Apliquei o que hoje chamo de Autogoverno em mim primeiro, de pouquinho em pouquinho. Retomei uma área, depois outra. E voltei. Minha família voltou comigo, meu trabalho voltou.

Quando comecei a ensinar esse caminho, a mesma coisa aconteceu com outras pessoas: servidores públicos, professores, gestores, empresários. Hoje levo o método a pessoas, escolas, prefeituras e empresas. Não porque eu seja especial. A diferença é que hoje eu tenho um método. E o que um homem faz, outro também faz.

Sou pastor, e isso faz parte de quem eu sou. Mas o Método Autogoverno é um método de vida: serve para quem crê, para quem não crê e para quem ainda está pensando nisso.`,
    citacao:
      "Autogoverno não é rigidez. É a liberdade de escolher quem você será antes que as circunstâncias escolham por você.",
  },
  marcos: {
    titulo: "Alguns marcos",
    itens: [
      {
        ano: "2013",
        titulo: "Sala de aula",
        texto:
          "Início como professor convidado em seminários e faculdades no Brasil e no exterior.",
      },
      {
        ano: "2015",
        titulo: "Educação básica",
        texto:
          "Início da docência de Humanidades e do trabalho de implantação de escolas e formação de professores.",
      },
      {
        ano: "2023",
        titulo: "Cidadão Vinhedense",
        texto:
          "Título concedido pela Câmara Municipal de Vinhedo. Início como professor tutor na Grace School of Theology, nos Estados Unidos.",
      },
      {
        ano: "2024",
        titulo: "A ruptura",
        texto: "A perda que deu origem ao Método Autogoverno.",
      },
      {
        ano: "2026",
        titulo: "Mestre e capacitação pública",
        texto:
          "Mestrado pela Universidade Presbiteriana Mackenzie e jornada de capacitação dos servidores do Esporte da Prefeitura de Jundiaí.",
      },
    ],
  },
  conviccoes: {
    titulo: "Aquilo em que acredito",
    itens: [
      {
        titulo: "Responsabilidade",
        texto:
          "O problema é você. E essa é a melhor notícia da sua vida: se o problema é seu, a solução também está ao seu alcance.",
      },
      {
        titulo: "Estudo",
        texto:
          "Governo de si não é novidade. Filósofos e Escrituras falam disso há milênios. Profundidade não é luxo, é método.",
      },
      {
        titulo: "Prática",
        texto:
          "Você não precisa ser especial. Precisa de método. Cada etapa termina em um passo concreto.",
      },
      {
        titulo: "Discrição",
        texto: "Histórias pessoais são tratadas com sigilo, em qualquer formato de trabalho.",
      },
    ],
  },
  formacao: {
    titulo: "Formação",
    itens: [
      "Mestre em Educação, Arte e História da Cultura · Universidade Presbiteriana Mackenzie",
      "MDiv em Teologia Histórica · Centro Presbiteriano de Pós-Graduação Andrew Jumper",
      "Licenciado em História · Universidade Federal do Estado do Rio de Janeiro (UNIRIO)",
      "Bacharel em Filosofia · Centro Universitário Ingá",
      "Bacharel em Teologia · Seminário Presbiteriano do Sul",
      "Especializações em Ciência Política, Educação Cristã Clássica, História do Cristianismo, Teologia Filosófica, Literatura e Teologia, Cristianismo e Política, Pedagogia Religiosa e Teologia e Cultura",
      "Professor Tutor na Grace School of Theology (EUA)",
      "Título de Cidadão Vinhedense · Câmara Municipal de Vinhedo",
    ],
  },
  curriculo: {
    botao: "Ver currículo completo",
    grupos: [
      {
        titulo: "Graduações",
        itens: `Bacharelado em Teologia · Seminário Presbiteriano do Sul (2015–2018)
Licenciatura em História · Universidade Federal do Estado do Rio de Janeiro, UNIRIO (2021–2024)
Bacharelado em Filosofia · Centro Universitário Ingá, UNINGÁ (2023–2025)
Em andamento: Licenciatura em Sociologia · Centro Universitário Única (conclusão prevista para 2026)
Em andamento: Licenciatura em Geografia · Centro Universitário Leonardo da Vinci, UNIASSELVI (conclusão prevista para 2027)`,
      },
      {
        titulo: "Mestrados",
        itens: `Mestre em Educação, Arte e História da Cultura · Universidade Presbiteriana Mackenzie (2024–2026)
MDiv (Mestrado Ministerial) em Teologia Histórica · Centro Presbiteriano de Pós-Graduação Andrew Jumper (2020–2023)
Em andamento: ThM em Estudos Bíblicos e Teológicos do Novo Testamento · CPGJE (2024–2027)
Formação continuada: MDiv em Teologia (FitRef), Educação Cristã Clássica (Southeastern University) e Antiguidade Clássica e Idade Média (Universidad de Buenos Aires)`,
      },
      {
        titulo: "Especializações",
        itens: `História do Cristianismo e do Pensamento Cristão · Faculdade Batista do Rio de Janeiro (2020–2022)
Educação Cristã Clássica · Faculdade Internacional Cidade Viva (2023–2024)
Ciência Política · Centro Universitário Única (2024–2025)
Cristianismo e Política · Centro Universitário Filadélfia (2024–2025)
Teologia Filosófica · Centro Universitário Filadélfia (2024–2025)
Literatura e Teologia · Faculdade Sudoeste (2024–2025)
Pedagogia Religiosa · La Faculdades (2024–2025)
Teologia e Cultura · Faculdade Sudoeste (2025–2026)
Em andamento: Relações Internacionais (Centro Universitário Única), História Medieval (PUC-PR), Storytelling e Escrita Criativa (FAAP), Neurociência e Comportamento Humano (PUC-RS) e Filosofia Patrística e Medieval (FMA)`,
      },
      {
        titulo: "Docência",
        itens: `Professor Tutor · Grace School of Theology, The Woodlands, EUA (desde 2023)
Professor convidado em seminários, faculdades teológicas e institutos bíblicos no Brasil e no exterior (desde 2013): Seminário Teológico Sul Brasileiro, Escola Superior da Bíblia, Seminário Teológico Batista de Jundiaí, Curso Perspectivas, Escola Basileia, ETED e Escola Teológica Sã Doutrina
Docente de Humanidades no Ensino Fundamental II e Médio · Colégio Cristão Attos (desde 2015)`,
      },
      {
        titulo: "Produção intelectual",
        itens: `Artigo: "A transformação das Artes Liberais em Educação Cristã Clássica: bases históricas e filosóficas". Revista Summae Sapientiae, n. 8, 2025 (Qualis/CAPES B2)
Livro: "Aprendendo o Breve Catecismo de Westminster", em coautoria. Edições Attos, 2023
Dissertação de mestrado: "O Pensamento Educacional de Mário Ferreira dos Santos: Filosofia Concreta e Formação Integral do Ser". Mackenzie, 2026
Monografias: Artes Liberais e Educação Cristã Clássica em Agostinho e Tomás de Aquino (UNIRIO, 2023); a transição de protestantes ao romanismo (CPAJ, 2023); o princípio regulador do culto (SPS, 2018)
Em publicação pela Edições Attos: "Judas: Prontos para a Batalha", "A Centralidade de Cristo", "História da Igreja Brasileira", "O que é Educação Cristã?", "E o Mestre Ensinou" e "Introdução à Filosofia Cristã"`,
      },
      {
        titulo: "Trajetória empresarial",
        itens: `Implantação de escolas, formação de professores e gestores, direção escolar e pedagógica
Empreendimentos em distribuição de revistas, telemarketing, frutas congeladas, terceirização de serviços bancários e lavanderia industrial`,
      },
      {
        titulo: "Idiomas",
        itens: `Inglês e espanhol: leitura intermediária
Latim e grego: leitura instrumental`,
      },
    ],
    links: [
      { rotulo: "Currículo Lattes", link: "https://lattes.cnpq.br/8112331870019107" },
      { rotulo: "LinkedIn", link: "https://www.linkedin.com/in/daniel-alves-basso-b0841544a" },
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
      {
        key: "completo",
        label: 'Texto que abre em "Ler descrição completa"',
        type: "markdown",
        help: "Vazio = sem botão.",
      },
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
    key: "curriculo",
    label: "Currículo completo",
    help: 'Abre abaixo da Formação, no botão "Ver currículo completo".',
    fields: [
      { key: "botao", label: "Texto do botão", type: "text" },
      {
        key: "grupos",
        label: "Blocos",
        type: "repeater",
        itemLabel: "Bloco",
        summaryKey: "titulo",
        fields: [
          { key: "titulo", label: "Título", type: "text" },
          { key: "itens", label: "Itens (um por linha)", type: "textarea", rows: 6 },
        ],
      },
      {
        key: "links",
        label: "Links",
        type: "repeater",
        itemLabel: "Link",
        summaryKey: "rotulo",
        fields: [
          { key: "rotulo", label: "Texto", type: "text", half: true },
          { key: "link", label: "Endereço", type: "url", half: true },
        ],
      },
    ],
  },
  {
    key: "cta",
    label: "Chamada final",
    fields: [{ key: "titulo", label: "Título", type: "text" }, CTA],
  },
];
