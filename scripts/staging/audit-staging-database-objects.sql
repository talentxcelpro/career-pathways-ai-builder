-- =============================================================================
-- TASK 002H: AUDIT STAGING DATABASE OBJECTS, RLS, PRIVILEGES & SECURITY
-- Target: Staging PostgreSQL (pvwwtquuexhyydwihjbi)
-- =============================================================================

-- 1. Check RLS status across all public tables
SELECT 
    schemaname,
    tablename,
    rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. List all RLS policies on security-critical tables
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname IN ('public', 'storage')
  AND (
      tablename IN ('user_roles', 'resume_downloads', 'edge_rate_limits', 'objects')
      OR tablename LIKE 'claim1%'
      OR tablename LIKE 'career%'
      OR tablename IN ('profiles', 'resumes', 'job_applications', 'companies')
  )
ORDER BY schemaname, tablename, policyname;

-- 3. Check functions: SECURITY DEFINER, search_path, volatility, owner
SELECT 
    p.proname AS function_name,
    n.nspname AS schema_name,
    pg_get_userbyid(p.proowner) AS owner,
    p.prosecdef AS is_security_definer,
    p.provolatile AS volatility,
    proconfig AS runtime_config,
    pg_get_function_arguments(p.oid) AS arguments
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname IN (
      'check_rate_limit',
      'record_resume_download_atomic',
      'is_app_admin',
      'is_company_admin_or_owner',
      'get_my_claims',
      'has_role'
  )
ORDER BY p.proname;

-- 4. Check function execution grants (routine privileges)
SELECT 
    routine_schema,
    routine_name,
    grantee,
    privilege_type
FROM information_schema.routine_privileges
WHERE routine_schema = 'public'
  AND routine_name IN (
      'check_rate_limit',
      'record_resume_download_atomic',
      'is_app_admin',
      'is_company_admin_or_owner'
  )
ORDER BY routine_name, grantee;

-- 5. Check table privileges for edge_rate_limits, user_roles, resume_downloads
SELECT 
    table_schema,
    table_name,
    grantee,
    privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'public'
  AND table_name IN ('edge_rate_limits', 'user_roles', 'resume_downloads')
ORDER BY table_name, grantee, privilege_type;

-- 6. Check storage bucket configuration & public flag
SELECT 
    id,
    name,
    public,
    avif_autodetection,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets
ORDER BY id;
