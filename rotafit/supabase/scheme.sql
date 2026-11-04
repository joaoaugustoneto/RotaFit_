-- RotaFit: esquema do banco (execute no SQL Editor do Supabase)
CREATE TABLE public.runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users (id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ NOT NULL,
  distance_meters NUMERIC(10, 2) NOT NULL CHECK (distance_meters >= 0),
  duration_seconds INT NOT NULL CHECK (duration_seconds > 0),
  avg_pace_sec_per_km NUMERIC(8, 2) CHECK (avg_pace_sec_per_km IS NULL OR avg_pace_sec_per_km > 0),
  -- Rota como uma lista de pontos [{lat, lng, t}], já simplificada no app.
  route JSONB NOT NULL DEFAULT '[]'::jsonb,
  spotify_track_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ended_after_started CHECK (ended_at >= started_at)
);

CREATE INDEX runs_user_idx ON public.runs (user_id, started_at DESC);

ALTER TABLE public.runs ENABLE ROW LEVEL SECURITY;

-- Cada usuário só lê, cria, atualiza e apaga as PRÓPRIAS corridas.
-- O próprio dono pode escrever direto, desde que os dados sejam dele (user_id = auth.uid()).
CREATE POLICY "Corridas: ler as próprias"
  ON public.runs FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Corridas: criar como dono"
  ON public.runs FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Corridas: apagar as próprias"
  ON public.runs FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);

GRANT SELECT, INSERT, DELETE ON public.runs TO authenticated;

-- Estatísticas da semana: total percorrido, tempo total e número de corridas.
-- security invoker (padrão): roda com os direitos de quem chama, então o RLS
-- de "runs" já filtra sozinho — a função só soma o que a política deixa ver.
CREATE OR REPLACE FUNCTION public.weekly_stats()
RETURNS TABLE (total_distance_meters NUMERIC, total_duration_seconds BIGINT, run_count BIGINT)
LANGUAGE sql
STABLE
AS $$
  SELECT
    COALESCE(SUM(distance_meters), 0),
    COALESCE(SUM(duration_seconds), 0),
    COUNT(*)
  FROM public.runs
  WHERE started_at >= date_trunc('week', now());
$$;

REVOKE ALL ON FUNCTION public.weekly_stats() FROM public;
GRANT EXECUTE ON FUNCTION public.weekly_stats() TO authenticated;