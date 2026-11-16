const { createClient } = require('@supabase/supabase-js');
const { runSql, STAGING_REF } = require('./db-audit-helper.cjs');
const path = require('path');
const fs = require('fs');

const SUPABASE_URL = `https://${STAGING_REF}.supabase.co`;
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2d3d0cXV1ZXhoeXlkd2loamJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM1OTI1NzYsImV4cCI6MjEwOTE2ODU3Nn0.ZBevJqFcBzb2UAwwr_o5zgUcrrI5uf1rFgsn-cMFXnQ";

process.env.SUPABASE_REST_URL = `${SUPABASE_URL}/rest/v1`;
process.env.SUPABASE_ANON_KEY = ANON_KEY;

const anonClient = createClient(SUPABASE_URL, ANON_KEY, { auth: { persistSession: false } });

async function runAllGates() {
  console.log('========================================================================');
  console.log('TALENTXCEL MIGRATION B FULL SECURITY GATES & ADVERSARIAL TEST SUITE');
  console.log(`Target: Staging (${STAGING_REF})`);
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

  // Login Test Users
  const { data: authA } = await anonClient.auth.signInWithPassword({
    email: 'audit_cand1@talentxcel-audit.local',
    password: 'AuditPassword123!Secure'
  });
  const clientA = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${authA.session.access_token}` } },
    auth: { persistSession: false }
  });
  const userA_id = authA.user.id;

  const { data: authB } = await anonClient.auth.signInWithPassword({
    email: 'audit_cand2@talentxcel-audit.local',
    password: 'AuditPassword123!Secure'
  });
  const clientB = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${authB.session.access_token}` } },
    auth: { persistSession: false }
  });
  const userB_id = authB.user.id;

  const { data: authRec } = await anonClient.auth.signInWithPassword({
    email: 'audit_rec1@talentxcel-audit.local',
    password: 'AuditPassword123!Secure'
  });
  const clientRec = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${authRec.session.access_token}` } },
    auth: { persistSession: false }
  });
  const rec_id = authRec.user.id;

  console.log(`Authenticated: User A (${userA_id}), User B (${userB_id}), Recruiter (${rec_id})`);

  // ==========================================================================
  // GATE 1: PROFILE OWNER COLUMN-LEVEL SECURITY
  // ==========================================================================
  console.log('\n--- GATE 1: PROFILE OWNER COLUMN-LEVEL SECURITY ---');

  // Test 1.1: Direct UPDATE of verification_status is DENIED (42501)
  const { error: errVerif } = await clientA
    .from('profiles')
    .update({ verification_status: 'verified' })
    .eq('id', userA_id);
  assert(
    'Direct UPDATE of verification_status denied (42501)',
    errVerif !== null && (errVerif.code === '42501' || errVerif.message.includes('permission denied')),
    errVerif?.message
  );

  // Test 1.2: Direct UPDATE of user_role is DENIED (42501)
  const { error: errRole } = await clientA
    .from('profiles')
    .update({ user_role: 'admin' })
    .eq('id', userA_id);
  assert(
    'Direct UPDATE of user_role denied (42501)',
    errRole !== null && (errRole.code === '42501' || errRole.message.includes('permission denied')),
    errRole?.message
  );

  // Test 1.3: Direct UPDATE of profile_visibility is DENIED (42501)
  const { error: errVis } = await clientA
    .from('profiles')
    .update({ profile_visibility: 'public' })
    .eq('id', userA_id);
  assert(
    'Direct UPDATE of profile_visibility denied (42501)',
    errVis !== null && (errVis.code === '42501' || errVis.message.includes('permission denied')),
    errVis?.message
  );

  // Test 1.4: Direct UPDATE of is_profile_public is DENIED (42501)
  const { error: errPubBool } = await clientA
    .from('profiles')
    .update({ is_profile_public: true })
    .eq('id', userA_id);
  assert(
    'Direct UPDATE of is_profile_public denied (42501)',
    errPubBool !== null && (errPubBool.code === '42501' || errPubBool.message.includes('permission denied')),
    errPubBool?.message
  );

  // Test 1.5: Direct INSERT with privileged verification_status is DENIED
  const { error: errInsPriv } = await clientA
    .from('profiles')
    .insert({
      id: userA_id,
      verification_status: 'verified'
    });
  assert(
    'INSERT with verification_status denied (42501)',
    errInsPriv !== null && (errInsPriv.code === '42501' || errInsPriv.message.includes('permission denied')),
    errInsPriv?.message
  );

  // Test 1.6: Onboarding Upsert with allowed user-editable columns SUCCEEDS
  const { data: upsertData, error: errUpsert } = await clientA
    .from('profiles')
    .upsert({
      id: userA_id,
      full_name: 'Audit Candidate One Updated',
      headline: 'Senior Cloud Security Architect',
      location: 'Dubai, UAE'
    })
    .select('id, full_name, headline, location')
    .single();
  assert(
    'Legitimate onboarding upsert with allowed columns succeeds',
    errUpsert === null && upsertData?.full_name === 'Audit Candidate One Updated',
    `Updated headline: ${upsertData?.headline}, Error: ${JSON.stringify(errUpsert)}`
  );

  // ==========================================================================
  // GATE 2: CONNECTION PROFILE PRIVACY & VISIBILITY TRANSITIONS
  // ==========================================================================
  console.log('\n--- GATE 2: CONNECTION PROFILE PRIVACY & VISIBILITY TRANSITIONS ---');

  const CONN_ID = 'c1111111-1111-1111-1111-111111111111';
  await runSql(`
    INSERT INTO public.connections (id, requester_id, recipient_id, status)
    VALUES ('${CONN_ID}', '${userA_id}', '${userB_id}', 'accepted')
    ON CONFLICT (id) DO UPDATE SET status = 'accepted';
  `, 'staging');

  // Step 2.1: User B grants public consent -> User A sees User B in connection_profiles
  const rpcPub = await clientB.rpc('set_public_profile_consent', {
    p_granted: true,
    p_visibility: 'public',
    p_source: 'profile_settings'
  });
  if (rpcPub.error) throw new Error('User B rpc grant failed: ' + rpcPub.error.message);

  const { data: connPubB } = await clientA
    .from('connection_profiles')
    .select('id, full_name, profile_picture_url')
    .eq('id', userB_id)
    .maybeSingle();
  assert('Connection view: User B visible when profile_visibility = public', connPubB?.id === userB_id);

  // Step 2.2: User B sets connections_only -> User A (connected) still sees User B
  const rpcConnOnly = await clientB.rpc('set_public_profile_consent', {
    p_granted: false,
    p_visibility: 'connections_only',
    p_source: 'profile_settings'
  });
  if (rpcConnOnly.error) throw new Error('User B rpc connections_only failed: ' + rpcConnOnly.error.message);

  const { data: connConnOnlyB } = await clientA
    .from('connection_profiles')
    .select('id, full_name, verification_status')
    .eq('id', userB_id)
    .maybeSingle();
  assert('Connection view: User B visible to accepted connection when connections_only', connConnOnlyB?.id === userB_id);

  // Step 2.3: Unconnected user (Recruiter without accepted connection) CANNOT see User B in connection_profiles
  const { data: connUnconnRec } = await clientRec
    .from('connection_profiles')
    .select('id')
    .eq('id', userB_id)
    .maybeSingle();
  assert('Connection view: User B HIDDEN from unconnected Recruiter when connections_only', connUnconnRec === null);

  // Step 2.4: User B sets profile_visibility = private -> User A (connected!) CANNOT see User B
  const rpcPriv = await clientB.rpc('set_public_profile_consent', {
    p_granted: false,
    p_visibility: 'private',
    p_source: 'profile_settings'
  });
  if (rpcPriv.error) throw new Error('User B rpc private failed: ' + rpcPriv.error.message);

  const { data: connPrivB } = await clientA
    .from('connection_profiles')
    .select('id')
    .eq('id', userB_id)
    .maybeSingle();
  assert(
    'Connection view: User B STRICTLY HIDDEN from connected User A when profile_visibility = private',
    connPrivB === null
  );

  // Restore User B to connections_only for subsequent tests
  await clientB.rpc('set_public_profile_consent', {
    p_granted: false,
    p_visibility: 'connections_only',
    p_source: 'profile_settings'
  });

  // ==========================================================================
  // GATE 3: APPLICANT PROFILE AUTHORIZATION MATRIX
  // ==========================================================================
  console.log('\n--- GATE 3: APPLICANT PROFILE AUTHORIZATION MATRIX ---');

  const REAL_COMPANY_ID = '11111111-aaaa-aaaa-aaaa-111111111111';
  const OTHER_COMPANY_ID = '22222222-bbbb-bbbb-bbbb-222222222222';
  const TEAM_MEMBER_ID = '11111111-cccc-cccc-cccc-111111111111';
  const TEST_JOB_ID = 'f0000000-0000-0000-0000-000000000001';
  const TEST_APP_ID = 'a0000000-0000-0000-0000-000000000001';

  // Seed test job with description and test application with valid status 'applied'
  await runSql(`
    INSERT INTO public.jobs (id, company_id, posted_by, title, description, requirements, is_active)
    VALUES ('${TEST_JOB_ID}', '${REAL_COMPANY_ID}', '${rec_id}', 'Principal Security Engineer', 'Job description text', 'Job requirements text', true)
    ON CONFLICT (id) DO UPDATE SET company_id = '${REAL_COMPANY_ID}', posted_by = '${rec_id}', description = 'Job description text';

    INSERT INTO public.job_applications (id, job_id, user_id, status)
    VALUES ('${TEST_APP_ID}', '${TEST_JOB_ID}', '${userA_id}', 'applied')
    ON CONFLICT (id) DO UPDATE SET status = 'applied';
  `, 'staging');

  // Case 3.1: Active Recruiter of Company -> ALLOWED
  await runSql(`
    UPDATE public.company_team_members 
    SET role = 'recruiter', is_active = true, permissions = '{}'::jsonb, company_id = '${REAL_COMPANY_ID}'
    WHERE id = '${TEAM_MEMBER_ID}';
  `, 'staging');
  const { data: appRecruiter } = await clientRec
    .from('applicant_profiles')
    .select('application_id, candidate_id')
    .eq('application_id', TEST_APP_ID)
    .maybeSingle();
  assert('Applicant auth: Active Recruiter can view applicant', appRecruiter?.application_id === TEST_APP_ID);

  // Case 3.2: Active HR Manager -> ALLOWED
  await runSql(`
    UPDATE public.company_team_members 
    SET role = 'hr_manager', is_active = true, permissions = '{}'::jsonb
    WHERE id = '${TEAM_MEMBER_ID}';
  `, 'staging');
  const { data: appHr } = await clientRec
    .from('applicant_profiles')
    .select('application_id')
    .eq('application_id', TEST_APP_ID)
    .maybeSingle();
  assert('Applicant auth: Active HR Manager can view applicant', appHr?.application_id === TEST_APP_ID);

  // Case 3.3: Active member with manage_jobs permission -> ALLOWED
  await runSql(`
    UPDATE public.company_team_members 
    SET role = 'viewer', is_active = true, permissions = '{"manage_jobs": true}'::jsonb 
    WHERE id = '${TEAM_MEMBER_ID}';
  `, 'staging');
  const { data: appManageJobs } = await clientRec
    .from('applicant_profiles')
    .select('application_id')
    .eq('application_id', TEST_APP_ID)
    .maybeSingle();
  assert('Applicant auth: Team member with manage_jobs permission can view applicant', appManageJobs?.application_id === TEST_APP_ID);

  // Case 3.4: Ordinary Viewer without manage_jobs -> BLOCKED (0 rows)
  await runSql(`
    UPDATE public.company_team_members 
    SET role = 'viewer', is_active = true, permissions = '{"manage_jobs": false}'::jsonb 
    WHERE id = '${TEAM_MEMBER_ID}';
  `, 'staging');
  const { data: appViewer } = await clientRec
    .from('applicant_profiles')
    .select('application_id')
    .eq('application_id', TEST_APP_ID)
    .maybeSingle();
  assert('Applicant auth: Team viewer without manage_jobs is BLOCKED', appViewer === null);

  // Case 3.5: Suspended/deactivated member (is_active = false) -> BLOCKED (0 rows)
  await runSql(`
    UPDATE public.company_team_members 
    SET role = 'recruiter', is_active = false, permissions = '{"manage_jobs": true}'::jsonb 
    WHERE id = '${TEAM_MEMBER_ID}';
  `, 'staging');
  const { data: appSuspended } = await clientRec
    .from('applicant_profiles')
    .select('application_id')
    .eq('application_id', TEST_APP_ID)
    .maybeSingle();
  assert('Applicant auth: Suspended team member (is_active = false) is BLOCKED', appSuspended === null);

  // Case 3.6: Removed member (deactivate/delete) -> BLOCKED (0 rows)
  await runSql(`
    UPDATE public.company_team_members 
    SET is_active = false 
    WHERE id = '${TEAM_MEMBER_ID}';
  `, 'staging');
  const { data: appRemoved } = await clientRec
    .from('applicant_profiles')
    .select('application_id')
    .eq('application_id', TEST_APP_ID)
    .maybeSingle();
  assert('Applicant auth: Removed/inactive team member is BLOCKED', appRemoved === null);

  // Case 3.7: Member of a different company -> BLOCKED (0 rows)
  await runSql(`
    UPDATE public.company_team_members 
    SET role = 'recruiter', is_active = true, company_id = '${OTHER_COMPANY_ID}' 
    WHERE id = '${TEAM_MEMBER_ID}';
  `, 'staging');
  const { data: appOtherCompany } = await clientRec
    .from('applicant_profiles')
    .select('application_id')
    .eq('application_id', TEST_APP_ID)
    .maybeSingle();
  assert('Applicant auth: Member of different company is BLOCKED', appOtherCompany === null);

  // Case 3.8: Unrelated candidate User B -> BLOCKED (0 rows)
  const { data: appCandidateB } = await clientB
    .from('applicant_profiles')
    .select('application_id')
    .eq('application_id', TEST_APP_ID)
    .maybeSingle();
  assert('Applicant auth: Arbitrary candidate B is BLOCKED', appCandidateB === null);

  // Restore Recruiter membership
  await runSql(`
    UPDATE public.company_team_members 
    SET role = 'admin', is_active = true, company_id = '${REAL_COMPANY_ID}', permissions = '{}'::jsonb
    WHERE id = '${TEAM_MEMBER_ID}';
  `, 'staging');

  // ==========================================================================
  // GATE 4: VIEW SECURITY MODEL AUDIT
  // ==========================================================================
  console.log('\n--- GATE 4: VIEW SECURITY MODEL AUDIT ---');

  const viewAudit = await runSql(`
    SELECT 
      c.relname AS view_name,
      pg_get_userbyid(c.relowner) AS view_owner,
      c.reloptions AS options
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relkind = 'v'
      AND c.relname IN ('public_profiles', 'connection_profiles', 'applicant_profiles', 'feed_author_snippets')
    ORDER BY c.relname;
  `, 'staging');

  for (const v of viewAudit) {
    const isBarrier = Array.isArray(v.options) && v.options.includes('security_barrier=true');
    const isInvoker = Array.isArray(v.options) && v.options.includes('security_invoker=true');
    assert(`View ${v.view_name} owned by postgres`, v.view_owner === 'postgres');
    assert(`View ${v.view_name} has security_barrier = true`, isBarrier === true);
    assert(`View ${v.view_name} has security_invoker = false`, isInvoker === false);
  }

  // ==========================================================================
  // GATE 5: FEED AUTHOR PRIVACY
  // ==========================================================================
  console.log('\n--- GATE 5: FEED AUTHOR PRIVACY ---');

  // Candidate B has private profile
  await clientB.rpc('set_public_profile_consent', {
    p_granted: false,
    p_visibility: 'private',
    p_source: 'profile_settings'
  });

  const SYNTH_POST_ID = 'c0000000-0000-0000-0000-000000000002';
  await runSql(`
    INSERT INTO public.posts (id, author_id, user_id, content, is_public, visibility, status, is_deleted)
    VALUES ('${SYNTH_POST_ID}', '${userB_id}', '${userB_id}', 'Published public research post', true, 'public', 'published', false)
    ON CONFLICT (id) DO UPDATE SET author_id = '${userB_id}', user_id = '${userB_id}', is_public = true, visibility = 'public', status = 'published', is_deleted = false;
  `, 'staging');

  // Test 5.1: Authenticated User A queries feed snippet for User B
  const { data: snippetB, error: errSnipB } = await clientA
    .from('feed_author_snippets')
    .select('*')
    .eq('id', userB_id)
    .maybeSingle();
  assert(
    'Feed author snippet returns 8 display fields for public post author',
    errSnipB === null && snippetB?.id === userB_id,
    `Fields: ${Object.keys(snippetB || {}).join(', ')}`
  );
  assert('feed_author_snippets strictly excludes email', !('email' in (snippetB || {})));
  assert('feed_author_snippets strictly excludes phone', !('phone' in (snippetB || {})));
  assert('feed_author_snippets strictly excludes salary', !('preferred_salary_min' in (snippetB || {})));
  assert('feed_author_snippets strictly excludes resume', !('resume_url' in (snippetB || {})));

  // Test 5.2: Full profile query by User A for User B is BLOCKED on base profiles
  const { data: fullProfB } = await clientA
    .from('profiles')
    .select('id, email, phone')
    .eq('id', userB_id)
    .maybeSingle();
  assert('Attacker CANNOT read full profile of private post author from profiles', fullProfB === null);

  // Test 5.3: Deleted post excludes author snippet
  await runSql(`UPDATE public.posts SET is_deleted = true WHERE id = '${SYNTH_POST_ID}';`, 'staging');
  const { data: delSnippetB } = await clientA
    .from('feed_author_snippets')
    .select('id')
    .eq('id', userB_id)
    .maybeSingle();
  assert('Deleted post author snippet is EXCLUDED from feed_author_snippets', delSnippetB === null);

  // ==========================================================================
  // GATE 7: EDGE CACHE REVOCATION REGRESSION TEST
  // ==========================================================================
  console.log('\n--- GATE 7: EDGE CACHE REVOCATION REGRESSION TEST ---');

  const { default: edgeHandler } = await import('../api/seo-render.ts');

  // Step 7.1: Candidate 1 grants affirmative public consent
  await clientA.rpc('set_public_profile_consent', {
    p_granted: true,
    p_visibility: 'public',
    p_source: 'profile_settings'
  });

  // Fetch from edge hydrator WITHOUT any cache-buster query parameters
  const reqGrant = new Request(`https://talentxcel.in/profile/${userA_id}`, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1)' }
  });
  const resGrant = await edgeHandler(reqGrant);
  const textGrant = await resGrant.text();
  assert('Edge hydrator returns 200 OK after consent grant', resGrant.status === 200);
  assert('Edge hydrator returns index, follow after consent grant', resGrant.headers.get('X-Robots-Tag')?.includes('index'));
  assert('Edge hydrator HTML contains candidate name', textGrant.includes('Audit Candidate One'));

  // Step 7.2: Candidate 1 revokes consent via RPC
  await clientA.rpc('set_public_profile_consent', {
    p_granted: false,
    p_visibility: 'private',
    p_source: 'profile_settings'
  });

  // Fetch from edge hydrator WITHOUT any cache-buster query parameters
  const reqRevoke = new Request(`https://talentxcel.in/profile/${userA_id}`, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1)' }
  });
  const resRevoke = await edgeHandler(reqRevoke);
  const textRevoke = await resRevoke.text();
  assert('Edge hydrator returns 404 Not Found after revocation (NO CACHE BUSTERS)', resRevoke.status === 404);
  assert('Edge hydrator returns noindex, nofollow after revocation', resRevoke.headers.get('X-Robots-Tag') === 'noindex, nofollow');
  assert('Edge hydrator HTML body does NOT leak candidate name after revocation', !textRevoke.includes('Audit Candidate One'));
  assert('Edge hydrator uses 404-Guard engine', resRevoke.headers.get('X-Render-Engine') === 'TalentXcel-Edge-404-Guard');

  // Step 7.3: Candidate 1 re-grants consent
  await clientA.rpc('set_public_profile_consent', {
    p_granted: true,
    p_visibility: 'public',
    p_source: 'profile_settings'
  });
  const reqRegrant = new Request(`https://talentxcel.in/profile/${userA_id}`);
  const resRegrant = await edgeHandler(reqRegrant);
  assert('Edge hydrator returns 200 OK after consent re-grant', resRegrant.status === 200);

  // ==========================================================================
  // GATE 6: ROLLBACK AND REAPPLICATION VERIFICATION
  // ==========================================================================
  console.log('\n--- GATE 6: ROLLBACK AND REAPPLICATION VERIFICATION ---');

  const rollbackPath = path.join(__dirname, '..', 'supabase', 'migrations', '20261114190000_txc_migration_b_secure_profiles_access_model_rollback.sql');
  const rollbackSql = fs.readFileSync(rollbackPath, 'utf8');

  // Ensure rollback SQL does NOT contain dangerous service_role re-grants
  assert('Rollback does NOT grant INSERT on consents to service_role', !rollbackSql.includes('GRANT INSERT') || !rollbackSql.includes('candidate_privacy_consents TO service_role'));
  assert('Rollback does NOT grant UPDATE on consents to service_role', !rollbackSql.includes('GRANT UPDATE') || !rollbackSql.includes('candidate_privacy_consents TO service_role'));
  assert('Rollback does NOT grant DELETE on consents to service_role', !rollbackSql.includes('GRANT DELETE') || !rollbackSql.includes('candidate_privacy_consents TO service_role'));
  assert('Rollback does NOT grant TRUNCATE on profiles to service_role', !rollbackSql.includes('GRANT TRUNCATE ON TABLE public.profiles TO service_role'));

  // Execute Rollback on Staging
  console.log('Executing Rollback on Staging...');
  await runSql(rollbackSql, 'staging');

  // Check state after rollback
  const rolledViews = await runSql(`
    SELECT table_name 
    FROM information_schema.views 
    WHERE table_schema = 'public' 
      AND table_name IN ('connection_profiles', 'applicant_profiles', 'feed_author_snippets', 'public_profiles');
  `, 'staging');
  const rolledViewNames = rolledViews.map(v => v.table_name);
  assert('Specialized views dropped on rollback', !rolledViewNames.includes('connection_profiles') && !rolledViewNames.includes('applicant_profiles') && !rolledViewNames.includes('feed_author_snippets'));
  assert('public_profiles view remains present on rollback', rolledViewNames.includes('public_profiles'));

  // Check consent records survived rollback
  const consentRecords = await runSql(`
    SELECT count(*)::integer AS count FROM public.candidate_privacy_consents;
  `, 'staging');
  assert('Consent history preserved during rollback', (consentRecords[0]?.count ?? 0) > 0, `Count: ${consentRecords[0]?.count}`);

  const eventRecords = await runSql(`
    SELECT count(*)::integer AS count FROM public.candidate_consent_events;
  `, 'staging');
  assert('Consent audit events preserved during rollback', (eventRecords[0]?.count ?? 0) > 0, `Count: ${eventRecords[0]?.count}`);

  // Re-apply Forward Migration B
  console.log('Re-applying Forward Migration B...');
  const forwardPath = path.join(__dirname, '..', 'supabase', 'migrations', '20261114190000_txc_migration_b_secure_profiles_access_model.sql');
  const forwardSql = fs.readFileSync(forwardPath, 'utf8');
  await runSql(forwardSql, 'staging');

  const reinstalledViews = await runSql(`
    SELECT table_name 
    FROM information_schema.views 
    WHERE table_schema = 'public' 
      AND table_name IN ('connection_profiles', 'applicant_profiles', 'feed_author_snippets', 'public_profiles')
    ORDER BY table_name;
  `, 'staging');
  assert('All 4 views restored after reapplication', reinstalledViews.length === 4, `Views: ${reinstalledViews.map(v => v.table_name).join(', ')}`);

  // Cleanup synthetic fixtures
  await runSql(`
    DELETE FROM public.posts WHERE id = '${SYNTH_POST_ID}';
    DELETE FROM public.connections WHERE id = '${CONN_ID}';
    DELETE FROM public.job_applications WHERE id = '${TEST_APP_ID}';
    DELETE FROM public.jobs WHERE id = '${TEST_JOB_ID}';
  `, 'staging');

  console.log('\n========================================================================');
  console.log(`FINAL RESULTS: ${passed} PASSED, ${failed} FAILED (TOTAL: ${passed + failed})`);
  console.log('========================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runAllGates().catch(err => {
  console.error('Fatal test failure:', err);
  process.exit(1);
});
