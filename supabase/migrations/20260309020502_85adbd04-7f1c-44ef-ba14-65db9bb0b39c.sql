
-- Add display_order column for drag-and-drop reordering
ALTER TABLE public.news ADD COLUMN display_order integer NOT NULL DEFAULT 0;

-- Allow authenticated users to update news
CREATE POLICY "Authenticated users can update news"
ON public.news
FOR UPDATE
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);
