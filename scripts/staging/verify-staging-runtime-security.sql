-- scripts/staging/verify-staging-runtime-security.sql
-- Automated End-to-End Runtime Security Verification Suite for Staging (Task 002G)

BEGIN;

DO $$
DECLARE
  -- Verification variables
  v_res1 JSONB;
  v_res2 JSONB;
  v_res3 JSONB;
  v_rate_key TEXT := 'staging_test_key_' || floor(random() * 1000000)::text;
  
  v_fake_owner UUID := gen_random_uuid();
  v_fake_stranger UUID := gen_random_uuid();
  v_obj_id UUID := gen_random_uuid();
  v_stranger_count INT;
  v_owner_count INT;
  
  v_company_id UUID := gen_random_uuid();
  v_employer_id UUID := gen_random_uuid();
  v_candidate_id UUID := gen_random_uuid();
  v_job_id UUID := gen_random_uuid();
  v_app_id UUID := gen_random_uuid();
  v_emp_obj_id UUID := gen_random_uuid();
  v_employer_count INT;
  
  v_resume_id UUID := gen_random_uuid();
  v_downloader_id UUID := gen_random_uuid();
BEGIN
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'RUNNING TASK 002G STAGING RUNTIME SECURITY VERIFICATION SUITE';
  RAISE NOTICE '============================================================';

  -- ------------------------------------------------------------------------
  -- CHECK 1: Database Object Existence & Hardening
  -- ------------------------------------------------------------------------
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'edge_rate_limits') THEN
    RAISE EXCEPTION 'CHECK 1 FAILED: public.edge_rate_limits table does not exist';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public' AND p.proname = 'check_rate_limit') THEN
    RAISE EXCEPTION 'CHECK 1 FAILED: public.check_rate_limit procedure does not exist';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public' AND p.proname = 'record_resume_download_atomic') THEN
    RAISE EXCEPTION 'CHECK 1 FAILED: public.record_resume_download_atomic procedure does not exist';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'documents' AND public = false) THEN
    RAISE EXCEPTION 'CHECK 1 FAILED: storage.buckets documents bucket is not private (public = false)';
  END IF;

  -- ------------------------------------------------------------------------
  -- CHECK 2: Privilege Revocation on user_roles & check_rate_limit
  -- ------------------------------------------------------------------------
  -- user_roles must NOT allow insert, update, delete for anon or authenticated
  IF EXISTS (
    SELECT 1 FROM information_schema.role_table_grants 
    WHERE table_schema = 'public' AND table_name = 'user_roles' 
      AND grantee IN ('anon', 'authenticated')
      AND privilege_type IN ('INSERT', 'UPDATE', 'DELETE', 'TRUNCATE')
  ) THEN
    RAISE EXCEPTION 'CHECK 2 FAILED: user_roles has unauthorized mutation privileges granted to anon/authenticated';
  END IF;

  -- check_rate_limit must NOT be executable by anon, authenticated, or PUBLIC
  IF EXISTS (
    SELECT 1 FROM information_schema.routine_privileges
    WHERE routine_schema = 'public' AND routine_name = 'check_rate_limit'
      AND grantee IN ('anon', 'authenticated', 'PUBLIC')
  ) THEN
    RAISE EXCEPTION 'CHECK 2 FAILED: check_rate_limit has execute granted to unprivileged callers';
  END IF;
  RAISE NOTICE 'CHECK 1 & 2 PASSED: Tables, procedures, bucket privacy, and privilege revocations verified.';

  -- ------------------------------------------------------------------------
  -- CHECK 3: Live Rate Limiter RPC Execution & Throttling
  -- ------------------------------------------------------------------------
  v_res1 := public.check_rate_limit(v_rate_key, 'auth_endpoint', 2, 30);
  IF (v_res1->>'allowed')::boolean != true OR (v_res1->>'remaining')::int != 1 THEN
    RAISE EXCEPTION 'CHECK 3 FAILED: Rate limit call 1 expected allowed=true, remaining=1, got %', v_res1;
  END IF;

  v_res2 := public.check_rate_limit(v_rate_key, 'auth_endpoint', 2, 30);
  IF (v_res2->>'allowed')::boolean != true OR (v_res2->>'remaining')::int != 0 THEN
    RAISE EXCEPTION 'CHECK 3 FAILED: Rate limit call 2 expected allowed=true, remaining=0, got %', v_res2;
  END IF;

  v_res3 := public.check_rate_limit(v_rate_key, 'auth_endpoint', 2, 30);
  IF (v_res3->>'allowed')::boolean != false OR (v_res3->>'remaining')::int != 0 THEN
    RAISE EXCEPTION 'CHECK 3 FAILED: Rate limit call 3 expected allowed=false (throttled), got %', v_res3;
  END IF;
  RAISE NOTICE 'CHECK 3 PASSED: Rate limit RPC correctly incremented counts and enforced throttling.';

  -- ------------------------------------------------------------------------
  -- CHECK 4: Atomic Resume Download Tracking Procedure
  -- ------------------------------------------------------------------------
  -- Unauthenticated caller must be rejected
  v_res1 := public.record_resume_download_atomic(v_resume_id);
  IF (v_res1->>'success')::boolean != false OR v_res1->>'error' != 'Authentication required' THEN
    RAISE EXCEPTION 'CHECK 4 FAILED: record_resume_download_atomic unauthenticated call failed to reject: %', v_res1;
  END IF;

  -- Authenticated caller should atomically increment
  PERFORM set_config('request.jwt.claim.sub', v_downloader_id::text, true);
  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_downloader_id::text)::text, true);

  v_res1 := public.record_resume_download_atomic(v_resume_id);
  IF (v_res1->>'success')::boolean != true OR (v_res1->>'download_count')::int != 1 THEN
    RAISE EXCEPTION 'CHECK 4 FAILED: record_resume_download_atomic first download failed: %', v_res1;
  END IF;

  v_res2 := public.record_resume_download_atomic(v_resume_id);
  IF (v_res2->>'success')::boolean != true OR (v_res2->>'download_count')::int != 2 THEN
    RAISE EXCEPTION 'CHECK 4 FAILED: record_resume_download_atomic second download failed: %', v_res2;
  END IF;
  RAISE NOTICE 'CHECK 4 PASSED: record_resume_download_atomic strictly enforced auth and atomic incrementing.';

  -- ------------------------------------------------------------------------
  -- CHECK 5: Candidate Document Storage RLS (Stranger Denied, Owner Granted)
  -- ------------------------------------------------------------------------
  INSERT INTO storage.objects (id, bucket_id, name, owner, created_at, updated_at)
  VALUES (v_obj_id, 'documents', v_fake_owner::text || '/resume_private.pdf', v_fake_owner, now(), now());

  -- Test as Stranger
  PERFORM set_config('role', 'authenticated', true);
  PERFORM set_config('request.jwt.claim.sub', v_fake_stranger::text, true);
  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_fake_stranger::text)::text, true);

  SELECT COUNT(*) INTO v_stranger_count FROM storage.objects WHERE id = v_obj_id;

  -- Test as Owner
  PERFORM set_config('role', 'authenticated', true);
  PERFORM set_config('request.jwt.claim.sub', v_fake_owner::text, true);
  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_fake_owner::text)::text, true);

  SELECT COUNT(*) INTO v_owner_count FROM storage.objects WHERE id = v_obj_id;

  PERFORM set_config('role', 'postgres', true);

  IF v_stranger_count != 0 THEN
    RAISE EXCEPTION 'CHECK 5 FAILED: Stranger was able to view private candidate document! Count: %', v_stranger_count;
  END IF;

  IF v_owner_count != 1 THEN
    RAISE EXCEPTION 'CHECK 5 FAILED: Owner was unable to view their own document! Count: %', v_owner_count;
  END IF;
  RAISE NOTICE 'CHECK 5 PASSED: Storage RLS denied stranger (count=0) and granted candidate owner (count=1).';

  -- ------------------------------------------------------------------------
  -- CHECK 6: Authorized Employer Applicant Document Access
  -- ------------------------------------------------------------------------
  INSERT INTO auth.users (id, email, created_at, updated_at)
  VALUES 
    (v_employer_id, 'recruiter@test-staging.internal', now(), now()),
    (v_candidate_id, 'applicant@test-staging.internal', now(), now());

  INSERT INTO public.companies (id, name, created_at, updated_at)
  VALUES (v_company_id, 'Staging Test Enterprises', now(), now());

  INSERT INTO public.company_team_members (id, company_id, user_id, role, is_active, joined_at)
  VALUES (gen_random_uuid(), v_company_id, v_employer_id, 'admin', true, now());

  INSERT INTO public.jobs (id, company_id, title, description, is_active, created_at, updated_at)
  VALUES (v_job_id, v_company_id, 'Lead Staff Engineer', 'Description', true, now(), now());

  INSERT INTO public.job_applications (id, job_id, user_id, status, applied_at, updated_at)
  VALUES (v_app_id, v_job_id, v_candidate_id, 'applied', now(), now());

  INSERT INTO storage.objects (id, bucket_id, name, owner, created_at, updated_at)
  VALUES (v_emp_obj_id, 'documents', v_candidate_id::text || '/resume_candidate.pdf', v_candidate_id, now(), now());

  -- Query as Employer
  PERFORM set_config('role', 'authenticated', true);
  PERFORM set_config('request.jwt.claim.sub', v_employer_id::text, true);
  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_employer_id::text)::text, true);

  SELECT COUNT(*) INTO v_employer_count FROM storage.objects WHERE id = v_emp_obj_id;

  PERFORM set_config('role', 'postgres', true);

  IF v_employer_count != 1 THEN
    RAISE EXCEPTION 'CHECK 6 FAILED: Authorized employer was unable to view applicant document! Count: %', v_employer_count;
  END IF;
  RAISE NOTICE 'CHECK 6 PASSED: Authorized employer granted access to applicant document via RLS policy (count=1).';

  RAISE NOTICE '============================================================';
  RAISE NOTICE 'ALL 6 RUNTIME SECURITY CHECKS PASSED SUCCESSFULLY!';
  RAISE NOTICE '============================================================';
END $$;

ROLLBACK;
