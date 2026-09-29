import { useEffect, useState } from "react";

/**
 * true quando a página passou de `limite` px de rolagem (ou da função, calculada na hora).
 * Listener passivo + requestAnimationFrame: sem biblioteca de animação no carregamento
 * inicial e sem re-render a cada pixel (só quando o resultado muda).
 */
export function useRolagem(limite: number | (() => number)) {
  const [passou, setPassou] = useState(false);
  useEffect(() => {
    let quadro = 0;
    const medir = () => {
      quadro = 0;
      const l = typeof limite === "function" ? limite() : limite;
      setPassou(window.scrollY > l);
    };
    const pedir = () => {
      if (!quadro) quadro = requestAnimationFrame(medir);
    };
    medir();
    window.addEventListener("scroll", pedir, { passive: true });
    window.addEventListener("resize", pedir);
    return () => {
      cancelAnimationFrame(quadro);
      window.removeEventListener("scroll", pedir);
      window.removeEventListener("resize", pedir);
    };
    // O limite é fixo por componente; recriar o listener a cada render não faz sentido.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return passou;
}
