export interface Env {
  SUPABASE_ORIGIN: string;
  ENVIRONMENT?: string;
  DEFAULT_PUBLIC_TTL?: string | number;
  MAX_PUBLIC_TTL?: string | number;
  PURGE_API_KEY?: string;
}

export interface WorkerExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

// Strictly public tables that are safe for shared edge caching
export const PUBLIC_CACHEABLE_ENTITIES = new Set([
  'jobs',
  'companies',
  'aggregated_courses',
  'learning_paths',
  'salary_benchmarks',
  'skills_taxonomy',
  'colleges',
  'ats_sources',
  'ats_feed_snapshots',
]);

// Tables and resources that MUST NEVER be cached publicly (enforce RLS, user privacy, credentials)
export const SENSITIVE_PRIVATE_ENTITIES = new Set([
  'profiles',
  'job_applications',
  'messages',
  'conversations',
  'notifications',
  'resumes',
  'cv_files',
  'user_behavior_events',
  'user_txc_balances',
  'user_credits',
  'user_follows',
  'post_likes',
  'post_saves',
  'saved_jobs',
  'user_feed_interactions',
  'user_preferences',
  'ai_organization_state',
  'ai_organization_audit_log',
  'ai_organization_recommendations',
  'admin_telemetry_logs',
  'employer_reviews',
]);

// Query parameter patterns that indicate user-specific or personalized filtering
export const SENSITIVE_QUERY_PATTERNS = [
  'user_id',
  'created_by',
  'owner_id',
  'applicant_id',
  'candidate_id',
  'profile_id',
  'author_id',
  'recipient_id',
  'sender_id',
];
