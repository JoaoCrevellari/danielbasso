-- ─────────────────────────────────────────────────────────────────────────────
-- Base do site Daniel Basso · Desenvolvimento Humano
--
-- Modelo pensado para crescer sem migração:
--   • content_items  → toda coleção (post, curso, mentoria, treinamento, livro,
--                      depoimento…). Campos próprios de cada coleção vão em `data`
--                      (jsonb) e são descritos no código (src/content/collections.ts).
--   • site_content   → textos editáveis das páginas fixas, configurações e o
--                      questionário do diagnóstico (chave → jsonb).
--   • leads          → tudo que o visitante envia (contato, interesse, proposta
--                      corporativa, diagnóstico).
--   • analytics_events → navegação anônima (sem IP, sem cookie de terceiros).
--
-- Escritas públicas (leads, analytics) passam pelo servidor com a service_role;
-- o visitante anônimo não tem acesso direto a nenhuma tabela de escrita.
-- ─────────────────────────────────────────────────────────────────────────────

-- Papéis ---------------------------------------------------------------------
CREATE TYPE public.app_role AS ENUM ('admin', 'editor');

CREATE TABLE public.user_roles (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  role       public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = (SELECT auth.uid()) AND role IN ('admin', 'editor')
  )
$$;
REVOKE EXECUTE ON FUNCTION public.is_staff() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_staff() TO authenticated, service_role;

CREATE POLICY "Usuário vê os próprios papéis" ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));
CREATE POLICY "Admin gerencia papéis" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role((SELECT auth.uid()), 'admin'))
  WITH CHECK (public.has_role((SELECT auth.uid()), 'admin'));

-- updated_at automático --------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Conteúdo ---------------------------------------------------------------------
CREATE TABLE public.content_items (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection      text NOT NULL,
  slug            text NOT NULL,
  title           text NOT NULL,
  subtitle        text,
  excerpt         text,
  body            text,
  cover_url       text,
  status          text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  featured        boolean NOT NULL DEFAULT false,
  sort_order      integer NOT NULL DEFAULT 0,
  data            jsonb NOT NULL DEFAULT '{}'::jsonb,
  seo_title       text,
  seo_description text,
  published_at    timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  updated_by      uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  UNIQUE (collection, slug),
  CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);
CREATE INDEX content_items_listing_idx
  ON public.content_items (collection, status, sort_order, published_at DESC);
CREATE TRIGGER content_items_updated_at BEFORE UPDATE ON public.content_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.content_items TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.content_items TO authenticated;
GRANT ALL ON public.content_items TO service_role;

CREATE POLICY "Público lê conteúdo publicado" ON public.content_items
  FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "Equipe lê tudo" ON public.content_items
  FOR SELECT TO authenticated USING (public.is_staff());
CREATE POLICY "Equipe cria" ON public.content_items
  FOR INSERT TO authenticated WITH CHECK (public.is_staff());
CREATE POLICY "Equipe edita" ON public.content_items
  FOR UPDATE TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE POLICY "Equipe exclui" ON public.content_items
  FOR DELETE TO authenticated USING (public.is_staff());

-- Textos das páginas e configurações -------------------------------------------------
CREATE TABLE public.site_content (
  key        text PRIMARY KEY,
  data       jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users (id) ON DELETE SET NULL
);
CREATE TRIGGER site_content_updated_at BEFORE UPDATE ON public.site_content
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.site_content TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.site_content TO authenticated;
GRANT ALL ON public.site_content TO service_role;

CREATE POLICY "Público lê textos" ON public.site_content
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Equipe cria textos" ON public.site_content
  FOR INSERT TO authenticated WITH CHECK (public.is_staff());
CREATE POLICY "Equipe edita textos" ON public.site_content
  FOR UPDATE TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE POLICY "Admin exclui textos" ON public.site_content
  FOR DELETE TO authenticated USING (public.has_role((SELECT auth.uid()), 'admin'));

-- Leads ------------------------------------------------------------------------
CREATE TABLE public.leads (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind        text NOT NULL,          -- contato | interesse | corporativo | diagnostico
  name        text NOT NULL,
  email       text,
  phone       text,
  company     text,
  message     text,
  subject     text,                   -- título do item de interesse, assunto etc.
  item_id     uuid REFERENCES public.content_items (id) ON DELETE SET NULL,
  data        jsonb NOT NULL DEFAULT '{}'::jsonb,
  status      text NOT NULL DEFAULT 'novo'
              CHECK (status IN ('novo', 'em_contato', 'convertido', 'arquivado')),
  notes       text,
  source_path text,
  referrer    text,
  utm         jsonb,
  visitor_id  text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  CHECK (email IS NOT NULL OR phone IS NOT NULL)
);
CREATE INDEX leads_created_idx ON public.leads (created_at DESC);
CREATE INDEX leads_kind_status_idx ON public.leads (kind, status);
CREATE INDEX leads_item_idx ON public.leads (item_id);
CREATE TRIGGER leads_updated_at BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
GRANT SELECT, UPDATE, DELETE ON public.leads TO authenticated;
GRANT ALL ON public.leads TO service_role;

CREATE POLICY "Equipe lê leads" ON public.leads
  FOR SELECT TO authenticated USING (public.is_staff());
CREATE POLICY "Equipe atualiza leads" ON public.leads
  FOR UPDATE TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE POLICY "Admin exclui leads" ON public.leads
  FOR DELETE TO authenticated USING (public.has_role((SELECT auth.uid()), 'admin'));

-- Analytics --------------------------------------------------------------------
CREATE TABLE public.analytics_events (
  id           bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at   timestamptz NOT NULL DEFAULT now(),
  type         text NOT NULL,         -- pageview | whatsapp | cta | lead | diagnostico_inicio …
  path         text NOT NULL,
  label        text,
  value        numeric,
  visitor_id   text NOT NULL,
  session_id   text NOT NULL,
  referrer     text,                  -- só o host de origem
  utm_source   text,
  utm_medium   text,
  utm_campaign text,
  device       text,                  -- mobile | tablet | desktop
  browser      text,
  os           text,
  country      text,
  region       text,
  city         text
);
CREATE INDEX analytics_events_created_idx ON public.analytics_events (created_at DESC);
CREATE INDEX analytics_events_type_created_idx ON public.analytics_events (type, created_at DESC);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.analytics_events TO authenticated;
GRANT ALL ON public.analytics_events TO service_role;

CREATE POLICY "Equipe lê analytics" ON public.analytics_events
  FOR SELECT TO authenticated USING (public.is_staff());

-- Painel: resumo de navegação num período (roda com as permissões de quem chama).
CREATE OR REPLACE FUNCTION public.analytics_overview(p_from timestamptz, p_to timestamptz)
RETURNS jsonb
LANGUAGE sql STABLE SECURITY INVOKER
SET search_path = public
AS $$
  WITH ev AS (
    SELECT * FROM public.analytics_events WHERE created_at >= p_from AND created_at < p_to
  ),
  pv AS (SELECT * FROM ev WHERE type = 'pageview'),
  sess AS (
    SELECT session_id, count(*) AS views,
           extract(epoch FROM max(created_at) - min(created_at)) AS dur
    FROM pv GROUP BY session_id
  )
  SELECT jsonb_build_object(
    'pageviews', (SELECT count(*) FROM pv),
    'visitors',  (SELECT count(DISTINCT visitor_id) FROM pv),
    'sessions',  (SELECT count(*) FROM sess),
    'bounce',    (SELECT round(100.0 * count(*) FILTER (WHERE views = 1) / nullif(count(*), 0), 1) FROM sess),
    'avg_duration', (SELECT round(avg(dur)) FROM sess WHERE views > 1),
    'leads',     (SELECT count(*) FROM public.leads WHERE created_at >= p_from AND created_at < p_to),
    'daily', (
      SELECT coalesce(jsonb_agg(d ORDER BY d->>'day'), '[]'::jsonb) FROM (
        SELECT jsonb_build_object(
          'day', to_char(date_trunc('day', created_at AT TIME ZONE 'America/Sao_Paulo'), 'YYYY-MM-DD'),
          'pageviews', count(*),
          'visitors', count(DISTINCT visitor_id)
        ) AS d
        FROM pv GROUP BY date_trunc('day', created_at AT TIME ZONE 'America/Sao_Paulo')
      ) x
    ),
    'pages', (
      SELECT coalesce(jsonb_agg(p), '[]'::jsonb) FROM (
        SELECT jsonb_build_object('label', path, 'value', count(*), 'visitors', count(DISTINCT visitor_id)) AS p
        FROM pv GROUP BY path ORDER BY count(*) DESC LIMIT 12
      ) x
    ),
    'referrers', (
      SELECT coalesce(jsonb_agg(p), '[]'::jsonb) FROM (
        SELECT jsonb_build_object('label', origem, 'value', count(DISTINCT session_id)) AS p
        FROM (SELECT session_id, coalesce(nullif(utm_source, ''), nullif(referrer, ''), 'Direto') AS origem FROM pv) o
        GROUP BY origem ORDER BY count(DISTINCT session_id) DESC LIMIT 10
      ) x
    ),
    'devices', (
      SELECT coalesce(jsonb_agg(p), '[]'::jsonb) FROM (
        SELECT jsonb_build_object('label', coalesce(device, 'desconhecido'), 'value', count(DISTINCT visitor_id)) AS p
        FROM pv GROUP BY device ORDER BY count(DISTINCT visitor_id) DESC
      ) x
    ),
    'cities', (
      SELECT coalesce(jsonb_agg(p), '[]'::jsonb) FROM (
        SELECT jsonb_build_object('label', concat_ws(', ', city, region), 'value', count(DISTINCT visitor_id)) AS p
        FROM pv WHERE city IS NOT NULL GROUP BY city, region ORDER BY count(DISTINCT visitor_id) DESC LIMIT 8
      ) x
    ),
    'events', (
      SELECT coalesce(jsonb_agg(p), '[]'::jsonb) FROM (
        SELECT jsonb_build_object('label', type, 'value', count(*)) AS p
        FROM ev WHERE type <> 'pageview' GROUP BY type ORDER BY count(*) DESC
      ) x
    ),
    'ctas', (
      SELECT coalesce(jsonb_agg(p), '[]'::jsonb) FROM (
        SELECT jsonb_build_object('label', rotulo, 'type', type, 'value', count(*)) AS p
        FROM (SELECT type, coalesce(label, type) AS rotulo FROM ev WHERE type IN ('whatsapp', 'cta')) c
        GROUP BY rotulo, type ORDER BY count(*) DESC LIMIT 10
      ) x
    )
  );
$$;
REVOKE EXECUTE ON FUNCTION public.analytics_overview(timestamptz, timestamptz) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.analytics_overview(timestamptz, timestamptz) TO authenticated;

-- Mídia (bucket público de leitura; só a equipe envia) --------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('media', 'media', true, 10485760,
        ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif', 'image/svg+xml', 'application/pdf']);

CREATE POLICY "Equipe lista mídia" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'media' AND public.is_staff());
CREATE POLICY "Equipe envia mídia" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'media' AND public.is_staff());
CREATE POLICY "Equipe atualiza mídia" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'media' AND public.is_staff());
CREATE POLICY "Equipe exclui mídia" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'media' AND public.is_staff());
