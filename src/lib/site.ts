/**
 * Constantes do site que não mudam pelo painel (identidade, domínio, rotas).
 * Contatos e redes podem ser sobrescritos em Admin → Configurações (site_content "settings");
 * os valores daqui são o padrão.
 */
export const SITE = {
  name: "Daniel Basso",
  shortName: "Daniel Basso",
  tagline: "Desenvolvimento Humano",
  role: "Mentor, escritor e treinador de líderes",
  url: "https://danielbasso.com.br",
  description:
    "Reconstrução, autogoverno e liderança. Cursos, mentorias, treinamentos corporativos e livros de Daniel Basso para quem quer crescer com responsabilidade.",
  locale: "pt_BR",
} as const;

export const CONTATO_PADRAO = {
  whatsapp: "5511972119531",
  whatsappMensagem: "Olá, Daniel. Vim pelo site e gostaria de conversar.",
  email: "contato@danielbasso.com.br",
  instagram: "https://instagram.com/danielbassooficial/",
  youtube: "https://youtube.com/@danielbassooficial01",
  cidade: "São Paulo, SP",
};

export type NavItem = { label: string; to: string };

/** Navegação principal. A ordem aqui é a ordem no menu. */
export const NAV_PRINCIPAL: NavItem[] = [
  { label: "Quem sou", to: "/quem-sou" },
  { label: "Método", to: "/metodo" },
  { label: "Cursos", to: "/cursos" },
  { label: "Mentorias", to: "/mentorias" },
  { label: "Empresas", to: "/treinamentos" },
  { label: "Livros", to: "/livros" },
  { label: "Blog", to: "/blog" },
];

export const NAV_SECUNDARIA: NavItem[] = [
  { label: "Depoimentos", to: "/depoimentos" },
  { label: "Diagnóstico", to: "/diagnostico" },
  { label: "Contato", to: "/contato" },
];

export function linkWhatsApp(numero: string, mensagem?: string) {
  const n = numero.replace(/\D/g, "");
  return `https://wa.me/${n}${mensagem ? `?text=${encodeURIComponent(mensagem)}` : ""}`;
}
