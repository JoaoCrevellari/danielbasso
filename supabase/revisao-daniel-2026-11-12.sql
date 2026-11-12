-- Revisão do Daniel (12/11/2026): itens com nomes e endereços novos e etapas renomeadas.
-- Aplicado uma vez pelo MCP do Supabase. O conteúdo novo dos itens vem depois, pelo
-- `npx tsx --env-file=.env scripts/seed-api.ts` (upsert pelo endereço).
-- Os endereços antigos redirecionam (301) em src/server.ts (ENDERECOS_ANTIGOS).

begin;

-- 1. Endereços: renomeia os registros existentes (mantém id, então leads ligados ao item seguem ligados).
update public.content_items c
   set slug = m.novo
  from (values
    ('curso', 'reconstrucao-pessoal', 'diagnostico-completo'),
    ('curso', 'fundamentos-do-autogoverno', 'metodo-autogoverno'),
    ('curso', 'lideranca-com-proposito', 'assuma-o-controle'),
    ('curso', 'alta-performance-sustentavel', 'nada-pode-me-deter'),
    ('mentoria', 'mentoria-para-lideres', 'mentoria-para-gestores'),
    ('mentoria', 'circulo-de-autogoverno', 'mastermind'),
    ('treinamento', 'lideranca-que-forma-pessoas', 'jornada-de-desenvolvimento-humano'),
    ('treinamento', 'cultura-de-responsabilidade', 'seu-problema-nao-e-tempo'),
    ('treinamento', 'o-lider-que-se-governa', 'a-vida-que-voce-nao-governa'),
    ('livro', 'o-governo-de-si', 'as-leis-do-autogoverno'),
    ('livro', 'reconstruir', 'ninguem-vai-fazer-por-voce'),
    ('livro', 'liderar-a-partir-de-dentro', 'nada-pode-me-deter')
  ) as m(colecao, antigo, novo)
 where c.collection = m.colecao and c.slug = m.antigo;

-- 2. Depoimentos e posts de exemplo saem do ar (rascunho; nada é apagado).
update public.content_items set status = 'draft' where collection in ('depoimento', 'post');

-- 3. Etapas renomeadas em todos os itens (inclusive rascunhos) e na categoria dos posts.
update public.content_items
   set data = jsonb_set(data, '{etapa}', to_jsonb(case data->>'etapa'
         when 'reconstrucao' then 'clareza'
         when 'autogoverno' then 'ordem'
         when 'transformacao' then 'progresso'
         when 'lideranca' then 'excelencia'
         when 'performance' then 'legado'
         else data->>'etapa' end))
 where data ? 'etapa';

update public.content_items
   set data = jsonb_set(data, '{categoria}', to_jsonb(coalesce(data->>'etapa', 'ordem')))
 where collection = 'post';

-- 4. Leads do diagnóstico (7 exemplos de demonstração): etapa-foco e chaves da pontuação
--    com os nomes novos. Só os valores entre aspas trocam (nomes inteiros de etapa).
update public.leads
   set data = replace(replace(replace(replace(replace(data::text,
         '"reconstrucao"', '"clareza"'),
         '"autogoverno"', '"ordem"'),
         '"transformacao"', '"progresso"'),
         '"lideranca"', '"excelencia"'),
         '"performance"', '"legado"')::jsonb
 where data ? 'foco';

commit;
