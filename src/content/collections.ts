/**
 * Registro das coleções de conteúdo.
 *
 * Todas moram na mesma tabela (content_items). Cada coleção declara:
 *  - como rotular as colunas comuns (título, subtítulo, resumo, corpo, capa);
 *  - seus campos próprios, gravados em `data` (jsonb).
 *
 * Nova coleção = uma entrada aqui (e, se tiver página pública, as rotas). O painel
 * passa a listá-la e editá-la sozinho.
 */
import { ETAPAS, type Field, type Option } from "./fields";

export type BaseColumn = "subtitle" | "excerpt" | "body" | "cover_url";

export type CollectionConfig = {
  key: CollectionKey;
  singular: string;
  plural: string;
  /** Artigo para mensagens ("o curso", "a mentoria"). */
  genero: "o" | "a";
  /** Caminho público da listagem; itens ficam em `${path}/${slug}`. Sem path = sem página. */
  path?: string;
  descricao: string;
  titleLabel: string;
  columns: Partial<Record<BaseColumn, { label: string; help?: string }>>;
  fields: Field[];
  /** manual = ordem definida no painel; data = mais recentes primeiro. */
  ordem: "manual" | "data";
  /** Rótulo do botão de interesse (lista de interesse no lugar da venda). */
  interesse?: string;
};

export const COLLECTION_KEYS = [
  "curso",
  "mentoria",
  "treinamento",
  "livro",
  "depoimento",
  "post",
] as const;
export type CollectionKey = (typeof COLLECTION_KEYS)[number];

const STATUS_OFERTA: Option[] = [
  { value: "aberto", label: "Inscrições abertas" },
  { value: "espera", label: "Lista de espera" },
  { value: "em-breve", label: "Em breve" },
  { value: "encerrado", label: "Encerrado" },
];

const FAQ: Field = {
  key: "faq",
  label: "Perguntas frequentes",
  type: "repeater",
  itemLabel: "Pergunta",
  summaryKey: "pergunta",
  fields: [
    { key: "pergunta", label: "Pergunta", type: "text", required: true },
    { key: "resposta", label: "Resposta", type: "textarea", rows: 3 },
  ],
};

const ETAPA: Field = {
  key: "etapa",
  label: "Etapa do Método",
  type: "select",
  options: ETAPAS,
  help: "Liga o conteúdo a uma das cinco etapas. Aparece como selo e ajuda a recomendar no diagnóstico.",
  half: true,
};

export const COLLECTIONS: Record<CollectionKey, CollectionConfig> = {
  curso: {
    key: "curso",
    singular: "Curso",
    plural: "Cursos",
    genero: "o",
    path: "/cursos",
    descricao: "Formações com começo, meio e fim, online ou presenciais.",
    titleLabel: "Nome do curso",
    columns: {
      subtitle: { label: "Frase de apoio", help: "Uma linha que completa o nome." },
      excerpt: { label: "Resumo", help: "Aparece nos cartões e no topo da página (até 2 linhas)." },
      body: { label: "Apresentação completa" },
      cover_url: { label: "Imagem de capa" },
    },
    ordem: "manual",
    interesse: "Quero participar",
    fields: [
      ETAPA,
      {
        key: "status_oferta",
        label: "Situação",
        type: "select",
        options: STATUS_OFERTA,
        half: true,
      },
      {
        key: "formato",
        label: "Formato",
        type: "select",
        half: true,
        options: [
          { value: "online", label: "Online" },
          { value: "presencial", label: "Presencial" },
          { value: "hibrido", label: "Híbrido" },
        ],
      },
      { key: "duracao", label: "Duração", type: "text", placeholder: "8 semanas", half: true },
      { key: "carga", label: "Carga horária", type: "text", placeholder: "24 horas", half: true },
      {
        key: "proxima_turma",
        label: "Próxima turma",
        type: "text",
        placeholder: "Março de 2027",
        half: true,
      },
      {
        key: "investimento",
        label: "Investimento",
        type: "text",
        placeholder: "Sob consulta",
        half: true,
      },
      { key: "para_quem", label: "Para quem é", type: "list", itemLabel: "Perfil" },
      { key: "resultados", label: "O que você leva", type: "list", itemLabel: "Resultado" },
      {
        key: "modulos",
        label: "Módulos",
        type: "repeater",
        itemLabel: "Módulo",
        summaryKey: "titulo",
        fields: [
          { key: "titulo", label: "Título do módulo", type: "text", required: true },
          { key: "descricao", label: "Descrição", type: "textarea", rows: 2 },
        ],
      },
      FAQ,
    ],
  },

  mentoria: {
    key: "mentoria",
    singular: "Mentoria",
    plural: "Mentorias",
    genero: "a",
    path: "/mentorias",
    descricao: "Acompanhamento próximo, individual ou em grupo pequeno.",
    titleLabel: "Nome da mentoria",
    columns: {
      subtitle: { label: "Frase de apoio" },
      excerpt: { label: "Resumo" },
      body: { label: "Apresentação completa" },
      cover_url: { label: "Imagem de capa" },
    },
    ordem: "manual",
    interesse: "Quero uma conversa inicial",
    fields: [
      ETAPA,
      {
        key: "status_oferta",
        label: "Situação",
        type: "select",
        options: STATUS_OFERTA,
        half: true,
      },
      {
        key: "formato",
        label: "Formato",
        type: "select",
        half: true,
        options: [
          { value: "individual", label: "Individual" },
          { value: "grupo", label: "Grupo reduzido" },
        ],
      },
      { key: "duracao", label: "Duração", type: "text", placeholder: "6 meses", half: true },
      {
        key: "encontros",
        label: "Encontros",
        type: "text",
        placeholder: "Quinzenais, 75 min",
        half: true,
      },
      { key: "vagas", label: "Vagas", type: "text", placeholder: "4 por semestre", half: true },
      {
        key: "investimento",
        label: "Investimento",
        type: "text",
        placeholder: "Sob consulta",
        half: true,
      },
      { key: "para_quem", label: "Para quem é", type: "list", itemLabel: "Perfil" },
      {
        key: "etapas",
        label: "Como funciona",
        type: "repeater",
        itemLabel: "Passo",
        summaryKey: "titulo",
        fields: [
          { key: "titulo", label: "Passo", type: "text", required: true },
          { key: "descricao", label: "Descrição", type: "textarea", rows: 2 },
        ],
      },
      { key: "entregas", label: "O que está incluído", type: "list", itemLabel: "Item" },
      FAQ,
    ],
  },

  treinamento: {
    key: "treinamento",
    singular: "Treinamento",
    plural: "Treinamentos corporativos",
    genero: "o",
    path: "/treinamentos",
    descricao: "Palestras, workshops e programas para empresas e equipes.",
    titleLabel: "Nome do treinamento",
    columns: {
      subtitle: { label: "Frase de apoio" },
      excerpt: { label: "Resumo" },
      body: { label: "Apresentação completa" },
      cover_url: { label: "Imagem de capa" },
    },
    ordem: "manual",
    interesse: "Solicitar proposta",
    fields: [
      ETAPA,
      {
        key: "formato",
        label: "Formato",
        type: "select",
        half: true,
        options: [
          { value: "palestra", label: "Palestra" },
          { value: "workshop", label: "Workshop" },
          { value: "programa", label: "Programa contínuo" },
        ],
      },
      { key: "duracao", label: "Duração", type: "text", placeholder: "4 horas", half: true },
      {
        key: "publico",
        label: "Público",
        type: "text",
        placeholder: "Gestores e coordenadores",
        half: true,
      },
      {
        key: "turma",
        label: "Tamanho de turma",
        type: "text",
        placeholder: "Até 40 pessoas",
        half: true,
      },
      {
        key: "modalidade",
        label: "Modalidade",
        type: "text",
        placeholder: "Presencial ou online",
        half: true,
      },
      { key: "objetivos", label: "Objetivos", type: "list", itemLabel: "Objetivo" },
      {
        key: "programa",
        label: "Roteiro",
        type: "repeater",
        itemLabel: "Bloco",
        summaryKey: "titulo",
        fields: [
          { key: "titulo", label: "Bloco", type: "text", required: true },
          { key: "descricao", label: "Descrição", type: "textarea", rows: 2 },
        ],
      },
      { key: "resultados", label: "Resultados esperados", type: "list", itemLabel: "Resultado" },
      FAQ,
    ],
  },

  livro: {
    key: "livro",
    singular: "Livro",
    plural: "Livros",
    genero: "o",
    path: "/livros",
    descricao: "Obras publicadas e em preparação.",
    titleLabel: "Título do livro",
    columns: {
      subtitle: { label: "Subtítulo" },
      excerpt: { label: "Sinopse curta" },
      body: { label: "Sobre o livro" },
      cover_url: {
        label: "Capa",
        help: "Proporção 2:3. Sem imagem, o site gera uma capa tipográfica com a cor escolhida.",
      },
    },
    ordem: "manual",
    interesse: "Quero ser avisado",
    fields: [
      {
        key: "situacao",
        label: "Situação",
        type: "select",
        half: true,
        options: [
          { value: "lancado", label: "Lançado" },
          { value: "pre-venda", label: "Pré-venda" },
          { value: "em-breve", label: "Em breve" },
        ],
      },
      {
        key: "cor",
        label: "Cor da capa tipográfica",
        type: "select",
        half: true,
        options: [
          { value: "petroleo", label: "Azul petróleo" },
          { value: "salvia", label: "Verde sálvia" },
          { value: "terracota", label: "Terracota" },
          { value: "grafite", label: "Cinza grafite" },
          { value: "gelo", label: "Branco gelo" },
        ],
      },
      { key: "ano", label: "Ano", type: "text", half: true },
      { key: "editora", label: "Editora", type: "text", half: true },
      { key: "paginas", label: "Páginas", type: "number", half: true },
      { key: "isbn", label: "ISBN", type: "text", half: true },
      ETAPA,
      { key: "trecho", label: "Trecho em destaque", type: "textarea", rows: 3 },
      {
        key: "lojas",
        label: "Onde comprar",
        type: "repeater",
        itemLabel: "Loja",
        summaryKey: "nome",
        help: "Quando houver link, o botão de compra substitui o de lista de interesse.",
        fields: [
          { key: "nome", label: "Loja", type: "text", required: true, half: true },
          { key: "url", label: "Link", type: "url", half: true },
        ],
      },
    ],
  },

  depoimento: {
    key: "depoimento",
    singular: "Depoimento",
    plural: "Depoimentos",
    genero: "o",
    descricao: "Palavras de alunos, mentorados e empresas.",
    titleLabel: "Nome da pessoa",
    columns: {
      subtitle: { label: "Cargo e empresa", help: "Ex.: Diretora de Operações, Grupo Almeida" },
      excerpt: { label: "Depoimento", help: "Até 3 linhas no site. Textos longos são cortados." },
      cover_url: { label: "Foto (opcional)", help: "Sem foto, o site mostra as iniciais." },
    },
    ordem: "manual",
    fields: [
      {
        key: "origem",
        label: "Veio de",
        type: "select",
        half: true,
        options: [
          { value: "curso", label: "Curso" },
          { value: "mentoria", label: "Mentoria" },
          { value: "treinamento", label: "Treinamento corporativo" },
          { value: "livro", label: "Livro" },
        ],
      },
      {
        key: "referencia",
        label: "Programa citado",
        type: "text",
        half: true,
        placeholder: "Mentoria Individual",
      },
      { key: "video", label: "Vídeo (YouTube)", type: "url", help: "Opcional." },
    ],
  },

  post: {
    key: "post",
    singular: "Post",
    plural: "Blog",
    genero: "o",
    path: "/blog",
    descricao: "Artigos e reflexões.",
    titleLabel: "Título",
    columns: {
      subtitle: { label: "Linha fina" },
      excerpt: { label: "Resumo", help: "Aparece na listagem e ao compartilhar." },
      body: { label: "Texto" },
      cover_url: { label: "Imagem de capa" },
    },
    ordem: "data",
    fields: [
      {
        key: "categoria",
        label: "Categoria",
        type: "select",
        half: true,
        options: [
          { value: "autogoverno", label: "Autogoverno" },
          { value: "lideranca", label: "Liderança" },
          { value: "carreira", label: "Carreira" },
          { value: "relacoes", label: "Relações" },
          { value: "ensaios", label: "Ensaios" },
        ],
      },
      ETAPA,
    ],
  },
};

export function getCollection(key: string): CollectionConfig | undefined {
  return (COLLECTIONS as Record<string, CollectionConfig>)[key];
}

export function opcaoLabel(col: CollectionConfig, fieldKey: string, valor: unknown) {
  const f = col.fields.find((x) => x.key === fieldKey);
  if (f?.type !== "select") return undefined;
  return f.options.find((o) => o.value === valor)?.label;
}
