/**
 * Página devolvida quando o servidor falha antes de o React conseguir renderizar.
 * HTML autossuficiente (sem CSS/JS externos): precisa funcionar mesmo com o app quebrado.
 */
export function renderErrorPage(): string {
  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <title>Esta página não pôde ser carregada · Daniel Basso</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex" />
    <style>
      :root { color-scheme: light; }
      body { font: 16px/1.6 system-ui, -apple-system, "Segoe UI", sans-serif; background: #F5F5F2; color: #003F5C; display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
      .card { max-width: 30rem; width: 100%; text-align: center; }
      .selo { font-size: .75rem; font-weight: 600; letter-spacing: .24em; text-transform: uppercase; color: #8A6A12; margin: 0 0 1rem; }
      h1 { font: 500 2rem/1.15 Georgia, "Times New Roman", serif; margin: 0 0 .75rem; }
      p { color: #4b5563; margin: 0 0 2rem; }
      .acoes { display: flex; gap: .75rem; justify-content: center; flex-wrap: wrap; }
      a, button { display: inline-flex; align-items: center; min-height: 3rem; padding: 0 1.5rem; font: 600 .875rem/1 inherit; letter-spacing: .02em; cursor: pointer; text-decoration: none; border: 1px solid transparent; }
      .primario { background: #003F5C; color: #F5F5F2; }
      .secundario { background: transparent; color: #003F5C; border-color: rgba(0, 63, 92, .3); }
      a:focus-visible, button:focus-visible { outline: 2px solid #003F5C; outline-offset: 3px; }
    </style>
  </head>
  <body>
    <main class="card">
      <p class="selo">Algo deu errado</p>
      <h1>Esta página não pôde ser carregada</h1>
      <p>Tivemos um problema do nosso lado. Tente de novo em instantes ou volte para o início.</p>
      <div class="acoes">
        <button class="primario" type="button" onclick="location.reload()">Tentar novamente</button>
        <a class="secundario" href="/">Voltar ao início</a>
      </div>
    </main>
  </body>
</html>`;
}
