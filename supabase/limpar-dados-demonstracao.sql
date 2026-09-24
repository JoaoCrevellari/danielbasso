-- Remove os dados de DEMONSTRAÇÃO criados para a apresentação do painel.
-- Rodar antes do lançamento (Supabase → SQL Editor). Não toca em dados reais.
--   • analytics: visitantes simulados têm visitor_id começando com "exemplo-"
--   • leads: os de exemplo têm data.exemplo = true
DELETE FROM public.analytics_events WHERE visitor_id LIKE 'exemplo-%';
DELETE FROM public.leads WHERE data->>'exemplo' = 'true';
