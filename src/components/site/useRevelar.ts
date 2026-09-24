import { useEffect } from "react";

const SELETOR = "[data-revelar]:not(.visivel), [data-revelar-grupo]:not(.visivel)";

/**
 * Animações de entrada do site inteiro.
 *
 * - [data-revelar]: o elemento entra quando aparece na tela (variantes no CSS).
 * - [data-revelar-grupo]: os filhos diretos entram em cascata; o índice (--i) de cada
 *   filho é numerado aqui, então listas e grades não precisam fazer isso à mão.
 *
 * Um único IntersectionObserver para tudo, mais um MutationObserver para conteúdo que
 * aparece depois (troca de rota, dados carregados). Com reduced-motion, o CSS já mostra
 * tudo sem animação.
 */
export function useRevelar() {
  useEffect(() => {
    if (!("IntersectionObserver" in window)) {
      document.documentElement.classList.remove("js");
      return;
    }
    const io = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (e.isIntersecting) {
            e.target.classList.add("visivel");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.06 },
    );
    const registrar = (el: Element) => {
      if (el.hasAttribute("data-revelar-grupo")) {
        Array.from(el.children).forEach((filho, n) => {
          (filho as HTMLElement).style.setProperty("--i", String(Math.min(n, 8)));
        });
      }
      io.observe(el);
    };
    const observar = (raiz: ParentNode) => raiz.querySelectorAll?.(SELETOR).forEach(registrar);

    observar(document);
    const mo = new MutationObserver((mut) => {
      for (const m of mut) {
        m.addedNodes.forEach((n) => {
          if (n instanceof HTMLElement) {
            if (n.matches(SELETOR)) registrar(n);
            observar(n);
          }
        });
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);
}
