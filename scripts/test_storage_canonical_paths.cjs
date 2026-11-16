const { createClient } = require('@supabase/supabase-js');
const { runSql, STAGING_REF } = require('./db-audit-helper.cjs');

const SUPABASE_URL = `https://${STAGING_REF}.supabase.co`;
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2d3d0cXV1ZXhoeXlkd2loamJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM1OTI1NzYsImV4cCI6MjEwOTE2ODU3Nn0.ZBevJqFcBzb2UAwwr_o5zgUcrrI5uf1rFgsn-cMFXnQ";

async function runCanonicalStorageSuite() {
  console.log('========================================================================');
  console.log('TALENTXCEL STORAGE CANONICAL PATH & ADVERSARIAL MATRIX TEST SUITE');
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

  const anonClient = createClient(SUPABASE_URL, ANON_KEY, { auth: { persistSession: false } });

  // 1. Authenticate Test Users
  const { data: authCandA } = await anonClient.auth.signInWithPassword({
    email: 'audit_cand1@talentxcel-audit.local',
    password: 'AuditPassword123!Secure'
  });
  const candA_id = authCandA.user.id;
  const clientCandA = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${authCandA.session.access_token}` } },
    auth: { persistSession: false }
  });

  const { data: authCandB } = await anonClient.auth.signInWithPassword({
    email: 'audit_cand2@talentxcel-audit.local',
    password: 'AuditPassword123!Secure'
  });
  const candB_id = authCandB.user.id;
  const clientCandB = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${authCandB.session.access_token}` } },
    auth: { persistSession: false }
  });

  const { data: authRec } = await anonClient.auth.signInWithPassword({
    email: 'audit_rec1@talentxcel-audit.local',
    password: 'AuditPassword123!Secure'
  });
  const rec_id = authRec.user.id;
  
  async function getFreshRecruiterClient() {
    await new Promise(r => setTimeout(r, 1100)); // Ensure fresh iat timestamp
    const { data: rAuth } = await anonClient.auth.signInWithPassword({
      email: 'audit_rec1@talentxcel-audit.local',
      password: 'AuditPassword123!Secure'
    });
    return createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${rAuth.session.access_token}` } },
      auth: { persistSession: false }
    });
  }

  // Consistent existing keys and IDs across all tests
  const COMPANY_ID = '11111111-aaaa-aaaa-aaaa-111111111111';
  const OTHER_COMPANY_ID = '99999999-9999-9999-9999-999999999999';
  const COMPANY_OWNER_ID = '5b2022b9-37f0-4fc1-807d-56cec1044303';
  const JOB1_ID = 'f0000000-0000-0000-0000-000000000001';
  const JOB2_OTHER_ID = 'f0000000-0000-0000-0000-000000000002';
  const APP1_ID = 'a0000000-0000-0000-0000-000000000001';
  const APP2_OTHER_ID = 'a0000000-0000-0000-0000-000000000002';
  const TEAM_MEMBER_ID = '11111111-cccc-cccc-cccc-111111111111';

  const CAND_A_RESUME_KEY = `${candA_id}/attached_application_resume.pdf`;
  const CAND_A_PRIVATE_KEY = `${candA_id}/unrelated_private_tax_records.pdf`;
  const CAND_B_IDENTICAL_FILENAME_KEY = `${candB_id}/attached_application_resume.pdf`;
  const CAND_A_JOB2_RESUME_KEY = `${candA_id}/other_company_resume.pdf`;

  // 1. Confirm and ensure all files exist before testing
  const pdfBuffer = Buffer.from('%PDF-1.4 Mock Candidate PDF Document Content For Security Audit');
  const pdfBlob = new Blob([pdfBuffer], { type: 'application/pdf' });
  await clientCandA.storage.from('documents').upload(CAND_A_RESUME_KEY, pdfBlob, { upsert: true, contentType: 'application/pdf' });
  await clientCandA.storage.from('documents').upload(CAND_A_PRIVATE_KEY, pdfBlob, { upsert: true, contentType: 'application/pdf' });
  await clientCandB.storage.from('documents').upload(CAND_B_IDENTICAL_FILENAME_KEY, pdfBlob, { upsert: true, contentType: 'application/pdf' });
  await clientCandA.storage.from('documents').upload(CAND_A_JOB2_RESUME_KEY, pdfBlob, { upsert: true, contentType: 'application/pdf' });

  // Verify file existence by owner download
  const { data: own1 } = await clientCandA.storage.from('documents').download(CAND_A_RESUME_KEY);
  const { data: own2 } = await clientCandA.storage.from('documents').download(CAND_A_PRIVATE_KEY);
  const { data: ownB } = await clientCandB.storage.from('documents').download(CAND_B_IDENTICAL_FILENAME_KEY);
  assert('PRE-01', 'Confirm Cand A Resume exists on disk/storage', own1 !== null);
  assert('PRE-02', 'Confirm Cand A Private Doc exists on disk/storage', own2 !== null);
  assert('PRE-03', 'Confirm Cand B Identical Filename exists on disk/storage', ownB !== null);

  // Seed DB records
  await runSql(`
    -- Company 1 (Real Company)
    INSERT INTO public.companies (id, name)
    VALUES ('${COMPANY_ID}', 'Audit Company 1')
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.company_profiles (company_id, owner_id)
    VALUES ('${COMPANY_ID}', '${COMPANY_OWNER_ID}')
    ON CONFLICT (company_id) DO UPDATE SET owner_id = '${COMPANY_OWNER_ID}';

    -- Recruiter team member at Company 1
    INSERT INTO public.company_team_members (id, company_id, user_id, role, is_active)
    VALUES ('${TEAM_MEMBER_ID}', '${COMPANY_ID}', '${rec_id}', 'recruiter', true)
    ON CONFLICT (id) DO UPDATE SET company_id = '${COMPANY_ID}', user_id = '${rec_id}', role = 'recruiter', is_active = true;

    -- Job 1 at Company 1 (Active)
    INSERT INTO public.jobs (id, company_id, title, description, location, is_active, expires_at)
    VALUES ('${JOB1_ID}', '${COMPANY_ID}', 'Cloud Security Engineer', 'Job 1 description', 'Remote', true, NOW() + INTERVAL '30 days')
    ON CONFLICT (id) DO UPDATE SET company_id = '${COMPANY_ID}', is_active = true, expires_at = NOW() + INTERVAL '30 days';

    -- Other Company and Job 2
    INSERT INTO public.companies (id, name)
    VALUES ('${OTHER_COMPANY_ID}', 'Other Tech Corp')
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.company_profiles (company_id, owner_id)
    VALUES ('${OTHER_COMPANY_ID}', '${candB_id}')
    ON CONFLICT (company_id) DO UPDATE SET owner_id = '${candB_id}';

    INSERT INTO public.jobs (id, company_id, title, description, location, is_active, expires_at)
    VALUES ('${JOB2_OTHER_ID}', '${OTHER_COMPANY_ID}', 'Frontend Specialist', 'Job 2 description', 'Remote', true, NOW() + INTERVAL '30 days')
    ON CONFLICT (id) DO UPDATE SET company_id = '${OTHER_COMPANY_ID}', is_active = true, expires_at = NOW() + INTERVAL '30 days';

    -- Application 1: Candidate A applies to Job 1 with attached resume
    INSERT INTO public.job_applications (id, job_id, user_id, resume_url, status)
    VALUES ('${APP1_ID}', '${JOB1_ID}', '${candA_id}', '${CAND_A_RESUME_KEY}', 'applied')
    ON CONFLICT (id) DO UPDATE SET job_id = '${JOB1_ID}', user_id = '${candA_id}', resume_url = '${CAND_A_RESUME_KEY}', status = 'applied';

    -- Application 2: Candidate A applies to Job 2 (Other Company) with distinct resume
    INSERT INTO public.job_applications (id, job_id, user_id, resume_url, status)
    VALUES ('${APP2_OTHER_ID}', '${JOB2_OTHER_ID}', '${candA_id}', '${CAND_A_JOB2_RESUME_KEY}', 'applied')
    ON CONFLICT (id) DO UPDATE SET job_id = '${JOB2_OTHER_ID}', user_id = '${candA_id}', resume_url = '${CAND_A_JOB2_RESUME_KEY}', status = 'applied';
  `, 'staging');

  console.log('Test fixtures established successfully.');

  // --------------------------------------------------------------------------
  // TEST SECTION 1: CANONICAL PATH ENFORCEMENT & BASENAME REJECTION
  // --------------------------------------------------------------------------
  console.log('\n--- 1. CANONICAL PATH ENFORCEMENT & BASENAME REJECTION ---');
  let recClient = await getFreshRecruiterClient();

  // Test 1.1: Recruiter can download Candidate A's resume attached to Job 1
  const { data: dlResume, error: errResume } = await recClient.storage.from('documents').download(CAND_A_RESUME_KEY);
  assert('TEST-CANON-01', 'Recruiter can download Candidate A attached resume using canonical key', errResume === null && dlResume !== null);

  // Test 1.2: Recruiter is strictly blocked from downloading Candidate A's unrelated private document
  const { data: dlPrivate, error: errPrivate } = await recClient.storage.from('documents').download(CAND_A_PRIVATE_KEY);
  assert('TEST-CANON-02', 'Recruiter BLOCKED from Candidate A unrelated document (private tax record)', errPrivate !== null);

  // Test 1.3: Identical filename in Candidate B's folder (Adversarial basename collision test)
  const { data: dlColl, error: errColl } = await recClient.storage.from('documents').download(CAND_B_IDENTICAL_FILENAME_KEY);
  assert('TEST-CANON-03', 'Recruiter BLOCKED from identical filename in different candidate folder (basename attack rejected)', errColl !== null);

  // Test 1.4: Cross-application isolation: Recruiter for Job 1 attempting Job 2's distinct resume (Other Company)
  const { data: dlJob2, error: errJob2 } = await recClient.storage.from('documents').download(CAND_A_JOB2_RESUME_KEY);
  assert('TEST-CANON-04', 'Recruiter BLOCKED from candidate resume submitted to a different company job application', errJob2 !== null);

  // --------------------------------------------------------------------------
  // TEST SECTION 2: APPLICATION & JOB LIFECYCLE REVOCATION (LIVE RLS)
  // --------------------------------------------------------------------------
  console.log('\n--- 2. APPLICATION & JOB LIFECYCLE REVOCATION ---');

  // Test 2.1: Application status changed to rejected -> Recruiter access blocked on Storage API
  await runSql(`UPDATE public.job_applications SET status = 'rejected' WHERE id = '${APP1_ID}';`, 'staging');
  recClient = await getFreshRecruiterClient();
  const { data: dlRejected, error: errRejected } = await recClient.storage.from('documents').download(CAND_A_RESUME_KEY);
  assert('TEST-CANON-05', 'Recruiter BLOCKED after application status is rejected', errRejected !== null);

  // Restore application status to 'applied'
  await runSql(`UPDATE public.job_applications SET status = 'applied' WHERE id = '${APP1_ID}';`, 'staging');
  recClient = await getFreshRecruiterClient();
  const { data: dlRestored, error: errRestored } = await recClient.storage.from('documents').download(CAND_A_RESUME_KEY);
  assert('TEST-CANON-06', 'Recruiter access RESTORED after application returns to active status', errRestored === null && dlRestored !== null);

  // Test 2.2: Job becomes inactive (is_active = false) -> Recruiter access blocked
  await runSql(`UPDATE public.jobs SET is_active = false WHERE id = '${JOB1_ID}';`, 'staging');
  recClient = await getFreshRecruiterClient();
  const { data: dlJobInactive, error: errJobInactive } = await recClient.storage.from('documents').download(CAND_A_RESUME_KEY);
  assert('TEST-CANON-07', 'Recruiter BLOCKED when job is closed/inactive (is_active = false)', errJobInactive !== null);

  // Restore job to active
  await runSql(`UPDATE public.jobs SET is_active = true WHERE id = '${JOB1_ID}';`, 'staging');

  // --------------------------------------------------------------------------
  // TEST SECTION 3: SIGNED URL RESIDUAL EXPOSURE & EXPIRATION VERIFICATION
  // --------------------------------------------------------------------------
  console.log('\n--- 3. SIGNED URL RESIDUAL EXPOSURE LIFECYCLE ---');
  recClient = await getFreshRecruiterClient();

  // Test 3.1: Authorized generation of 300-second signed URL
  const { data: signData300, error: errSign300 } = await recClient.storage.from('documents').createSignedUrl(CAND_A_RESUME_KEY, 300);
  assert('TEST-SIGN-RES-01', 'Authorized recruiter successfully generates 300-second signed URL for attached resume', errSign300 === null && !!signData300?.signedUrl);

  // Test 3.2: Bearer download without Authorization header functions during validity
  const bearerRes = await fetch(signData300.signedUrl);
  assert('TEST-SIGN-RES-02', 'Bearer download without Authorization header succeeds during validity window', bearerRes.status === 200);

  // Test 3.3: Residual exposure proof: Recruiter is suspended in DB, but previously issued bearer URL remains valid until token exp
  await runSql(`UPDATE public.company_team_members SET is_active = false WHERE id = '${TEAM_MEMBER_ID}';`, 'staging');
  const bearerResidualRes = await fetch(signData300.signedUrl);
  assert('TEST-SIGN-RES-03', 'Documented residual exposure: Issued signed URL remains bearer-valid until token expiration', bearerResidualRes.status === 200);

  // Test 3.4: Generating a NEW signed URL after suspension is STRICTLY BLOCKED by live RLS
  recClient = await getFreshRecruiterClient();
  const { data: newSignBlocked, error: errNewSignBlocked } = await recClient.storage.from('documents').createSignedUrl(CAND_A_RESUME_KEY, 300);
  assert('TEST-SIGN-RES-04', 'Generating a NEW signed URL after suspension is STRICTLY BLOCKED by RLS', errNewSignBlocked !== null);

  // Restore recruiter active status
  await runSql(`UPDATE public.company_team_members SET is_active = true WHERE id = '${TEAM_MEMBER_ID}';`, 'staging');

  // Test 3.5: Expired token rejection
  recClient = await getFreshRecruiterClient();
  const { data: shortSign } = await recClient.storage.from('documents').createSignedUrl(CAND_A_RESUME_KEY, 2);
  console.log('Waiting 3.5 seconds for signed token expiration...');
  await new Promise(r => setTimeout(r, 3500));
  const expiredRes = await fetch(shortSign.signedUrl);
  const expiredBody = await expiredRes.json().catch(() => ({}));
  assert('TEST-SIGN-RES-05', 'Storage API rejects expired signed URL with 400 InvalidJWT', expiredRes.status === 400 && expiredBody.code === 'InvalidJWT');

  // --------------------------------------------------------------------------
  // TEST SECTION 4: ANTI-ORACLE BOUNDARY VERIFICATION
  // --------------------------------------------------------------------------
  console.log('\n--- 4. ANTI-ORACLE HELPER BOUNDARY VERIFICATION ---');

  // Test 4.1: Unrelated authenticated user calling helper for another user returns false
  const oracleCheckOther = await runSql(`
    SELECT public.can_employer_access_document('${CAND_A_RESUME_KEY}', '${candA_id}', '${candB_id}');
  `, 'staging');
  assert('TEST-ORACLE-01', 'Anti-oracle check: passing distinct p_auth_uid returns false', oracleCheckOther[0]?.can_employer_access_document === false, JSON.stringify(oracleCheckOther));

  // Test 4.2: Anonymous/null caller returns false
  const oracleCheckNull = await runSql(`
    SELECT public.can_employer_access_document('${CAND_A_RESUME_KEY}', '${candA_id}', NULL);
  `, 'staging');
  assert('TEST-ORACLE-02', 'Anti-oracle check: null auth uid returns false', oracleCheckNull[0]?.can_employer_access_document === false);

  console.log('\n========================================================================');
  console.log(`CANONICAL STORAGE SUITE COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================================\n');

  if (failed > 0) process.exit(1);
}

runCanonicalStorageSuite().catch(err => {
  console.error('Fatal error in canonical storage suite:', err);
  process.exit(1);
});
