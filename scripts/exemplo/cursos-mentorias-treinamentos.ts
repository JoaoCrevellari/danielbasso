import type { ItemSemente } from "./tipos";

const U = (id: string) => `https://images.unsplash.com/${id}`;

export const CURSOS: ItemSemente[] = [
  {
    collection: "curso",
    slug: "fundamentos-do-autogoverno",
    title: "Fundamentos do Autogoverno",
    subtitle: "Retomar o comando da agenda, da atenção e das reações",
    excerpt:
      "Oito semanas para construir a base de todo o método: decisões que se sustentam, rotina que protege o essencial e reações que deixam de trabalhar contra você.",
    cover_url: U("photo-1638537690617-ebc561143de0"),
    featured: true,
    sort_order: 1,
    body: `Autogoverno é a etapa central do método. Sem ele, qualquer conhecimento novo vira mais uma intenção que não se cumpre.

Neste curso, você vai entender de onde vêm as decisões que não se sustentam e construir, semana a semana, uma rotina de governo pessoal: pequenas práticas diárias que devolvem o comando da agenda, da atenção e das próprias reações.

## Como o curso funciona

Cada semana tem uma aula gravada, um exercício prático e um encontro ao vivo de perguntas e respostas. O ritmo foi pensado para quem trabalha: cerca de três horas por semana.

> A liberdade começa no momento em que você deixa de negociar consigo mesmo aquilo que já decidiu.`,
    data: {
      etapa: "autogoverno",
      status_oferta: "aberto",
      formato: "online",
      duracao: "8 semanas",
      carga: "24 horas",
      proxima_turma: "Março de 2027",
      investimento: "Sob consulta",
      para_quem: [
        "Profissionais que sentem a agenda tomada pelo urgente",
        "Líderes que querem ser exemplo de disciplina sem rigidez",
        "Quem já tentou muitos métodos de produtividade e voltou ao ponto de partida",
      ],
      resultados: [
        "Uma rotina de revisão diária de dez minutos",
        "Critérios claros para dizer não",
        "Um plano de atenção para proteger o trabalho profundo",
        "Ferramentas para lidar com reações impulsivas",
      ],
      modulos: [
        { titulo: "O que é governar a si mesmo", descricao: "A diferença entre controle, rigidez e autogoverno." },
        { titulo: "Decisões que se sustentam", descricao: "Por que as boas decisões se desfazem e como protegê-las." },
        { titulo: "A economia da atenção", descricao: "Mapear onde vai a atenção e redesenhar o dia." },
        { titulo: "Emoções e reações", descricao: "O intervalo entre o estímulo e a resposta." },
        { titulo: "Compromissos pequenos", descricao: "Construir confiança em si mesmo, um compromisso por vez." },
        { titulo: "Rotina de revisão", descricao: "O ritual diário e semanal que mantém o rumo." },
        { titulo: "Ambientes e limites", descricao: "Quando o ambiente ajuda e quando atrapalha." },
        { titulo: "Plano de continuidade", descricao: "O que fazer depois da última aula." },
      ],
      faq: [
        { pergunta: "Preciso ter feito outro curso antes?", resposta: "Não. Este é o curso de entrada do método." },
        { pergunta: "As aulas ficam gravadas?", resposta: "Sim. O acesso às gravações vale por doze meses." },
        { pergunta: "Há certificado?", resposta: "Sim, para quem concluir as oito semanas e os exercícios." },
      ],
    },
  },
  {
    collection: "curso",
    slug: "reconstrucao-pessoal",
    title: "Reconstrução Pessoal",
    subtitle: "Reorganizar a vida depois de uma ruptura",
    excerpt:
      "Para quem atravessou uma perda, uma demissão, um fim ou um fracasso e quer recomeçar sem fingir que nada aconteceu.",
    cover_url: U("photo-1519143009590-e3800b9df468"),
    sort_order: 2,
    body: `Toda vida passa por rupturas. O que muda de uma pessoa para outra é o que ela faz com os escombros.

Este curso conduz um inventário honesto da trajetória: o que ficou de pé, o que precisa ser refeito e o que precisa ser deixado para trás. Não é terapia, e não substitui acompanhamento clínico quando ele é necessário. É um trabalho de reorganização prática, com método e prazo.

## O que você vai fazer

Ao longo de seis semanas, você constrói o seu mapa de reconstrução: uma visão clara dos recursos disponíveis, das perdas assumidas e dos primeiros passos concretos.`,
    data: {
      etapa: "reconstrucao",
      status_oferta: "espera",
      formato: "online",
      duracao: "6 semanas",
      carga: "18 horas",
      proxima_turma: "Maio de 2027",
      investimento: "Sob consulta",
      para_quem: [
        "Quem passou por uma demissão, separação ou falência",
        "Profissionais em transição de carreira",
        "Quem sente que está recomeçando pela terceira vez",
      ],
      resultados: [
        "Um inventário escrito da própria trajetória",
        "O mapa de perdas e recursos",
        "Um plano de noventa dias para o recomeço",
      ],
      modulos: [
        { titulo: "O que a ruptura revela", descricao: "Ler a crise como informação, não só como dor." },
        { titulo: "Inventário de trajetória", descricao: "Escrever a própria história com honestidade." },
        { titulo: "Perdas e recursos", descricao: "O que se foi e o que continua disponível." },
        { titulo: "Reconciliação", descricao: "Assumir escolhas sem se definir por elas." },
        { titulo: "Primeiros alicerces", descricao: "Rotina mínima para dias difíceis." },
        { titulo: "Plano de noventa dias", descricao: "Os primeiros passos, com datas." },
      ],
      faq: [
        { pergunta: "O curso substitui terapia?", resposta: "Não. Ele pode caminhar junto com um acompanhamento clínico." },
      ],
    },
  },
  {
    collection: "curso",
    slug: "lideranca-com-proposito",
    title: "Liderança com Propósito",
    subtitle: "Autoridade que não depende do cargo",
    excerpt:
      "Para quem já lidera pessoas e quer formar equipes responsáveis, conduzir conversas difíceis e deixar sucessores.",
    cover_url: U("photo-1604948501466-4e9c339b9c24"),
    sort_order: 3,
    body: `Liderar é assumir responsabilidade pelo crescimento de outras pessoas. É uma tarefa que começa por dentro: ninguém conduz bem uma equipe quando ainda não aprendeu a conduzir a si mesmo.

Neste curso, você trabalha as práticas centrais da liderança madura: conversas difíceis, delegação real, feedback que forma e a construção deliberada de sucessores.`,
    data: {
      etapa: "lideranca",
      status_oferta: "aberto",
      formato: "hibrido",
      duracao: "10 semanas",
      carga: "30 horas",
      proxima_turma: "Abril de 2027",
      investimento: "Sob consulta",
      para_quem: ["Gestores e coordenadores", "Empreendedores com equipe", "Líderes recém-promovidos"],
      resultados: [
        "Roteiro para conversas difíceis",
        "Matriz de delegação da sua equipe",
        "Plano de desenvolvimento de um sucessor",
      ],
      modulos: [
        { titulo: "Autoridade e cargo", descricao: "De onde vem a autoridade que as pessoas reconhecem." },
        { titulo: "Conversas difíceis", descricao: "Preparar, conduzir e concluir." },
        { titulo: "Delegar responsabilidade", descricao: "Muito além de repassar tarefas." },
        { titulo: "Feedback que forma", descricao: "Corrigir sem diminuir." },
        { titulo: "Sucessão", descricao: "Formar quem vai ocupar o seu lugar." },
      ],
      faq: [],
    },
  },
  {
    collection: "curso",
    slug: "alta-performance-sustentavel",
    title: "Alta Performance Sustentável",
    subtitle: "Resultado consistente sem pagar com a saúde",
    excerpt:
      "Prioridades trimestrais, indicadores simples e um ritmo de trabalho que não desmorona a vida fora dele.",
    cover_url: U("photo-1634707983128-0236c567a345"),
    sort_order: 4,
    body: `Performance não é pressa nem exaustão. É a colheita das etapas anteriores do método: quem se reconstruiu, se governa e transformou hábitos passa a produzir com consistência.

Este curso organiza essa colheita em um sistema simples de prioridades, indicadores e revisões, com atenção especial ao ritmo de descanso.`,
    data: {
      etapa: "performance",
      status_oferta: "em-breve",
      formato: "online",
      duracao: "6 semanas",
      carga: "16 horas",
      proxima_turma: "Segundo semestre de 2027",
      investimento: "Sob consulta",
      para_quem: ["Executivos e empreendedores", "Profissionais liberais com agenda cheia"],
      resultados: ["Painel pessoal de indicadores", "Plano trimestral de prioridades", "Protocolo de descanso"],
      modulos: [
        { titulo: "O que é performance", descricao: "Resultado, não movimento." },
        { titulo: "Prioridades trimestrais", descricao: "Três frentes, noventa dias." },
        { titulo: "Indicadores pessoais", descricao: "Medir o que importa, sem virar planilha." },
        { titulo: "Ritmo e descanso", descricao: "Sustentar o esforço por anos." },
      ],
      faq: [],
    },
  },
];

export const MENTORIAS: ItemSemente[] = [
  {
    collection: "mentoria",
    slug: "mentoria-individual",
    title: "Mentoria Individual",
    subtitle: "Um plano pessoal, acompanhado de perto",
    excerpt:
      "Seis meses de encontros quinzenais para decisões importantes, transições de carreira e reconstruções que pedem presença.",
    cover_url: U("photo-1604881988758-f76ad2f7aac1"),
    featured: true,
    sort_order: 1,
    body: `A mentoria individual é o formato mais próximo do método. Começa com um diagnóstico aprofundado da sua trajetória e se transforma em um plano de trabalho com metas, práticas e indicadores combinados por escrito.

Entre os encontros, você recebe tarefas e pode enviar dúvidas por mensagem. Tudo com sigilo absoluto.`,
    data: {
      etapa: "transformacao",
      status_oferta: "aberto",
      formato: "individual",
      duracao: "6 meses",
      encontros: "Quinzenais, 75 minutos",
      vagas: "6 por semestre",
      investimento: "Sob consulta",
      para_quem: [
        "Profissionais em transição de carreira",
        "Quem enfrenta uma decisão de alto impacto",
        "Quem quer acompanhamento para sustentar mudanças",
      ],
      etapas: [
        { titulo: "Conversa inicial", descricao: "Trinta minutos, sem custo, para ver se faz sentido." },
        { titulo: "Diagnóstico aprofundado", descricao: "Um encontro de duas horas sobre trajetória, recursos e bloqueios." },
        { titulo: "Plano de trabalho", descricao: "Metas e práticas combinadas por escrito." },
        { titulo: "Encontros e revisões", descricao: "Encontros quinzenais e revisão mensal do plano." },
      ],
      entregas: [
        "12 encontros individuais",
        "Diagnóstico aprofundado",
        "Plano de trabalho por escrito",
        "Canal direto por mensagem entre os encontros",
        "Acesso ao curso Fundamentos do Autogoverno",
      ],
      faq: [
        { pergunta: "Os encontros são online?", resposta: "Sim, por videochamada. Encontros presenciais em São Paulo podem ser combinados." },
        { pergunta: "Posso interromper?", resposta: "Sim, com aviso de trinta dias." },
      ],
    },
  },
  {
    collection: "mentoria",
    slug: "mentoria-para-lideres",
    title: "Mentoria para Líderes",
    subtitle: "Para quem responde pelo crescimento de outras pessoas",
    excerpt:
      "Acompanhamento para executivos, gestores e empreendedores que precisam liderar com mais autoridade e menos desgaste.",
    cover_url: U("photo-1681301865120-7c74657dc01a"),
    sort_order: 2,
    body: `Liderar é solitário. A mentoria para líderes oferece um espaço reservado para pensar decisões, preparar conversas difíceis e rever a própria forma de conduzir pessoas.

O trabalho combina encontros individuais com a análise de situações reais da sua equipe.`,
    data: {
      etapa: "lideranca",
      status_oferta: "espera",
      formato: "individual",
      duracao: "6 meses",
      encontros: "Quinzenais, 90 minutos",
      vagas: "4 por semestre",
      investimento: "Sob consulta",
      para_quem: ["Diretores e gerentes", "Fundadores de empresas em crescimento", "Líderes recém-promovidos"],
      etapas: [
        { titulo: "Conversa inicial", descricao: "Entender o contexto da liderança e da empresa." },
        { titulo: "Mapa da liderança", descricao: "Como você lidera hoje, pelo seu olhar e pelo da equipe." },
        { titulo: "Plano de desenvolvimento", descricao: "Três frentes de trabalho para o semestre." },
        { titulo: "Acompanhamento", descricao: "Encontros com base em situações reais." },
      ],
      entregas: ["12 encontros individuais", "Mapa da liderança", "Roteiros para conversas difíceis"],
      faq: [],
    },
  },
  {
    collection: "mentoria",
    slug: "circulo-de-autogoverno",
    title: "Círculo de Autogoverno",
    subtitle: "Mentoria em grupo reduzido",
    excerpt:
      "Oito pessoas, quatro meses, encontros mensais. O compromisso do grupo ajuda a sustentar o que cada um decidiu.",
    cover_url: U("photo-1758438919146-f3f59a6d2544"),
    sort_order: 3,
    body: `O Círculo reúne até oito pessoas em torno das práticas do autogoverno. Cada encontro combina uma breve exposição, a revisão dos compromissos do mês e o trabalho sobre casos trazidos pelos participantes.

O grupo é fechado do início ao fim, e tudo o que é dito ali permanece ali.`,
    data: {
      etapa: "autogoverno",
      status_oferta: "em-breve",
      formato: "grupo",
      duracao: "4 meses",
      encontros: "Mensais, 3 horas",
      vagas: "8 por turma",
      investimento: "Sob consulta",
      para_quem: ["Quem já fez o curso Fundamentos do Autogoverno", "Quem se beneficia do compromisso com um grupo"],
      etapas: [
        { titulo: "Entrevista", descricao: "Conversa individual antes de entrar no grupo." },
        { titulo: "Encontros mensais", descricao: "Quatro encontros presenciais ou online." },
        { titulo: "Compromissos", descricao: "Cada participante assume e revisa compromissos mensais." },
      ],
      entregas: ["4 encontros em grupo", "1 encontro individual", "Material de apoio"],
      faq: [],
    },
  },
];

export const TREINAMENTOS: ItemSemente[] = [
  {
    collection: "treinamento",
    slug: "lideranca-que-forma-pessoas",
    title: "Liderança que Forma Pessoas",
    subtitle: "Programa contínuo para lideranças",
    excerpt:
      "Seis meses de encontros com gestores e coordenadores para desenvolver autoridade, delegação e conversas difíceis.",
    cover_url: U("photo-1532619675605-1ede6c2ed2b0"),
    featured: true,
    sort_order: 1,
    body: `Um programa para empresas que querem formar lideranças capazes de desenvolver pessoas, e não apenas de cobrar resultados.

O programa combina encontros presenciais, mentorias em grupo e tarefas aplicadas no dia a dia da equipe, com indicadores acompanhados junto ao RH.`,
    data: {
      etapa: "lideranca",
      formato: "programa",
      duracao: "6 meses",
      publico: "Gestores e coordenadores",
      turma: "Até 25 pessoas",
      modalidade: "Presencial, com encontros online",
      objetivos: [
        "Desenvolver autoridade que não dependa do cargo",
        "Reduzir a centralização de decisões",
        "Criar uma linguagem comum de liderança",
      ],
      programa: [
        { titulo: "Abertura com a alta liderança", descricao: "Alinhamento de expectativas e indicadores." },
        { titulo: "Autogoverno do líder", descricao: "Agenda, atenção e reações sob pressão." },
        { titulo: "Conversas difíceis", descricao: "Prática com casos reais." },
        { titulo: "Delegação e acompanhamento", descricao: "Da tarefa à responsabilidade." },
        { titulo: "Formação de sucessores", descricao: "Plano individual por líder." },
        { titulo: "Encerramento e relatório", descricao: "Resultados e próximos passos." },
      ],
      resultados: [
        "Líderes com plano individual de desenvolvimento",
        "Rituais de equipe revisados",
        "Relatório de evolução para o RH",
      ],
      faq: [
        { pergunta: "O programa pode ser adaptado?", resposta: "Sim. Conteúdo e duração são ajustados na etapa de proposta." },
      ],
    },
  },
  {
    collection: "treinamento",
    slug: "cultura-de-responsabilidade",
    title: "Cultura de Responsabilidade",
    subtitle: "Workshop para equipes",
    excerpt:
      "Um dia inteiro para equipes que precisam assumir compromissos, cumprir prazos e parar de terceirizar a culpa.",
    cover_url: U("photo-1549045345-058277380fc3"),
    sort_order: 2,
    body: `Responsabilidade não se impõe por decreto. Ela se constrói quando cada pessoa entende o que é dela, se compromete com isso e encontra um ambiente que reconhece quem cumpre.

O workshop trabalha esses três elementos com dinâmicas, estudos de caso e um plano de compromissos por equipe.`,
    data: {
      etapa: "autogoverno",
      formato: "workshop",
      duracao: "8 horas",
      publico: "Equipes de qualquer área",
      turma: "Até 40 pessoas",
      modalidade: "Presencial",
      objetivos: ["Clareza de papéis", "Compromissos explícitos", "Rituais de acompanhamento"],
      programa: [
        { titulo: "O que é meu", descricao: "Mapear responsabilidades individuais e da equipe." },
        { titulo: "Compromissos", descricao: "Como fazer promessas que se cumprem." },
        { titulo: "Rituais", descricao: "Acompanhar sem microgerenciar." },
      ],
      resultados: ["Plano de compromissos por equipe", "Ritual semanal definido"],
      faq: [],
    },
  },
  {
    collection: "treinamento",
    slug: "o-lider-que-se-governa",
    title: "O Líder que se Governa",
    subtitle: "Palestra",
    excerpt:
      "Uma palestra de setenta minutos sobre autogoverno, autoridade e responsabilidade para convenções e encontros de liderança.",
    cover_url: U("photo-1544531586-fde5298cdd40"),
    sort_order: 3,
    body: `A palestra apresenta as ideias centrais do método em linguagem direta, com histórias reais e provocações práticas para o público levar para o dia seguinte.`,
    data: {
      etapa: "autogoverno",
      formato: "palestra",
      duracao: "70 minutos",
      publico: "Convenções, encontros de liderança e SIPATs",
      turma: "Sem limite",
      modalidade: "Presencial ou online",
      objetivos: ["Abrir a conversa sobre autogoverno", "Criar linguagem comum", "Provocar ação prática"],
      programa: [],
      resultados: [],
      faq: [],
    },
  },
];
