-- Resumo do diagnóstico calculado no banco (sem limite de linhas): total, quantas pessoas
-- caíram em cada etapa foco, média de pontuação por etapa e as 12 respostas mais recentes.
-- SECURITY INVOKER: a RLS de leads (módulo "diagnostico") vale para quem chama.
CREATE OR REPLACE FUNCTION public.diagnostico_resumo()
RETURNS jsonb
LANGUAGE sql STABLE SECURITY INVOKER
SET search_path = public
AS $$
  WITH d AS (
    SELECT id, name, email, status, created_at, data
      FROM public.leads
     WHERE kind = 'diagnostico'
  ),
  pont AS (
    SELECT p.key AS etapa, (p.value)::text AS valor
      FROM d, jsonb_each(CASE WHEN jsonb_typeof(d.data->'pontuacao') = 'object' THEN d.data->'pontuacao' ELSE '{}'::jsonb END) p
     WHERE jsonb_typeof(p.value) = 'number'
  )
  SELECT jsonb_build_object(
    'total', (SELECT count(*) FROM d),
    'focos', (
      SELECT coalesce(jsonb_object_agg(foco, n), '{}'::jsonb)
        FROM (SELECT data->>'foco' AS foco, count(*) AS n FROM d
               WHERE data->>'foco' IS NOT NULL GROUP BY 1) f
    ),
    'medias', (
      SELECT coalesce(jsonb_object_agg(etapa, media), '{}'::jsonb)
        FROM (SELECT etapa, round(avg(valor::numeric), 2) AS media FROM pont GROUP BY etapa) m
    ),
    'recentes', (
      SELECT coalesce(jsonb_agg(r ORDER BY r->>'created_at' DESC), '[]'::jsonb) FROM (
        SELECT jsonb_build_object(
          'id', id, 'name', name, 'email', email, 'status', status, 'created_at', created_at,
          'foco', data->>'foco',
          'pontuacao', CASE WHEN jsonb_typeof(data->'pontuacao') = 'object' THEN data->'pontuacao' ELSE '{}'::jsonb END
        ) AS r
        FROM d ORDER BY created_at DESC LIMIT 12
      ) x
    )
  );
$$;
REVOKE EXECUTE ON FUNCTION public.diagnostico_resumo() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.diagnostico_resumo() TO authenticated;
