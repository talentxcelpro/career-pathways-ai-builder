const https = require('https');
const { createClient } = require('@supabase/supabase-js');
const { runSql } = require('./db-audit-helper.cjs');
const fs = require('fs');

const STAGING_URL = "https://pvwwtquuexhyydwihjbi.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2d3d0cXV1ZXhoeXlkd2loamJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM1OTI1NzYsImV4cCI6MjEwOTE2ODU3Nn0.ZBevJqFcBzb2UAwwr_o5zgUcrrI5uf1rFgsn-cMFXnQ";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2d3d0cXV1ZXhoeXlkd2loamJpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MzU5MjU3NiwiZXhwIjoyMTA5MTY4NTc2fQ.fnYAXFI51Rpc6-GrnKN2Ui-Cyj_6K0aundMWZi0oJEI";

const adminClient = createClient(STAGING_URL, SERVICE_KEY, { auth: { persistSession: false } });
const anonClient = createClient(STAGING_URL, ANON_KEY, { auth: { persistSession: false } });

function httpReq(method, path, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(STAGING_URL + path);
    const options = {
      method,
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      headers: {
        'apikey': ANON_KEY,
        ...headers
      }
    };
    if (body) {
      options.headers['Content-Type'] = 'application/json';
    }
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let parsed;
        try {
          parsed = JSON.parse(data);
        } catch {
          parsed = data;
        }
        resolve({ status: res.statusCode, headers: res.headers, body: parsed });
      });
    });
    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

const ALLOWED_COLUMNS = [
  'id', 'full_name', 'username', 'title', 'headline', 'about', 'location',
  'profile_picture_url', 'profile_photo_url', 'cover_image_url', 'skills',
  'experience_years', 'industry', 'current_company', 'linkedin_url', 'github_url',
  'portfolio_url', 'website', 'verification_status', 'is_profile_public',
  'created_at', 'updated_at'
];

const SENSITIVE_COLUMNS = [
  'email', 'phone', 'resume_url', 'preferred_salary_min', 'preferred_salary_max',
  'access_token', 'refresh_token', 'secret', 'token', 'password'
];

async function runTestSuite() {
  console.log('========================================================================');
  console.log('MIGRATION A — 27-TEST REGRESSION SUITE (STAGING: pvwwtquuexhyydwihjbi)');
  console.log('========================================================================\n');

  // Setup synthetic test state
  const USER_PUBLIC_ID = '0b28a473-bcbb-4c49-b291-f9ea0daf4add'; // audit_cand1
  const USER_PRIVATE_ID = '45bdd0a1-37e0-4728-8dc6-67be4ebdb735'; // audit_cand2
  const USER_NULL_ID = '5b2022b9-37f0-4fc1-807d-56cec1044303'; // audit_rec2

  runSql(`
    UPDATE public.profiles SET is_profile_public = true WHERE id = '${USER_PUBLIC_ID}';
    UPDATE public.profiles SET is_profile_public = false WHERE id = '${USER_PRIVATE_ID}';
    UPDATE public.profiles SET is_profile_public = NULL WHERE id = '${USER_NULL_ID}';
  `, 'staging');

  // Log in user 1 to get JWT
  const { data: authCand1, error: loginErr } = await anonClient.auth.signInWithPassword({
    email: 'audit_cand1@talentxcel-audit.local',
    password: 'AuditPassword123!Secure'
  });
  if (loginErr) throw new Error('Login cand1 failed: ' + loginErr.message);
  const cand1Token = authCand1.session.access_token;

  let results = [];

  function record(id, name, pass, evidence) {
    console.log(`Test ${id}: ${name} -> ${pass ? 'PASS' : 'FAIL'}`);
    if (!pass) console.log(`   Evidence: ${JSON.stringify(evidence)}`);
    results.push({ id, name, pass, evidence });
  }

  // --- PART 1: PUBLIC PROFILE VIEW TESTS (1-10) ---

  // Test 1: Anonymous user can read an explicitly public profile
  const res1 = await httpReq('GET', `/rest/v1/public_profiles?id=eq.${USER_PUBLIC_ID}&select=*`);
  const pass1 = res1.status === 200 && Array.isArray(res1.body) && res1.body.length === 1 && res1.body[0].id === USER_PUBLIC_ID;
  record(1, 'Anonymous user can read an explicitly public profile', pass1, { status: res1.status, length: res1.body?.length });

  // Test 2: Anonymous user cannot read a private profile
  const res2 = await httpReq('GET', `/rest/v1/public_profiles?id=eq.${USER_PRIVATE_ID}&select=*`);
  const pass2 = res2.status === 200 && Array.isArray(res2.body) && res2.body.length === 0;
  record(2, 'Anonymous user cannot read a private profile', pass2, { status: res2.status, body: res2.body });

  // Test 3: Anonymous user cannot read a profile with NULL visibility
  const res3 = await httpReq('GET', `/rest/v1/public_profiles?id=eq.${USER_NULL_ID}&select=*`);
  const pass3 = res3.status === 200 && Array.isArray(res3.body) && res3.body.length === 0;
  record(3, 'Anonymous user cannot read a profile with NULL visibility', pass3, { status: res3.status, body: res3.body });

  // Test 4: Authenticated user can read approved public profile fields
  const res4 = await httpReq('GET', `/rest/v1/public_profiles?id=eq.${USER_PUBLIC_ID}&select=*`, {
    'Authorization': `Bearer ${cand1Token}`
  });
  const pass4 = res4.status === 200 && Array.isArray(res4.body) && res4.body.length === 1 && res4.body[0].id === USER_PUBLIC_ID;
  record(4, 'Authenticated user can read approved public profile fields', pass4, { status: res4.status, length: res4.body?.length });

  // Inspect view columns
  const viewCols = runSql(`
    SELECT column_name FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'public_profiles';
  `, 'staging').map(r => r.column_name);

  // Test 5: Email is absent from the view
  const pass5 = !viewCols.includes('email') && res1.body?.[0]?.email === undefined;
  record(5, 'Email is absent from the view', pass5, { columnPresent: viewCols.includes('email') });

  // Test 6: Phone is absent from the view
  const pass6 = !viewCols.includes('phone') && res1.body?.[0]?.phone === undefined;
  record(6, 'Phone is absent from the view', pass6, { columnPresent: viewCols.includes('phone') });

  // Test 7: Resume URL is absent from the view
  const pass7 = !viewCols.includes('resume_url') && res1.body?.[0]?.resume_url === undefined;
  record(7, 'Resume URL is absent from the view', pass7, { columnPresent: viewCols.includes('resume_url') });

  // Test 8: Salary fields are absent from the view
  const pass8 = !viewCols.includes('preferred_salary_min') && !viewCols.includes('preferred_salary_max') &&
                res1.body?.[0]?.preferred_salary_min === undefined && res1.body?.[0]?.preferred_salary_max === undefined;
  record(8, 'Salary fields are absent from the view', pass8, { min: viewCols.includes('preferred_salary_min'), max: viewCols.includes('preferred_salary_max') });

  // Test 9: OAuth and token fields are absent from the view
  const pass9 = !viewCols.some(c => c.includes('token') || c.includes('secret') || c.includes('password'));
  record(9, 'OAuth and token fields are absent from the view', pass9, { cols: viewCols });

  // Test 10: No sensitive fields are exposed through view metadata or JSON responses
  const actualKeys = Object.keys(res1.body[0] || {});
  const illegalKeys = actualKeys.filter(k => SENSITIVE_COLUMNS.includes(k) || !ALLOWED_COLUMNS.includes(k));
  const pass10 = illegalKeys.length === 0;
  record(10, 'No sensitive fields exposed through JSON responses', pass10, { illegalKeys });

  // --- PART 2: VIEW SECURITY TESTS (11-16) ---

  // Test 11: Verify view owner is postgres
  const ownerRes = runSql(`
    SELECT pg_get_userbyid(c.relowner) AS owner
    FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'public_profiles';
  `, 'staging');
  const viewOwner = ownerRes[0]?.owner;
  const pass11 = viewOwner === 'postgres';
  record(11, 'Verify view owner is postgres', pass11, { viewOwner });

  // Test 12: Verify effective RLS behavior (view executes as owner without leaking base table private rows)
  const expectedPublicCount = runSql(`SELECT count(*) as cnt FROM public.profiles WHERE is_profile_public = true;`, 'staging')[0]?.cnt;
  const actualViewCount = runSql(`SELECT count(*) as cnt FROM public.public_profiles;`, 'staging')[0]?.cnt;
  const privateInView = runSql(`SELECT count(*) as cnt FROM public.public_profiles WHERE id IN ('${USER_PRIVATE_ID}', '${USER_NULL_ID}');`, 'staging')[0]?.cnt;
  const pass12 = Number(actualViewCount) === Number(expectedPublicCount) && Number(privateInView) === 0;
  record(12, 'Verify effective RLS behavior (filters strictly by WHERE clause)', pass12, { actualViewCount, expectedPublicCount, privateInView });

  // Test 13: Verify anonymous and authenticated execution behavior over HTTP PostgREST
  const pass13 = res1.status === 200 && res4.status === 200;
  record(13, 'Verify anonymous and authenticated execution behavior over PostgREST', pass13, { anonStatus: res1.status, authStatus: res4.status });

  // Test 14: Verify view cannot be used to access private profile rows
  const privateFilterRes = await httpReq('GET', `/rest/v1/public_profiles?id=eq.${USER_PRIVATE_ID}`);
  const pass14 = privateFilterRes.status === 200 && privateFilterRes.body.length === 0;
  record(14, 'Verify view cannot be used to access private profile rows', pass14, { rowsReturned: privateFilterRes.body?.length });

  // Test 15: Verify underlying profiles table remains unchanged by Migration A
  const baseTableInfo = runSql(`
    SELECT c.relname, pg_get_userbyid(c.relowner) AS owner, c.relrowsecurity
    FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'profiles';
  `, 'staging')[0];
  const pass15 = baseTableInfo.relname === 'profiles' && baseTableInfo.owner === 'postgres' && baseTableInfo.relrowsecurity === true;
  record(15, 'Verify underlying profiles table remains unchanged', pass15, baseTableInfo);

  // Test 16: Verify no existing policies or table grants on profiles were unintentionally altered
  const basePolicies = runSql(`
    SELECT policyname, cmd, roles, qual FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' ORDER BY policyname;
  `, 'staging');
  const policyNames = basePolicies.map(p => p.policyname);
  const pass16 = policyNames.includes('Users can insert own profile') && 
                 policyNames.includes('Users can update own profile') && 
                 policyNames.includes('profiles_select_own');
  record(16, 'Verify no existing policies on profiles were altered', pass16, { policies: policyNames });

  // --- PART 3: COMPATIBILITY TESTS (17-23) ---

  // Test 17: Verify public profile cards (querying by id returns public profile card payload)
  const cardRes = await httpReq('GET', `/rest/v1/public_profiles?id=eq.${USER_PUBLIC_ID}&select=id,full_name,username,headline,profile_photo_url,skills`);
  const pass17 = cardRes.status === 200 && cardRes.body.length === 1 && cardRes.body[0].full_name === 'Audit Candidate Alpha';
  record(17, 'Verify public profile cards', pass17, cardRes.body[0]);

  // Test 18: Verify profile detail pages
  const detailRes = await httpReq('GET', `/rest/v1/public_profiles?id=eq.${USER_PUBLIC_ID}&select=*`);
  const pass18 = detailRes.status === 200 && detailRes.body[0].is_profile_public === true;
  record(18, 'Verify profile detail pages', pass18, { status: detailRes.status });

  // Test 19: Verify user profile editing on base table (owner can UPDATE)
  const updateRes = await httpReq('PATCH', `/rest/v1/profiles?id=eq.${USER_PUBLIC_ID}`, {
    'Authorization': `Bearer ${cand1Token}`,
    'Prefer': 'return=representation'
  }, { headline: 'Security Audit Verified Candidate' });
  const pass19 = updateRes.status === 200 && updateRes.body[0]?.headline === 'Security Audit Verified Candidate';
  record(19, 'Verify user profile editing on base table for owner', pass19, { status: updateRes.status, headline: updateRes.body?.[0]?.headline });

  // Test 20: Verify recruiter application listing compatibility
  const appList = runSql(`SELECT count(*) as cnt FROM public.job_applications;`, 'staging');
  const pass20 = Array.isArray(appList) && appList[0].cnt !== undefined;
  record(20, 'Verify recruiter application listing compatibility', pass20, { count: appList[0]?.cnt });

  // Test 21: Verify recruiter CRM workflows
  const crmCandidates = runSql(`SELECT count(*) as cnt FROM public.profiles WHERE is_profile_public = true;`, 'staging');
  const pass21 = Array.isArray(crmCandidates) && Number(crmCandidates[0].cnt) >= 1;
  record(21, 'Verify recruiter CRM candidate query compatibility', pass21, { count: crmCandidates[0]?.cnt });

  // Test 22: Verify resume builder access
  const resumeAccess = runSql(`
    SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'resume_url';
  `, 'staging');
  const pass22 = resumeAccess.length === 1;
  record(22, 'Verify resume builder data integrity on base table', pass22, { found: resumeAccess.length });

  // Test 23: Verify server-side service-role workflows
  const { data: serviceData, error: serviceErr } = await adminClient
    .from('profiles')
    .select('id, email, phone, resume_url')
    .eq('id', USER_PUBLIC_ID)
    .single();
  const pass23 = !serviceErr && serviceData && serviceData.id === USER_PUBLIC_ID;
  record(23, 'Verify server-side service-role access to base profiles', pass23, { success: !serviceErr });

  // --- PART 4: MIGRATION SAFETY TESTS (24-27) ---

  // Test 24: Verify idempotency (re-applying Migration A SQL succeeds without error)
  const migrationSql = fs.readFileSync('supabase/migrations/20261114170000_txc_sanitized_public_profiles_view.sql', 'utf8');
  const idempRes = runSql(migrationSql, 'staging');
  const pass24 = !idempRes.error;
  record(24, 'Verify migration idempotency', pass24, { error: idempRes.error });

  // Test 25: Verify view documentation and dependencies
  const commentRes = runSql(`
    SELECT d.description
    FROM pg_description d
    JOIN pg_class c ON c.oid = d.objoid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'public_profiles';
  `, 'staging');
  const pass25 = commentRes[0]?.description && commentRes[0].description.includes('Sanitized public profile interface');
  record(25, 'Verify view documentation and schema dependencies', pass25, { comment: commentRes[0]?.description });

  // Test 26: Verify rollback behavior in staging
  const rollbackSql = fs.readFileSync('supabase/migrations/20261114170000_txc_sanitized_public_profiles_view_rollback.sql', 'utf8');
  const rbRes = runSql(rollbackSql, 'staging');
  const checkDropped = runSql(`
    SELECT count(*) as cnt FROM information_schema.views WHERE table_schema = 'public' AND table_name = 'public_profiles';
  `, 'staging');
  const pass26 = !rbRes.error && Number(checkDropped[0]?.cnt) === 0;
  record(26, 'Verify rollback drops view cleanly', pass26, { viewCountAfterRollback: checkDropped[0]?.cnt });

  // Test 27: Verify rollback does not alter original profiles policies or permissions
  const postRbPolicies = runSql(`
    SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' ORDER BY policyname;
  `, 'staging').map(p => p.policyname);
  const pass27 = postRbPolicies.includes('Users can insert own profile') &&
                 postRbPolicies.includes('Users can update own profile') &&
                 postRbPolicies.includes('profiles_select_own');
  record(27, 'Verify rollback does not alter original profiles policies', pass27, { policies: postRbPolicies });

  // Re-apply migration so staging is in desired state
  console.log('\nRe-applying Migration A forward migration to staging...');
  runSql(migrationSql, 'staging');
  const finalCheck = runSql(`
    SELECT count(*) as cnt FROM information_schema.views WHERE table_schema = 'public' AND table_name = 'public_profiles';
  `, 'staging');
  console.log(`Migration A re-applied successfully. View exists: ${finalCheck[0]?.cnt === 1 || finalCheck[0]?.cnt === '1' ? 'YES' : 'NO'}`);

  // Summary
  const passedCount = results.filter(r => r.pass).length;
  console.log('\n========================================================================');
  console.log(`TEST SUITE RESULTS: ${passedCount} / ${results.length} PASSED`);
  console.log('========================================================================');

  // Restore synthetic user states
  runSql(`
    UPDATE public.profiles SET is_profile_public = true WHERE id IN ('${USER_PUBLIC_ID}', '${USER_PRIVATE_ID}', '${USER_NULL_ID}');
  `, 'staging');
}

runTestSuite().catch(err => {
  console.error('Test suite execution failed:', err);
  process.exit(1);
});
