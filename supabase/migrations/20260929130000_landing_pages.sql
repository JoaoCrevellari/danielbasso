-- ─────────────────────────────────────────────────────────────────────────────
-- LPs de lançamento (servidas em lp.danielbasso.com.br/<slug>/)
--
--   • landing_pages: cadastro, versão publicada e configurações (pixels, datas, domínios).
--     Os arquivos (index.html + assets/) ficam no bucket privado "lps", em
--     <id>/v<versao>/…; o Worker lê com a chave de serviço e serve com CSP própria.
--   • lp_events: medição de cada LP (visita, seção vista, rolagem, clique, formulário,
--     tempo). Sem IP; visitante e sessão são ids aleatórios do navegador.
--   • Respostas dos formulários vão para leads (kind = 'lp', lp_id, subject = formulário),
--     então aparecem também na caixa de leads para quem tem permissão.
--   • Escrita pública só pelas funções submit_lp_lead e track_lp_events (validam tudo e
--     só aceitam LP publicada e no prazo).
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.landing_pages (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' AND length(slug) <= 80),
  titulo          text NOT NULL CHECK (length(trim(titulo)) BETWEEN 2 AND 160),
  status          text NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'publicada', 'encerrada')),
  versao          integer NOT NULL DEFAULT 0,
  arquivos        jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(arquivos) = 'array'),
  conformidade    jsonb NOT NULL DEFAULT '[]'::jsonb,
  pixels          jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(pixels) = 'object'),
  dominios_extras text[] NOT NULL DEFAULT '{}',
  inicio          timestamptz,
  fim             timestamptz,
  url_encerrada   text CHECK (url_encerrada IS NULL OR url_encerrada ~ '^https://'),
  notas           text,
  publicada_em    timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  created_by      uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  updated_by      uuid REFERENCES auth.users (id) ON DELETE SET NULL
);
CREATE TRIGGER landing_pages_updated_at BEFORE UPDATE ON public.landing_pages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.landing_pages ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.landing_pages TO authenticated;
GRANT ALL ON public.landing_pages TO service_role;
CREATE POLICY "Equipe vê LPs" ON public.landing_pages
  FOR SELECT TO authenticated USING (public.pode('lps', 'ver'));
CREATE POLICY "Equipe cria LPs" ON public.landing_pages
  FOR INSERT TO authenticated WITH CHECK (public.pode('lps', 'editar'));
CREATE POLICY "Equipe edita LPs" ON public.landing_pages
  FOR UPDATE TO authenticated USING (public.pode('lps', 'editar')) WITH CHECK (public.pode('lps', 'editar'));
CREATE POLICY "Equipe apaga LPs" ON public.landing_pages
  FOR DELETE TO authenticated USING (public.pode('lps', 'apagar'));

-- Eventos -----------------------------------------------------------------------------
CREATE TABLE public.lp_events (
  id           bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  lp_id        uuid NOT NULL REFERENCES public.landing_pages (id) ON DELETE CASCADE,
  created_at   timestamptz NOT NULL DEFAULT now(),
  type         text NOT NULL,   -- visita | secao | rolagem | cta | link | form_inicio | form_envio | tempo
  label        text,
  value        numeric,
  visitor_id   text NOT NULL,
  session_id   text NOT NULL,
  referrer     text,
  utm_source   text,
  utm_medium   text,
  utm_campaign text,
  utm_content  text,
  utm_term     text,
  device       text,
  browser      text,
  os           text,
  country      text,
  region       text,
  city         text
);
CREATE INDEX lp_events_lp_created_idx ON public.lp_events (lp_id, created_at DESC);
CREATE INDEX lp_events_lp_type_idx ON public.lp_events (lp_id, type);

ALTER TABLE public.lp_events ENABLE ROW LEVEL SECURITY;
GRANT SELECT, DELETE ON public.lp_events TO authenticated;
GRANT ALL ON public.lp_events TO service_role;
CREATE POLICY "Equipe vê eventos das LPs" ON public.lp_events
  FOR SELECT TO authenticated USING (public.pode('lps', 'ver'));
CREATE POLICY "Equipe apaga eventos das LPs" ON public.lp_events
  FOR DELETE TO authenticated USING (public.pode('lps', 'apagar'));

-- Respostas dos formulários ---------------------------------------------------------------
ALTER TABLE public.leads ADD COLUMN lp_id uuid REFERENCES public.landing_pages (id) ON DELETE SET NULL;
CREATE INDEX leads_lp_idx ON public.leads (lp_id, created_at DESC) WHERE lp_id IS NOT NULL;

-- LP aceita visitas/respostas? (publicada e dentro do prazo)
CREATE OR REPLACE FUNCTION public.lp_ativa(_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.landing_pages
     WHERE id = _id AND status = 'publicada'
       AND (inicio IS NULL OR inicio <= now() + interval '1 day')
       AND (fim IS NULL OR fim > now())
  )
$$;
REVOKE EXECUTE ON FUNCTION public.lp_ativa(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.lp_ativa(uuid) TO service_role;  -- uso interno das funções abaixo

CREATE OR REPLACE FUNCTION public.submit_lp_lead(p jsonb)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id    uuid;
  v_lp    uuid;
  v_form  text := left(trim(coalesce(p->>'form', '')), 60);
  v_name  text := left(trim(coalesce(p->>'name', '')), 160);
  v_email text := nullif(lower(left(trim(coalesce(p->>'email', '')), 200)), '');
  v_phone text := nullif(left(regexp_replace(coalesce(p->>'phone', ''), '[^0-9+() -]', '', 'g'), 40), '');
  v_data  jsonb := CASE WHEN jsonb_typeof(p->'data') = 'object' THEN p->'data' ELSE '{}'::jsonb END;
BEGIN
  IF coalesce(p->>'lp_id', '') !~ '^[0-9a-f-]{36}$' THEN RAISE EXCEPTION 'lp inválida'; END IF;
  v_lp := (p->>'lp_id')::uuid;
  IF NOT public.lp_ativa(v_lp) THEN RAISE EXCEPTION 'lp indisponível'; END IF;
  IF v_form !~ '^[a-z0-9]+([_-][a-z0-9]+)*$' THEN RAISE EXCEPTION 'formulário inválido'; END IF;
  IF v_email IS NULL AND v_phone IS NULL THEN RAISE EXCEPTION 'contato obrigatório'; END IF;
  IF v_email IS NOT NULL AND v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN
    RAISE EXCEPTION 'e-mail inválido';
  END IF;
  IF pg_column_size(p) > 32000 THEN RAISE EXCEPTION 'envio grande demais'; END IF;
  IF length(v_name) < 2 THEN v_name := coalesce(split_part(v_email, '@', 1), v_phone); END IF;

  INSERT INTO public.leads (kind, name, email, phone, subject, lp_id, data,
                            source_path, referrer, utm, visitor_id)
  VALUES (
    'lp', v_name, v_email, v_phone, v_form, v_lp, v_data,
    nullif(left(coalesce(p->>'source_path', ''), 300), ''),
    nullif(left(coalesce(p->>'referrer', ''), 300), ''),
    CASE WHEN jsonb_typeof(p->'utm') = 'object' THEN p->'utm' END,
    nullif(left(coalesce(p->>'visitor_id', ''), 64), '')
  )
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.submit_lp_lead(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_lp_lead(jsonb) TO anon, authenticated, service_role;

-- Até 30 eventos por chamada, todos da mesma LP.
CREATE OR REPLACE FUNCTION public.track_lp_events(p_lp uuid, p jsonb)
RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  e jsonb;
  n integer := 0;
  v_type text;
BEGIN
  IF jsonb_typeof(p) <> 'array' OR NOT public.lp_ativa(p_lp) THEN RETURN 0; END IF;
  FOR e IN SELECT * FROM jsonb_array_elements(p) LIMIT 30 LOOP
    v_type := coalesce(e->>'type', '');
    CONTINUE WHEN v_type NOT IN ('visita', 'secao', 'rolagem', 'cta', 'link', 'form_inicio', 'form_envio', 'tempo');
    CONTINUE WHEN coalesce(e->>'visitor_id', '') !~ '^[A-Za-z0-9_-]{8,64}$';
    CONTINUE WHEN coalesce(e->>'session_id', '') !~ '^[A-Za-z0-9_-]{8,64}$';
    INSERT INTO public.lp_events (lp_id, type, label, value, visitor_id, session_id, referrer,
      utm_source, utm_medium, utm_campaign, utm_content, utm_term, device, browser, os, country, region, city)
    VALUES (
      p_lp, v_type,
      nullif(left(coalesce(e->>'label', ''), 200), ''),
      CASE WHEN (e->>'value') ~ '^-?[0-9]+(\.[0-9]+)?$' THEN least((e->>'value')::numeric, 1e9) END,
      e->>'visitor_id', e->>'session_id',
      nullif(left(coalesce(e->>'referrer', ''), 200), ''),
      nullif(left(coalesce(e->>'utm_source', ''), 100), ''),
      nullif(left(coalesce(e->>'utm_medium', ''), 100), ''),
      nullif(left(coalesce(e->>'utm_campaign', ''), 100), ''),
      nullif(left(coalesce(e->>'utm_content', ''), 100), ''),
      nullif(left(coalesce(e->>'utm_term', ''), 100), ''),
      nullif(left(coalesce(e->>'device', ''), 20), ''),
      nullif(left(coalesce(e->>'browser', ''), 40), ''),
      nullif(left(coalesce(e->>'os', ''), 40), ''),
      nullif(left(coalesce(e->>'country', ''), 4), ''),
      nullif(left(coalesce(e->>'region', ''), 80), ''),
      nullif(left(coalesce(e->>'city', ''), 80), '')
    );
    n := n + 1;
  END LOOP;
  RETURN n;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.track_lp_events(uuid, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.track_lp_events(uuid, jsonb) TO anon, authenticated, service_role;

-- Relatório de uma LP num período (roda com as permissões de quem chama).
CREATE OR REPLACE FUNCTION public.lp_relatorio(p_lp uuid, p_from timestamptz, p_to timestamptz)
RETURNS jsonb
LANGUAGE sql STABLE SECURITY INVOKER
SET search_path = public
AS $$
  WITH ev AS (
    SELECT * FROM public.lp_events WHERE lp_id = p_lp AND created_at >= p_from AND created_at < p_to
  ),
  vis AS (SELECT * FROM ev WHERE type = 'visita'),
  ld AS (
    SELECT * FROM public.leads WHERE lp_id = p_lp AND created_at >= p_from AND created_at < p_to
  ),
  sess AS (
    SELECT session_id,
           max(value) FILTER (WHERE type = 'rolagem') AS rolagem,
           max(value) FILTER (WHERE type = 'tempo') AS tempo
      FROM ev GROUP BY session_id
  ),
  nsess AS (SELECT count(DISTINCT session_id) AS n FROM vis)
  SELECT jsonb_build_object(
    'visitas',     (SELECT count(*) FROM vis),
    'visitantes',  (SELECT count(DISTINCT visitor_id) FROM vis),
    'sessoes',     (SELECT n FROM nsess),
    'respostas',   (SELECT count(*) FROM ld),
    'conversao',   (SELECT round(100.0 * (SELECT count(DISTINCT coalesce(visitor_id, id::text)) FROM ld)
                                 / nullif(count(DISTINCT visitor_id), 0), 1) FROM vis),
    'tempo_medio', (SELECT round(avg(tempo)) FROM sess WHERE tempo > 0),
    'rolagem_media', (SELECT round(avg(rolagem)) FROM sess WHERE rolagem IS NOT NULL),
    'cliques',     (SELECT count(*) FROM ev WHERE type IN ('cta', 'link')),
    'diario', (
      SELECT coalesce(jsonb_agg(d ORDER BY d->>'dia'), '[]'::jsonb) FROM (
        SELECT jsonb_build_object(
          'dia', dia,
          'visitantes', coalesce(v.visitantes, 0),
          'respostas', coalesce(r.respostas, 0)
        ) AS d
        FROM (
          SELECT to_char(date_trunc('day', created_at AT TIME ZONE 'America/Sao_Paulo'), 'YYYY-MM-DD') AS dia,
                 count(DISTINCT visitor_id) AS visitantes
            FROM vis GROUP BY 1
        ) v
        FULL JOIN (
          SELECT to_char(date_trunc('day', created_at AT TIME ZONE 'America/Sao_Paulo'), 'YYYY-MM-DD') AS dia,
                 count(*) AS respostas
            FROM ld GROUP BY 1
        ) r USING (dia)
      ) x
    ),
    'secoes', (
      SELECT coalesce(jsonb_agg(s ORDER BY (s->>'ordem')::numeric), '[]'::jsonb) FROM (
        SELECT jsonb_build_object(
          'label', label,
          'ordem', min(value),
          'sessoes', count(DISTINCT session_id),
          'pct', round(100.0 * count(DISTINCT session_id) / nullif((SELECT n FROM nsess), 0), 1)
        ) AS s
        FROM ev WHERE type = 'secao' AND label IS NOT NULL GROUP BY label
      ) x
    ),
    'rolagem', (
      SELECT coalesce(jsonb_agg(r ORDER BY (r->>'marco')::int), '[]'::jsonb) FROM (
        SELECT jsonb_build_object(
          'marco', m,
          'pct', round(100.0 * count(*) FILTER (WHERE rolagem >= m) / nullif((SELECT n FROM nsess), 0), 1)
        ) AS r
        FROM sess CROSS JOIN (VALUES (25), (50), (75), (100)) AS marcos (m)
        GROUP BY m
      ) x
    ),
    'ctas', (
      SELECT coalesce(jsonb_agg(c), '[]'::jsonb) FROM (
        SELECT jsonb_build_object('label', label, 'tipo', type, 'cliques', count(*),
                                  'sessoes', count(DISTINCT session_id)) AS c
          FROM ev WHERE type IN ('cta', 'link') AND label IS NOT NULL
         GROUP BY label, type ORDER BY count(*) DESC LIMIT 20
      ) x
    ),
    'formularios', (
      SELECT coalesce(jsonb_agg(f), '[]'::jsonb) FROM (
        SELECT jsonb_build_object(
          'form', form,
          'inicios', coalesce(i.inicios, 0),
          'respostas', coalesce(r.respostas, 0)
        ) AS f
        FROM (SELECT label AS form, count(DISTINCT session_id) AS inicios
                FROM ev WHERE type = 'form_inicio' AND label IS NOT NULL GROUP BY label) i
        FULL JOIN (SELECT subject AS form, count(*) AS respostas FROM ld GROUP BY subject) r USING (form)
      ) x
    ),
    'origens', (
      SELECT coalesce(jsonb_agg(o), '[]'::jsonb) FROM (
        SELECT jsonb_build_object('label', origem, 'visitantes', count(DISTINCT visitor_id)) AS o
          FROM (SELECT visitor_id,
                       coalesce(nullif(utm_source, ''), nullif(referrer, ''), 'Direto') AS origem
                  FROM vis) v
         GROUP BY origem ORDER BY count(DISTINCT visitor_id) DESC LIMIT 12
      ) x
    ),
    'campanhas', (
      SELECT coalesce(jsonb_agg(c), '[]'::jsonb) FROM (
        SELECT jsonb_build_object(
          'source', coalesce(v.source, '(sem utm)'),
          'medium', v.medium,
          'campaign', v.campaign,
          'visitantes', v.visitantes,
          'respostas', coalesce(r.respostas, 0)
        ) AS c
        FROM (
          SELECT utm_source AS source, utm_medium AS medium, utm_campaign AS campaign,
                 count(DISTINCT visitor_id) AS visitantes
            FROM vis GROUP BY 1, 2, 3
        ) v
        LEFT JOIN (
          SELECT utm->>'utm_source' AS source, utm->>'utm_medium' AS medium,
                 utm->>'utm_campaign' AS campaign, count(*) AS respostas
            FROM ld GROUP BY 1, 2, 3
        ) r ON r.source IS NOT DISTINCT FROM v.source
           AND r.medium IS NOT DISTINCT FROM v.medium
           AND r.campaign IS NOT DISTINCT FROM v.campaign
        ORDER BY v.visitantes DESC LIMIT 15
      ) x
    ),
    'dispositivos', (
      SELECT coalesce(jsonb_agg(d), '[]'::jsonb) FROM (
        SELECT jsonb_build_object('label', coalesce(device, 'desconhecido'), 'value', count(DISTINCT visitor_id)) AS d
          FROM vis GROUP BY device ORDER BY count(DISTINCT visitor_id) DESC
      ) x
    ),
    'cidades', (
      SELECT coalesce(jsonb_agg(c), '[]'::jsonb) FROM (
        SELECT jsonb_build_object('label', concat_ws(', ', city, region), 'value', count(DISTINCT visitor_id)) AS c
          FROM vis WHERE city IS NOT NULL GROUP BY city, region
         ORDER BY count(DISTINCT visitor_id) DESC LIMIT 8
      ) x
    )
  );
$$;
REVOKE EXECUTE ON FUNCTION public.lp_relatorio(uuid, timestamptz, timestamptz) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.lp_relatorio(uuid, timestamptz, timestamptz) TO authenticated;

-- Números resumidos de todas as LPs (para a lista).
CREATE OR REPLACE FUNCTION public.lps_resumo(p_from timestamptz, p_to timestamptz)
RETURNS TABLE (lp_id uuid, visitantes bigint, respostas bigint, cliques bigint)
LANGUAGE sql STABLE SECURITY INVOKER
SET search_path = public
AS $$
  SELECT lp.id,
         (SELECT count(DISTINCT visitor_id) FROM public.lp_events e
           WHERE e.lp_id = lp.id AND e.type = 'visita' AND e.created_at >= p_from AND e.created_at < p_to),
         (SELECT count(*) FROM public.leads l
           WHERE l.lp_id = lp.id AND l.created_at >= p_from AND l.created_at < p_to),
         (SELECT count(*) FROM public.lp_events e
           WHERE e.lp_id = lp.id AND e.type IN ('cta', 'link') AND e.created_at >= p_from AND e.created_at < p_to)
    FROM public.landing_pages lp
$$;
REVOKE EXECUTE ON FUNCTION public.lps_resumo(timestamptz, timestamptz) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.lps_resumo(timestamptz, timestamptz) TO authenticated;

-- Arquivos das LPs (bucket privado) ---------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('lps', 'lps', false, 26214400, ARRAY[
  'text/html', 'text/css', 'text/javascript', 'application/javascript', 'application/json',
  'image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif', 'image/svg+xml', 'image/x-icon',
  'video/mp4', 'video/webm', 'font/woff', 'font/woff2', 'application/pdf'
]);

CREATE POLICY "Equipe lê arquivos das LPs" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'lps' AND public.pode('lps', 'ver'));
CREATE POLICY "Equipe envia arquivos das LPs" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'lps' AND public.pode('lps', 'editar'));
CREATE POLICY "Equipe atualiza arquivos das LPs" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'lps' AND public.pode('lps', 'editar'));
CREATE POLICY "Equipe apaga arquivos das LPs" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'lps' AND public.pode('lps', 'editar'));
