const { createClient } = require('@supabase/supabase-js');
const { runSql, STAGING_REF } = require('./db-audit-helper.cjs');

const SUPABASE_URL = `https://${STAGING_REF}.supabase.co`;
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2d3d0cXV1ZXhoeXlkd2loamJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM1OTI1NzYsImV4cCI6MjEwOTE2ODU3Nn0.ZBevJqFcBzb2UAwwr_o5zgUcrrI5uf1rFgsn-cMFXnQ";

async function main() {
  console.log('========================================================================');
  console.log(`TALENTXCEL GUC & TRIGGER BOUNDARY SECURITY TEST SUITE`);
  console.log(`Target: Staging (${STAGING_REF})`);
  console.log('========================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(id, description, condition, details = '') {
    if (condition) {
      console.log(`✅ PASS: [${id}] ${description}`);
      passed++;
    } else {
      console.error(`❌ FAIL: [${id}] ${description}`);
      if (details) console.error(`   Details: ${details}`);
      failed++;
    }
  }

  // 1. Search pg_proc for txc.in_consent_rpc
  console.log('--- 1. PG_PROC GUC INVENTORY AUDIT ---');
  const gucProcs = await runSql(`
    SELECT n.nspname || '.' || p.proname AS full_name
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname IN ('public', 'auth', 'extensions')
      AND p.prosrc ILIKE '%txc.in_consent_rpc%'
    ORDER BY full_name;
  `, 'staging');

  const procNames = gucProcs.map(r => r.full_name);
  console.log('Procedures referencing txc.in_consent_rpc:', procNames);
  assert(
    'TEST-GUC-01',
    'Exactly two functions reference txc.in_consent_rpc (consent RPC & protection trigger)',
    procNames.length === 2 &&
    procNames.includes('public.set_public_profile_consent') &&
    procNames.includes('public.protect_profile_system_columns'),
    `Found: ${JSON.stringify(procNames)}`
  );

  // 2. Direct RPC invocation of set_config from client
  console.log('\n--- 2. CLIENT RPC ENDPOINT EXPOSURE CHECK ---');
  const anonClient = createClient(SUPABASE_URL, ANON_KEY, { auth: { persistSession: false } });
  const { data: authCand } = await anonClient.auth.signInWithPassword({
    email: 'audit_cand1@talentxcel-audit.local',
    password: 'AuditPassword123!Secure'
  });
  const candClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${authCand.session.access_token}` } },
    auth: { persistSession: false }
  });
  const candId = authCand.user.id;

  // Anon attempt to invoke set_config
  let anonRpcError = null;
  try {
    const { data, error } = await anonClient.rpc('set_config', {
      setting_name: 'txc.in_consent_rpc',
      new_value: 'on',
      is_local: true
    });
    anonRpcError = error;
  } catch (err) {
    anonRpcError = err;
  }
  assert(
    'TEST-GUC-02A',
    'Anonymous client RPC call to set_config is rejected (function not exposed in public API schema)',
    anonRpcError !== null && (anonRpcError.code === 'PGRST202' || anonRpcError.message.includes('Could not find') || anonRpcError.code === '42883'),
    `RPC result: ${JSON.stringify(anonRpcError)}`
  );

  // Authenticated attempt to invoke set_config
  let authRpcError = null;
  try {
    const { data, error } = await candClient.rpc('set_config', {
      setting_name: 'txc.in_consent_rpc',
      new_value: 'on',
      is_local: true
    });
    authRpcError = error;
  } catch (err) {
    authRpcError = err;
  }
  assert(
    'TEST-GUC-02B',
    'Authenticated client RPC call to set_config is rejected (function not exposed in public API schema)',
    authRpcError !== null && (authRpcError.code === 'PGRST202' || authRpcError.message.includes('Could not find') || authRpcError.code === '42883'),
    `RPC result: ${JSON.stringify(authRpcError)}`
  );

  // 3. Direct service_role mutation of is_profile_public without GUC flag
  console.log('\n--- 3. SERVICE_ROLE DIRECT MUTATION DENIAL (WITHOUT GUC) ---');
  // Establish baseline: is_profile_public = true, verification_status = 'verified'
  await runSql(`UPDATE public.profiles SET is_profile_public = true, profile_visibility = 'public', verification_status = 'verified' WHERE id = '${candId}';`, 'staging');

  const resPublic = await runSql(`
    DO $$
    BEGIN
      SET LOCAL ROLE service_role;
      UPDATE public.profiles SET is_profile_public = false WHERE id = '${candId}';
    END $$;
  `, 'staging');
  const isBlockedPublic = resPublic?.error && (resPublic.stdout?.includes('42501') || resPublic.error?.includes('42501') || resPublic.stderr?.includes('42501'));

  assert(
    'TEST-GUC-03',
    'Direct service_role update of is_profile_public without GUC is BLOCKED by trigger (42501)',
    isBlockedPublic === true,
    `Result: ${JSON.stringify(resPublic)}`
  );

  // 4. Direct service_role mutation of verification_status without GUC flag
  console.log('\n--- 4. SERVICE_ROLE VERIFICATION_STATUS MUTATION DENIAL ---');
  const resVerif = await runSql(`
    DO $$
    BEGIN
      SET LOCAL ROLE service_role;
      UPDATE public.profiles SET verification_status = 'unverified' WHERE id = '${candId}';
    END $$;
  `, 'staging');
  const isBlockedVerif = resVerif?.error && (resVerif.stdout?.includes('42501') || resVerif.error?.includes('42501') || resVerif.stderr?.includes('42501'));

  assert(
    'TEST-GUC-04',
    'Direct service_role update of verification_status without superuser is BLOCKED by trigger (42501)',
    isBlockedVerif === true,
    `Result: ${JSON.stringify(resVerif)}`
  );

  // 5. Test that setting txc.in_consent_rpc CANNOT bypass verification_status / user_role protection
  console.log('\n--- 5. GUC CANNOT BYPASS SYSTEM SECURITY COLUMNS (VERIFICATION_STATUS / USER_ROLE) ---');
  const resTamper = await runSql(`
    DO $$
    BEGIN
      SET LOCAL ROLE service_role;
      PERFORM set_config('txc.in_consent_rpc', 'on', true);
      UPDATE public.profiles SET verification_status = 'unverified' WHERE id = '${candId}';
    END $$;
  `, 'staging');
  const isBlockedTamper = resTamper?.error && (resTamper.stdout?.includes('42501') || resTamper.error?.includes('42501') || resTamper.stderr?.includes('42501'));

  assert(
    'TEST-GUC-05',
    'Trigger strictly blocks verification_status mutation even when txc.in_consent_rpc = on for non-superuser',
    isBlockedTamper === true,
    `Result: ${JSON.stringify(resTamper)}`
  );

  // 6. Direct authenticated user mutation of is_profile_public via REST API
  console.log('\n--- 6. AUTHENTICATED DIRECT MUTATION DENIAL ---');
  const { data: authData, error: authErr } = await candClient
    .from('profiles')
    .update({ is_profile_public: false })
    .eq('id', candId)
    .select();

  assert(
    'TEST-GUC-06',
    'Direct authenticated user update of is_profile_public via REST API is BLOCKED (42501)',
    authErr !== null && (authErr.code === '42501' || authErr.message.includes('permission denied')),
    `Result: ${JSON.stringify(authErr)}`
  );

  // 7. Legitimate consent update via set_public_profile_consent succeeds
  console.log('\n--- 7. LEGITIMATE RPC UPDATE SUCCESS ---');
  const { data: rpcData, error: rpcErr } = await candClient.rpc('set_public_profile_consent', {
    p_granted: true,
    p_visibility: 'public',
    p_source: 'user_privacy_dashboard'
  });

  assert(
    'TEST-GUC-07',
    'Legitimate set_public_profile_consent RPC succeeds (200 OK) with transaction-local GUC',
    rpcErr === null && rpcData && rpcData.success === true && rpcData.consent_status === 'granted',
    `RPC response: ${JSON.stringify(rpcData)}, error: ${JSON.stringify(rpcErr)}`
  );

  // 8. Transaction locality proof (GUC does not persist)
  console.log('\n--- 8. GUC TRANSACTION-LOCALITY PROOF ---');
  const gucAfter = await runSql(`
    SELECT pg_catalog.current_setting('txc.in_consent_rpc', true) AS guc_value;
  `, 'staging');

  assert(
    'TEST-GUC-08',
    'txc.in_consent_rpc flag is transaction-local and evaluates to NULL/empty in subsequent queries',
    !gucAfter || gucAfter.length === 0 || gucAfter[0].guc_value === null || gucAfter[0].guc_value === '',
    `Value: ${JSON.stringify(gucAfter)}`
  );

  console.log('\n========================================================================');
  console.log(`GUC & TRIGGER SUITE COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
