import { createContext, useContext, type ReactNode } from "react";

import { CONFIG_PADRAO, type ConfigConteudo } from "@/content/paginas/configuracoes";

/** Configurações globais (contato, redes, aviso de apresentação) lidas no loader da raiz. */
const ConfigContext = createContext<ConfigConteudo>(CONFIG_PADRAO);

export function ConfigProvider({
  value,
  children,
}: {
  value: ConfigConteudo;
  children: ReactNode;
}) {
  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
}

export function useConfig() {
  return useContext(ConfigContext);
}
