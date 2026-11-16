const { createClient } = require('@supabase/supabase-js');
const { runSql, STAGING_REF } = require('./db-audit-helper.cjs');

const SUPABASE_URL = `https://${STAGING_REF}.supabase.co`;
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2d3d0cXV1ZXhoeXlkd2loamJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM1OTI1NzYsImV4cCI6MjEwOTE2ODU3Nn0.ZBevJqFcBzb2UAwwr_o5zgUcrrI5uf1rFgsn-cMFXnQ";

async function runStorageSecuritySuite() {
  console.log('========================================================================');
  console.log('TALENTXCEL STORAGE RLS & SIGNED URL LIFECYCLE VERIFICATION');
  console.log(`Target: Staging (${STAGING_REF})`);
  console.log('========================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(id, desc, condition, details = '') {
    if (condition) {
      console.log(`✅ PASS: [${id}] ${desc} ${details ? '(' + details + ')' : ''}`);
      passed++;
    } else {
      console.error(`❌ FAIL: [${id}] ${desc} ${details ? '(' + details + ')' : ''}`);
      failed++;
    }
  }

  // Pure anonymous client with zero active session
  const unauthedClient = createClient(SUPABASE_URL, ANON_KEY, { auth: { persistSession: false } });

  // Separate client for authentication
  const authHelperClient = createClient(SUPABASE_URL, ANON_KEY, { auth: { persistSession: false } });

  // 1. Authenticate test identities
  const { data: authA } = await authHelperClient.auth.signInWithPassword({
    email: 'audit_cand1@talentxcel-audit.local',
    password: 'AuditPassword123!Secure'
  });
  const clientA = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${authA.session.access_token}` } },
    auth: { persistSession: false }
  });
  const userA_id = authA.user.id;

  const { data: authB } = await authHelperClient.auth.signInWithPassword({
    email: 'audit_cand2@talentxcel-audit.local',
    password: 'AuditPassword123!Secure'
  });
  const clientB = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${authB.session.access_token}` } },
    auth: { persistSession: false }
  });
  const userB_id = authB.user.id;

  const { data: authRecInit } = await authHelperClient.auth.signInWithPassword({
    email: 'audit_rec1@talentxcel-audit.local',
    password: 'AuditPassword123!Secure'
  });
  const rec_id = authRecInit.user.id;

  async function getFreshRecruiterClient() {
    await new Promise(r => setTimeout(r, 1100)); // Ensure fresh iat timestamp
    const { data: authFresh } = await authHelperClient.auth.signInWithPassword({
      email: 'audit_rec1@talentxcel-audit.local',
      password: 'AuditPassword123!Secure'
    });
    return createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${authFresh.session.access_token}` } },
      auth: { persistSession: false }
    });
  }

  console.log('Identities authenticated:');
  console.log('Candidate A (Owner):', userA_id);
  console.log('Candidate B (Unrelated):', userB_id);
  console.log('Recruiter:', rec_id);

  // 2. Upload Candidate A Document 1 (Attached Resume) and Document 2 (Private Document)
  const doc1Path = `${userA_id}/attached_application_resume.pdf`;
  const doc2Path = `${userA_id}/unrelated_private_tax_records.pdf`;

  const blob1 = Buffer.from('%PDF-1.4 Attached Application Resume Content for Job 333', 'utf-8');
  const blob2 = Buffer.from('%PDF-1.4 Private Tax Record 2025 - Confidential Internal Data', 'utf-8');

  // Remove existing if any
  await clientA.storage.from('documents').remove([doc1Path, doc2Path]);

  const up1 = await clientA.storage.from('documents').upload(doc1Path, blob1, { contentType: 'application/pdf', upsert: true });
  const up2 = await clientA.storage.from('documents').upload(doc2Path, blob2, { contentType: 'application/pdf', upsert: true });

  console.log('\nUpload status:');
  console.log('Doc 1 (Resume) upload:', up1.error ? up1.error.message : 'SUCCESS');
  console.log('Doc 2 (Private) upload:', up2.error ? up2.error.message : 'SUCCESS');

  // Ensure documents bucket exists and is private
  await runSql(`
    UPDATE storage.buckets SET public = false WHERE id = 'documents';
  `, 'staging');

  // 3. Link Document 1 to Job Application
  const REAL_COMPANY_ID = '11111111-aaaa-aaaa-aaaa-111111111111';
  const OTHER_COMPANY_ID = '22222222-bbbb-bbbb-bbbb-222222222222';
  const TEAM_MEMBER_ID = '11111111-cccc-cccc-cccc-111111111111';
  const TEST_JOB_ID = 'f0000000-0000-0000-0000-000000000001';
  const TEST_APP_ID = 'a0000000-0000-0000-0000-000000000001';

  await runSql(`
    INSERT INTO public.jobs (id, company_id, posted_by, title, description, requirements, is_active)
    VALUES ('${TEST_JOB_ID}', '${REAL_COMPANY_ID}', '${rec_id}', 'Principal Security Engineer', 'Job desc', 'Job reqs', true)
    ON CONFLICT (id) DO UPDATE SET company_id = '${REAL_COMPANY_ID}', posted_by = '${rec_id}';

    INSERT INTO public.job_applications (id, job_id, user_id, status, resume_url)
    VALUES ('${TEST_APP_ID}', '${TEST_JOB_ID}', '${userA_id}', 'applied', '${doc1Path}')
    ON CONFLICT (id) DO UPDATE SET status = 'applied', resume_url = '${doc1Path}';
  `, 'staging');

  // Helper function to test download
  async function testDownload(client, path) {
    const { data, error } = await client.storage.from('documents').download(path);
    if (error || !data) {
      return { success: false, error: error?.message || 'Download blocked by policy', status: error?.status };
    }
    const text = await data.text();
    return { success: true, text, size: data.size };
  }

  // Helper function to test createSignedUrl
  async function testSignedUrl(client, path, expiresIn = 300) {
    const { data, error } = await client.storage.from('documents').createSignedUrl(path, expiresIn);
    if (error || !data?.signedUrl) {
      return { success: false, error: error?.message || 'Signed URL creation blocked' };
    }
    return { success: true, signedUrl: data.signedUrl };
  }

  console.log('\n--- 1. CANDIDATE (OWNER) ACCESS VERIFICATION ---');
  const candDoc1 = await testDownload(clientA, doc1Path);
  assert('TEST-STOR-01', 'Candidate can download own attached resume (Doc 1)', candDoc1.success === true && candDoc1.text.includes('Attached Application Resume'));

  const candDoc2 = await testDownload(clientA, doc2Path);
  assert('TEST-STOR-02', 'Candidate can download own private document (Doc 2)', candDoc2.success === true && candDoc2.text.includes('Private Tax Record'));

  console.log('\n--- 2. ROLE 1: AUTHORIZED RECRUITER (Active hiring authority) ---');
  await runSql(`
    UPDATE public.company_team_members 
    SET role = 'recruiter', is_active = true, permissions = '{}'::jsonb, company_id = '${REAL_COMPANY_ID}', user_id = '${rec_id}'
    WHERE id = '${TEAM_MEMBER_ID}';
  `, 'staging');
  const clientAuthRec = await getFreshRecruiterClient();

  const recDoc1 = await testDownload(clientAuthRec, doc1Path);
  assert('TEST-STOR-03', 'Authorized recruiter CAN download attached resume (Doc 1)', recDoc1.success === true && recDoc1.text.includes('Attached Application Resume'));

  const recDoc2 = await testDownload(clientAuthRec, doc2Path);
  assert('TEST-STOR-04', 'Authorized recruiter is BLOCKED from unrelated private document (Doc 2)', recDoc2.success === false, `Result: ${recDoc2.error}`);

  console.log('\n--- 3. ROLE 2: ACTIVE VIEWER (Without hiring authority) ---');
  await runSql(`
    UPDATE public.company_team_members 
    SET role = 'viewer', is_active = true, permissions = '{"manage_jobs": false}'::jsonb, company_id = '${REAL_COMPANY_ID}', user_id = '${rec_id}'
    WHERE id = '${TEAM_MEMBER_ID}';
  `, 'staging');
  const clientViewer = await getFreshRecruiterClient();

  const viewerDoc1 = await testDownload(clientViewer, doc1Path);
  assert('TEST-STOR-05', 'Active viewer is BLOCKED from applicant resume (Doc 1)', viewerDoc1.success === false, `Result: ${viewerDoc1.error}`);

  const viewerDoc2 = await testDownload(clientViewer, doc2Path);
  assert('TEST-STOR-06', 'Active viewer is BLOCKED from candidate private document (Doc 2)', viewerDoc2.success === false, `Result: ${viewerDoc2.error}`);

  console.log('\n--- 4. ROLE 3: ACTIVE TEAM MEMBER WITHOUT HIRING PERMISSIONS ---');
  await runSql(`
    UPDATE public.company_team_members 
    SET role = 'viewer', is_active = true, permissions = '{}'::jsonb, company_id = '${REAL_COMPANY_ID}', user_id = '${rec_id}'
    WHERE id = '${TEAM_MEMBER_ID}';
  `, 'staging');
  const clientNoPerm = await getFreshRecruiterClient();

  const noPermDoc1 = await testDownload(clientNoPerm, doc1Path);
  assert('TEST-STOR-07', 'Team member without hiring permissions is BLOCKED from Doc 1', noPermDoc1.success === false, `Result: ${noPermDoc1.error}`);

  const noPermDoc2 = await testDownload(clientNoPerm, doc2Path);
  assert('TEST-STOR-08', 'Team member without hiring permissions is BLOCKED from Doc 2', noPermDoc2.success === false, `Result: ${noPermDoc2.error}`);

  console.log('\n--- 5. ROLE 4: SUSPENDED RECRUITER (is_active = false) ---');
  await runSql(`
    UPDATE public.company_team_members 
    SET role = 'recruiter', is_active = false, permissions = '{"manage_jobs": true}'::jsonb, company_id = '${REAL_COMPANY_ID}', user_id = '${rec_id}'
    WHERE id = '${TEAM_MEMBER_ID}';
  `, 'staging');
  const clientSusp = await getFreshRecruiterClient();

  const suspDoc1 = await testDownload(clientSusp, doc1Path);
  assert('TEST-STOR-09', 'Suspended recruiter is BLOCKED from Doc 1', suspDoc1.success === false, `Result: ${suspDoc1.error}`);

  const suspDoc2 = await testDownload(clientSusp, doc2Path);
  assert('TEST-STOR-10', 'Suspended recruiter is BLOCKED from Doc 2', suspDoc2.success === false, `Result: ${suspDoc2.error}`);

  console.log('\n--- 6. ROLE 5: REMOVED TEAM MEMBER ---');
  await runSql(`
    DELETE FROM public.company_team_members WHERE id = '${TEAM_MEMBER_ID}';
  `, 'staging');
  const clientRemoved = await getFreshRecruiterClient();

  const remDoc1 = await testDownload(clientRemoved, doc1Path);
  assert('TEST-STOR-11', 'Removed team member is BLOCKED from Doc 1', remDoc1.success === false, `Result: ${remDoc1.error}`);

  const remDoc2 = await testDownload(clientRemoved, doc2Path);
  assert('TEST-STOR-12', 'Removed team member is BLOCKED from Doc 2', remDoc2.success === false, `Result: ${remDoc2.error}`);

  console.log('\n--- 7. ROLE 6: RECRUITER BELONGING TO ANOTHER COMPANY ---');
  await runSql(`
    INSERT INTO public.company_team_members (id, company_id, user_id, role, is_active, permissions)
    VALUES ('${TEAM_MEMBER_ID}', '${OTHER_COMPANY_ID}', '${rec_id}', 'recruiter', true, '{}'::jsonb)
    ON CONFLICT (id) DO UPDATE SET company_id = '${OTHER_COMPANY_ID}', role = 'recruiter', is_active = true, user_id = '${rec_id}';
  `, 'staging');
  const clientOtherCo = await getFreshRecruiterClient();

  const otherCoDoc1 = await testDownload(clientOtherCo, doc1Path);
  assert('TEST-STOR-13', 'Recruiter from different company is BLOCKED from Doc 1', otherCoDoc1.success === false, `Result: ${otherCoDoc1.error}`);

  const otherCoDoc2 = await testDownload(clientOtherCo, doc2Path);
  assert('TEST-STOR-14', 'Recruiter from different company is BLOCKED from Doc 2', otherCoDoc2.success === false, `Result: ${otherCoDoc2.error}`);

  console.log('\n--- 8. ROLE 7: UNRELATED AUTHENTICATED USER (Candidate B) ---');
  const unrelDoc1 = await testDownload(clientB, doc1Path);
  assert('TEST-STOR-15', 'Unrelated authenticated user is BLOCKED from Doc 1', unrelDoc1.success === false, `Result: ${unrelDoc1.error}`);

  const unrelDoc2 = await testDownload(clientB, doc2Path);
  assert('TEST-STOR-16', 'Unrelated authenticated user is BLOCKED from Doc 2', unrelDoc2.success === false, `Result: ${unrelDoc2.error}`);

  console.log('\n--- 9. ROLE 8: ANONYMOUS USER ---');
  const anonDoc1 = await testDownload(unauthedClient, doc1Path);
  assert('TEST-STOR-17', 'Anonymous user is BLOCKED from Doc 1', anonDoc1.success === false, `Result: ${anonDoc1.error}`);

  const anonDoc2 = await testDownload(unauthedClient, doc2Path);
  assert('TEST-STOR-18', 'Anonymous user is BLOCKED from Doc 2', anonDoc2.success === false, `Result: ${anonDoc2.error}`);

  // ==========================================================================
  // GATE 2: SIGNED URL LIFECYCLE AUDIT & VERIFICATION
  // ==========================================================================
  console.log('\n========================================================================');
  console.log('GATE 2: SIGNED URL LIFECYCLE AUDIT & VERIFICATION');
  console.log('========================================================================\n');

  // Restore authorized recruiter on REAL_COMPANY_ID
  await runSql(`
    UPDATE public.company_team_members 
    SET company_id = '${REAL_COMPANY_ID}', role = 'recruiter', is_active = true, user_id = '${rec_id}'
    WHERE id = '${TEAM_MEMBER_ID}';
  `, 'staging');
  const clientFinalRec = await getFreshRecruiterClient();

  // Test 2.1: Authorized recruiter can create signed URL for attached resume (Doc 1)
  const signRecDoc1 = await testSignedUrl(clientFinalRec, doc1Path, 300);
  assert('TEST-SIGN-01', 'Authorized recruiter CAN generate signed URL for attached resume', signRecDoc1.success === true && signRecDoc1.signedUrl.includes('token='));

  // Test 2.2: Authorized recruiter CANNOT create signed URL for unrelated private document (Doc 2)
  const signRecDoc2 = await testSignedUrl(clientFinalRec, doc2Path, 300);
  assert('TEST-SIGN-02', 'Authorized recruiter is BLOCKED from creating signed URL for Doc 2', signRecDoc2.success === false, `Result: ${signRecDoc2.error}`);

  // Test 2.3: Unrelated user CANNOT create signed URL for Doc 1
  const signUnrelDoc1 = await testSignedUrl(clientB, doc1Path, 300);
  assert('TEST-SIGN-03', 'Unrelated user is BLOCKED from creating signed URL for Doc 1', signUnrelDoc1.success === false, `Result: ${signUnrelDoc1.error}`);

  // Test 2.4: Anonymous user CANNOT create signed URL for Doc 1
  const signAnonDoc1 = await testSignedUrl(unauthedClient, doc1Path, 300);
  assert('TEST-SIGN-04', 'Anonymous user is BLOCKED from creating signed URL for Doc 1', signAnonDoc1.success === false, `Result: ${signAnonDoc1.error}`);

  // Test 2.5: Bearer credential test - Fetching signed URL directly via raw HTTP GET without Authorization header
  if (signRecDoc1.success) {
    const https = require('https');
    const signedUrlFull = signRecDoc1.signedUrl.startsWith('http') 
      ? signRecDoc1.signedUrl 
      : `${SUPABASE_URL}/storage/v1${signRecDoc1.signedUrl}`;

    const bearerTest = await new Promise((resolve) => {
      https.get(signedUrlFull, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => resolve({ statusCode: res.statusCode, body }));
      }).on('error', err => resolve({ error: err.message }));
    });

    assert(
      'TEST-SIGN-05',
      'Signed URL functions as bearer credential without Authorization header during validity',
      bearerTest.statusCode === 200 && bearerTest.body.includes('Attached Application Resume'),
      `Status: ${bearerTest.statusCode}`
    );
  }

  // Test 2.6: Short expiry verification (2-second token expires after wait)
  console.log('Testing signed URL short expiry (2-second lifespan)...');
  const shortSign = await testSignedUrl(clientFinalRec, doc1Path, 2);
  if (shortSign.success) {
    const https = require('https');
    const signedUrlFull = shortSign.signedUrl.startsWith('http') 
      ? shortSign.signedUrl 
      : `${SUPABASE_URL}/storage/v1${shortSign.signedUrl}`;

    console.log('Waiting 3.5 seconds for signed token expiration...');
    await new Promise(r => setTimeout(r, 3500));

    const expiredFetch = await new Promise((resolve) => {
      https.get(signedUrlFull, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => resolve({ statusCode: res.statusCode, body }));
      }).on('error', err => resolve({ error: err.message }));
    });

    assert(
      'TEST-SIGN-06',
      'Storage API rejects expired signed URL with error (token expired)',
      expiredFetch.statusCode === 400 || expiredFetch.statusCode === 401 || expiredFetch.statusCode === 403,
      `Status: ${expiredFetch.statusCode}, Body: ${expiredFetch.body}`
    );
  }

  console.log('\n========================================================================');
  console.log(`STORAGE & SIGNED URL SUITE COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runStorageSecuritySuite().catch(err => {
  console.error('Fatal error in test suite:', err);
  process.exit(1);
});
