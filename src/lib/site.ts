/**
 * Constantes do site que não mudam pelo painel (identidade, domínio, rotas).
 * Contatos e redes podem ser sobrescritos em Admin → Configurações (site_content "settings");
 * os valores daqui são o padrão.
 */
export const SITE = {
  name: "Daniel Basso",
  shortName: "Daniel Basso",
  tagline: "Desenvolvimento Humano",
  role: "Professor, pesquisador, escritor e mentor",
  url: "https://danielbasso.com.br",
  description:
    "Você não perdeu o controle da sua vida. Você entregou, sem perceber. Daniel Basso ensina pessoas e instituições a retomar o comando com o Método Autogoverno.",
  locale: "pt_BR",
} as const;

export const CONTATO_PADRAO = {
  whatsapp: "5511972119531",
  whatsappMensagem: "Olá, Daniel. Vim pelo site e gostaria de conversar.",
  email: "contato@danielbasso.com.br",
  instagram: "https://instagram.com/danielbassooficial/",
  youtube: "https://youtube.com/@danielbassooficial01",
  tiktok: "https://www.tiktok.com/@danielbassooficial",
  facebook: "",
  cidade: "Jundiaí e região, SP",
};

export type NavItem = { label: string; to: string };

/** Navegação principal. A ordem aqui é a ordem no menu. */
export const NAV_PRINCIPAL: NavItem[] = [
  { label: "Quem sou", to: "/quem-sou" },
  { label: "Método", to: "/metodo" },
  { label: "Cursos", to: "/cursos" },
  { label: "Mentorias", to: "/mentorias" },
  { label: "Instituições", to: "/treinamentos" },
  { label: "Livros", to: "/livros" },
  { label: "Blog", to: "/blog" },
];

// "Depoimentos" sai do menu enquanto não houver depoimentos reais (pedido de 12/11/2026).
export const NAV_SECUNDARIA: NavItem[] = [
  { label: "Diagnóstico", to: "/diagnostico" },
  { label: "Contato", to: "/contato" },
];

export function linkWhatsApp(numero: string, mensagem?: string) {
  const n = numero.replace(/\D/g, "");
  return `https://wa.me/${n}${mensagem ? `?text=${encodeURIComponent(mensagem)}` : ""}`;
}
