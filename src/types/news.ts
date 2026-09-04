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

export type EvidenceStatus = 'EDITORIAL' | 'RESEARCH' | 'INDUSTRY_OBSERVATION';
export type ClaimStatus = 'VERIFIED' | 'EDITORIAL_OPINION' | 'REVIEW_REQUIRED';

export interface ArticleSource {
  name: string;
  url?: string;
  citationType?: 'OFFICIAL_STANDARD' | 'LABOR_DATA' | 'INDUSTRY_BENCHMARK' | 'ACADEMIC' | 'INTERNAL_TELEMETRY';
}

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
  imageAlt?: string;
  imageCaption?: string;
  imageLicense?: string;
  readTime: string;
  tags: string[];
  keyTakeaways: string[];
  isFeatured?: boolean;

  // Editorial Evidence Governance Layer
  evidenceStatus?: EvidenceStatus;
  claimStatus?: ClaimStatus;
  sources?: ArticleSource[];
  methodology?: string | null;
  limitations?: string | null;
  lastReviewedAt?: string;
}
