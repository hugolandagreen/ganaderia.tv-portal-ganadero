
CREATE TABLE public.news (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'global',
  country TEXT NOT NULL DEFAULT 'México',
  flag TEXT NOT NULL DEFAULT '🌍',
  image_url TEXT NOT NULL DEFAULT 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=600&h=350&fit=crop',
  summary TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  published_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

CREATE POLICY "News is publicly readable"
  ON public.news FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create news"
  ON public.news FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Creators can delete their news"
  ON public.news FOR DELETE USING (auth.uid() = created_by);

CREATE INDEX idx_news_published_at ON public.news (published_at DESC);
