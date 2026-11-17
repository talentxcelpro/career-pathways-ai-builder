const { createClient } = require('@supabase/supabase-js');
const { runSql, STAGING_REF } = require('./db-audit-helper.cjs');

const SUPABASE_URL = `https://${STAGING_REF}.supabase.co`;
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2d3d0cXV1ZXhoeXlkd2loamJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM1OTI1NzYsImV4cCI6MjEwOTE2ODU3Nn0.ZBevJqFcBzb2UAwwr_o5zgUcrrI5uf1rFgsn-cMFXnQ";

const anonClient = createClient(SUPABASE_URL, ANON_KEY, { auth: { persistSession: false } });

async function runSuite() {
  console.log('========================================================================');
  console.log('TALENTXCEL MIGRATION B COMPREHENSIVE SECURITY & REGRESSION SUITE');
  console.log('Target: Staging (pvwwtquuexhyydwihjbi)');
  console.log('========================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(name, condition, details = '') {
    if (condition) {
      console.log(`✅ PASS: ${name} ${details ? '(' + details + ')' : ''}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${name} ${details ? '(' + details + ')' : ''}`);
      failed++;
    }
  }

  // --- 1. ANONYMOUS ACCESS RESTRICTIONS ---
  console.log('\n--- SUITE 1: ANONYMOUS ACCESS RESTRICTIONS ---');

  // Test 1.1: Anonymous cannot read base public.profiles
  const { data: anonProfiles, error: anonErr1 } = await anonClient
    .from('profiles')
    .select('id, full_name, email')
    .limit(5);
  assert(
    'Anon direct SELECT on profiles blocked',
    anonErr1 !== null || (Array.isArray(anonProfiles) && anonProfiles.length === 0),
    anonErr1 ? anonErr1.message : 'Returned 0 rows'
  );

  // Test 1.2: Anonymous cannot read connection_profiles
  const { data: anonConn, error: anonErr2 } = await anonClient
    .from('connection_profiles')
    .select('*')
    .limit(5);
  assert(
    'Anon SELECT on connection_profiles blocked',
    anonErr2 !== null || (Array.isArray(anonConn) && anonConn.length === 0),
    anonErr2 ? anonErr2.message : 'Returned 0 rows'
  );

  // Test 1.3: Anonymous cannot read applicant_profiles
  const { data: anonApp, error: anonErr3 } = await anonClient
    .from('applicant_profiles')
    .select('*')
    .limit(5);
  assert(
    'Anon SELECT on applicant_profiles blocked',
    anonErr3 !== null || (Array.isArray(anonApp) && anonApp.length === 0),
    anonErr3 ? anonErr3.message : 'Returned 0 rows'
  );

  // Test 1.4: Anonymous can read public_profiles affirmative view
  const { data: anonPub, error: anonErr4 } = await anonClient
    .from('public_profiles')
    .select('id, full_name, title, skills, created_at, is_profile_public')
    .limit(5);
  assert(
    'Anon can query public_profiles affirmative view',
    anonErr4 === null && Array.isArray(anonPub),
    `Count: ${anonPub?.length ?? 0}`
  );

  // Test 1.5: Verify updated_at is NOT in public_profiles
  const { data: anonPubBadCol, error: anonErr5 } = await anonClient
    .from('public_profiles')
    .select('id, updated_at')
    .limit(1);
  assert(
    'public_profiles does NOT expose updated_at',
    anonErr5 !== null,
    anonErr5?.message
  );

  // --- 2. AUTHENTICATED USER IDENTITIES ---
  console.log('\n--- SUITE 2: AUTHENTICATED USER ACCESS & ISOLATION ---');

  // Candidate 1 (User A)
  const { data: authA, error: loginErrA } = await anonClient.auth.signInWithPassword({
    email: 'audit_cand1@talentxcel-audit.local',
    password: 'AuditPassword123!Secure'
  });
  if (loginErrA) throw new Error('User A login failed: ' + loginErrA.message);

  const clientA = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${authA.session.access_token}` } },
    auth: { persistSession: false }
  });
  const userA_id = authA.user.id;

  // Candidate 2 (User B)
  const { data: authB, error: loginErrB } = await anonClient.auth.signInWithPassword({
    email: 'audit_cand2@talentxcel-audit.local',
    password: 'AuditPassword123!Secure'
  });
  if (loginErrB) throw new Error('User B login failed: ' + loginErrB.message);

  const clientB = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${authB.session.access_token}` } },
    auth: { persistSession: false }
  });
  const userB_id = authB.user.id;

  // Recruiter 1
  const { data: authRec, error: loginErrRec } = await anonClient.auth.signInWithPassword({
    email: 'audit_rec1@talentxcel-audit.local',
    password: 'AuditPassword123!Secure'
  });
  if (loginErrRec) throw new Error('Recruiter login failed: ' + loginErrRec.message);

  const clientRec = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${authRec.session.access_token}` } },
    auth: { persistSession: false }
  });
  const rec_id = authRec.user.id;

  // Test 2.1: User A can read own profile
  const { data: ownProfA, error: errOwnA } = await clientA
    .from('profiles')
    .select('id, full_name, email')
    .eq('id', userA_id)
    .maybeSingle();
  assert('User A can read own full profile', errOwnA === null && ownProfA?.id === userA_id);

  // Test 2.2: User A CANNOT read User B's profile directly from base table
  const { data: otherProf, error: errOther } = await clientA
    .from('profiles')
    .select('id, full_name, email')
    .eq('id', userB_id)
    .maybeSingle();
  assert('User A cannot read User B profile row on base table', otherProf === null);

  // Test 2.3: User A CANNOT update User B's profile
  const { data: maliciousUpdate, error: errMalUp } = await clientA
    .from('profiles')
    .update({ full_name: 'Hacked Name' })
    .eq('id', userB_id)
    .select();
  assert('User A cannot update User B profile', (maliciousUpdate || []).length === 0);

  // Test 2.4: User A CAN update their own profile
  const originalName = ownProfA.full_name || 'Audit Candidate One';
  const { data: validUpdate, error: errValUp } = await clientA
    .from('profiles')
    .update({ full_name: originalName })
    .eq('id', userA_id)
    .select();
  assert('User A can update own profile', errValUp === null && (validUpdate || []).length === 1);

  // --- 3. CONNECTIONS INTERFACE VERIFICATION ---
  console.log('\n--- SUITE 3: CONNECTIONS INTERFACE (connection_profiles) ---');

  const CONN_ID = 'c1111111-1111-1111-1111-111111111111';
  await runSql(`
    INSERT INTO public.connections (id, requester_id, recipient_id, status)
    VALUES ('${CONN_ID}', '${userA_id}', '${userB_id}', 'accepted')
    ON CONFLICT (id) DO UPDATE SET status = 'accepted';
  `, 'staging');

  // Test 3.1: User A reads User B via connection_profiles
  const { data: connB, error: errConnB } = await clientA
    .from('connection_profiles')
    .select('*')
    .eq('id', userB_id)
    .maybeSingle();
  assert(
    'User A can read accepted connection User B via connection_profiles',
    errConnB === null && connB?.id === userB_id,
    `Fields: ${Object.keys(connB || {}).join(', ')}`
  );

  // Test 3.2: Verify connection_profiles does NOT expose email, phone, salary
  assert('connection_profiles does NOT contain email', !('email' in (connB || {})));
  assert('connection_profiles does NOT contain phone', !('phone' in (connB || {})));
  assert('connection_profiles does NOT contain current_salary', !('current_salary' in (connB || {})));
  assert('connection_profiles does NOT contain target_salary', !('target_salary' in (connB || {})));

  // Test 3.3: User A CANNOT read unconnected user via connection_profiles
  const UNCONNECTED_ID = '00000000-0000-0000-0000-000000000001';
  const { data: connUnconnected } = await clientA
    .from('connection_profiles')
    .select('*')
    .eq('id', UNCONNECTED_ID)
    .maybeSingle();
  assert('Unconnected user not visible in connection_profiles', connUnconnected === null);

  // --- 4. RECRUITER APPLICANT INTERFACE ---
  console.log('\n--- SUITE 4: RECRUITER APPLICANT INTERFACE (applicant_profiles) ---');

  // Test 4.1: Recruiter can view applicant Candidate 1 (userA_id) via applicant_profiles
  const { data: appRecord, error: errApp } = await clientRec
    .from('applicant_profiles')
    .select('*')
    .eq('candidate_id', userA_id)
    .maybeSingle();
  assert(
    'Recruiter can view applicant A via applicant_profiles',
    errApp === null && appRecord?.candidate_id === userA_id,
    `Fields: ${Object.keys(appRecord || {}).join(', ')}`
  );
  assert('applicant_profiles does NOT expose base current_salary', !('current_salary' in (appRecord || {})));
  assert('applicant_profiles does NOT expose base target_salary', !('target_salary' in (appRecord || {})));

  // Test 4.2: Candidate B CANNOT view other applicants or arbitrary jobs in applicant_profiles
  const { data: appCandidateProbe } = await clientB
    .from('applicant_profiles')
    .select('*')
    .eq('candidate_id', userA_id)
    .maybeSingle();
  assert('Candidate B cannot query unauthorized applications in applicant_profiles', appCandidateProbe === null);

  // --- 5. SOCIAL FEED AUTHOR SNIPPETS ---
  console.log('\n--- SUITE 5: SOCIAL FEED AUTHOR SNIPPETS (feed_author_snippets) ---');

  const SYNTH_POST_ID = 'c0000000-0000-0000-0000-000000000001';
  await runSql(`
    INSERT INTO public.posts (id, author_id, content, is_public, visibility, status, is_deleted)
    VALUES ('${SYNTH_POST_ID}', '${userB_id}', 'Audit post content', true, 'public', 'published', false)
    ON CONFLICT (id) DO UPDATE SET is_public = true, is_deleted = false;
  `, 'staging');

  // Test 5.1: Authenticated User A can query author snippet
  const { data: snippet, error: errSnip } = await clientA
    .from('feed_author_snippets')
    .select('*')
    .eq('id', userB_id)
    .maybeSingle();
  assert(
    'User A can view public post author snippet',
    errSnip === null && snippet?.id === userB_id,
    `Fields: ${Object.keys(snippet || {}).join(', ')}`
  );
  assert('feed_author_snippets does NOT contain email', !('email' in (snippet || {})));
  assert('feed_author_snippets does NOT contain salary', !('current_salary' in (snippet || {})));

  // --- 6. SERVICE-ROLE MUTATION RESTRICTIONS ---
  console.log('\n--- SUITE 6: SERVICE-ROLE PRIVILEGE HARDENING ---');

  // Test 6.1: Direct INSERT on candidate_privacy_consents by service_role is DENIED
  const srvInsertSql = await runSql(`
    SET ROLE service_role;
    INSERT INTO public.candidate_privacy_consents (user_id, consent_type, consent_status)
    VALUES ('${userA_id}', 'public_profile_indexing', 'granted');
  `, 'staging');
  assert(
    'service_role direct INSERT on candidate_privacy_consents blocked (42501)',
    JSON.stringify(srvInsertSql).includes('42501') || JSON.stringify(srvInsertSql).includes('permission denied')
  );

  // Test 6.2: Direct UPDATE on candidate_privacy_consents by service_role is DENIED
  const srvUpdateSql = await runSql(`
    SET ROLE service_role;
    UPDATE public.candidate_privacy_consents SET consent_status = 'granted' WHERE user_id = '${userA_id}';
  `, 'staging');
  assert(
    'service_role direct UPDATE on candidate_privacy_consents blocked (42501)',
    JSON.stringify(srvUpdateSql).includes('42501') || JSON.stringify(srvUpdateSql).includes('permission denied')
  );

  // Test 6.3: Direct DELETE on candidate_privacy_consents by service_role is DENIED
  const srvDeleteSql = await runSql(`
    SET ROLE service_role;
    DELETE FROM public.candidate_privacy_consents WHERE user_id = '${userA_id}';
  `, 'staging');
  assert(
    'service_role direct DELETE on candidate_privacy_consents blocked (42501)',
    JSON.stringify(srvDeleteSql).includes('42501') || JSON.stringify(srvDeleteSql).includes('permission denied')
  );

  // Test 6.4: Direct TRUNCATE on candidate_privacy_consents by service_role is DENIED
  const srvTruncSql = await runSql(`
    SET ROLE service_role;
    TRUNCATE TABLE public.candidate_privacy_consents;
  `, 'staging');
  assert(
    'service_role TRUNCATE on candidate_privacy_consents blocked (42501)',
    JSON.stringify(srvTruncSql).includes('42501') || JSON.stringify(srvTruncSql).includes('permission denied')
  );

  // Test 6.5: Direct TRUNCATE on profiles by service_role is DENIED
  const srvTruncProf = await runSql(`
    SET ROLE service_role;
    TRUNCATE TABLE public.profiles;
  `, 'staging');
  assert(
    'service_role TRUNCATE on profiles blocked (42501)',
    JSON.stringify(srvTruncProf).includes('42501') || JSON.stringify(srvTruncProf).includes('permission denied')
  );

  // --- 7. CLEANUP SYNTHETIC ROWS ---
  await runSql(`
    DELETE FROM public.posts WHERE id = '${SYNTH_POST_ID}';
    DELETE FROM public.connections WHERE id = '${CONN_ID}';
  `, 'staging');

  console.log('\n========================================================================');
  console.log(`FINAL RESULTS: ${passed} PASSED, ${failed} FAILED (TOTAL: ${passed + failed})`);
  console.log('========================================================================\n');

  if (failed > 0) process.exit(1);
}

runSuite().catch(err => {
  console.error('Fatal suite failure:', err);
  process.exit(1);
});
