import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  content: string;
  url: string;
  source_name: string;
  author: string;
  published_at: string;
  category: string;
  tags: string[];
  sentiment_score: number;
  engagement_score: number;
  is_trending: boolean;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export const useNewsArticles = (limit = 10) => {
  return useQuery({
    queryKey: ['news-articles', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .order('published_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(error.message);
      }

      return data as NewsArticle[];
    },
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    refetchInterval: 30 * 60 * 1000, // Refetch every 30 minutes
  });
};

export const useTrendingNews = (limit = 5) => {
  return useQuery({
    queryKey: ['trending-news', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .eq('is_trending', true)
        .order('engagement_score', { ascending: false })
        .order('published_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(error.message);
      }

      return data as NewsArticle[];
    },
    staleTime: 10 * 60 * 1000, // Consider data fresh for 10 minutes
  });
};