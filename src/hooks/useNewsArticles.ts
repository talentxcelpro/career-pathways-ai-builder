import { useQuery } from '@tanstack/react-query';
import { FOUNDATION_NEWS_ARTICLES } from '@/data/newsArticles';

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

const MAPPED_ARTICLES: NewsArticle[] = FOUNDATION_NEWS_ARTICLES.map((a, idx) => ({
  id: a.id,
  title: a.title,
  description: a.summary,
  content: a.content,
  url: `/news/${a.slug}`,
  source_name: 'TalentXcel Intelligence',
  author: a.author?.name || 'Editorial Desk',
  published_at: a.publishedAt,
  category: a.category,
  tags: a.tags || [],
  sentiment_score: 0.85,
  engagement_score: 95 - idx * 2,
  is_trending: a.isFeatured || idx < 3,
  image_url: a.imageUrl,
  created_at: a.publishedAt,
  updated_at: a.updatedAt || a.publishedAt,
}));

export const useNewsArticles = (limit = 10) => {
  return useQuery({
    queryKey: ['news-articles', limit],
    queryFn: async () => {
      return MAPPED_ARTICLES.slice(0, limit);
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useTrendingNews = (limit = 5) => {
  return useQuery({
    queryKey: ['trending-news', limit],
    queryFn: async () => {
      return MAPPED_ARTICLES.filter(a => a.is_trending).slice(0, limit);
    },
    staleTime: 10 * 60 * 1000,
  });
};