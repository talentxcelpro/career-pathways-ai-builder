export type ContentPillar = 
  | 'careers'
  | 'jobs'
  | 'skills'
  | 'education'
  | 'resumes'
  | 'learning'
  | 'passport'
  | 'network'
  | 'ecosystem';

export type AutoPostStatus = 
  | 'generated'
  | 'published'
  | 'rejected'
  | 'failed'
  | 'cancelled';

export interface AutoPostRecord {
  id: string;
  post_id?: string | null;
  user_id: string;
  content: string;
  pillar: ContentPillar;
  word_count: number;
  status: AutoPostStatus;
  similarity_hash?: string | null;
  rejection_reason?: string | null;
  scheduled_at?: string | null;
  published_at?: string | null;
  created_at: string;
}

export interface AutoPostConfig {
  id: string;
  authorized_email: string;
  authorized_user_id?: string | null;
  enabled: boolean;
  min_interval_minutes: number;
  max_interval_minutes: number;
  max_daily_posts: number;
  next_post_scheduled_at: string;
  last_post_timestamp?: string | null;
  posts_today_count: number;
  counter_date: string;
  updated_at: string;
  created_at: string;
}

export interface ValidationResult {
  valid: boolean;
  wordCount: number;
  reason?: string;
  similarityScore?: number;
}

export interface SeedConcept {
  id: string;
  pillar: ContentPillar;
  text: string;
  isBrandMention?: boolean;
}
