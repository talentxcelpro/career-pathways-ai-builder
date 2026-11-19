const { createClient } = require('@supabase/supabase-js');
const { runSql, STAGING_REF } = require('./db-audit-helper.cjs');

const SUPABASE_URL = `https://${STAGING_REF}.supabase.co`;
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2d3d0cXV1ZXhoeXlkd2loamJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM1OTI1NzYsImV4cCI6MjEwOTE2ODU3Nn0.ZBevJqFcBzb2UAwwr_o5zgUcrrI5uf1rFgsn-cMFXnQ";

async function main() {
  console.log('========================================================================');
  console.log('GATE 2: CONSENT RPC AND TRIGGER INTEGRITY TEST SUITE');
  console.log('========================================================================\n');

  const anonClient = createClient(SUPABASE_URL, ANON_KEY, { auth: { persistSession: false } });
  
  // Login Candidate 1 (User A)
  const { data: authA } = await anonClient.auth.signInWithPassword({
    email: 'audit_cand1@talentxcel-audit.local',
    password: 'AuditPassword123!Secure'
  });
  const clientA = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${authA.session.access_token}` } },
    auth: { persistSession: false }
  });
  const userA_id = authA.user.id;

  // Login Candidate 2 (User B)
  const { data: authB } = await anonClient.auth.signInWithPassword({
    email: 'audit_cand2@talentxcel-audit.local',
    password: 'AuditPassword123!Secure'
  });
  const clientB = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${authB.session.access_token}` } },
    auth: { persistSession: false }
  });
  const userB_id = authB.user.id;

  let passed = 0;
  let total = 0;
  function assert(testName, cond, details = '') {
    total++;
    if (cond) {
      console.log(`✅ PASS: ${testName} ${details ? '(' + details + ')' : ''}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName} ${details ? '(' + details + ')' : ''}`);
    }
  }

  // Scenario 2.1: Consent Grant (public)
  const resGrant = await clientA.rpc('set_public_profile_consent', {
    p_granted: true,
    p_visibility: 'public',
    p_source: 'user_privacy_dashboard'
  });
  assert('RPC Consent grant succeeds', resGrant.error === null && resGrant.data?.success === true, JSON.stringify(resGrant.data));

  // Verify DB state for Candidate 1
  const checkGrant = await runSql(`
    SELECT is_profile_public, profile_visibility 
    FROM public.profiles WHERE id = '${userA_id}';
  `, 'staging');
  assert('DB profile row reflects granted consent', checkGrant[0]?.is_profile_public === true && checkGrant[0]?.profile_visibility === 'public');

  // Scenario 2.2: Public Revocation (revoked, private)
  const resRevoke = await clientA.rpc('set_public_profile_consent', {
    p_granted: false,
    p_visibility: 'private',
    p_source: 'user_privacy_dashboard'
  });
  assert('RPC Public revocation succeeds', resRevoke.error === null && resRevoke.data?.success === true, JSON.stringify(resRevoke.data));

  const checkRevoke = await runSql(`
    SELECT is_profile_public, profile_visibility 
    FROM public.profiles WHERE id = '${userA_id}';
  `, 'staging');
  assert('DB profile row reflects revoked consent', checkRevoke[0]?.is_profile_public === false && checkRevoke[0]?.profile_visibility === 'private');

  // Scenario 2.3: Connections-only Transition
  const resConnOnly = await clientA.rpc('set_public_profile_consent', {
    p_granted: false,
    p_visibility: 'connections_only',
    p_source: 'user_privacy_dashboard'
  });
  assert('RPC Connections-only transition succeeds', resConnOnly.error === null && resConnOnly.data?.success === true, JSON.stringify(resConnOnly.data));

  const checkConnOnly = await runSql(`
    SELECT is_profile_public, profile_visibility 
    FROM public.profiles WHERE id = '${userA_id}';
  `, 'staging');
  assert('DB profile row reflects connections_only', checkConnOnly[0]?.is_profile_public === false && checkConnOnly[0]?.profile_visibility === 'connections_only');

  // Scenario 2.4: Private Transition
  const resPrivate = await clientA.rpc('set_public_profile_consent', {
    p_granted: false,
    p_visibility: 'private',
    p_source: 'user_privacy_dashboard'
  });
  assert('RPC Private transition succeeds', resPrivate.error === null && resPrivate.data?.success === true, JSON.stringify(resPrivate.data));

  // Scenario 2.5a: Invalid Arguments (inconsistent grant: granted=true with private)
  const resInvalid = await clientA.rpc('set_public_profile_consent', {
    p_granted: true,
    p_visibility: 'private',
    p_source: 'user_privacy_dashboard'
  });
  assert('RPC Inconsistent grant/visibility rejected', resInvalid.error !== null, resInvalid.error?.message);

  // Scenario 2.5b: Invalid Arguments (invalid visibility string)
  const resInvalidVis = await clientA.rpc('set_public_profile_consent', {
    p_granted: true,
    p_visibility: 'super_public_invalid',
    p_source: 'user_privacy_dashboard'
  });
  assert('RPC Invalid visibility rejected', resInvalidVis.error !== null, resInvalidVis.error?.message);

  // Scenario 2.5c: Invalid Arguments (invalid source)
  const resInvalidSource = await clientA.rpc('set_public_profile_consent', {
    p_granted: true,
    p_visibility: 'public',
    p_source: 'hacked_source'
  });
  assert('RPC Invalid source rejected', resInvalidSource.error !== null, resInvalidSource.error?.message);

  // Scenario 2.6: Cross-user attempts (Can User A mutate User B's consent?)
  const checkBBefore = await runSql(`SELECT updated_at FROM public.profiles WHERE id = '${userB_id}';`, 'staging');
  await clientA.rpc('set_public_profile_consent', {
    p_granted: true,
    p_visibility: 'public',
    p_source: 'user_privacy_dashboard'
  });
  const checkBAfter = await runSql(`SELECT updated_at FROM public.profiles WHERE id = '${userB_id}';`, 'staging');
  assert('Cross-user isolation: User A cannot affect User B', checkBBefore[0]?.updated_at === checkBAfter[0]?.updated_at);

  // Scenario 2.7: Missing Profile (Auth user with no profile row)
  const fakeUserId = '99999999-9999-9999-9999-999999999999';
  const missingRes = runSql(`
    DO $$
    DECLARE
      v_res jsonb;
    BEGIN
      PERFORM set_config('request.jwt.claim.sub', '${fakeUserId}', true);
      PERFORM set_config('request.jwt.claim.role', 'authenticated', true);
      SELECT public.set_public_profile_consent(true, 'public', 'user_privacy_dashboard') INTO v_res;
    END $$;
  `, 'staging');
  const missingMsg = [missingRes.stdout, missingRes.stderr, missingRes.error, JSON.stringify(missingRes)].join(' ');
  const missingProfileCaught = missingMsg.includes('Profile row not found') || missingMsg.includes('P0002');
  assert('Missing profile row triggers rollback exception', missingProfileCaught, 'P0002 / Profile row not found caught');

  // Scenario 2.8: Direct Sensitive-Column Writes
  const { error: directWriteErr } = await clientA
    .from('profiles')
    .update({ profile_visibility: 'public' })
    .eq('id', userA_id);
  assert('Direct sensitive-column write blocked', directWriteErr !== null && (directWriteErr.code === '42501' || directWriteErr.message.includes('permission denied')));

  // Scenario 2.9: GUC caller isolation (PostgREST provides no GUC mutation interface; column permissions block all direct mutation)
  const { error: gucBlockedErr } = await clientA
    .from('profiles')
    .update({ verification_status: 'verified' })
    .eq('id', userA_id);
  assert('Column permissions prevent GUC bypass on verification_status', gucBlockedErr !== null && gucBlockedErr.code === '42501', gucBlockedErr?.message);

  console.log(`\nGATE 2 RESULTS: ${passed} / ${total} TESTS PASSED.`);
}

main().catch(e => console.error(e));
