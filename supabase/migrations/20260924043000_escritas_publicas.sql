-- has_role só responde sobre o próprio usuário (evita sondar papéis de terceiros).
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT _user_id = (SELECT auth.uid())
     AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- Escritas públicas: o visitante não grava direto nas tabelas. O servidor do site
-- chama estas funções com a chave pública; elas validam e limitam cada campo.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.submit_lead(p jsonb)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id    uuid;
  v_kind  text := left(trim(coalesce(p->>'kind', '')), 40);
  v_name  text := left(trim(coalesce(p->>'name', '')), 160);
  v_email text := nullif(lower(left(trim(coalesce(p->>'email', '')), 200)), '');
  v_phone text := nullif(left(regexp_replace(coalesce(p->>'phone', ''), '[^0-9+() -]', '', 'g'), 40), '');
  v_item  uuid;
BEGIN
  IF v_kind NOT IN ('contato', 'interesse', 'corporativo', 'diagnostico') THEN
    RAISE EXCEPTION 'tipo inválido';
  END IF;
  IF length(v_name) < 2 THEN RAISE EXCEPTION 'nome obrigatório'; END IF;
  IF v_email IS NULL AND v_phone IS NULL THEN RAISE EXCEPTION 'contato obrigatório'; END IF;
  IF v_email IS NOT NULL AND v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN
    RAISE EXCEPTION 'e-mail inválido';
  END IF;
  IF pg_column_size(p) > 32000 THEN RAISE EXCEPTION 'envio grande demais'; END IF;

  -- Só referencia itens publicados.
  IF p ? 'item_id' AND (p->>'item_id') ~ '^[0-9a-f-]{36}$' THEN
    SELECT id INTO v_item FROM public.content_items
     WHERE id = (p->>'item_id')::uuid AND status = 'published';
  END IF;

  INSERT INTO public.leads (kind, name, email, phone, company, message, subject, item_id, data,
                            source_path, referrer, utm, visitor_id)
  VALUES (
    v_kind, v_name, v_email, v_phone,
    nullif(left(trim(coalesce(p->>'company', '')), 160), ''),
    nullif(left(trim(coalesce(p->>'message', '')), 5000), ''),
    nullif(left(trim(coalesce(p->>'subject', '')), 200), ''),
    v_item,
    CASE WHEN jsonb_typeof(p->'data') = 'object' THEN p->'data' ELSE '{}'::jsonb END,
    nullif(left(coalesce(p->>'source_path', ''), 300), ''),
    nullif(left(coalesce(p->>'referrer', ''), 300), ''),
    CASE WHEN jsonb_typeof(p->'utm') = 'object' THEN p->'utm' END,
    nullif(left(coalesce(p->>'visitor_id', ''), 64), '')
  )
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.submit_lead(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_lead(jsonb) TO anon, authenticated, service_role;

-- Registra até 20 eventos de navegação por chamada.
CREATE OR REPLACE FUNCTION public.track_events(p jsonb)
RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  e jsonb;
  n integer := 0;
  v_type text;
BEGIN
  IF jsonb_typeof(p) <> 'array' THEN RETURN 0; END IF;
  FOR e IN SELECT * FROM jsonb_array_elements(p) LIMIT 20 LOOP
    v_type := left(coalesce(e->>'type', ''), 40);
    CONTINUE WHEN v_type !~ '^[a-z_]{2,40}$';
    CONTINUE WHEN coalesce(e->>'visitor_id', '') !~ '^[A-Za-z0-9_-]{8,64}$';
    CONTINUE WHEN coalesce(e->>'session_id', '') !~ '^[A-Za-z0-9_-]{8,64}$';
    INSERT INTO public.analytics_events (type, path, label, value, visitor_id, session_id, referrer,
      utm_source, utm_medium, utm_campaign, device, browser, os, country, region, city)
    VALUES (
      v_type,
      left(coalesce(e->>'path', '/'), 300),
      nullif(left(coalesce(e->>'label', ''), 200), ''),
      CASE WHEN (e->>'value') ~ '^-?[0-9]+(\.[0-9]+)?$' THEN (e->>'value')::numeric END,
      e->>'visitor_id', e->>'session_id',
      nullif(left(coalesce(e->>'referrer', ''), 200), ''),
      nullif(left(coalesce(e->>'utm_source', ''), 100), ''),
      nullif(left(coalesce(e->>'utm_medium', ''), 100), ''),
      nullif(left(coalesce(e->>'utm_campaign', ''), 100), ''),
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
REVOKE EXECUTE ON FUNCTION public.track_events(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.track_events(jsonb) TO anon, authenticated, service_role;
