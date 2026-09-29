/**
 * Módulos do painel e ações que cada pessoa da equipe pode ter.
 *
 * A regra de verdade está no banco (função public.pode, usada pelas políticas de RLS);
 * este arquivo espelha a mesma lista para montar o menu, esconder botões e o formulário
 * de usuários. Administrador pode tudo e é o único que gerencia usuários.
 */
export const ACOES = ["ver", "editar", "apagar"] as const;
export type Acao = (typeof ACOES)[number];

export const ROTULO_ACAO: Record<Acao, string> = {
  ver: "Ver",
  editar: "Criar e editar",
  apagar: "Apagar",
};

export type Modulo =
  "painel" | "leads" | "diagnostico" | "conteudo" | "paginas" | "midia" | "configuracoes" | "lps";

type DefModulo = {
  chave: Modulo;
  rotulo: string;
  descricao: string;
  /** Ações que fazem sentido no módulo (o resto fica desabilitado no formulário). */
  acoes: readonly Acao[];
};

export const MODULOS: readonly DefModulo[] = [
  {
    chave: "painel",
    rotulo: "Visão geral",
    descricao: "Visitas, origens e números do site",
    acoes: ["ver"],
  },
  {
    chave: "lps",
    rotulo: "LPs de lançamento",
    descricao: "Páginas de lançamento, resultados e respostas",
    acoes: ["ver", "editar", "apagar"],
  },
  {
    chave: "leads",
    rotulo: "Leads",
    descricao: "Contatos, interesses e propostas do site",
    acoes: ["ver", "editar", "apagar"],
  },
  {
    chave: "diagnostico",
    rotulo: "Diagnóstico",
    descricao: "Respostas e questionário do diagnóstico",
    acoes: ["ver", "editar", "apagar"],
  },
  {
    chave: "conteudo",
    rotulo: "Conteúdo",
    descricao: "Cursos, mentorias, treinamentos, livros, depoimentos e blog",
    acoes: ["ver", "editar", "apagar"],
  },
  {
    chave: "paginas",
    rotulo: "Páginas",
    descricao: "Textos das páginas do site",
    acoes: ["ver", "editar"],
  },
  {
    chave: "midia",
    rotulo: "Mídia",
    descricao: "Imagens e arquivos enviados",
    acoes: ["ver", "editar", "apagar"],
  },
  {
    chave: "configuracoes",
    rotulo: "Configurações",
    descricao: "Contatos, redes sociais e dados gerais",
    acoes: ["ver", "editar"],
  },
];

export type Permissoes = Partial<Record<Modulo, Acao[]>>;

/** Mantém só módulos e ações válidos; editar e apagar implicam ver. */
export function normalizarPermissoes(p: unknown): Permissoes {
  const saida: Permissoes = {};
  if (!p || typeof p !== "object") return saida;
  for (const m of MODULOS) {
    const lista = (p as Record<string, unknown>)[m.chave];
    if (!Array.isArray(lista)) continue;
    const acoes = m.acoes.filter((a) => lista.includes(a));
    if (acoes.length && !acoes.includes("ver")) acoes.unshift("ver");
    if (acoes.length) saida[m.chave] = acoes;
  }
  return saida;
}

export function temPermissao(
  quem: { admin: boolean; permissoes: Permissoes },
  modulo: Modulo,
  acao: Acao = "ver",
) {
  return quem.admin || !!quem.permissoes[modulo]?.includes(acao);
}

/** Pontos de partida no formulário de usuário (a pessoa ajusta depois). */
export const MODELOS: { rotulo: string; permissoes: Permissoes }[] = [
  {
    rotulo: "Lançamentos",
    permissoes: { lps: ["ver", "editar", "apagar"], leads: ["ver"], painel: ["ver"] },
  },
  {
    rotulo: "Conteúdo",
    permissoes: {
      conteudo: ["ver", "editar"],
      paginas: ["ver", "editar"],
      midia: ["ver", "editar"],
    },
  },
  {
    rotulo: "Atendimento",
    permissoes: { leads: ["ver", "editar"], diagnostico: ["ver", "editar"], lps: ["ver"] },
  },
  {
    rotulo: "Só leitura",
    permissoes: Object.fromEntries(MODULOS.map((m) => [m.chave, ["ver"]])) as Permissoes,
  },
];

/** Resumo curto das permissões para a lista de usuários. */
export function resumoPermissoes(p: Permissoes) {
  return MODULOS.filter((m) => p[m.chave]?.length).map((m) => {
    const a = p[m.chave]!;
    const nivel = a.includes("apagar") ? "total" : a.includes("editar") ? "edita" : "vê";
    return { modulo: m.rotulo, nivel };
  });
}

/** Mesmo mapeamento de public.modulo_do_lead no banco. */
export function moduloDoLead(kind: string): Modulo {
  return kind === "diagnostico" ? "diagnostico" : kind === "lp" ? "lps" : "leads";
}
