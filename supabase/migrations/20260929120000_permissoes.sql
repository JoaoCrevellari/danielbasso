-- ─────────────────────────────────────────────────────────────────────────────
-- Permissões por módulo e convites de uso único
--
--   • Administrador (user_roles.role = 'admin') pode tudo, inclusive gerenciar usuários.
--   • Membro da equipe (role = 'editor') faz só o que estiver em staff_profiles.permissoes:
--       { "conteudo": ["ver", "editar", "apagar"], "leads": ["ver"], … }
--     Módulos: painel, leads, diagnostico, conteudo, paginas, midia, configuracoes, lps.
--     Ações: ver, editar (criar e alterar), apagar.
--   • public.pode(modulo, acao) é a regra única: as políticas de RLS usam essa função,
--     então a permissão vale no banco, não só na tela.
--   • Convites: o link leva um token aleatório; aqui fica só o hash (sha256). Uso único,
--     com validade. Quem aceita é tratado no servidor com a chave de serviço.
-- ─────────────────────────────────────────────────────────────────────────────

-- Perfil da equipe ----------------------------------------------------------------
CREATE TABLE public.staff_profiles (
  user_id    uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  nome       text NOT NULL CHECK (length(trim(nome)) BETWEEN 2 AND 120),
  cargo      text CHECK (cargo IS NULL OR length(cargo) <= 120),
  permissoes jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(permissoes) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users (id) ON DELETE SET NULL
);
CREATE TRIGGER staff_profiles_updated_at BEFORE UPDATE ON public.staff_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.staff_profiles ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.staff_profiles TO authenticated;
GRANT ALL ON public.staff_profiles TO service_role;

-- Regra única de permissão ---------------------------------------------------------
CREATE OR REPLACE FUNCTION public.pode(_modulo text, _acao text)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
           SELECT 1 FROM public.user_roles
            WHERE user_id = (SELECT auth.uid()) AND role = 'admin'
         )
      OR EXISTS (
           SELECT 1
             FROM public.user_roles r
             JOIN public.staff_profiles p ON p.user_id = r.user_id
            WHERE r.user_id = (SELECT auth.uid())
              AND r.role = 'editor'
              AND jsonb_typeof(p.permissoes -> _modulo) = 'array'
              AND (p.permissoes -> _modulo) ? _acao
         )
$$;
REVOKE EXECUTE ON FUNCTION public.pode(text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.pode(text, text) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.eh_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = (SELECT auth.uid()) AND role = 'admin'
  )
$$;
REVOKE EXECUTE ON FUNCTION public.eh_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.eh_admin() TO authenticated, service_role;

-- A que módulo pertence cada chave de site_content e cada tipo de lead.
CREATE OR REPLACE FUNCTION public.modulo_do_texto(_key text)
RETURNS text LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT CASE _key WHEN 'settings' THEN 'configuracoes'
                   WHEN 'diagnostico' THEN 'diagnostico'
                   ELSE 'paginas' END
$$;

CREATE OR REPLACE FUNCTION public.modulo_do_lead(_kind text)
RETURNS text LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT CASE _kind WHEN 'diagnostico' THEN 'diagnostico'
                    WHEN 'lp' THEN 'lps'
                    ELSE 'leads' END
$$;

-- Perfis: cada um lê o próprio; o administrador lê e gerencia todos.
CREATE POLICY "Lê o próprio perfil" ON public.staff_profiles
  FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()) OR public.eh_admin());
CREATE POLICY "Admin gerencia perfis" ON public.staff_profiles
  FOR ALL TO authenticated USING (public.eh_admin()) WITH CHECK (public.eh_admin());

-- Conteúdo ---------------------------------------------------------------------------
DROP POLICY "Equipe lê tudo" ON public.content_items;
DROP POLICY "Equipe cria" ON public.content_items;
DROP POLICY "Equipe edita" ON public.content_items;
DROP POLICY "Equipe exclui" ON public.content_items;
CREATE POLICY "Equipe lê tudo" ON public.content_items
  FOR SELECT TO authenticated USING (public.pode('conteudo', 'ver'));
CREATE POLICY "Equipe cria" ON public.content_items
  FOR INSERT TO authenticated WITH CHECK (public.pode('conteudo', 'editar'));
CREATE POLICY "Equipe edita" ON public.content_items
  FOR UPDATE TO authenticated
  USING (public.pode('conteudo', 'editar')) WITH CHECK (public.pode('conteudo', 'editar'));
CREATE POLICY "Equipe exclui" ON public.content_items
  FOR DELETE TO authenticated USING (public.pode('conteudo', 'apagar'));

-- Textos das páginas, configurações e questionário do diagnóstico ---------------------
DROP POLICY "Equipe cria textos" ON public.site_content;
DROP POLICY "Equipe edita textos" ON public.site_content;
DROP POLICY "Admin exclui textos" ON public.site_content;
CREATE POLICY "Equipe cria textos" ON public.site_content
  FOR INSERT TO authenticated WITH CHECK (public.pode(public.modulo_do_texto(key), 'editar'));
CREATE POLICY "Equipe edita textos" ON public.site_content
  FOR UPDATE TO authenticated
  USING (public.pode(public.modulo_do_texto(key), 'editar'))
  WITH CHECK (public.pode(public.modulo_do_texto(key), 'editar'));
CREATE POLICY "Equipe exclui textos" ON public.site_content
  FOR DELETE TO authenticated USING (public.pode(public.modulo_do_texto(key), 'apagar'));

-- Leads ---------------------------------------------------------------------------
DROP POLICY "Equipe lê leads" ON public.leads;
DROP POLICY "Equipe atualiza leads" ON public.leads;
DROP POLICY "Admin exclui leads" ON public.leads;
CREATE POLICY "Equipe lê leads" ON public.leads
  FOR SELECT TO authenticated USING (public.pode(public.modulo_do_lead(kind), 'ver'));
CREATE POLICY "Equipe atualiza leads" ON public.leads
  FOR UPDATE TO authenticated
  USING (public.pode(public.modulo_do_lead(kind), 'editar'))
  WITH CHECK (public.pode(public.modulo_do_lead(kind), 'editar'));
CREATE POLICY "Equipe exclui leads" ON public.leads
  FOR DELETE TO authenticated USING (public.pode(public.modulo_do_lead(kind), 'apagar'));

-- Analytics do site -----------------------------------------------------------------
DROP POLICY "Equipe lê analytics" ON public.analytics_events;
CREATE POLICY "Equipe lê analytics" ON public.analytics_events
  FOR SELECT TO authenticated USING (public.pode('painel', 'ver'));

-- Mídia: quem edita conteúdo, páginas, configurações ou LPs também envia imagens.
CREATE OR REPLACE FUNCTION public.pode_enviar_midia()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.pode('midia', 'editar') OR public.pode('conteudo', 'editar')
      OR public.pode('paginas', 'editar') OR public.pode('configuracoes', 'editar')
      OR public.pode('diagnostico', 'editar') OR public.pode('lps', 'editar')
$$;
REVOKE EXECUTE ON FUNCTION public.pode_enviar_midia() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.pode_enviar_midia() TO authenticated, service_role;

DROP POLICY "Equipe lista mídia" ON storage.objects;
DROP POLICY "Equipe envia mídia" ON storage.objects;
DROP POLICY "Equipe atualiza mídia" ON storage.objects;
DROP POLICY "Equipe exclui mídia" ON storage.objects;
CREATE POLICY "Equipe lista mídia" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'media' AND (public.pode('midia', 'ver') OR public.pode_enviar_midia()));
CREATE POLICY "Equipe envia mídia" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'media' AND public.pode_enviar_midia());
CREATE POLICY "Equipe atualiza mídia" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'media' AND public.pode_enviar_midia());
CREATE POLICY "Equipe exclui mídia" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'media' AND public.pode('midia', 'apagar'));

-- Convites de uso único -------------------------------------------------------------
CREATE TABLE public.staff_invites (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash  text NOT NULL UNIQUE CHECK (token_hash ~ '^[0-9a-f]{64}$'),
  email       text NOT NULL CHECK (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  nome        text NOT NULL CHECK (length(trim(nome)) BETWEEN 2 AND 120),
  cargo       text CHECK (cargo IS NULL OR length(cargo) <= 120),
  admin       boolean NOT NULL DEFAULT false,
  permissoes  jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(permissoes) = 'object'),
  created_by  uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  expires_at  timestamptz NOT NULL DEFAULT now() + interval '7 days',
  used_at     timestamptz,
  used_by     uuid REFERENCES auth.users (id) ON DELETE SET NULL
);
CREATE INDEX staff_invites_pendentes_idx ON public.staff_invites (created_at DESC) WHERE used_at IS NULL;

ALTER TABLE public.staff_invites ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.staff_invites TO authenticated;
GRANT ALL ON public.staff_invites TO service_role;
CREATE POLICY "Admin gerencia convites" ON public.staff_invites
  FOR ALL TO authenticated USING (public.eh_admin()) WITH CHECK (public.eh_admin());
