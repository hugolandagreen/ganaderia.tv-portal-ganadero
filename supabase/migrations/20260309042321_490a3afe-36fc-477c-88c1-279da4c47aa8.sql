
-- Create articles table
CREATE TABLE public.articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  tag TEXT NOT NULL DEFAULT 'General',
  icon TEXT NOT NULL DEFAULT 'BookOpen',
  description TEXT NOT NULL DEFAULT '',
  content TEXT,
  image_url TEXT,
  author TEXT NOT NULL DEFAULT 'Redacción Ganaderia.TV',
  display_order INTEGER NOT NULL DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  published_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Articles are publicly readable"
  ON public.articles FOR SELECT
  USING (true);

-- Authenticated can create
CREATE POLICY "Authenticated users can create articles"
  ON public.articles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- Authenticated can update
CREATE POLICY "Authenticated users can update articles"
  ON public.articles FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Creators can delete
CREATE POLICY "Creators can delete their articles"
  ON public.articles FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);
