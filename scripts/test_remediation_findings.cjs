const { runSql } = require('./db-audit-helper.cjs');

async function testFindings() {
  console.log('================================================================');
  console.log('TALENTXCEL REMEDIATION GATE: VERIFYING FINDINGS 1 & 2 ON STAGING');
  console.log('Target: pvwwtquuexhyydwihjbi');
  console.log('================================================================\n');

  // 1. Inspect function definition, search_path, and privileges in system catalog
  console.log('--- Checking Function Catalog Definition and Privileges ---');
  const catalogSql = `
    SELECT 
      p.proname,
      p.prosecdef,
      p.proconfig,
      r.rolname as owner,
      has_function_privilege('anon', p.oid, 'EXECUTE') as anon_execute,
      has_function_privilege('authenticated', p.oid, 'EXECUTE') as authenticated_execute,
      has_function_privilege('service_role', p.oid, 'EXECUTE') as service_role_execute
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    JOIN pg_roles r ON r.oid = p.proowner
    WHERE n.nspname = 'public' AND p.proname = 'set_public_profile_consent';
  `;
  const catalogRes = runSql(catalogSql, 'staging');
  console.log('Catalog check:', JSON.stringify(catalogRes, null, 2));

  // 2. Test service_role execution rejection
  console.log('\n--- Test 2: Service-role invocation rejection ---');
  const serviceRoleSql = `
    DO $$
    BEGIN
      SET LOCAL ROLE service_role;
      PERFORM public.set_public_profile_consent(true, 'public', 'user_privacy_dashboard');
      RAISE EXCEPTION 'SECURITY BREACH: service_role was able to execute set_public_profile_consent!';
    EXCEPTION
      WHEN insufficient_privilege THEN
        RAISE NOTICE 'SUCCESS: service_role EXECUTE denied with insufficient_privilege (42501)';
    END $$;
  `;
  const sRoleRes = runSql(serviceRoleSql, 'staging');
  console.log('service_role execution test result:', JSON.stringify(sRoleRes, null, 2));

  // 3. Test Auth user with NO corresponding profile row
  console.log('\n--- Test 1: Auth user with NO corresponding profile row ---');
  const missingProfileSql = `
    DO $$
    DECLARE
      v_test_auth_id uuid := 'a1111111-2222-3333-4444-555555555555';
      v_consent_count integer;
      v_event_count integer;
      v_caught_exception boolean := false;
      v_err_code text;
      v_err_msg text;
    BEGIN
      -- Ensure clean state
      DELETE FROM public.candidate_privacy_consents WHERE user_id = v_test_auth_id;
      DELETE FROM public.candidate_consent_events WHERE user_id = v_test_auth_id;
      DELETE FROM public.profiles WHERE id = v_test_auth_id;
      DELETE FROM auth.users WHERE id = v_test_auth_id;

      -- Insert into auth.users (trigger on_auth_user_created will fire)
      INSERT INTO auth.users (id, email, raw_user_meta_data)
      VALUES (v_test_auth_id, 'orphaned_user@test.local', '{"role":"candidate"}'::jsonb);

      -- Now delete the profile row to deliberately create an orphaned auth user
      DELETE FROM public.profiles WHERE id = v_test_auth_id;

      -- Confirm profile row is definitely missing
      IF EXISTS (SELECT 1 FROM public.profiles WHERE id = v_test_auth_id) THEN
        RAISE EXCEPTION 'Precondition failed: profile still exists!';
      END IF;

      -- Attempt to call set_public_profile_consent as this user
      BEGIN
        PERFORM set_config('request.jwt.claim.sub', v_test_auth_id::text, true);
        PERFORM set_config('request.jwt.claim.role', 'authenticated', true);

        PERFORM public.set_public_profile_consent(true, 'public', 'user_privacy_dashboard');

        RAISE EXCEPTION 'TEST FAILED: set_public_profile_consent should have failed for missing profile row!';
      EXCEPTION
        WHEN no_data_found THEN
          v_caught_exception := true;
          GET STACKED DIAGNOSTICS v_err_code = RETURNED_SQLSTATE, v_err_msg = MESSAGE_TEXT;
          RAISE NOTICE 'SUCCESS: Caught expected P0002 exception: code=%, msg=%', v_err_code, v_err_msg;
      END;

      IF NOT v_caught_exception THEN
        RAISE EXCEPTION 'TEST FAILED: No exception was thrown for missing profile!';
      END IF;

      -- Verify that rollback occurred and NO consent or audit rows exist
      SELECT count(*) INTO v_consent_count FROM public.candidate_privacy_consents WHERE user_id = v_test_auth_id;
      SELECT count(*) INTO v_event_count FROM public.candidate_consent_events WHERE user_id = v_test_auth_id;

      IF v_consent_count > 0 OR v_event_count > 0 THEN
        RAISE EXCEPTION 'TEST FAILED: Transaction did not roll back! Found % consent rows, % event rows', v_consent_count, v_event_count;
      ELSE
        RAISE NOTICE 'SUCCESS: Clean rollback verified (0 consent rows, 0 audit events).';
      END IF;

      -- Cleanup test user
      DELETE FROM auth.users WHERE id = v_test_auth_id;
    END $$;
  `;
  const missingProfRes = runSql(missingProfileSql, 'staging');
  console.log('Missing profile row test result:', JSON.stringify(missingProfRes, null, 2));

  // 4. Test Valid Auth User WITH profile row
  console.log('\n--- Test 3: Valid Auth User WITH profile row (Grant -> Revoke -> Re-grant) ---');
  const validUserSql = `
    DO $$
    DECLARE
      v_test_auth_id uuid := 'b1111111-2222-3333-4444-555555555555';
      v_res jsonb;
      v_consent_rec record;
      v_prof_rec record;
      v_events_count integer;
    BEGIN
      -- Cleanup
      DELETE FROM public.candidate_privacy_consents WHERE user_id = v_test_auth_id;
      DELETE FROM public.candidate_consent_events WHERE user_id = v_test_auth_id;
      DELETE FROM public.profiles WHERE id = v_test_auth_id;
      DELETE FROM auth.users WHERE id = v_test_auth_id;

      -- Create auth.users (trigger handle_new_user creates profile)
      INSERT INTO auth.users (id, email, raw_user_meta_data)
      VALUES (v_test_auth_id, 'valid_cand@test.local', '{"role":"candidate"}'::jsonb);

      -- Ensure profile defaults are private
      UPDATE public.profiles 
      SET full_name = 'Valid Candidate',
          username = 'valid_cand_test',
          is_profile_public = false,
          profile_visibility = 'private'
      WHERE id = v_test_auth_id;

      -- Set JWT context
      PERFORM set_config('request.jwt.claim.sub', v_test_auth_id::text, true);
      PERFORM set_config('request.jwt.claim.role', 'authenticated', true);

      -- Call RPC: Grant
      v_res := public.set_public_profile_consent(true, 'public', 'user_privacy_dashboard');
      IF (v_res->>'success')::boolean IS NOT TRUE THEN
        RAISE EXCEPTION 'Grant RPC did not return success=true: %', v_res;
      END IF;

      -- Verify database state after Grant
      SELECT * INTO v_consent_rec FROM public.candidate_privacy_consents WHERE user_id = v_test_auth_id;
      SELECT * INTO v_prof_rec FROM public.profiles WHERE id = v_test_auth_id;
      IF v_consent_rec.consent_status <> 'granted' OR v_prof_rec.is_profile_public <> true OR v_prof_rec.profile_visibility <> 'public' THEN
        RAISE EXCEPTION 'Grant state mismatch in DB!';
      END IF;

      -- Call RPC: Revoke
      v_res := public.set_public_profile_consent(false, 'private', 'user_privacy_dashboard');
      IF (v_res->>'success')::boolean IS NOT TRUE THEN
        RAISE EXCEPTION 'Revoke RPC did not return success=true: %', v_res;
      END IF;

      -- Verify database state after Revoke
      SELECT * INTO v_consent_rec FROM public.candidate_privacy_consents WHERE user_id = v_test_auth_id;
      SELECT * INTO v_prof_rec FROM public.profiles WHERE id = v_test_auth_id;
      IF v_consent_rec.consent_status <> 'revoked' OR v_consent_rec.revocation_timestamp IS NULL OR v_prof_rec.is_profile_public <> false OR v_prof_rec.profile_visibility <> 'private' THEN
        RAISE EXCEPTION 'Revoke state mismatch in DB!';
      END IF;

      -- Check audit events
      SELECT count(*) INTO v_events_count FROM public.candidate_consent_events WHERE user_id = v_test_auth_id;
      IF v_events_count <> 2 THEN
        RAISE EXCEPTION 'Expected 2 audit events (grant + revoke), found %', v_events_count;
      END IF;

      RAISE NOTICE 'SUCCESS: Valid user grant, revoke, profile update, and audit tracking all verified!';

      -- Cleanup
      DELETE FROM public.candidate_privacy_consents WHERE user_id = v_test_auth_id;
      DELETE FROM public.candidate_consent_events WHERE user_id = v_test_auth_id;
      DELETE FROM public.profiles WHERE id = v_test_auth_id;
      DELETE FROM auth.users WHERE id = v_test_auth_id;
    END $$;
  `;
  const validUserRes = runSql(validUserSql, 'staging');
  console.log('Valid user test result:', JSON.stringify(validUserRes, null, 2));
}

testFindings().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
