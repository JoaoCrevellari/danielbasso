/**
 * Aviso de alterações não salvas: bloqueia a navegação interna (com confirmação) e
 * a saída da aba (beforeunload). `liberar()` desliga o bloqueio antes de uma navegação
 * feita pelo próprio editor (ex.: depois de criar um item novo).
 */
import { useBlocker } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

import { Modal } from "./Dialogo";
import { acao } from "./ui";

export function useProtecaoSaida(sujo: boolean) {
  const ref = useRef(sujo);
  useEffect(() => {
    ref.current = sujo;
  }, [sujo]);
  const bloqueio = useBlocker({
    shouldBlockFn: () => ref.current,
    enableBeforeUnload: () => ref.current,
    withResolver: true,
  });
  return {
    bloqueio,
    liberar: () => {
      ref.current = false;
    },
  };
}

export function AvisoSaida({
  bloqueio,
}: {
  bloqueio: ReturnType<typeof useProtecaoSaida>["bloqueio"];
}) {
  const aberto = bloqueio.status === "blocked";
  return (
    <Modal
      aberto={aberto}
      onFechar={() => bloqueio.reset?.()}
      titulo="Sair sem salvar?"
      largura="max-w-md"
      rodape={
        <>
          <button type="button" className={acao("secundario")} onClick={() => bloqueio.proceed?.()}>
            Sair sem salvar
          </button>
          <button
            type="button"
            autoFocus
            className={acao("primario")}
            onClick={() => bloqueio.reset?.()}
          >
            Continuar editando
          </button>
        </>
      }
    >
      <p className="text-[0.9375rem] text-grafite">
        Há alterações que ainda não foram salvas. Se sair agora, elas serão perdidas.
      </p>
    </Modal>
  );
}
