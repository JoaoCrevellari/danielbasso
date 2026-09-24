# Daniel Basso · Desenvolvimento Humano

Site de Daniel Basso: cursos, mentorias, treinamentos corporativos, livros, blog e o
Diagnóstico de Autogoverno, com painel administrativo em `/admin` para todo o conteúdo,
leads e navegação.

Domínio: <https://danielbasso.com.br> (DNS na Cloudflare).

## Stack

- **TanStack Start** (React 19 + TanStack Router) com SSR
- **Tailwind CSS v4** (tokens em `src/styles.css`)
- **Supabase** (projeto `volnctioztyylqsyiham`, org Ylink): banco, login, arquivos
- **Cloudflare Workers** (build pelo Nitro, preset `cloudflare-module`)
- **motion** para animação, **Phosphor** para ícones, Newsreader + Geist como fontes
- **Resend** (opcional) para avisar novos leads por e-mail

## Rodando localmente

```sh
npm install
cp .env.example .env   # preencha as chaves
npm run dev            # http://localhost:8091
```

A porta 8091 é fixa: o Ylink usa a 8080 e o site do Pr. Daniel a 8090.

## Como o conteúdo funciona

Tudo o que aparece no site é editável no painel, e tudo tem um texto de exemplo padrão no
código. Se o banco estiver vazio ou fora do ar, o site continua completo.

| Onde                                   | O que é                                                                                                   |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `src/content/collections.ts`           | Coleções (curso, mentoria, treinamento, livro, depoimento, post): rótulos e campos próprios de cada uma. |
| `src/content/paginas/*`                | Páginas fixas (Home, Quem sou, Método…), configurações e diagnóstico: campos do painel + texto padrão.   |
| `src/content/fields.ts`                | Tipos de campo do painel (texto, markdown, imagem, lista, repetidor, grupo…).                           |
| `supabase/migrations/`                 | Esquema do banco e políticas de acesso (RLS).                                                           |

**Novo campo** em uma coleção: acrescente em `fields` no registro. O painel passa a mostrar o
campo e as páginas de detalhe (curso, mentoria, treinamento) já exibem listas, roteiros e a
ficha técnica automaticamente.

**Nova coleção**: nova entrada em `COLLECTIONS` (sem migration; tudo fica em `content_items`)
e, se tiver página pública, as rotas `src/routes/<caminho>.index.tsx` e `<caminho>.$slug.tsx`.

**Nova página editável**: um arquivo em `src/content/paginas/` com `CAMPOS` e `PADRAO`,
registrado em `src/content/paginas/index.ts`.

Convenção de títulos: o trecho entre `*asteriscos*` vira o destaque em itálico dourado.

## Leads e analytics

- Formulários gravam pela função `submit_lead` do banco (validação dupla, campo armadilha e
  limite por IP no Worker). Tipos: contato, interesse, corporativo, diagnóstico.
- Analytics próprio e anônimo: `src/lib/analytics.ts` envia eventos para `/api/evento`, que
  grava pela função `track_events`. Sem IP e sem cookies de terceiros. O painel lê o resumo
  pela função `analytics_overview`.
- **Dados de demonstração**: há visitas e leads de exemplo para a apresentação. Remova antes
  do lançamento com `supabase/limpar-dados-demonstracao.sql`.

## Conteúdo de exemplo

`scripts/exemplo/*` tem os cursos, mentorias, treinamentos, livros, depoimentos e posts de
exemplo. `npm run seed:sql` gera `supabase/seed.sql` (idempotente, atualiza pelo slug).

## Variáveis de ambiente

Nomes em `.env.example`. `VITE_*` vão para o navegador (variáveis de build);
`SUPABASE_SERVICE_ROLE_KEY` e `RESEND_API_KEY` são segredos do Worker e nunca levam `VITE_`.
