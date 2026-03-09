
-- Sponsor/ad placements enum
CREATE TYPE public.ad_placement AS ENUM (
  'home_after_news',
  'home_after_programming',
  'home_after_articles',
  'news_top',
  'news_inline',
  'articles_top',
  'articles_inline',
  'detail_after_content',
  'assistant_sidebar',
  'global_leaderboard'
);

-- Sponsors table
CREATE TABLE public.sponsors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  image_url TEXT NOT NULL,
  link_url TEXT NOT NULL DEFAULT '#',
  placement ad_placement NOT NULL DEFAULT 'home_after_news',
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  cta_text TEXT NOT NULL DEFAULT 'Conocer más',
  badge_text TEXT DEFAULT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;

-- Anyone can read active sponsors
CREATE POLICY "Sponsors are publicly readable"
  ON public.sponsors FOR SELECT
  USING (true);

-- Only admins can insert/update/delete
CREATE POLICY "Admins can manage sponsors"
  ON public.sponsors FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Storage bucket for sponsor images
INSERT INTO storage.buckets (id, name, public) VALUES ('sponsor-images', 'sponsor-images', true)
ON CONFLICT (id) DO NOTHING;

-- Public read access for sponsor images
CREATE POLICY "Public can read sponsor images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'sponsor-images');

-- Admins can upload sponsor images
CREATE POLICY "Admins can upload sponsor images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'sponsor-images' AND public.has_role(auth.uid(), 'admin'));

-- Admins can delete sponsor images
CREATE POLICY "Admins can delete sponsor images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'sponsor-images' AND public.has_role(auth.uid(), 'admin'));
