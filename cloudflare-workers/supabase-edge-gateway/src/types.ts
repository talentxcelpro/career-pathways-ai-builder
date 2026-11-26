export interface Env {
  SUPABASE_ORIGIN: string;
  ENVIRONMENT?: string;
  DEFAULT_PUBLIC_TTL?: string | number;
  MAX_PUBLIC_TTL?: string | number;
  SUPABASE_ANON_KEY?: string;
  PURGE_API_KEY?: string;
}

export interface WorkerExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

// Strictly public tables that are safe for shared edge caching (directory/catalog only)
export const PUBLIC_CACHEABLE_ENTITIES = new Set([
  'jobs',
  'companies',
  'aggregated_courses',
  'learning_paths',
  'salary_benchmarks',
  'skills_taxonomy',
  'colleges',
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
  'external_ats_sources',
  'job_ingestion_queue',
  'keyword_sources',
  'keyword_clusters',
  'keyword_intelligence',
  'keyword_observations',
  'seo_opportunities',
  'seo_page_qualification',
  'seo_internal_link_recommendations',
  'seo_content_opportunities',
  'seo_intelligence_runs',
  'seo_validated_geo_hubs',
  'seo_taxonomy_registry',
  'gsc_multi_window_snapshots',
  'seo_ctr_recommendations',
  'seo_position_attack_targets',
  'seo_competitor_benchmarks',
  'seo_page_performance_feedback',
  'seo_action_governance_log',
  'seo_growth_execution_queue',
  'seo_cannibalization_audits',
  'seo_growth_scorecard_snapshots',
  'seo_technical_audit_findings',
  'search_demand_sources',
  'udx_demand_entities',
  'udx_demand_clusters',
  'udx_opportunities',
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
  'employer_id',
  'creator_id',
];

// Explicitly safe Prefer directives supported for shared edge caching:
// Only 'count=none' is eligible for edge caching because 'count=exact' causes PostgREST 
// to return 206 Partial Content and trigger expensive sequential count(*) scans on origin.
export const SUPPORTED_PREFER_DIRECTIVES = new Set([
  'count=none',
]);
