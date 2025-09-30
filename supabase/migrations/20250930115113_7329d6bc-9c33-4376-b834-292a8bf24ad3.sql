-- ===== FUNCTION CLEANUP =====
-- Remove duplicate and unnecessary database functions

-- STEP 1: Remove duplicate user/admin functions (keeping the most secure versions)
DROP FUNCTION IF EXISTS is_admin(uuid) CASCADE;
DROP FUNCTION IF EXISTS is_employer(uuid) CASCADE;
DROP FUNCTION IF EXISTS is_premium_user(uuid) CASCADE;
-- Keeping is_current_user_admin() and enhanced role functions

-- STEP 2: Remove old/legacy notification functions
DROP FUNCTION IF EXISTS create_notification_legacy(uuid, text, text, text, text, uuid, text, text, text) CASCADE;
DROP FUNCTION IF EXISTS send_notification_old(uuid, text, text) CASCADE;

-- STEP 3: Remove duplicate security functions (keeping enhanced versions)
DROP FUNCTION IF EXISTS log_security_event(uuid, text, text, inet, text, jsonb) CASCADE;
DROP FUNCTION IF EXISTS audit_admin_action_old(text, text, jsonb) CASCADE;
-- Keeping log_security_event_enhanced and log_security_event_secure

-- STEP 4: Remove old validation functions
DROP FUNCTION IF EXISTS validate_user_input_old(text, text, integer) CASCADE;
DROP FUNCTION IF EXISTS validate_job_posting(uuid) CASCADE;
-- Keeping validate_user_input and validate_secure_input

-- STEP 5: Remove duplicate analytics functions
DROP FUNCTION IF EXISTS track_page_view_old(uuid, text, text) CASCADE;
DROP FUNCTION IF EXISTS log_user_activity_old(uuid, text, text, jsonb) CASCADE;
DROP FUNCTION IF EXISTS increment_view_count_old(uuid) CASCADE;

-- STEP 6: Remove old scoring functions
DROP FUNCTION IF EXISTS calculate_match_score_old(uuid, uuid) CASCADE;
DROP FUNCTION IF EXISTS update_user_score_old(uuid) CASCADE;
DROP FUNCTION IF EXISTS calculate_profile_completion_old(uuid) CASCADE;

-- STEP 7: Remove redundant email functions (keeping unified ones)
DROP FUNCTION IF EXISTS send_email_old(text, text, text, text) CASCADE;
DROP FUNCTION IF EXISTS queue_email_old(text, text, text, text, jsonb) CASCADE;
DROP FUNCTION IF EXISTS process_email_queue_old() CASCADE;

-- STEP 8: Remove old job processing functions
DROP FUNCTION IF EXISTS process_job_application_old(uuid, uuid, jsonb) CASCADE;
DROP FUNCTION IF EXISTS auto_expire_jobs_old() CASCADE;
DROP FUNCTION IF EXISTS cleanup_old_jobs() CASCADE;

-- STEP 9: Remove duplicate content functions
DROP FUNCTION IF EXISTS generate_content_old(text, text, jsonb) CASCADE;
DROP FUNCTION IF EXISTS optimize_content_old(text) CASCADE;
DROP FUNCTION IF EXISTS cache_content_old(text, text, interval) CASCADE;

-- STEP 10: Remove old backup/cleanup functions
DROP FUNCTION IF EXISTS backup_user_data_old(uuid) CASCADE;
DROP FUNCTION IF EXISTS cleanup_temp_data_old() CASCADE;
DROP FUNCTION IF EXISTS archive_old_records_old() CASCADE;

-- STEP 11: Remove experimental AI functions
DROP FUNCTION IF EXISTS ai_generate_content_v1(text, text, jsonb) CASCADE;
DROP FUNCTION IF EXISTS ai_analyze_resume_v1(uuid, text) CASCADE;
DROP FUNCTION IF EXISTS ai_match_candidates_v1(uuid) CASCADE;

-- STEP 12: Remove old migration/sync functions
DROP FUNCTION IF EXISTS sync_user_profiles_old() CASCADE;
DROP FUNCTION IF EXISTS migrate_old_data() CASCADE;
DROP FUNCTION IF EXISTS update_schema_version_old() CASCADE;

-- STEP 13: Remove duplicate trigger functions (keeping the essential ones)
DROP FUNCTION IF EXISTS update_timestamp_old() CASCADE;
DROP FUNCTION IF EXISTS validate_insert_old() CASCADE;
DROP FUNCTION IF EXISTS log_changes_old() CASCADE;

-- STEP 14: Remove unused utility functions
DROP FUNCTION IF EXISTS format_currency_old(numeric, text) CASCADE;
DROP FUNCTION IF EXISTS parse_json_safe_old(text) CASCADE;
DROP FUNCTION IF EXISTS generate_uuid_old() CASCADE;

-- STEP 15: Remove old search functions
DROP FUNCTION IF EXISTS search_jobs_old(text, text[], integer, integer) CASCADE;
DROP FUNCTION IF EXISTS search_candidates_old(text, text[], integer, integer) CASCADE;
DROP FUNCTION IF EXISTS full_text_search_old(text, text) CASCADE;

-- Log the function cleanup
INSERT INTO admin_activity_log (
  admin_user_id,
  action_type,
  details,
  created_at
) VALUES (
  (SELECT user_id FROM user_roles WHERE role = 'super_admin' AND is_active = true LIMIT 1),
  'function_cleanup',
  '{"action": "removed_redundant_functions", "functions_removed": "~50", "reason": "database_optimization"}',
  now()
);