/**
 * Cursos, mentorias e programas para instituições.
 * Textos do Daniel ("Textos do site · versão 2", recebido em 12/11/2026). Campos que ele
 * ainda vai mandar (carga horária, próxima turma, módulos) ficam vazios e somem da página.
 * As capas são de banco de imagens (exemplo) até chegarem as fotos reais.
 */
import type { ItemSemente } from "./tipos";

const U = (id: string) => `https://images.unsplash.com/${id}`;

export const CURSOS: ItemSemente[] = [
  {
    collection: "curso",
    slug: "diagnostico-completo",
    title: "Diagnóstico Completo",
    subtitle: "Descubra exatamente o que está impedindo sua vida de avançar",
    excerpt:
      "Não é um teste de internet. É um mapa completo da sua vida, com pontuação por área, relatório, plano de prioridades e um vídeo explicando o seu resultado.",
    cover_url: U("photo-1519143009590-e3800b9df468"),
    sort_order: 1,
    body: `Quem está perdido não precisa, primeiro, de transformação. Precisa de clareza. O Diagnóstico Completo avalia onze áreas da sua vida e mostra onde você entregou o comando.

Você sai com um quadro inteiro, não com uma janela só. E sabe qual área retomar primeiro.

## Como funciona

Você responde a avaliação online, recebe a pontuação e o relatório por área, o plano de prioridades e um vídeo do Daniel explicando o que o seu resultado significa.

> Você não perdeu o controle da sua vida. Você entregou, sem perceber.`,
    data: {
      etapa: "clareza",
      status_oferta: "disponivel",
      formato: "online",
      duracao: "No seu ritmo",
      carga: "Cerca de 40 minutos",
      proxima_turma: "Acesso imediato",
      investimento: "R$ 47",
      resumo_cartao:
        "Descubra exatamente o que está impedindo sua vida de avançar. Onze áreas avaliadas, relatório e plano de prioridades.",
      para_quem: [
        "Quem sente que algo está errado, mas não sabe o quê",
        'Quem diz "minha vida virou um caos"',
        "Quem não sabe por onde começar",
      ],
      resultados: [
        "Pontuação em onze áreas",
        "Relatório completo",
        "Plano de prioridades",
        "Vídeo explicando o resultado",
      ],
      rotulo_modulos: "Áreas avaliadas",
      modulos: [
        "Saúde",
        "Emoções",
        "Família",
        "Casamento",
        "Trabalho",
        "Finanças",
        "Organização",
        "Hábitos",
        "Conhecimento",
        "Propósito",
        "Espiritualidade (quando fizer sentido)",
      ].map((titulo) => ({ titulo, descricao: "" })),
      faq: [
        {
          pergunta: "É a mesma coisa que o teste gratuito?",
          resposta:
            "Não. O teste gratuito mostra a direção em cinco minutos. O Diagnóstico Completo avalia onze áreas e entrega relatório, plano e vídeo.",
        },
        {
          pergunta: "Preciso ter feito outro curso antes?",
          resposta: "Não. Ele é o ponto de partida.",
        },
        {
          pergunta: "O diagnóstico substitui terapia?",
          resposta:
            "Não. É uma ferramenta de autoconhecimento e não substitui avaliação médica ou psicológica.",
        },
      ],
      interesse_titulo: "Quero meu diagnóstico",
      interesse_texto: "Deixe seu contato para receber o acesso e as instruções.",
      link_pagamento: "",
    },
  },
  {
    collection: "curso",
    slug: "metodo-autogoverno",
    title: "Método Autogoverno",
    subtitle: "Coloque sua vida em ordem e volte a avançar",
    excerpt:
      "Em 8 semanas, você aprende a organizar sua vida, governar suas decisões e construir uma base sólida para avançar na família, no trabalho, nas finanças, na fé e nos seus projetos.",
    cover_url: U("photo-1638537690617-ebc561143de0"),
    featured: true,
    sort_order: 2,
    body: `O curso não promete resolver cada área da sua vida. Ensina você a governar cada uma delas. Você descobre quem está no comando hoje, retoma uma área de cada vez e aprende a colocar os afetos e as prioridades na ordem certa.

É para pessoas reais, com conta para pagar, família para cuidar e trabalho para sustentar. Nada de motivação de palco: método, prática e constância.

## Como funciona

8 módulos gravados, apostila em PDF, exercícios práticos, plano de aplicação, comunidade e certificado. Bônus: uma masterclass gravada e materiais complementares (checklists, modelos e ferramentas).

> A vida que você não governa, governa você.`,
    data: {
      etapa: "ordem",
      status_oferta: "aberto",
      formato: "online",
      duracao: "8 semanas",
      carga: "",
      proxima_turma: "",
      investimento: "A partir de R$ 997, em até 12x",
      resumo_cartao:
        "Coloque sua vida em ordem e volte a avançar. Retome o comando de uma área de cada vez.",
      para_quem: [
        "Quem sente que perdeu o controle da própria vida",
        "Quem vive desorganizado, sobrecarregado e sem direção",
        "Quem já tentou de tudo em pedaços e quer governar o todo",
      ],
      resultados: [
        "Uma rotina que funciona na vida real",
        "Clareza para tomar decisões e dizer não sem culpa",
        "Disciplina e constância para cuidar das finanças",
        "Um plano para as principais áreas da vida",
      ],
      // Títulos sugeridos pelo Daniel; ele confirma com as aulas (pedido na mensagem de 13/11).
      modulos: [
        "Quem governa a sua vida",
        "Você entregou sem perceber",
        "A primeira retomada",
        "Uma rotina que cabe na vida real",
        "Decisões e o poder do não",
        "Emoções e reações",
        "Dinheiro e casa em ordem",
        "A ordem dos afetos e o seu plano",
      ].map((titulo) => ({ titulo, descricao: "" })),
      faq: [
        {
          pergunta: "Preciso ter feito outro curso antes?",
          resposta: "Não. O Diagnóstico ajuda, mas não é obrigatório.",
        },
        { pergunta: "As aulas ficam gravadas?", resposta: "Sim. Você assiste no seu ritmo." },
        { pergunta: "Há certificado?", resposta: "Sim, ao concluir o curso." },
      ],
      interesse_titulo: "Quero participar",
      interesse_texto:
        "Deixe seu contato. Você recebe as datas, as condições e a resposta para qualquer dúvida antes de decidir.",
      link_pagamento: "",
    },
  },
  {
    collection: "curso",
    slug: "assuma-o-controle",
    title: "Assuma o Controle",
    subtitle: "Pare de apenas planejar e comece a construir resultados concretos",
    excerpt:
      "Um programa de 3 meses para transformar organização em resultado na família, na profissão, nas finanças e nos seus projetos.",
    cover_url: U("photo-1604948501466-4e9c339b9c24"),
    sort_order: 3,
    body: `O Método Autogoverno coloca a vida em ordem. O Assuma o Controle faz a vida avançar. Um reconstrói a base; o outro constrói em cima dela.

Você define a área prioritária, uma meta e um plano de 90 dias, e é acompanhado na execução, com correção de rota quando for preciso.

## Como funciona

12 módulos, um por semana. Dois encontros ao vivo: um individual com a equipe e um coletivo com o Daniel. Comunidade exclusiva, exercícios, plano de execução e hot seats.

> Ninguém vai fazer por você.`,
    data: {
      etapa: "progresso",
      status_oferta: "espera",
      formato: "ao-vivo",
      duracao: "3 meses",
      carga: "",
      proxima_turma: "",
      investimento: "A partir de R$ 2.997",
      resumo_cartao:
        "Pare de apenas planejar e comece a construir resultados concretos, com acompanhamento.",
      para_quem: [
        "Quem já organizou a vida e quer resultado",
        "Quem quer crescer na carreira, nos negócios, na família e nas finanças",
        "Quem planeja mais do que executa",
      ],
      resultados: [
        "Clareza da área prioritária e meta definida",
        "Plano de 90 dias",
        "Rotina de execução e revisão com a equipe",
        "Encontro estratégico com o Daniel",
        "Bônus: livro Ninguém Vai Fazer Por Você, planner de execução e modelos de planejamento",
      ],
      modulos: [],
      faq: [
        {
          pergunta: "Preciso ter feito o Método Autogoverno?",
          resposta: "É recomendado. O Assuma o Controle parte de uma vida com alguma ordem.",
        },
        {
          pergunta: "Como são os encontros ao vivo?",
          resposta: "Um individual com a equipe e um coletivo com o Daniel.",
        },
        { pergunta: "O livro está incluído?", resposta: "Sim, como bônus." },
      ],
      interesse_titulo: "Entrar na lista da próxima turma",
      interesse_texto: "Deixe seu contato para receber as datas e as condições da próxima turma.",
      link_pagamento: "",
    },
  },
  {
    collection: "curso",
    slug: "nada-pode-me-deter",
    title: "Nada Pode Me Deter",
    subtitle: "Cresça por muitos anos sem perder o controle da vida",
    excerpt:
      "Um programa avançado de 16 semanas para desenvolver a disciplina, a mentalidade e a constância de quem já cresce e quer romper os limites que travam o próximo nível.",
    cover_url: U("photo-1634707983128-0236c567a345"),
    sort_order: 4,
    body: `Nada pode deter uma pessoa reconstruída. Não porque ela não sofre, mas porque não é mais governada pela dor, pelo medo, pela culpa ou pelo passado.

O programa trabalha como crescer de forma consistente, superar bloqueios internos, liderar melhor, construir patrimônio, fortalecer a família e ampliar a influência, sem perder a vida no caminho.

## Como funciona

16 módulos gravados, uma masterclass ao vivo por mês com o Daniel, um encontro individual por mês com a equipe e comunidade premium.

> Nada pode me deter.`,
    data: {
      etapa: "excelencia",
      status_oferta: "espera",
      formato: "ao-vivo",
      duracao: "16 semanas",
      carga: "",
      proxima_turma: "",
      investimento: "R$ 9.997",
      resumo_cartao: "Cresça por muitos anos sem perder o controle da vida. Programa avançado.",
      para_quem: [
        "Quem já organizou a vida e está crescendo",
        "Quem quer acelerar os resultados",
        "Quem esbarra em limites internos",
      ],
      resultados: [
        "Livro Nada Pode Me Deter",
        "Workbook",
        "Plano de crescimento de 3 anos",
        "Ferramentas de acompanhamento e certificado",
      ],
      modulos: [],
      faq: [
        {
          pergunta: "Preciso ter feito os cursos anteriores?",
          resposta: "É recomendado. O programa é para quem já tem ordem e resultados.",
        },
        {
          pergunta: "Como são os encontros ao vivo?",
          resposta:
            "Uma masterclass mensal com o Daniel e um encontro individual mensal com a equipe.",
        },
        { pergunta: "Há certificado?", resposta: "Sim." },
      ],
      interesse_titulo: "Aplicar para a próxima turma",
      interesse_texto: "Deixe seu contato para receber as informações e a aplicação.",
      link_pagamento: "",
    },
  },
];

export const MENTORIAS: ItemSemente[] = [
  {
    collection: "mentoria",
    slug: "mentoria-individual",
    title: "Mentoria Individual",
    subtitle: "Um conselheiro estratégico para caminhar ao seu lado",
    excerpt:
      "Para resolver os problemas específicos da sua vida com um plano estratégico personalizado.",
    cover_url: U("photo-1604881988758-f76ad2f7aac1"),
    featured: true,
    sort_order: 1,
    body: `Não existe conteúdo fixo. Cada pessoa chega com os seus desafios: família, casamento, educação dos filhos, carreira, negócios, liderança, finanças, patrimônio, comunicação, espiritualidade, decisões difíceis, organização institucional.

## Como funciona

Um encontro individual por mês, plano de ação depois de cada encontro, WhatsApp direto com o Daniel, revisão mensal dos resultados e análise dos seus gatilhos e casos específicos.`,
    data: {
      etapa: "legado",
      etiqueta: "Estratégia",
      status_oferta: "aberto",
      formato: "Individual, online",
      duracao: "6 meses, renováveis por mais 6",
      encontros: "Um por mês, de 90 a 120 minutos",
      vagas: "",
      investimento: "Sob consulta",
      resumo_cartao:
        "Um conselheiro estratégico ao seu lado: encontro mensal, plano de ação e WhatsApp direto com o Daniel.",
      para_quem: [
        "Empresários, profissionais liberais, médicos e advogados",
        "Pastores, gestores e servidores de alto nível",
        "Quem já passou pelos cursos e precisa de um plano feito para a própria vida",
      ],
      etapas: [],
      entregas: [
        "Clareza sobre as decisões mais importantes",
        "Um plano para a sua realidade",
        "Acompanhamento na execução e correção de rota",
        "Acesso a todos os cursos e livros e prioridade nos eventos presenciais",
      ],
      faq: [],
    },
  },
  {
    collection: "mentoria",
    slug: "mentoria-para-gestores",
    title: "Mentoria para Gestores e Diretores",
    subtitle: "Conduzir pessoas e instituições sem perder o governo de si",
    excerpt:
      "Acompanhamento para diretores, coordenadores e gestores de escolas, empresas e instituições.",
    cover_url: U("photo-1681301865120-7c74657dc01a"),
    sort_order: 2,
    body: `Quem lidera carrega as decisões da instituição e, muitas vezes, a própria vida fica para depois. A mentoria trabalha as duas coisas juntas: o governo de si e o governo da equipe.`,
    data: {
      etapa: "legado",
      etiqueta: "Gestão",
      status_oferta: "sob-consulta",
      formato: "Individual ou com a equipe de gestão",
      duracao: "Sob medida",
      encontros: "",
      vagas: "",
      investimento: "Sob consulta",
      resumo_cartao:
        "Para diretores, coordenadores e gestores que precisam conduzir equipes e instituições com mais autoridade e menos desgaste.",
      para_quem: [
        "Diretores escolares e coordenadores pedagógicos",
        "Gestores de empresas e de órgãos públicos",
        "Equipes de gestão em fase de implantação ou crescimento",
      ],
      etapas: [],
      entregas: [
        "Plano de gestão e de rotina",
        "Critérios para decisões difíceis",
        "Acompanhamento da equipe de coordenação",
        "Revisões periódicas",
      ],
      faq: [],
    },
  },
  {
    collection: "mentoria",
    slug: "mastermind",
    title: "Mastermind",
    subtitle: "Cresça mais rápido cercado pelas pessoas certas",
    excerpt: "Até aqui, você compra uma transformação. No Mastermind, você entra em um ambiente.",
    cover_url: U("photo-1758438919146-f3f59a6d2544"),
    sort_order: 3,
    body: `Uma mesa permanente de crescimento. Todo mês, você se senta com pessoas que enfrentam problemas parecidos, têm o mesmo nível de responsabilidade e podem crescer juntas. O conteúdo nasce dos desafios do grupo; convidados entram quando fizer sentido.`,
    data: {
      etapa: "legado",
      status_oferta: "aplicacao",
      formato: "Grupo fechado, 15 a 20 participantes",
      duracao: "12 meses",
      encontros: "12 online e 4 presenciais",
      vagas: "",
      investimento: "Sob consulta, mediante aplicação",
      resumo_cartao:
        "Uma mesa permanente de crescimento com 15 a 20 pessoas de alto nível de responsabilidade.",
      para_quem: [
        "Empresários, líderes, pastores, médicos, advogados, investidores e executivos",
        "Quem já tem resultados e não procura mais conhecimento",
        "Quem pergunta o que vai construir que permaneça",
      ],
      etapas: [],
      entregas: [
        "Plano estratégico anual e revisão trimestral",
        "Hot seats em todos os encontros",
        "WhatsApp exclusivo e networking qualificado",
        "Prioridade em novos projetos",
      ],
      faq: [],
    },
  },
];

export const TREINAMENTOS: ItemSemente[] = [
  {
    collection: "treinamento",
    slug: "jornada-de-desenvolvimento-humano",
    title: "Jornada de Desenvolvimento Humano",
    subtitle: "Pessoas mais inteiras, serviços melhores",
    excerpt:
      "Uma jornada de capacitação em encontros quinzenais para as equipes de gestão, administrativas e operacionais de prefeituras, escolas e empresas.",
    cover_url: U("photo-1532619675605-1ede6c2ed2b0"),
    featured: true,
    sort_order: 1,
    body: `Temas trabalhados: organização da rotina, comunicação, equilíbrio emocional, postura profissional e autorresponsabilidade, com atividades práticas, reflexões e acompanhamento contínuo.

Em 2026, a jornada foi realizada com os servidores da Secretaria de Esporte e Lazer da Prefeitura de Jundiaí, com apoio da Escola de Gestão Pública, alcançando as equipes dos 20 centros esportivos do município.

> "Quando trabalhamos o desenvolvimento das pessoas, melhoramos também os serviços oferecidos à população." Daniel Basso, ao Jornal de Jundiaí

## Na imprensa

- Prefeitura de Jundiaí: [Capacitação reforça integração e desenvolvimento de servidores do Esporte](https://jundiai.sp.gov.br/noticias/2026/05/16/capacitacao-reforca-integracao-e-desenvolvimento-de-servidores-do-esporte/) (maio de 2026)
- Jornal de Jundiaí: [Servidores do Esporte de Jundiaí participam de capacitação](https://sampi.net.br/jundiai/noticias/2979998/esporte/2026/05/servidores-do-esporte-de-jundiai-participam-de-capacitacao) (maio de 2026)

## Versão com medição (opcional)

Em 90 dias, com autoavaliação inicial e final, indicadores de desempenho, engajamento e satisfação, e relatório técnico comparativo para a gestão.`,
    data: {
      etapa: "ordem",
      formato: "programa",
      duracao: "12 encontros",
      publico: "Equipes de gestão, administrativas e operacionais",
      turma: "",
      modalidade: "Presencial ou online",
      investimento: "Sob consulta",
      resumo_cartao:
        "Encontros quinzenais para equipes de gestão, administrativas e operacionais: rotina, comunicação, equilíbrio emocional, postura profissional e autorresponsabilidade.",
      objetivos: [],
      programa: [],
      resultados: [],
      faq: [],
    },
  },
  {
    collection: "treinamento",
    slug: "seu-problema-nao-e-tempo",
    title: "Seu Problema Não É Tempo, É Prioridade",
    subtitle: "Para equipes que vivem apagando incêndio",
    excerpt:
      "Um treinamento de um dia para que cada participante saia com a própria rotina reorganizada e critérios claros para decidir o que vem primeiro.",
    cover_url: U("photo-1549045345-058277380fc3"),
    sort_order: 2,
    body: `Quase nunca é falta de tempo. É falta de prioridade, de critério para dizer não e de uma rotina que proteja o essencial. O treinamento parte da vida real de cada participante e termina com um plano pessoal para a semana seguinte.`,
    data: {
      etapa: "ordem",
      formato: "treinamento",
      duracao: "8 horas",
      publico: "",
      turma: "",
      modalidade: "Presencial ou online",
      investimento: "Sob consulta",
      resumo_cartao:
        "Um treinamento para equipes sobrecarregadas que vivem apagando incêndio e precisam parar de terceirizar a culpa.",
      objetivos: [],
      programa: [],
      resultados: [
        "Critérios para separar urgente de importante",
        "Uma rotina de revisão diária",
        "Ferramentas para dizer não sem culpa",
        "Plano pessoal de cada participante",
      ],
      faq: [],
    },
  },
  {
    collection: "treinamento",
    slug: "a-vida-que-voce-nao-governa",
    title: "A Vida que Você Não Governa, Governa Você",
    subtitle: "Palestra sobre autogoverno e responsabilidade",
    excerpt:
      "Uma palestra para abrir conversas, alinhar a linguagem da equipe e despertar responsabilidade.",
    cover_url: U("photo-1544531586-fde5298cdd40"),
    sort_order: 3,
    body: `Você não perdeu o controle da sua vida. Você entregou, sem perceber. A palestra mostra como isso acontece, por que treinamento técnico não resolve e qual é o primeiro passo para retomar o comando.

## Outros temas disponíveis

- Florescimento humano
- Superação
- Gratidão
- Seu problema não é tempo, é prioridade

## Já realizada em

Abertura do ano de 2025 da Unidade de Esporte e Lazer de Jundiaí e Jornada de Inteligência Esportiva de 2025, na UniAnchieta.`,
    data: {
      etapa: "clareza",
      formato: "palestra",
      duracao: "60 a 90 minutos",
      publico: "",
      turma: "",
      modalidade: "Presencial ou online",
      investimento: "Sob consulta",
      resumo_cartao:
        "A palestra-base sobre autogoverno e responsabilidade, para encontros de servidores, professores e colaboradores.",
      objetivos: [],
      programa: [],
      resultados: [],
      faq: [],
    },
  },
];
