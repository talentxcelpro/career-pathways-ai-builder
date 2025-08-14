// TalentXcel Platform Type Definitions
export interface User {
  id: string;
  name: string;
  tagline?: string;
  location?: string;
  email: string;
  website?: string;
  member_id?: string;
  profile_completion: number;
  career_readiness_score: number;
  market_competitiveness_score: number;
  last_activity: string;
  created_at: string;
  updated_at: string;
}

export interface CareerPassport {
  user_id: string;
  resumes_created: number;
  jobs_applied: number;
  certifications: number;
  tests_completed: number;
  milestones: Record<string, any>;
  achievements: Record<string, any>;
  journey: Record<string, any>;
  completion_percentage: number;
  last_activity_at: string;
  created_at: string;
  updated_at: string;
}

export interface PublicProfile {
  user_id: string;
  qr_code?: string;
  public_url: string;
  is_active: boolean;
  view_count: number;
  shared_count: number;
  created_at: string;
  updated_at: string;
}

export interface ModuleProgress {
  module_name: string;
  completion_percentage: number;
  last_accessed: string;
  time_spent_minutes: number;
  achievements_unlocked: string[];
}

export interface PlatformAnalytics {
  user_id: string;
  module_usage: Record<string, number>;
  feature_engagement: Record<string, number>;
  conversion_metrics: Record<string, number>;
  performance_scores: Record<string, number>;
  last_calculated: string;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface RealtimeEvent {
  eventType: string;
  payload: any;
  timestamp: string;
  source: string;
}

export type ModuleName = 
  | 'passport'
  | 'network' 
  | 'jobs'
  | 'employer'
  | 'companies'
  | 'resume-builder'
  | 'tools'
  | 'services'
  | 'learning'
  | 'colleges'
  | 'career-map';

export interface ModuleConfig {
  name: ModuleName;
  title: string;
  description: string;
  icon: string;
  route: string;
  isEnabled: boolean;
  requiresAuth: boolean;
  isPremium: boolean;
  sortOrder: number;
}