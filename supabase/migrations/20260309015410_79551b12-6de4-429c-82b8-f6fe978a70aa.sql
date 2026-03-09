
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS content text;
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS author text NOT NULL DEFAULT 'Redacción Ganaderia.TV';
