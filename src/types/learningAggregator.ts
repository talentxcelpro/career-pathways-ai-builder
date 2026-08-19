// TalentXcel Learning Aggregator — Enormous Taxonomy & Intelligence Types

export type SourceType = 
  | 'OFFICIAL_API' 
  | 'OFFICIAL_FEED' 
  | 'OFFICIAL_CATALOG' 
  | 'MANUAL_REVIEW' 
  | 'PARTNER_FEED';

export type VerificationStatus = 
  | 'VERIFIED' 
  | 'NEEDS_REVIEW' 
  | 'BROKEN' 
  | 'NO_LONGER_FREE' 
  | 'REMOVED';

export type FreeType = 
  | 'FREE_TO_LEARN' 
  | 'FREE' 
  | 'FREE_AUDIT' 
  | 'PAID';

export type CertificateStatus = 
  | 'FREE_CERTIFICATE' 
  | 'PAID_CERTIFICATE' 
  | 'NO_CERTIFICATE' 
  | 'UNKNOWN';

export type CourseLevel = 
  | 'Beginner' 
  | 'Intermediate' 
  | 'Advanced' 
  | 'All Levels';

export interface TaxonomyNode {
  industry: string;
  domain: string;
  subject: string;
  category: string;
  skill: string;
  sub_skills: string[];
  career_paths: string[];
}

export interface LearningProvider {
  id: string;
  name: string;
  slug: string;
  website: string;
  logo: string;
  description: string;
  provider_type: 'University' | 'Tech Company' | 'Government Portal' | 'Non-Profit' | 'Open Education';
  trust_level: 'Official' | 'Verified Partner' | 'Open Community';
  country?: string;
  verified: boolean;
  course_count?: number;
  api_endpoint?: string;
  categories_offered?: string[];
}

export interface AggregatedCourse {
  id: string;
  title: string;
  slug: string;
  provider_id: string;
  provider_name: string;
  provider_logo?: string;
  source_url: string;
  canonical_url: string;
  source_domain: string;
  provider_course_id?: string;
  source_type: SourceType;
  short_description: string;
  long_description: string;
  industry: string;
  domain: string;
  subject: string;
  category: string;
  subcategory?: string;
  level: CourseLevel;
  duration_minutes?: number;
  duration_text: string;
  language: string;
  is_free: boolean;
  free_type: FreeType;
  certificate_available: boolean;
  certificate_type: CertificateStatus;
  certificate_cost?: string;
  course_format?: 'Video & Interactive' | 'Text & Code' | 'Guided Project' | 'Self-Paced Course' | 'Interactive Sandbox';
  thumbnail_url: string;
  skills: string[];
  sub_skills?: string[];
  career_relevance: string[];
  recommendation_reason?: string;
  talentxcel_match?: number;
  last_verified_at: string;
  verification_status: VerificationStatus;
  popularity_score?: number;
  quality_score?: number;
  created_at: string;
  updated_at: string;
}

export interface CareerStep {
  step_number: number;
  skill_name: string;
  target_level: CourseLevel;
  recommended_course_id: string;
  duration_text: string;
  reason: string;
  weeks?: string;
}

export interface PersonalizedLearningPlan {
  user_intent: string;
  current_experience: string;
  weekly_hours: number;
  total_weeks: number;
  current_strengths: string[];
  skills_to_build: string[];
  weekly_schedule: { week_range: string; focus_skill: string; courses_count: number }[];
  recommended_courses: AggregatedCourse[];
  matched_pathway_slug?: string;
}

export interface CareerPathway {
  id: string;
  slug: string;
  title: string;
  target_role: string;
  description: string;
  average_salary?: string;
  estimated_weeks?: number;
  total_free_courses?: number;
  steps: CareerStep[];
}

export interface CourseHandoffEvent {
  user_id?: string;
  course_id: string;
  provider_id: string;
  provider_name: string;
  source_url: string;
  clicked_at: string;
  career_intent?: string;
  source_page?: string;
}
