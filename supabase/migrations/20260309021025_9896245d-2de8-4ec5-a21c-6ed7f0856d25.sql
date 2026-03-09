
-- Trigger: on insert, shift all existing news display_order up by 1, set new one to 0
-- Then delete oldest news if count exceeds 15
CREATE OR REPLACE FUNCTION public.handle_new_news()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Push all existing news down by 1
  UPDATE public.news SET display_order = display_order + 1 WHERE id != NEW.id;
  -- Set the new news to position 0 (first)
  NEW.display_order := 0;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.cleanup_old_news()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete news beyond the 15th position (ordered by display_order)
  DELETE FROM public.news
  WHERE id IN (
    SELECT id FROM public.news
    ORDER BY display_order ASC, published_at DESC
    OFFSET 15
  );
  RETURN NULL;
END;
$$;

-- Before insert: shift orders
CREATE TRIGGER on_news_insert_reorder
  BEFORE INSERT ON public.news
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_news();

-- After insert: cleanup excess
CREATE TRIGGER on_news_insert_cleanup
  AFTER INSERT ON public.news
  FOR EACH ROW
  EXECUTE FUNCTION public.cleanup_old_news();
