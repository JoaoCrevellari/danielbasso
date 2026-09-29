# Padrão para landing pages de lançamento: Daniel Basso · Desenvolvimento Humano

> Pode colar este texto no começo de uma conversa nova ou no meio de uma conversa em que
> a LP já está sendo feita. As seções 1 a 4, 6 e 7 são obrigatórias (é o que faz a página
> funcionar e ficar segura no site). A seção 5 (identidade visual) é uma sugestão.

Esta landing page de lançamento de **Daniel Basso · Desenvolvimento Humano** será publicada no site oficial, no endereço `lp.danielbasso.com.br/nome-da-lp`. A hospedagem, o registro dos formulários, a medição de cliques e os pixels ficam por conta do site: **a página só cuida do conteúdo, do visual e da marcação descrita abaixo**.

**Se a página já estiver em construção nesta conversa:** mantenha o conteúdo, o texto e o visual que já foram definidos e adapte o código às regras obrigatórias abaixo (formato de entrega, formulários, marcação, qualidade e segurança). Depois liste, em poucas linhas, o que precisou ser alterado. Onde houver dúvida, escolha a opção mais simples e segura.

---

## 1. Formato da entrega

- Um arquivo **`.zip`** contendo:
  - `index.html` (a página inteira: HTML, CSS e JS no mesmo arquivo);
  - pasta `assets/` com imagens, vídeos curtos e a imagem de compartilhamento `assets/og.jpg` (1200×630).
- Todos os caminhos são **relativos**: `./assets/foto.webp`. Nunca comece com `/` e nunca use `<base>`.
- Nada de build, framework ou `node_modules`: HTML/CSS/JS puro que abre direto no navegador.
- Tamanho: zip ≤ 15 MB; página (sem vídeo) ≤ 1,5 MB no primeiro carregamento.

Junto com o zip, informe em texto:
1. Nome da LP e o endereço desejado (ex.: `imersao-lideranca`: letras minúsculas, números e hífen).
2. Os formulários da página e os campos de cada um.
3. IDs dos pixels (Meta, Google Analytics/Ads, TikTok), se houver.
4. Domínios externos para onde os botões levam (checkout, WhatsApp, grupo etc.).
5. Data de início e de encerramento da campanha, se já existirem.

## 2. O que o site injeta sozinho (não inclua na página)

- Script de medição (visitas, rolagem, cliques, envio de formulário, UTMs).
- Envio e armazenamento dos formulários.
- Pixels e tags (a partir dos IDs informados).
- Favicon e cabeçalhos de segurança.

Portanto, **não** inclua: Meta Pixel, Google Tag/GA, Hotjar, Clarity ou qualquer rastreador; serviços de formulário externos (RD Station, Google Forms, Typeform, Mailchimp, ActiveCampaign etc.); `fetch`/`XMLHttpRequest` para outros domínios; `action` nos formulários.

## 3. Formulários (obrigatório seguir exatamente)

```html
<form data-lp-form="inscricao">
  <label for="nome">Nome</label>
  <input id="nome" name="nome" autocomplete="name" required>

  <label for="email">E-mail</label>
  <input id="email" name="email" type="email" autocomplete="email" required>

  <label for="whatsapp">WhatsApp</label>
  <input id="whatsapp" name="whatsapp" type="tel" autocomplete="tel" inputmode="tel">

  <!-- Campos extras são livres: use name em minúsculas_com_underscore. -->

  <label>
    <input type="checkbox" name="consentimento" required>
    Li e concordo com a
    <a href="https://danielbasso.com.br/privacidade" target="_blank" rel="noopener">Política de Privacidade</a>.
  </label>

  <button type="submit">Quero participar</button>

  <div data-lp-sucesso hidden>Inscrição confirmada! …</div>
  <div data-lp-erro hidden>Não foi possível enviar. Tente de novo ou fale no WhatsApp.</div>
</form>
```

Regras:
- `data-lp-form` recebe um nome curto que identifica o formulário (`inscricao`, `lista-espera`, `aplicacao`…). Com mais de um formulário na página, cada um tem um nome diferente.
- Campos padrão com esses nomes exatos: `nome`, `email`, `whatsapp`. Os extras viram colunas na lista de respostas.
- Checkbox `consentimento` obrigatório (LGPD) com link para a Política de Privacidade.
- Não escreva JavaScript de envio. O site valida, envia, preenche o atributo `data-lp-enviando` no `<form>` durante o envio (estilize o botão com `[data-lp-enviando] button`) e mostra `data-lp-sucesso` ou `data-lp-erro`. Depois de enviar, o `<form>` ganha `data-lp-enviado` (use para esconder os campos, se quiser: `[data-lp-enviado] .campos { display: none }`).
- Para levar a pessoa a outra página depois do envio (checkout, página de obrigado, grupo): `<form data-lp-form="inscricao" data-lp-redirecionar="https://…">`.
- **Nunca** peça senha, CPF, dados de cartão ou documentos. O pagamento acontece na plataforma de checkout.

## 4. Marcação para os relatórios

- Cada seção: `<section data-lp-secao="nome-da-secao">` (ex.: `hero`, `problema`, `metodo`, `depoimentos`, `oferta`, `faq`). Isso gera o funil de leitura (até onde as pessoas chegam).
- Cada botão ou link importante: `data-lp-cta="nome-do-botao"` (ex.: `hero-inscricao`, `oferta-comprar`, `whatsapp-duvidas`). Os demais links são medidos automaticamente, mas sem nome.
- Botões que levam ao checkout: link comum `<a href="https://pay.hotmart.com/…" data-lp-cta="oferta-comprar">`. O site acrescenta as UTMs da visita.
- Vídeo: iframe do **YouTube** (`youtube-nocookie.com`), **Vimeo** ou **Panda Video**, com `title`, `loading="lazy"` e `allow="fullscreen"`.

## 5. Identidade visual (sugestão)

Este é o padrão do site do Daniel e a recomendação para as LPs. Cada lançamento pode ter
identidade própria (outras cores, fontes e elementos) **desde que o Daniel aprove**. Se a
LP seguir outro padrão, informe na entrega. Mesmo com outra identidade, contraste, legibilidade e as regras das seções 6 e 7 continuam valendo.

**Paleta do site:**

| Uso | Cor |
|---|---|
| Azul petróleo (principal) | `#003F5C` · escuros `#001F2E`, `#00141E` · claros `#DBE6EB`, `#EEF3F5` |
| Dourado ocre (destaque) | `#D4A72C` em fundo escuro · `#8A6A12` para **texto** dourado em fundo claro |
| Branco gelo (fundo) | `#F5F5F2` · papel `#FBFBF9` · alternado `#ECECE6` |
| Verde sálvia (apoio) | `#5F8F7A` · texto `#3F6B58` |
| Terracota (apoio) | `#C97B49` · texto `#9A5427` |
| Grafite (texto) | `#333333` · texto secundário `#5B6166` |
| Linhas | `rgba(0,63,92,.14)` em fundo claro · `rgba(245,245,242,.14)` em fundo escuro |

**Evitamos no site:** vermelho puro, roxo, rosa, cores fluorescentes/neon, gradientes chamativos.

**Tipografia do site** (Google Fonts, com `display=swap`; outras fontes do Google Fonts também funcionam):
- Títulos: **Newsreader** (serifada), peso 380–420, tracking levemente negativo. Destaque de palavra: itálico da mesma fonte, em dourado.
- Texto e botões: **Geist**.
- Rótulos de seção: Geist, maiúsculas, 11–12px, espaçamento 0,2em, dourado.
- Títulos em no máximo 2 linhas no desktop; texto corrido com no máximo ~65 caracteres por linha.

**Forma:** imagens, cartões e campos com cantos quase retos (raio 2px); botões em pílula (raio total). Sombras sutis, na cor do petróleo, nunca preto puro.

**Ritmo:** cada seção cabendo em uma tela (no celular e no desktop), com cabeçalho enxuto.

**Tom da marca:** "profundidade intelectual aplicada à vida". Sóbrio, elegante e humano, longe da estética de coach americano (CAPS LOCK gritando, emojis em excesso, setas piscando).

## 6. Qualidade (obrigatório; checklist antes de entregar)

- **Mobile first**: pensada para celular e testada de 360px a 1440px, sem rolagem horizontal. Alvos de toque ≥ 44px.
- Um único `<h1>`; seções com `<h2>`; HTML semântico (`header`, `main`, `section`, `footer`).
- `<html lang="pt-BR">`, `<meta charset="utf-8">`, `<meta name="viewport" content="width=device-width, initial-scale=1">`, `<title>`, `<meta name="description">`, `og:title`, `og:description`, `og:image` (`./assets/og.jpg`).
- Imagens em **WebP/AVIF**, com `width`, `height` e `alt` descritivo; `loading="lazy"` abaixo da dobra; a imagem principal do topo com `fetchpriority="high"`.
- Contraste mínimo AA (4,5:1 no texto). Foco visível no teclado.
- Animações: entrada suave dos elementos (fade/subida curta, 300–800 ms), animando só `transform` e `opacity`. Com `prefers-reduced-motion`, troque o movimento por um fade simples (não remova a animação).
- JavaScript só para interações visuais (FAQ, carrossel, contador). Bibliotecas externas apenas de `cdn.jsdelivr.net` ou `cdnjs.cloudflare.com` (ex.: GSAP).
- Contador regressivo só com data real e fixa (nunca reinicia a cada visita). Escassez ("últimas vagas") só se for verdade.
- Depoimentos apenas reais e autorizados, com nome e contexto. Sem promessa de resultado garantido.
- Links externos com `target="_blank" rel="noopener"`.
- Rodapé com: "© 2026 Daniel Basso. Todos os direitos reservados.", links para `https://danielbasso.com.br/privacidade` e `https://danielbasso.com.br/termos`.

## 7. Segurança (não negociável)

- Nenhum script, iframe, fonte ou imagem de domínios fora destes: `fonts.googleapis.com`, `fonts.gstatic.com`, `cdn.jsdelivr.net`, `cdnjs.cloudflare.com`, `youtube-nocookie.com`, `player.vimeo.com`, `player-vz-*.tv.pandavideo.com.br`. Precisou de outro? Informe o motivo na entrega.
- Sem `eval`, `new Function`, `document.write`, `<meta http-equiv="refresh">`, service worker ou `<base>`.
- Não use `localStorage`, `sessionStorage` nem cookies para guardar dados pessoais.
- Não inclua chaves, tokens, e-mails internos ou links de área administrativa no código.
- A página será publicada com cabeçalhos de segurança (CSP): o que estiver fora destas regras **simplesmente não vai funcionar** quando for publicada.
