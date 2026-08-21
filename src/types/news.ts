export type NewsCategory = 
  | 'All'
  | 'Company News'
  | 'Career Intelligence'
  | 'Education Intelligence'
  | 'TalentXcel Network'
  | 'Press & Media';

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
  publishedAt: string;
  updatedAt?: string;
  author: NewsAuthor;
  imageUrl: string;
  readTime: string;
  tags: string[];
  keyTakeaways: string[];
  isFeatured?: boolean;
}
