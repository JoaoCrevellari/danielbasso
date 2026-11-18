/**
 * Páginas de listagem (cursos, mentorias, treinamentos, livros, depoimentos, blog) e contato.
 */
import { ETAPAS, type FieldGroup } from "../fields";
import { CTA, ROTULO, grupoAbertura, grupoAberturaComImagem } from "./comum";

export const CURSOS_PADRAO = {
  hero: {
    titulo: "Cursos para estudar *com método*",
    subtitulo:
      "Cada curso resolve um momento diferente da vida. Você não precisa começar pelo mais longo; precisa começar pelo certo. O diagnóstico mostra qual é o seu.",
  },
  // Níveis enviados pelo Daniel em 17/11/2026 (substituem a escada das etapas).
  niveis: {
    rotulo: "Por onde começar",
    titulo: "Cada momento da vida pede *um passo diferente*",
    texto: "Escolha pelo que você vive hoje. Em Saiba mais, você deixa seu contato e recebe as informações.",
    itens: [
      {
        etapa: "clareza",
        produto: "Diagnóstico Completo",
        para_quem: "Quem está confuso e sente que algo está errado, mesmo sem saber o quê.",
        rotulo_falas: "Se você diz coisas como",
        falas: "Estou perdido.\nEstou cansado.\nMinha vida não anda.\nEstou estagnado.",
        compra: "Clareza",
        entrega: "Condições de descobrir exatamente o que está impedindo a sua vida de avançar.",
        link: "/cursos/diagnostico-completo",
      },
      {
        etapa: "ordem",
        produto: "Método Autogoverno",
        para_quem: "Quem já descobriu o problema e agora é capaz de assumir as responsabilidades.",
        rotulo_falas: "",
        falas: "",
        compra: "Organização pessoal",
        entrega: "Devolvemos a sua capacidade de colocar a vida em ordem e voltar a avançar.",
        link: "/cursos/metodo-autogoverno",
      },
      {
        etapa: "progresso",
        produto: "Assuma o Controle",
        para_quem: "Quem já tem certa ordem na vida, mas continua sem os tão sonhados resultados.",
        rotulo_falas: "Se você se pergunta",
        falas: "Como transformar todo o meu potencial em progresso?",
        compra: "Execução",
        entrega: "Criamos as condições para você sair do planejamento e começar a construir resultados concretos.",
        link: "/cursos/assuma-o-controle",
      },
      {
        etapa: "excelencia",
        produto: "Nada Pode Me Deter",
        para_quem: "Quem já tem resultados, mas ainda esbarra em limites internos.",
        rotulo_falas: "Se você se pergunta",
        falas: "Como operar no meu máximo potencial?",
        compra: "Alta performance humana",
        entrega: "Ajudamos você a desenvolver uma mentalidade vencedora, com a disciplina e a resistência necessárias para atingir níveis extraordinários de realização.",
        link: "/cursos/nada-pode-me-deter",
      },
      {
        etapa: "legado",
        produto: "Mentoria Individual",
        para_quem: "Empresários, líderes, pastores, gestores e executivos.",
        rotulo_falas: "Se você se pergunta",
        falas: "Como acelerar os próximos 10 anos da minha vida?",
        compra: "Estratégia a curto, médio e longo prazo",
        entrega: "Clareza estratégica para as decisões que vão mudar a sua vida, a sua carreira e o seu legado.",
        link: "/mentorias/mentoria-individual",
      },
      {
        etapa: "legado",
        produto: "Mastermind",
        para_quem: "Quem já venceu os problemas pessoais e os profissionais.",
        rotulo_falas: "E agora se pergunta",
        falas: "O que vou construir que vai permanecer depois de mim?",
        compra: "Legado",
        entrega: "A capacidade de construir algo muito maior do que você.",
        link: "/mentorias/mastermind",
      },
    ],
  },
  como: {
    rotulo: "Como funciona",
    titulo: "Do estudo à prática, em *três movimentos*",
    itens: [
      {
        titulo: "Comece pelo diagnóstico",
        texto: "Ele mostra em qual etapa você está e qual curso faz sentido agora.",
      },
      {
        titulo: "Estude no seu ritmo",
        texto: "Aulas gravadas, exercícios práticos e, nos programas maiores, encontros ao vivo.",
      },
      {
        titulo: "Leve para a rotina",
        texto: "Cada módulo termina em uma decisão concreta para a semana seguinte.",
      },
    ],
  },
  cta: {
    titulo: "Não sabe por onde começar?",
    texto: "O diagnóstico mostra onde você entregou o comando e qual curso faz sentido agora.",
    cta: { rotulo: "Fazer o diagnóstico", link: "/diagnostico" },
  },
};

export const MENTORIAS_PADRAO = {
  hero: {
    titulo: "Mentoria é para decisões que *não cabem* em um curso",
    subtitulo:
      "Quando você lidera pessoas, sustenta uma família, conduz uma empresa ou uma instituição, as decisões mais importantes não têm resposta em aula gravada. Elas pedem alguém ao lado, que conheça a sua realidade e fale a verdade. Vagas limitadas.",
  },
  programas: {
    rotulo: "Programas",
    titulo: "Escolha o formato de *acompanhamento*",
    texto:
      "Individual, para gestores ou em grupo seleto: escolha pelo tipo de decisão que você precisa tomar.",
  },
  processo: {
    rotulo: "Como começa",
    titulo: "Quatro passos até o *primeiro encontro*",
    itens: [
      {
        titulo: "Conversa inicial",
        texto:
          "Trinta minutos para entender o seu momento e ver se faz sentido caminharmos juntos.",
      },
      {
        titulo: "Diagnóstico aprofundado",
        texto: "Um encontro para mapear trajetória, recursos e bloqueios.",
      },
      {
        titulo: "Plano de trabalho",
        texto: "Metas, práticas e revisões combinadas por escrito.",
      },
      {
        titulo: "Acompanhamento",
        texto:
          "Encontros regulares, plano de ação depois de cada encontro e revisão mensal dos resultados.",
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
    rotulo: "Para empresas e instituições",
    titulo: "Pessoas que se governam formam *equipes que respondem*",
    subtitulo:
      "Palestras, treinamentos e jornadas de capacitação para prefeituras, escolas, igrejas e empresas. O servidor que adia, falta ou vive esgotado raramente tem um problema técnico: quase sempre perdeu o governo da própria vida. O desenvolvimento humano alcança essa camada.",
    imagem: "https://volnctioztyylqsyiham.supabase.co/storage/v1/object/public/media/2026/11/palestra-jundiai-do-ordinario-ao-extraordinario-wvcfat-w1280.webp",
  },
  formatos: {
    rotulo: "Formatos",
    titulo: "Três formatos, conforme o *momento da instituição*",
    itens: [
      {
        titulo: "Palestra",
        texto:
          "De 60 a 90 minutos para abrir conversas e alinhar linguagem. Ideal para abertura e encerramento de ano, convenções e semanas internas.",
      },
      {
        titulo: "Treinamento",
        texto:
          "Meio período ou dia inteiro, com exercícios práticos e plano pessoal de cada participante.",
      },
      {
        titulo: "Programa contínuo",
        texto:
          "De 90 dias a 12 meses, com encontros, acompanhamento e, quando a instituição quiser, medição antes e depois com relatório técnico para a gestão.",
      },
    ],
  },
  programas: {
    rotulo: "Programas",
    titulo: "Palestras, treinamentos e *programas*",
    texto:
      "Cada formato pode ser adaptado ao contexto, ao tamanho da equipe e ao objetivo da instituição.",
  },
  processo: {
    rotulo: "Como trabalhamos",
    titulo: "Do primeiro contato à *entrega*",
    itens: [
      {
        titulo: "Escuta",
        texto: "Reunião com a gestão para entender contexto, desafios e expectativas.",
      },
      {
        titulo: "Proposta",
        texto:
          "Desenho do formato, conteúdo, carga horária e investimento em até cinco dias úteis.",
      },
      {
        titulo: "Entrega",
        texto: "Presencial ou online, com material próprio para os participantes.",
      },
      {
        titulo: "Avaliação",
        texto: "Relatório de percepção dos participantes e recomendações para os próximos passos.",
      },
    ],
  },
  instituicoes: {
    rotulo: "Onde já trabalhamos",
    titulo: "Instituições que já *receberam o método*",
    itens: [
      {
        nome: "Prefeitura do Município de Jundiaí",
        escopo:
          "Jornada de capacitação de 12 encontros para a Secretaria de Esporte e Lazer; palestras de 2025",
        logo: "https://volnctioztyylqsyiham.supabase.co/storage/v1/object/public/media/2026/11/logo-prefeitura-de-jundiai-d7qi42-w599.webp",
      },
      {
        nome: "Prefeitura do Município de Vinhedo",
        escopo: "Trabalho com creches municipais e terceirizadas",
        logo: "https://volnctioztyylqsyiham.supabase.co/storage/v1/object/public/media/2026/11/logo-prefeitura-de-vinhedo-gwq0b2-w433.webp",
      },
      {
        nome: "Colégio Cristão Attos",
        escopo:
          "Implantação de unidades, treinamento de professores, acompanhamento da coordenação e mentoria de diretores e gestores",
        logo: "https://volnctioztyylqsyiham.supabase.co/storage/v1/object/public/media/2026/11/logo-colegio-attos-moaiau-w277.webp",
      },
      {
        nome: "Attos Educacional",
        escopo: "Implantação do projeto empresarial completo",
        logo: "",
      },
      {
        nome: "Vinde School",
        escopo: "Implantação da unidade e treinamento de todo o corpo docente",
        logo: "https://volnctioztyylqsyiham.supabase.co/storage/v1/object/public/media/2026/11/logo-vinde-school-khaud2-w575.webp",
      },
      {
        nome: "Kubrusly Basso Group USA",
        escopo: "Treinamento de gestores e equipes de campo",
        logo: "https://volnctioztyylqsyiham.supabase.co/storage/v1/object/public/media/2026/11/logo-kubrusly-basso-mkqyb9-w499.webp",
      },
    ],
  },
  imprensa: {
    rotulo: "Na imprensa",
    titulo: "O trabalho *em registro público*",
    itens: [
      {
        veiculo: "Prefeitura de Jundiaí",
        data: "Maio de 2026",
        titulo: "Capacitação reforça integração e desenvolvimento de servidores do Esporte",
        link: "https://jundiai.sp.gov.br/noticias/2026/05/16/capacitacao-reforca-integracao-e-desenvolvimento-de-servidores-do-esporte/",
      },
      {
        veiculo: "Jornal de Jundiaí",
        data: "Maio de 2026",
        titulo: "Servidores do Esporte de Jundiaí participam de capacitação",
        link: "https://sampi.net.br/jundiai/noticias/2979998/esporte/2026/05/servidores-do-esporte-de-jundiai-participam-de-capacitacao",
      },
      {
        veiculo: "Câmara Municipal de Vinhedo",
        data: "Novembro de 2023",
        titulo: "Título de Cidadão Vinhedense",
        link: "https://www.camaravinhedo.sp.gov.br/imprensa/noticias/Noticias/54/0/637",
      },
    ],
  },
  formulario: {
    rotulo: "Proposta",
    titulo: "Solicitar proposta",
    texto:
      "Preencha os dados abaixo. Retorno em até dois dias úteis com as primeiras perguntas e uma sugestão de agenda.",
    assuntos: ["Palestra", "Treinamento", "Programa contínuo", "Ainda não sei"],
  },
};

export const LIVROS_PADRAO = {
  hero: {
    titulo: "Os livros do *Autogoverno*",
    subtitulo:
      "Quatro livros, um mesmo caminho: entender por que a vida saiu dos trilhos, retomar o comando e permanecer firme. Lançamento em 2026.",
  },
};

export const DEPOIMENTOS_PADRAO = {
  hero: {
    titulo: "Histórias de quem *decidiu mudar*",
    subtitulo:
      "Alunos, mentorados e instituições contam o que mudou depois do trabalho com o método.",
  },
};

export const BLOG_PADRAO = {
  hero: {
    titulo: "Ensaios sobre *autogoverno* e vida prática",
    subtitulo: "Textos curtos para ler com calma e voltar a eles quando for preciso.",
  },
};

export const CONTATO_PAGINA_PADRAO = {
  hero: {
    titulo: "Vamos *conversar*",
    subtitulo:
      "Para cursos, mentorias, palestras, treinamentos, entrevistas ou convites. Toda reconstrução começa com uma conversa honesta. Respondo pessoalmente ou pela minha equipe em até dois dias úteis.",
  },
  assuntos: {
    itens: [
      "Cursos",
      "Mentorias",
      "Palestra ou treinamento",
      "Diagnóstico",
      "Livros",
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

const grupoTitulo = (key: string, label: string): FieldGroup => ({
  key,
  label,
  fields: [
    ROTULO,
    { key: "titulo", label: "Título", type: "text" },
    { key: "texto", label: "Texto", type: "textarea", rows: 2 },
  ],
});

export const CURSOS_CAMPOS: FieldGroup[] = [
  grupoAbertura(),
  {
    key: "niveis",
    label: "Níveis (por onde começar)",
    help: "Um nível por produto, na ordem. Aparece na página Cursos e, resumido, na Início.",
    fields: [
      ROTULO,
      { key: "titulo", label: "Título", type: "text" },
      { key: "texto", label: "Texto", type: "textarea", rows: 2 },
      {
        key: "itens",
        label: "Níveis",
        type: "repeater",
        itemLabel: "Nível",
        summaryKey: "produto",
        fields: [
          { key: "etapa", label: "Etapa", type: "select", options: ETAPAS, half: true },
          { key: "produto", label: "Produto", type: "text", half: true },
          { key: "para_quem", label: "Para quem é", type: "textarea", rows: 2 },
          { key: "rotulo_falas", label: "Rótulo das frases", type: "text", half: true, help: "Ex.: Se você se pergunta" },
          { key: "falas", label: "Frases (uma por linha)", type: "textarea", rows: 3 },
          { key: "compra", label: "O que você compra", type: "text", half: true },
          { key: "link", label: "Link do Saiba mais", type: "text", half: true },
          { key: "entrega", label: "O que você recebe", type: "textarea", rows: 2 },
        ],
      },
    ],
  },
  grupoPassos("como", "Como funciona", "Passo"),
  GRUPO_CTA,
];
export const MENTORIAS_CAMPOS: FieldGroup[] = [
  grupoAbertura(),
  grupoTitulo("programas", "Programas (título da lista)"),
  grupoPassos("processo", "Como começa", "Passo"),
  GRUPO_CTA,
];
const ABERTURA_TREINAMENTOS = grupoAberturaComImagem();
export const TREINAMENTOS_CAMPOS: FieldGroup[] = [
  {
    ...ABERTURA_TREINAMENTOS,
    fields: [{ ...ROTULO, label: "Rótulo acima do título" }, ...ABERTURA_TREINAMENTOS.fields],
  },
  grupoPassos("formatos", "Formatos", "Formato"),
  grupoTitulo("programas", "Programas (título da lista)"),
  grupoPassos("processo", "Processo", "Passo"),
  {
    key: "instituicoes",
    label: "Onde já trabalhamos",
    help: "Aparece aqui em cartões e na Início em uma faixa. Sem logo, o nome aparece escrito. Use logos só com autorização da instituição.",
    fields: [
      ROTULO,
      { key: "titulo", label: "Título", type: "text" },
      {
        key: "itens",
        label: "Instituições",
        type: "repeater",
        itemLabel: "Instituição",
        summaryKey: "nome",
        fields: [
          { key: "nome", label: "Nome", type: "text", required: true },
          { key: "escopo", label: "Escopo do trabalho", type: "textarea", rows: 2 },
          {
            key: "logo",
            label: "Logo (opcional)",
            type: "image",
            aspect: "3:1",
            inteira: true,
            help: "De preferência PNG ou SVG com fundo transparente. No site, a logo aparece em tons de cinza e ganha cor quando o mouse passa por cima.",
          },
        ],
      },
    ],
  },
  {
    key: "imprensa",
    label: "Na imprensa",
    help: "Aparece nesta página e na Quem sou.",
    fields: [
      ROTULO,
      { key: "titulo", label: "Título", type: "text" },
      {
        key: "itens",
        label: "Matérias",
        type: "repeater",
        itemLabel: "Matéria",
        summaryKey: "titulo",
        fields: [
          { key: "veiculo", label: "Veículo", type: "text", half: true },
          { key: "data", label: "Data", type: "text", half: true, placeholder: "Maio de 2026" },
          { key: "titulo", label: "Título da matéria", type: "text" },
          { key: "link", label: "Link", type: "url" },
        ],
      },
    ],
  },
  {
    key: "formulario",
    label: "Formulário de proposta",
    fields: [
      ROTULO,
      { key: "titulo", label: "Título", type: "text" },
      { key: "texto", label: "Texto", type: "textarea", rows: 2 },
      { key: "assuntos", label: "Opções do campo Assunto", type: "list", itemLabel: "Opção" },
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
