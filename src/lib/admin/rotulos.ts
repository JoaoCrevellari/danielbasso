/** Rótulos em pt-BR dos valores guardados no banco. */
export const TIPOS_LEAD = [
  { value: "contato", label: "Contato" },
  { value: "interesse", label: "Interesse" },
  { value: "corporativo", label: "Corporativo" },
  { value: "diagnostico", label: "Diagnóstico" },
] as const;

export const STATUS_LEAD = [
  { value: "novo", label: "Novo" },
  { value: "em_contato", label: "Em contato" },
  { value: "convertido", label: "Convertido" },
  { value: "arquivado", label: "Arquivado" },
] as const;

export type TipoLead = (typeof TIPOS_LEAD)[number]["value"];
export type StatusLead = (typeof STATUS_LEAD)[number]["value"];

export function rotuloTipo(v: string) {
  return TIPOS_LEAD.find((t) => t.value === v)?.label ?? v;
}
export function rotuloStatus(v: string) {
  return STATUS_LEAD.find((t) => t.value === v)?.label ?? v;
}

const DISPOSITIVOS: Record<string, string> = {
  mobile: "Celular",
  tablet: "Tablet",
  desktop: "Computador",
  desconhecido: "Não identificado",
};
export function rotuloDispositivo(v: string) {
  return DISPOSITIVOS[v] ?? v;
}

const EVENTOS: Record<string, string> = {
  whatsapp: "WhatsApp",
  cta: "Botão",
  social: "Rede social",
  email: "E-mail",
  lead: "Formulário enviado",
  diagnostico_inicio: "Diagnóstico iniciado",
  diagnostico_fim: "Diagnóstico concluído",
};
export function rotuloEvento(v: string) {
  return EVENTOS[v] ?? v;
}

export const PAPEIS = [
  {
    value: "admin",
    label: "Administrador",
    descricao: "Acesso total, inclusive usuários e exclusão de leads.",
  },
  {
    value: "editor",
    label: "Editor",
    descricao: "Edita conteúdo, páginas e mídia; acompanha leads.",
  },
] as const;
export function rotuloPapel(v: string) {
  return PAPEIS.find((p) => p.value === v)?.label ?? v;
}

/** Tom do selo de cada status de lead. */
export const TOM_STATUS: Record<string, "ouro" | "petroleo" | "salvia" | "neutro"> = {
  novo: "ouro",
  em_contato: "petroleo",
  convertido: "salvia",
  arquivado: "neutro",
};
