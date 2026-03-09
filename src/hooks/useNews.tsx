import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type NewsRow = Tables<"news">;

export const useNews = (limit?: number) => {
  return useQuery({
    queryKey: ["news", limit],
    queryFn: async () => {
      let query = supabase
        .from("news")
        .select("*")
        .order("display_order", { ascending: true })
        .order("published_at", { ascending: false });

      if (limit) query = query.limit(limit);

      const { data, error } = await query;
      if (error) throw error;
      return data as NewsRow[];
    },
  });
};

export const useCreateNews = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (news: TablesInsert<"news">) => {
      // display_order is auto-set to 0 by DB trigger; existing news shifts down automatically
      const { display_order, ...rest } = news as any;
      const { data, error } = await supabase.from("news").insert(rest).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["news"] }),
  });
};

export const useUpdateNews = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<"news"> & { id: string }) => {
      const { data, error } = await supabase.from("news").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["news"] }),
  });
};

export const useReorderNews = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (items: { id: string; display_order: number }[]) => {
      const promises = items.map((item) =>
        supabase.from("news").update({ display_order: item.display_order }).eq("id", item.id)
      );
      const results = await Promise.all(promises);
      const error = results.find((r) => r.error)?.error;
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["news"] }),
  });
};

export const useDeleteNews = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("news").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["news"] }),
  });
};
