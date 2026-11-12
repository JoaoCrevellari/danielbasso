// ── Página "Em breve" (pedido de 2026-11-12) ─────────────────────────────────────────
// O Daniel começou uma campanha e o site ainda está em revisão. Quem não abriu o link de
// validação (/validacao/v1, ver src/server.ts) vê só esta página, em qualquer endereço.
// É HTML puro, sem React: carrega rápido e não depende do banco nem do build do app.
import { CONTATO_PADRAO } from "./lib/site";


export function renderEmBreve(): string {
  // Na Cloudflare o relógio só anda dentro de uma requisição: fora dela, Date() dá 1970.
  const ANO = new Date().getFullYear();
  const whatsapp = `https://wa.me/${CONTATO_PADRAO.whatsapp}?text=${encodeURIComponent(
    CONTATO_PADRAO.whatsappMensagem.replace("Vim pelo site", "Vi que o site está em construção"),
  )}`;
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
<title>Daniel Basso · Em breve</title>
<meta name="description" content="O novo site de Daniel Basso · Desenvolvimento Humano está em construção.">
<meta name="theme-color" content="#00141e">
<meta property="og:title" content="Daniel Basso · Desenvolvimento Humano">
<meta property="og:description" content="Você não perdeu o controle da sua vida. Você entregou, sem perceber. O novo site está a caminho.">
<meta property="og:image" content="https://danielbasso.com.br/compartilhamento-v2.jpg">
<link rel="icon" href="/favicon-48.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preload" href="/fontes/newsreader-latin-opsz-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fontes/geist-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<style>
@font-face{font-family:"Newsreader";src:url(/fontes/newsreader-latin-opsz-normal.woff2) format("woff2");font-weight:200 800;font-style:normal;font-display:swap}
@font-face{font-family:"Newsreader";src:url(/fontes/newsreader-latin-opsz-italic.woff2) format("woff2");font-weight:200 800;font-style:italic;font-display:swap}
@font-face{font-family:"Geist";src:url(/fontes/geist-latin-wght-normal.woff2) format("woff2");font-weight:100 900;font-display:swap}
:root{
  --petroleo-950:#00141e;--petroleo-900:#001f2e;--petroleo-700:#0a4f70;--petroleo:#003f5c;
  --ouro:#d4a72c;--ouro-claro:#e6c36a;--gelo:#f5f5f2;
  --texto-2:rgb(245 245 242/.72);--texto-3:rgb(245 245 242/.5);--linha:rgb(245 245 242/.14);
  --serif:"Newsreader","Iowan Old Style",Georgia,serif;
  --sans:"Geist",ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;
  --ease:cubic-bezier(.16,1,.3,1);
  --gutter:1.25rem;
  color-scheme:dark;
}
@media (min-width:768px){:root{--gutter:2.5rem}}
*{box-sizing:border-box}
html,body{margin:0;height:100%}
body{
  min-height:100dvh;display:grid;grid-template-rows:1fr auto;
  background:var(--petroleo-950);color:var(--gelo);
  font:400 1rem/1.6 var(--sans);-webkit-font-smoothing:antialiased;
  overflow-x:hidden;position:relative;isolation:isolate;
}
/* Fundo: duas luzes que derivam devagar e um grão fino por cima */
.luz{position:fixed;z-index:-2;border-radius:50%;filter:blur(80px);pointer-events:none;will-change:transform}
.luz--ouro{width:46vmax;height:46vmax;left:-14vmax;top:-18vmax;background:radial-gradient(circle,rgb(212 167 44/.22),transparent 65%);animation:deriva-a 22s var(--ease) infinite alternate}
.luz--azul{width:60vmax;height:60vmax;right:-22vmax;bottom:-28vmax;background:radial-gradient(circle,rgb(10 79 112/.55),transparent 65%);animation:deriva-b 26s var(--ease) infinite alternate}
@keyframes deriva-a{to{transform:translate3d(8vmax,6vmax,0) scale(1.08)}}
@keyframes deriva-b{to{transform:translate3d(-7vmax,-5vmax,0) scale(1.05)}}
body::after{
  content:"";position:fixed;inset:0;z-index:-1;pointer-events:none;opacity:.07;mix-blend-mode:overlay;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
/* Moldura: fios finos nas laterais, como nas seções do site */
.moldura{position:absolute;inset:var(--gutter);border:1px solid var(--linha);pointer-events:none;z-index:-1}
@media (max-width:767px){.moldura{display:none}}

main{display:grid;place-items:center;padding:clamp(2.75rem,8vh,5rem) calc(var(--gutter)*1.6) clamp(1.5rem,4vh,2.5rem)}
.conteudo{width:100%;max-width:40rem;text-align:center;display:flex;flex-direction:column;align-items:center}
.logo{width:clamp(8.5rem,26vw,11rem);height:auto;display:block}
.status{
  margin:clamp(1.5rem,5vh,2.75rem) 0 0;display:inline-flex;align-items:center;gap:.6rem;
  padding:.42rem .95rem .42rem .8rem;border:1px solid rgb(212 167 44/.35);border-radius:999px;
  font-size:.72rem;letter-spacing:.2em;text-transform:uppercase;color:var(--ouro-claro)
}
.ponto{position:relative;width:.45rem;height:.45rem;border-radius:50%;background:var(--ouro)}
.ponto::after{content:"";position:absolute;inset:0;border-radius:50%;background:var(--ouro);animation:pulso 2.4s var(--ease) infinite}
@keyframes pulso{0%{transform:scale(1);opacity:.7}70%,100%{transform:scale(3.2);opacity:0}}
h1{
  margin:1.4rem 0 0;font-family:var(--serif);font-weight:400;
  font-size:clamp(2.35rem,7.2vw,4rem);line-height:1.04;letter-spacing:-.02em;
  font-variation-settings:"opsz" 72;text-wrap:balance
}
h1 em{font-style:italic;color:var(--ouro)}
.fio{width:3.5rem;height:1px;margin:1.8rem auto 0;background:linear-gradient(90deg,transparent,var(--ouro),transparent);transform-origin:center}
.texto{margin:1.6rem 0 0;max-width:32rem;color:var(--texto-2);font-size:clamp(1rem,2.4vw,1.08rem);text-wrap:pretty}
.acoes{margin-top:2.2rem;display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.botao{
  display:inline-flex;align-items:center;justify-content:center;gap:.6rem;min-height:3rem;
  padding:.8rem 1.5rem;border-radius:999px;font:500 .95rem/1 var(--sans);text-decoration:none;
  transition:background-color .25s var(--ease),color .25s var(--ease),border-color .25s var(--ease),transform .25s var(--ease)
}
.botao svg{width:1.1rem;height:1.1rem;flex:none}
.botao--ouro{background:var(--ouro);color:var(--petroleo-950)}
.botao--ouro:hover{background:var(--ouro-claro);transform:translateY(-1px)}
.botao--linha{border:1px solid rgb(245 245 242/.28);color:var(--gelo)}
.botao--linha:hover{border-color:var(--gelo);background:rgb(245 245 242/.06);transform:translateY(-1px)}
.botao:active{transform:translateY(0) scale(.98)}
.botao:focus-visible,footer a:focus-visible{outline:2px solid var(--ouro);outline-offset:3px}
blockquote{
  margin:clamp(2rem,6vh,3.4rem) 0 0;padding:0;max-width:30rem;text-wrap:balance;
  font-family:var(--serif);font-style:italic;font-size:clamp(1.05rem,2.6vw,1.2rem);line-height:1.45;color:var(--texto-3)
}
footer{
  display:flex;flex-wrap:wrap;gap:.5rem 1.5rem;justify-content:space-between;align-items:center;
  padding:1.2rem calc(var(--gutter)*1.6) calc(1.2rem + var(--gutter) + env(safe-area-inset-bottom));margin:0 var(--gutter);
  font-size:.8rem;color:var(--texto-3);border-top:1px solid var(--linha)
}
@media (max-width:767px){footer{justify-content:center;text-align:center;padding-inline:var(--gutter)}}
footer a{color:inherit;text-decoration:none;transition:color .25s var(--ease)}
footer a:hover{color:var(--gelo)}
footer strong{font-weight:500;color:var(--texto-2)}

/* Entrada em cascata */
.entra{opacity:0;transform:translateY(14px);filter:blur(6px);animation:entra .9s var(--ease) forwards;animation-delay:calc(var(--i)*90ms + 120ms)}
.fio.entra{transform:scaleX(0);filter:none;animation-name:fio}
@keyframes entra{to{opacity:1;transform:none;filter:none}}
@keyframes fio{to{opacity:1;transform:scaleX(1)}}

@media (prefers-reduced-motion:reduce){
  .luz,.ponto::after{animation:none}
  .entra,.fio.entra{transform:none;filter:none;animation:esmaece .6s ease forwards;animation-delay:calc(var(--i)*60ms)}
  @keyframes esmaece{to{opacity:1}}
  .botao:hover{transform:none}
}
</style>
</head>
<body>
<div class="luz luz--ouro" aria-hidden="true"></div>
<div class="luz luz--azul" aria-hidden="true"></div>
<div class="moldura" aria-hidden="true"></div>
<main>
  <div class="conteudo">
    <img class="logo entra" style="--i:0" src="/marca/logo.png" width="954" height="499" alt="Daniel Basso · Desenvolvimento Humano">
    <p class="status entra" style="--i:1"><span class="ponto" aria-hidden="true"></span>Site em construção</p>
    <h1 class="entra" style="--i:2">Um novo site está <em>a caminho</em>.</h1>
    <div class="fio entra" style="--i:3" aria-hidden="true"></div>
    <p class="texto entra" style="--i:4">Estou preparando um espaço para quem quer retomar o comando da própria vida: cursos, mentorias, palestras e livros do Método Autogoverno. Enquanto isso, fale comigo diretamente.</p>
    <div class="acoes entra" style="--i:5">
      <a class="botao botao--ouro" href="${whatsapp}" target="_blank" rel="noopener noreferrer">
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.3zM12 21.8c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4c-1-1.6-1.5-3.4-1.5-5.2 0-5.4 4.4-9.8 9.8-9.8 2.6 0 5.1 1 6.9 2.9 1.8 1.8 2.9 4.3 2.9 6.9 0 5.4-4.4 9.8-9.8 9.8zm8.4-18.2C18.1 1.3 15.2.1 12 .1 5.5.1.1 5.4.1 12c0 2.1.5 4.1 1.6 5.9L0 24l6.3-1.6c1.7.9 3.7 1.4 5.7 1.4 6.6 0 11.9-5.3 11.9-11.9 0-3.2-1.2-6.2-3.5-8.3z"/></svg>
        Conversar pelo WhatsApp
      </a>
      <a class="botao botao--linha" href="${CONTATO_PADRAO.instagram}" target="_blank" rel="noopener noreferrer">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.4" cy="6.6" r=".9" fill="currentColor" stroke="none"/></svg>
        Seguir no Instagram
      </a>
    </div>
    <blockquote class="entra" style="--i:6">“Você não perdeu o controle da sua vida. Você entregou, sem perceber.”</blockquote>
  </div>
</main>
<footer class="entra" style="--i:7">
  <span>© ${ANO} Daniel Basso · Desenvolvimento Humano</span>
  <a href="https://ylink.com.br" target="_blank" rel="noopener noreferrer">Site em desenvolvimento pela <strong>Ylink</strong></a>
</footer>
</body>
</html>`;
}
