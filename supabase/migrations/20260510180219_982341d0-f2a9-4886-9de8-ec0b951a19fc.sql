ALTER TABLE public.produtos ADD COLUMN IF NOT EXISTS ordem integer NOT NULL DEFAULT 0;

WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY mes ORDER BY created_at ASC) AS rn
  FROM public.produtos
)
UPDATE public.produtos p SET ordem = ranked.rn
FROM ranked WHERE p.id = ranked.id AND p.ordem = 0;

CREATE INDEX IF NOT EXISTS idx_produtos_mes_ordem ON public.produtos (mes, ordem, created_at);