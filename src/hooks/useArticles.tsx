import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ArticleRow {
  id: string;
  title: string;
  tag: string;
  icon: string;
  description: string;
  content: string | null;
  image_url: string | null;
  author: string;
  display_order: number;
  created_by: string | null;
  created_at: string;
  published_at: string;
}

type ArticleInsert = Omit<ArticleRow, "id" | "created_at" | "published_at" | "display_order">;
type ArticleUpdate = Partial<ArticleInsert> & { id: string };

export const useArticles = (limit?: number) => {
  return useQuery({
    queryKey: ["articles", limit],
    queryFn: async () => {
      let query = supabase
        .from("articles")
        .select("*")
        .order("display_order", { ascending: true })
        .order("published_at", { ascending: false });

      if (limit) query = query.limit(limit);

      const { data, error } = await query;
      if (error) throw error;
      return data as ArticleRow[];
    },
  });
};

export const useCreateArticle = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (article: ArticleInsert) => {
      const { data, error } = await supabase.from("articles").insert(article).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["articles"] }),
  });
};

export const useUpdateArticle = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: ArticleUpdate) => {
      const { data, error } = await supabase.from("articles").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["articles"] }),
  });
};

export const useDeleteArticle = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("articles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["articles"] }),
  });
};

export const useReorderArticles = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (items: { id: string; display_order: number }[]) => {
      const promises = items.map((item) =>
        supabase.from("articles").update({ display_order: item.display_order }).eq("id", item.id)
      );
      const results = await Promise.all(promises);
      const error = results.find((r) => r.error)?.error;
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["articles"] }),
  });
};
