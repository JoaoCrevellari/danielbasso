/**
 * Registro das páginas editáveis (tabela site_content, uma linha por chave).
 *
 * Cada entrada liga: chave no banco → campos do painel → conteúdo padrão (exemplo).
 * O site sempre mescla o que está salvo sobre o padrão; se o banco estiver vazio ou
 * fora do ar, a página continua completa com o texto de exemplo.
 */
import type { FieldGroup } from "../fields";
import { CONFIG_CAMPOS, CONFIG_PADRAO } from "./configuracoes";
import { DIAGNOSTICO_CAMPOS, DIAGNOSTICO_PADRAO } from "./diagnostico";
import { HOME_CAMPOS, HOME_PADRAO } from "./home";
import {
  BLOG_CAMPOS,
  BLOG_PADRAO,
  CONTATO_CAMPOS,
  CONTATO_PAGINA_PADRAO,
  CURSOS_CAMPOS,
  CURSOS_PADRAO,
  DEPOIMENTOS_CAMPOS,
  DEPOIMENTOS_PADRAO,
  LIVROS_CAMPOS,
  LIVROS_PADRAO,
  MENTORIAS_CAMPOS,
  MENTORIAS_PADRAO,
  TREINAMENTOS_CAMPOS,
  TREINAMENTOS_PADRAO,
} from "./listas";
import { METODO_CAMPOS, METODO_PADRAO } from "./metodo";
import { QUEM_SOU_CAMPOS, QUEM_SOU_PADRAO } from "./quem-sou";

export type PaginaConfig = {
  key: string;
  titulo: string;
  /** Caminho público, para o botão "ver no site". */
  path?: string;
  grupo: "paginas" | "sistema";
  campos: FieldGroup[];
  padrao: Record<string, unknown>;
};

export const PAGINAS = {
  home: {
    key: "home",
    titulo: "Página inicial",
    path: "/",
    grupo: "paginas",
    campos: HOME_CAMPOS,
    padrao: HOME_PADRAO,
  },
  "quem-sou": {
    key: "quem-sou",
    titulo: "Quem sou",
    path: "/quem-sou",
    grupo: "paginas",
    campos: QUEM_SOU_CAMPOS,
    padrao: QUEM_SOU_PADRAO,
  },
  metodo: {
    key: "metodo",
    titulo: "Método",
    path: "/metodo",
    grupo: "paginas",
    campos: METODO_CAMPOS,
    padrao: METODO_PADRAO,
  },
  cursos: {
    key: "cursos",
    titulo: "Cursos (página)",
    path: "/cursos",
    grupo: "paginas",
    campos: CURSOS_CAMPOS,
    padrao: CURSOS_PADRAO,
  },
  mentorias: {
    key: "mentorias",
    titulo: "Mentorias (página)",
    path: "/mentorias",
    grupo: "paginas",
    campos: MENTORIAS_CAMPOS,
    padrao: MENTORIAS_PADRAO,
  },
  treinamentos: {
    key: "treinamentos",
    titulo: "Empresas (página)",
    path: "/treinamentos",
    grupo: "paginas",
    campos: TREINAMENTOS_CAMPOS,
    padrao: TREINAMENTOS_PADRAO,
  },
  livros: {
    key: "livros",
    titulo: "Livros (página)",
    path: "/livros",
    grupo: "paginas",
    campos: LIVROS_CAMPOS,
    padrao: LIVROS_PADRAO,
  },
  depoimentos: {
    key: "depoimentos",
    titulo: "Depoimentos (página)",
    path: "/depoimentos",
    grupo: "paginas",
    campos: DEPOIMENTOS_CAMPOS,
    padrao: DEPOIMENTOS_PADRAO,
  },
  blog: {
    key: "blog",
    titulo: "Blog (página)",
    path: "/blog",
    grupo: "paginas",
    campos: BLOG_CAMPOS,
    padrao: BLOG_PADRAO,
  },
  contato: {
    key: "contato",
    titulo: "Contato",
    path: "/contato",
    grupo: "paginas",
    campos: CONTATO_CAMPOS,
    padrao: CONTATO_PAGINA_PADRAO,
  },
  diagnostico: {
    key: "diagnostico",
    titulo: "Diagnóstico",
    path: "/diagnostico",
    grupo: "sistema",
    campos: DIAGNOSTICO_CAMPOS,
    padrao: DIAGNOSTICO_PADRAO,
  },
  settings: {
    key: "settings",
    titulo: "Configurações",
    grupo: "sistema",
    campos: CONFIG_CAMPOS,
    padrao: CONFIG_PADRAO,
  },
} satisfies Record<string, PaginaConfig>;

export type PaginaKey = keyof typeof PAGINAS;

export type ConteudoDe<K extends PaginaKey> = (typeof PAGINAS)[K]["padrao"];

export function getPagina(key: string): PaginaConfig | undefined {
  return (PAGINAS as Record<string, PaginaConfig>)[key];
}
