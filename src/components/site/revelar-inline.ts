/**
 * Script inline (vai no <head>) que liga as animações de entrada ANTES do JavaScript do
 * site carregar. Antes, o topo da página ficava escondido até o bundle baixar e o React
 * hidratar (~3 s num celular em 4G), o que atrasava o que a pessoa vê primeiro.
 *
 * Um MutationObserver acompanha o HTML sendo lido e registra cada [data-revelar] e
 * [data-revelar-grupo] num IntersectionObserver; ao entrar na tela, o elemento ganha
 * .visivel (as transições estão em styles.css). Continua valendo nas trocas de página.
 * useRevelar() só entra em ação se este script não tiver rodado.
 */
export const SCRIPT_REVELAR = `(function(){var d=document.documentElement;d.classList.add("js");if(!("IntersectionObserver"in window)||!("MutationObserver"in window)){d.classList.remove("js");return}var S="[data-revelar]:not(.visivel),[data-revelar-grupo]:not(.visivel)";var io=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;var t=e.target;if(t.hasAttribute("data-revelar-grupo")){for(var i=0;i<t.children.length;i++)t.children[i].style.setProperty("--i",String(Math.min(i,8)))}t.classList.add("visivel");io.unobserve(t)})},{rootMargin:"0px 0px -6% 0px",threshold:0.06});var vistos=new WeakSet();function reg(el){if(vistos.has(el))return;vistos.add(el);io.observe(el)}function varrer(n){if(n.matches&&n.matches(S))reg(n);if(n.querySelectorAll)n.querySelectorAll(S).forEach(reg)}new MutationObserver(function(ms){ms.forEach(function(m){m.addedNodes.forEach(function(n){if(n.nodeType===1)varrer(n)})})}).observe(d,{childList:true,subtree:true});varrer(d);window.__revelar=true})();`;
