
INSERT INTO storage.buckets (id, name, public)
VALUES ('news-images', 'news-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view news images"
ON storage.objects FOR SELECT
USING (bucket_id = 'news-images');

CREATE POLICY "Authenticated users can upload news images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'news-images');

CREATE POLICY "Authenticated users can delete their news images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'news-images');
