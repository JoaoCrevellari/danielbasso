-- Onde um arquivo da mídia está em uso (antes de excluir): itens de conteúdo (capa, texto e
-- campos extras) e textos das páginas/configurações. Procura o caminho do arquivo no bucket.
-- SECURITY DEFINER para enxergar todo o conteúdo, mas só responde a quem pode ver a mídia,
-- e devolve apenas onde o arquivo aparece (título e link do painel), nada do conteúdo.
CREATE OR REPLACE FUNCTION public.midia_em_uso(p_caminho text)
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.pode('midia', 'ver') THEN RAISE EXCEPTION 'sem permissão'; END IF;
  IF length(coalesce(p_caminho, '')) < 3 THEN RETURN '[]'::jsonb; END IF;
  RETURN (
    SELECT coalesce(jsonb_agg(u), '[]'::jsonb) FROM (
      SELECT jsonb_build_object('tipo', 'conteudo', 'colecao', collection, 'id', id, 'titulo', title) AS u
        FROM public.content_items
       WHERE position(p_caminho IN coalesce(cover_url, '') || ' ' || coalesce(body, '') || ' ' || data::text) > 0
      UNION ALL
      SELECT jsonb_build_object('tipo', 'pagina', 'chave', key, 'titulo', key)
        FROM public.site_content
       WHERE position(p_caminho IN data::text) > 0
    ) x
  );
END;
$$;
REVOKE EXECUTE ON FUNCTION public.midia_em_uso(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.midia_em_uso(text) TO authenticated;
