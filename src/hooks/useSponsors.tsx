import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type AdPlacement =
  | "home_after_news"
  | "home_after_programming"
  | "home_after_articles"
  | "news_top"
  | "news_inline"
  | "articles_top"
  | "articles_inline"
  | "detail_after_content"
  | "assistant_sidebar"
  | "global_leaderboard";

export interface Sponsor {
  id: string;
  name: string;
  description: string;
  image_url: string;
  link_url: string;
  placement: AdPlacement;
  is_active: boolean;
  display_order: number;
  cta_text: string;
  badge_text: string | null;
  created_at: string;
  updated_at: string;
}

export const useSponsors = (placement?: AdPlacement | AdPlacement[]) => {
  return useQuery({
    queryKey: ["sponsors", placement],
    queryFn: async () => {
      let query = supabase
        .from("sponsors")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (placement) {
        if (Array.isArray(placement)) {
          query = query.in("placement", placement);
        } else {
          query = query.eq("placement", placement);
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as Sponsor[];
    },
  });
};

export const useAllSponsors = () => {
  return useQuery({
    queryKey: ["sponsors", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sponsors")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return (data || []) as Sponsor[];
    },
  });
};
