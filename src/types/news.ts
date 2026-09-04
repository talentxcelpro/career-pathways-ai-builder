export type NewsCategory = 
  | 'All'
  | 'Company News'
  | 'Career Intelligence'
  | 'Education Intelligence'
  | 'TalentXcel Network'
  | 'Press & Media';

export type NewsArchetype =
  | 'Sector Report'
  | 'Career Guide'
  | 'Industry Insider'
  | 'Professional Journal'
  | 'Trade Publication';

export interface NewsAuthor {
  name: string;
  role: string;
  avatar?: string;
}

export interface NewsArticle {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  category: Exclude<NewsCategory, 'All'>;
  archetype?: NewsArchetype;
  publishedAt: string;
  updatedAt?: string;
  lastRefreshedAt?: string;
  editionVersion?: string;
  refreshCadenceDays?: number;
  metricsSnapshot?: Record<string, string | number>;
  author: NewsAuthor;
  imageUrl: string;
  readTime: string;
  tags: string[];
  keyTakeaways: string[];
  isFeatured?: boolean;
}
