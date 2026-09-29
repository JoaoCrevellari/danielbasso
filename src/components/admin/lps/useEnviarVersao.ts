import { useState } from "react";

import { enviarPacote } from "@/lib/admin/lp-pacote";
import { registrarVersaoFn } from "@/lib/admin/lps.functions";
import type { PacoteLido } from "./EnvioPacote";

/** Envia os arquivos de uma versão nova e registra a versão (com progresso). */
export function useEnviarVersao() {
  const [progresso, setProgresso] = useState<{ feitos: number; total: number } | null>(null);

  async function enviar(lpId: string, versaoAtual: number, pacote: PacoteLido) {
    const versao = versaoAtual + 1;
    setProgresso({ feitos: 0, total: pacote.arquivos.length });
    try {
      const arquivos = await enviarPacote(lpId, versao, pacote.arquivos, (feitos, total) =>
        setProgresso({ feitos, total }),
      );
      await registrarVersaoFn({
        data: { id: lpId, versao, arquivos, conformidade: pacote.conformidade },
      });
      return versao;
    } finally {
      setProgresso(null);
    }
  }

  return { enviar, progresso };
}
