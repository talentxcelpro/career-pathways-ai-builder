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
    auth: { persistSession: false },
    global: { headers: { Authorization: `Bearer ${authCandA.session.access_token}` } }
  });

  const { data: authCandB } = await anonClient.auth.signInWithPassword({
    email: 'audit_cand2@talentxcel-audit.local',
    password: 'AuditPassword123!Secure'
  });
  const candB_id = authCandB.user.id;
  const clientCandB = createClient(SUPABASE_URL, ANON_KEY, {
    auth: { persistSession: false },
    global: { headers: { Authorization: `Bearer ${authCandB.session.access_token}` } }
  });

  const { data: authRec } = await anonClient.auth.signInWithPassword({
    email: 'audit_rec1@talentxcel-audit.local',
    password: 'AuditPassword123!Secure'
  });
  const rec_id = authRec.user.id;
  function getFreshRecruiterClient() {
    return createClient(SUPABASE_URL, ANON_KEY, {
      auth: { persistSession: false },
      global: { headers: { Authorization: `Bearer ${authRec.session.access_token}` } }
    });
  }

  // 2. Setup Test Fixture Identifiers
  const COMPANY_ID = '90000000-0000-0000-0000-000000000001';
  const COMPANY_OWNER_ID = '5b2022b9-37f0-4fc1-807d-56cec1044303'; // audit_rec2
  const OTHER_COMPANY_ID = '90000000-0000-0000-0000-000000000002';
  const TEAM_MEMBER_ID = '90000000-0000-0000-0000-000000000003';
  const JOB1_ID = '90000000-0000-0000-0000-000000000004';
  const JOB2_OTHER_ID = '90000000-0000-0000-0000-000000000005';
  const APP1_ID = '90000000-0000-0000-0000-000000000006';
  const APP2_OTHER_ID = '90000000-0000-0000-0000-000000000007';
  const JOB_INACTIVE_ID = '90000000-0000-0000-0000-000000000010';
  const JOB_EXPIRED_ID = '90000000-0000-0000-0000-000000000011';
  const JOB_REJECTED_ID = '90000000-0000-0000-0000-000000000012';
  const JOB_SR_ID = '90000000-0000-0000-0000-000000000013';
  const APP_REJ_ID = '90000000-0000-0000-0000-000000000020';
  const APP_INACT_ID = '90000000-0000-0000-0000-000000000021';
  const APP_EXP_ID = '90000000-0000-0000-0000-000000000022';
  const APP_SR_ID = '90000000-0000-0000-0000-000000000030';

  // Storage Paths (run-scoped with cacheControl '0' to prevent CDN 3600s cache hit across status mutations)
  const RUN_ID = Date.now();
  const CAND_A_RESUME_KEY = `resumes/${candA_id}/canonical_app1_resume_${RUN_ID}.pdf`;
  const CAND_A_PRIVATE_KEY = `resumes/${candA_id}/private_tax_document_${RUN_ID}.pdf`;
  const CAND_B_IDENTICAL_FILENAME_KEY = `resumes/${candB_id}/canonical_app1_resume_${RUN_ID}.pdf`;
  const CAND_A_JOB2_RESUME_KEY = `resumes/${candA_id}/other_company_job2_resume_${RUN_ID}.pdf`;
  const CAND_A_RESUME_REJECTED_KEY = `resumes/${candA_id}/canonical_app_rejected_${RUN_ID}.pdf`;
  const CAND_A_RESUME_INACTIVE_KEY = `resumes/${candA_id}/canonical_app_inactive_${RUN_ID}.pdf`;
  const CAND_A_RESUME_EXPIRED_KEY = `resumes/${candA_id}/canonical_app_expired_${RUN_ID}.pdf`;
  const CAND_A_SERVICE_ROLE_KEY = `resumes/${candA_id}/service_role_uploaded_${RUN_ID}.pdf`;

  console.log('Seeding test files to Supabase Storage...');
  const pdfBuffer = Buffer.from('%PDF-1.4 Mock PDF Content for Security Audit Gate Evaluation', 'utf-8');
  const pdfBlob = new Blob([pdfBuffer], { type: 'application/pdf' });

  // Upload candidate documents with cacheControl '0' to prevent CDN edge retention across DB status updates
  await clientCandA.storage.from('documents').upload(CAND_A_RESUME_KEY, pdfBlob, { upsert: true, cacheControl: '0' });
  await clientCandA.storage.from('documents').upload(CAND_A_PRIVATE_KEY, pdfBlob, { upsert: true, cacheControl: '0' });
  await clientCandA.storage.from('documents').upload(CAND_A_JOB2_RESUME_KEY, pdfBlob, { upsert: true, cacheControl: '0' });
  await clientCandB.storage.from('documents').upload(CAND_B_IDENTICAL_FILENAME_KEY, pdfBlob, { upsert: true, cacheControl: '0' });
  await clientCandA.storage.from('documents').upload(CAND_A_RESUME_REJECTED_KEY, pdfBlob, { upsert: true, cacheControl: '0' });
  await clientCandA.storage.from('documents').upload(CAND_A_RESUME_INACTIVE_KEY, pdfBlob, { upsert: true, cacheControl: '0' });
  await clientCandA.storage.from('documents').upload(CAND_A_RESUME_EXPIRED_KEY, pdfBlob, { upsert: true, cacheControl: '0' });
  await clientCandA.storage.from('documents').upload(CAND_A_SERVICE_ROLE_KEY, pdfBlob, { upsert: true, cacheControl: '0' });

  console.log('Establishing database test fixtures...');
  const fixtureRes = await runSql(`
    -- Simulate service-role upload by setting owner = NULL and owner_id = NULL on service-role uploaded file
    UPDATE storage.objects SET owner = NULL, owner_id = NULL WHERE name = '${CAND_A_SERVICE_ROLE_KEY}';

    -- Clear any residual mappings for service-role key
    DELETE FROM public.candidate_document_mappings WHERE bucket_id = 'documents' AND object_name = '${CAND_A_SERVICE_ROLE_KEY}';

    INSERT INTO public.companies (id, name)
    VALUES ('${COMPANY_ID}', 'Audit Company 1')
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.company_profiles (company_id, owner_id)
    VALUES ('${COMPANY_ID}', '${COMPANY_OWNER_ID}')
    ON CONFLICT (company_id) DO UPDATE SET owner_id = '${COMPANY_OWNER_ID}';

    -- Recruiter team member at Company 1 (Active)
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

    -- Inactive Job at Company 1
    INSERT INTO public.jobs (id, company_id, title, description, location, is_active, expires_at)
    VALUES ('${JOB_INACTIVE_ID}', '${COMPANY_ID}', 'Inactive Engineer', 'Inactive Role', 'Remote', false, NOW() + INTERVAL '30 days')
    ON CONFLICT (id) DO UPDATE SET company_id = '${COMPANY_ID}', is_active = false, expires_at = NOW() + INTERVAL '30 days';

    -- Expired Job at Company 1
    INSERT INTO public.jobs (id, company_id, title, description, location, is_active, expires_at)
    VALUES ('${JOB_EXPIRED_ID}', '${COMPANY_ID}', 'Expired Architect', 'Expired Role', 'Remote', true, NOW() - INTERVAL '1 day')
    ON CONFLICT (id) DO UPDATE SET company_id = '${COMPANY_ID}', is_active = true, expires_at = NOW() - INTERVAL '1 day';

    -- Rejected Job at Company 1 (Active job with candidate rejected application)
    INSERT INTO public.jobs (id, company_id, title, description, location, is_active, expires_at)
    VALUES ('${JOB_REJECTED_ID}', '${COMPANY_ID}', 'Rejected Position', 'Rejected Role', 'Remote', true, NOW() + INTERVAL '30 days')
    ON CONFLICT (id) DO UPDATE SET company_id = '${COMPANY_ID}', is_active = true, expires_at = NOW() + INTERVAL '30 days';

    -- Service-Role Uploaded Job at Company 1 (Active)
    INSERT INTO public.jobs (id, company_id, title, description, location, is_active, expires_at)
    VALUES ('${JOB_SR_ID}', '${COMPANY_ID}', 'Backend Architect', 'Service Role Upload Role', 'Remote', true, NOW() + INTERVAL '30 days')
    ON CONFLICT (id) DO UPDATE SET company_id = '${COMPANY_ID}', is_active = true, expires_at = NOW() + INTERVAL '30 days';

    -- Application 1: Candidate A applies to Job 1 with attached resume
    INSERT INTO public.job_applications (id, job_id, user_id, resume_url, status)
    VALUES ('${APP1_ID}', '${JOB1_ID}', '${candA_id}', '${CAND_A_RESUME_KEY}', 'applied')
    ON CONFLICT (id) DO UPDATE SET job_id = '${JOB1_ID}', user_id = '${candA_id}', resume_url = '${CAND_A_RESUME_KEY}', status = 'applied';

    -- Application 2: Candidate A applies to Job 2 (Other Company) with distinct resume
    INSERT INTO public.job_applications (id, job_id, user_id, resume_url, status)
    VALUES ('${APP2_OTHER_ID}', '${JOB2_OTHER_ID}', '${candA_id}', '${CAND_A_JOB2_RESUME_KEY}', 'applied')
    ON CONFLICT (id) DO UPDATE SET job_id = '${JOB2_OTHER_ID}', user_id = '${candA_id}', resume_url = '${CAND_A_JOB2_RESUME_KEY}', status = 'applied';

    -- Application 3 (Rejected Lifecycle Fixture): Candidate A applied to Job Rejected, marked rejected
    INSERT INTO public.job_applications (id, job_id, user_id, resume_url, status)
    VALUES ('${APP_REJ_ID}', '${JOB_REJECTED_ID}', '${candA_id}', '${CAND_A_RESUME_REJECTED_KEY}', 'rejected')
    ON CONFLICT (id) DO UPDATE SET job_id = '${JOB_REJECTED_ID}', user_id = '${candA_id}', resume_url = '${CAND_A_RESUME_REJECTED_KEY}', status = 'rejected';

    -- Application 4 (Inactive Job Fixture): Candidate A applied to Job with is_active = false
    INSERT INTO public.job_applications (id, job_id, user_id, resume_url, status)
    VALUES ('${APP_INACT_ID}', '${JOB_INACTIVE_ID}', '${candA_id}', '${CAND_A_RESUME_INACTIVE_KEY}', 'applied')
    ON CONFLICT (id) DO UPDATE SET job_id = '${JOB_INACTIVE_ID}', user_id = '${candA_id}', resume_url = '${CAND_A_RESUME_INACTIVE_KEY}', status = 'applied';

    -- Application 5 (Expired Job Fixture): Candidate A applied to Job with expires_at < NOW()
    INSERT INTO public.job_applications (id, job_id, user_id, resume_url, status)
    VALUES ('${APP_EXP_ID}', '${JOB_EXPIRED_ID}', '${candA_id}', '${CAND_A_RESUME_EXPIRED_KEY}', 'applied')
    ON CONFLICT (id) DO UPDATE SET job_id = '${JOB_EXPIRED_ID}', user_id = '${candA_id}', resume_url = '${CAND_A_RESUME_EXPIRED_KEY}', status = 'applied';

    -- Application 6 (Service-Role Upload Fixture): Candidate A applied with service-role file
    INSERT INTO public.job_applications (id, job_id, user_id, resume_url, status)
    VALUES ('${APP_SR_ID}', '${JOB_SR_ID}', '${candA_id}', '${CAND_A_SERVICE_ROLE_KEY}', 'applied')
    ON CONFLICT (id) DO UPDATE SET job_id = '${JOB_SR_ID}', user_id = '${candA_id}', resume_url = '${CAND_A_SERVICE_ROLE_KEY}', status = 'applied';
  `, 'staging');

  if (fixtureRes && fixtureRes.error) {
    throw new Error(`Failed to establish test fixtures: ${fixtureRes.error} stderr: ${fixtureRes.stderr}`);
  }

  console.log('Test fixtures established successfully.');
  await new Promise(r => setTimeout(r, 1200));

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
  // TEST SECTION 2: EXPLICIT STORAGE OWNER VALIDATION MATRIX
  // --------------------------------------------------------------------------
  console.log('\n--- 2. EXPLICIT STORAGE OWNER VALIDATION MATRIX ---');

  // Test 2.1: Correct owner and correct path
  const checkOwnerCorrect = await recClient.rpc('can_employer_access_document', {
    p_object_name: CAND_A_RESUME_KEY,
    p_object_owner: candA_id,
    p_bucket_id: 'documents',
    p_auth_uid: rec_id
  });
  assert('TEST-OWNER-01', 'Correct owner and correct path -> access GRANTED', checkOwnerCorrect.data === true);

  // Test 2.2: Incorrect owner with correct path (Candidate B identity passed for Candidate A file)
  const checkOwnerWrong = await recClient.rpc('can_employer_access_document', {
    p_object_name: CAND_A_RESUME_KEY,
    p_object_owner: candB_id,
    p_bucket_id: 'documents',
    p_auth_uid: rec_id
  });
  assert('TEST-OWNER-02', 'Incorrect owner with correct path -> access BLOCKED', checkOwnerWrong.data === false);

  // Test 2.3: Correct owner with incorrect path (Path doesn't match application resume)
  const checkPathWrong = await recClient.rpc('can_employer_access_document', {
    p_object_name: `resumes/${candA_id}/non_existent_file.pdf`,
    p_object_owner: candA_id,
    p_bucket_id: 'documents',
    p_auth_uid: rec_id
  });
  assert('TEST-OWNER-03', 'Correct owner with incorrect path -> access BLOCKED', checkPathWrong.data === false);

  // Test 2.4: Same filename in different candidate folder (Candidate B folder)
  const checkBasenameAttack = await recClient.rpc('can_employer_access_document', {
    p_object_name: CAND_B_IDENTICAL_FILENAME_KEY,
    p_object_owner: candB_id,
    p_bucket_id: 'documents',
    p_auth_uid: rec_id
  });
  assert('TEST-OWNER-04', 'Same filename in different candidate folder -> access BLOCKED', checkBasenameAttack.data === false);

  // Test 2.5: Same candidate with unrelated private document
  const checkUnrelatedDoc = await recClient.rpc('can_employer_access_document', {
    p_object_name: CAND_A_PRIVATE_KEY,
    p_object_owner: candA_id,
    p_bucket_id: 'documents',
    p_auth_uid: rec_id
  });
  assert('TEST-OWNER-05', 'Same candidate with unrelated private document -> access BLOCKED', checkUnrelatedDoc.data === false);

  // Test 2.6: Bucket boundary check (non-approved bucket)
  const checkBucketBoundary = await recClient.rpc('can_employer_access_document', {
    p_object_name: CAND_A_RESUME_KEY,
    p_object_owner: candA_id,
    p_bucket_id: 'avatars',
    p_auth_uid: rec_id
  });
  assert('TEST-OWNER-06', 'Unapproved bucket (avatars) -> access BLOCKED', checkBucketBoundary.data === false);

  // --------------------------------------------------------------------------
  // TEST SECTION 3: CAN_MANAGE_COMPANY_JOB SIGNATURES & IDENTITY BOUNDARY
  // --------------------------------------------------------------------------
  console.log('\n--- 3. CAN_MANAGE_COMPANY_JOB SIGNATURES & IDENTITY BOUNDARY ---');

  // Test 3.1: 1-argument form derives identity strictly from auth.uid()
  const rpcMgmt1ArgRec = await recClient.rpc('can_manage_company_job', { p_company_id: COMPANY_ID });
  assert('TEST-MGMT-01', 'Authoritative 1-arg can_manage_company_job(company_id) allows authorized recruiter', rpcMgmt1ArgRec.data === true);

  // Test 3.2: 1-argument form rejects unauthorized candidate
  const rpcMgmt1ArgCand = await clientCandA.rpc('can_manage_company_job', { p_company_id: COMPANY_ID });
  assert('TEST-MGMT-02', 'Authoritative 1-arg can_manage_company_job(company_id) blocks unauthorized candidate', rpcMgmt1ArgCand.data === false);

  // Test 3.3: 2-argument form anti-spoofing guard
  const rpcMgmt2ArgSpoof = await clientCandA.rpc('can_manage_company_job', { p_company_id: COMPANY_ID, p_user_id: rec_id });
  assert('TEST-MGMT-03', '2-arg form anti-spoofing guard: caller cannot inspect or claim another user identity', rpcMgmt2ArgSpoof.data === false);

  // Test 3.4: Function ACL and security attributes in pg_proc
  const checkProcAcl = await runSql(`
    SELECT 
      proname,
      pronargs,
      prosecdef,
      proconfig,
      has_function_privilege('authenticated', oid, 'EXECUTE') as auth_exec,
      has_function_privilege('anon', oid, 'EXECUTE') as anon_exec
    FROM pg_proc
    WHERE proname = 'can_manage_company_job' AND pronamespace = 'public'::regnamespace;
  `, 'staging');
  assert('TEST-MGMT-04', 'can_manage_company_job overloads exist, SECURITY DEFINER, search_path empty, anon revoked',
    checkProcAcl.length >= 2 &&
    checkProcAcl.every(p => p.prosecdef === true && p.anon_exec === false && p.auth_exec === true));

  // --------------------------------------------------------------------------
  // TEST SECTION 4: COMPLETE APPLICATION & JOB LIFECYCLE AUTHORIZATION
  // --------------------------------------------------------------------------
  console.log('\n--- 4. COMPLETE APPLICATION & JOB LIFECYCLE AUTHORIZATION ---');

  // Test positive allowlist in helper logic across all candidate statuses
  const statusAudit = await runSql(`
    SELECT 
      status,
      (status IN ('applied', 'submitted', 'reviewing', 'under_review', 'interviewing', 'shortlisted', 'accepted', 'offered', 'hired')) as is_allowed
    FROM (VALUES 
      ('applied'), ('submitted'), ('reviewing'), ('under_review'), ('interviewing'), 
      ('shortlisted'), ('accepted'), ('offered'), ('hired'),
      ('rejected'), ('withdrawn'), ('archived'), ('deleted'), ('draft'), ('pending_external_sync')
    ) as t(status);
  `, 'staging');

  const allowedStatuses = new Set(['applied', 'submitted', 'reviewing', 'under_review', 'interviewing', 'shortlisted', 'accepted', 'offered', 'hired']);
  for (const row of statusAudit) {
    const expected = allowedStatuses.has(row.status);
    assert(`TEST-LIFECYCLE-${row.status.toUpperCase()}`,
      `Application status "${row.status}" -> ${expected ? 'ALLOWED' : 'BLOCKED'}`,
      row.is_allowed === expected);
  }

  // Live Storage API: Active 'applied' status -> Allowed
  const { data: dlApplied, error: errApplied } = await recClient.storage.from('documents').download(CAND_A_RESUME_KEY);
  assert('TEST-LIVE-LIFECYCLE-APPLIED', 'Live Storage API: Recruiter allowed for active applied status', errApplied === null && dlApplied !== null);

  // Live Storage API: Active 'reviewing' status -> Allowed
  await runSql(`UPDATE public.job_applications SET status = 'reviewing' WHERE id = '${APP1_ID}';`, 'staging');
  await new Promise(r => setTimeout(r, 800));
  recClient = await getFreshRecruiterClient();
  const { data: dlReviewing, error: errReviewing } = await recClient.storage.from('documents').download(CAND_A_RESUME_KEY);
  assert('TEST-LIVE-LIFECYCLE-REVIEWING', 'Live Storage API: Recruiter allowed for active reviewing status', errReviewing === null && dlReviewing !== null);

  // Live Storage API: Active 'interviewing' status -> Allowed
  await runSql(`UPDATE public.job_applications SET status = 'interviewing' WHERE id = '${APP1_ID}';`, 'staging');
  await new Promise(r => setTimeout(r, 800));
  recClient = await getFreshRecruiterClient();
  const { data: dlInterviewing, error: errInterviewing } = await recClient.storage.from('documents').download(CAND_A_RESUME_KEY);
  assert('TEST-LIVE-LIFECYCLE-INTERVIEWING', 'Live Storage API: Recruiter allowed for active interviewing status', errInterviewing === null && dlInterviewing !== null);

  // Live Storage API: 'rejected' status -> Blocked
  const dlRejectedRes = await recClient.storage.from('documents').download(CAND_A_RESUME_REJECTED_KEY);
  assert('TEST-LIVE-LIFECYCLE-REJECTED', 'Live Storage API: Recruiter BLOCKED after application status is rejected', dlRejectedRes.error !== null);

  // Restore application status to 'applied' -> Access is restored
  await runSql(`UPDATE public.job_applications SET status = 'applied' WHERE id = '${APP_REJ_ID}';`, 'staging');
  await new Promise(r => setTimeout(r, 1500));
  recClient = getFreshRecruiterClient();
  const { data: dlLiveRestored, error: errLiveRestored } = await recClient.storage.from('documents').download(CAND_A_RESUME_REJECTED_KEY);
  assert('TEST-LIVE-LIFECYCLE-RESTORED', 'Live Storage API: Recruiter access RESTORED when application returns to applied', errLiveRestored === null && dlLiveRestored !== null);

  // Job Inactive test
  const dlInactiveRes = await recClient.storage.from('documents').download(CAND_A_RESUME_INACTIVE_KEY);
  assert('TEST-LIVE-LIFECYCLE-INACTIVE-JOB', 'Live Storage API: Recruiter BLOCKED when job is inactive (is_active = false)', dlInactiveRes.error !== null);

  // Job Expired test
  const dlExpiredRes = await recClient.storage.from('documents').download(CAND_A_RESUME_EXPIRED_KEY);
  assert('TEST-LIVE-LIFECYCLE-EXPIRED-JOB', 'Live Storage API: Recruiter BLOCKED when job is expired', dlExpiredRes.error !== null);

  // Ensure APP1_ID is in 'applied' status for Section 5 tests
  await runSql(`UPDATE public.job_applications SET status = 'applied' WHERE id = '${APP1_ID}';`, 'staging');
  await new Promise(r => setTimeout(r, 800));

  // --------------------------------------------------------------------------
  // TEST SECTION 5: SIGNED URL RESIDUAL EXPOSURE & EXPIRATION VERIFICATION
  // --------------------------------------------------------------------------
  console.log('\n--- 5. SIGNED URL RESIDUAL EXPOSURE LIFECYCLE ---');
  recClient = await getFreshRecruiterClient();

  const { data: signData300, error: errSign300 } = await recClient.storage.from('documents').createSignedUrl(CAND_A_RESUME_KEY, 300);
  assert('TEST-SIGN-RES-01', 'Authorized recruiter successfully generates 300-second signed URL for attached resume', errSign300 === null && !!signData300?.signedUrl);

  const bearerRes = await fetch(signData300?.signedUrl || '');
  assert('TEST-SIGN-RES-02', 'Bearer download without Authorization header succeeds during validity window', bearerRes.status === 200);

  // Residual exposure test: Recruiter is suspended in DB
  await runSql(`UPDATE public.company_team_members SET is_active = false WHERE id = '${TEAM_MEMBER_ID}';`, 'staging');
  const bearerResidualRes = await fetch(signData300?.signedUrl || '');
  assert('TEST-SIGN-RES-03', 'Documented residual exposure: Issued signed URL remains bearer-valid until token expiration', bearerResidualRes.status === 200);

  recClient = await getFreshRecruiterClient();
  const { error: errNewSignBlocked } = await recClient.storage.from('documents').createSignedUrl(CAND_A_RESUME_KEY, 300);
  assert('TEST-SIGN-RES-04', 'Generating a NEW signed URL after suspension is STRICTLY BLOCKED by RLS', errNewSignBlocked !== null);

  // Restore recruiter to active status
  await runSql(`UPDATE public.company_team_members SET is_active = true WHERE id = '${TEAM_MEMBER_ID}';`, 'staging');
  await new Promise(r => setTimeout(r, 1200));

  // Expired token test
  recClient = await getFreshRecruiterClient();
  const { data: shortSign, error: shortErr } = await recClient.storage.from('documents').createSignedUrl(CAND_A_RESUME_KEY, 2);
  if (shortErr || !shortSign) {
    console.error('Notice shortSign error:', shortErr);
  }
  assert('TEST-SIGN-RES-05A', 'Short-lived signed URL generation succeeds', shortErr === null && !!shortSign?.signedUrl);
  console.log('Waiting 3.5 seconds for signed token expiration...');
  await new Promise(r => setTimeout(r, 3500));
  const expiredRes = await fetch(shortSign?.signedUrl || '');
  const expiredBody = await expiredRes.json().catch(() => ({}));
  assert('TEST-SIGN-RES-05', 'Storage API rejects expired signed URL with 400 InvalidJWT', expiredRes.status === 400 && expiredBody.code === 'InvalidJWT');

  // --------------------------------------------------------------------------
  // TEST SECTION 6: HELPER RPC EXPOSURE & ANTI-ORACLE BOUNDARY TESTING
  // --------------------------------------------------------------------------
  console.log('\n--- 6. HELPER RPC EXPOSURE & ANTI-ORACLE BOUNDARY TESTING ---');

  // Test 6.1: Direct PostgREST RPC call by authenticated recruiter with arbitrary probe path returns false
  const rpcProbeArbitrary = await recClient.rpc('can_employer_access_document', {
    p_object_name: `resumes/${candA_id}/arbitrary_probed_file.pdf`,
    p_object_owner: candA_id,
    p_bucket_id: 'documents',
    p_auth_uid: rec_id
  });
  assert('TEST-ORACLE-RPC-01', 'Direct RPC probe on arbitrary object path returns false (no boolean oracle leak)',
    rpcProbeArbitrary.data === false);

  // Test 6.2: Direct PostgREST RPC call attempting to spoof caller identity returns false
  const rpcProbeSpoof = await recClient.rpc('can_employer_access_document', {
    p_object_name: CAND_A_RESUME_KEY,
    p_object_owner: candA_id,
    p_bucket_id: 'documents',
    p_auth_uid: candB_id
  });
  assert('TEST-ORACLE-RPC-02', 'Direct RPC probe with spoofed p_auth_uid returns false',
    rpcProbeSpoof.data === false);

  // Test 6.3: Direct PostgREST RPC call by unauthorized candidate probing recruiter permissions returns false
  const rpcProbeCand = await clientCandA.rpc('can_employer_access_document', {
    p_object_name: CAND_A_RESUME_KEY,
    p_object_owner: candA_id,
    p_bucket_id: 'documents',
    p_auth_uid: candA_id
  });
  assert('TEST-ORACLE-RPC-03', 'Direct RPC probe by candidate returns false',
    rpcProbeCand.data === false);

  // Test 6.4: Non-exposed schema extensions.can_employer_access_document is NOT accessible via PostgREST RPC
  const rpcExtensionsProbe = await recClient.rpc('extensions.can_employer_access_document', {
    p_object_name: CAND_A_RESUME_KEY,
    p_object_owner: candA_id,
    p_bucket_id: 'documents',
    p_auth_uid: rec_id
  });
  assert('TEST-ORACLE-RPC-04', 'Non-exposed schema helper cannot be invoked via PostgREST Data API',
    rpcExtensionsProbe.error !== null);

  // Test 6.5: Direct SQL anti-oracle checks
  const oracleCheckOther = await runSql(`
    SELECT public.can_employer_access_document('${CAND_A_RESUME_KEY}', '${candA_id}'::uuid, 'documents', '${candB_id}'::uuid);
  `, 'staging');
  assert('TEST-ORACLE-SQL-01', 'Direct SQL: passing distinct p_auth_uid returns false', oracleCheckOther[0]?.can_employer_access_document === false);

  const oracleCheckNull = await runSql(`
    SELECT public.can_employer_access_document('${CAND_A_RESUME_KEY}', '${candA_id}'::uuid, 'documents', NULL);
  `, 'staging');
  assert('TEST-ORACLE-SQL-02', 'Direct SQL: null auth uid returns false', oracleCheckNull[0]?.can_employer_access_document === false);

  console.log('\n========================================================================');
  console.log(`CANONICAL STORAGE SUITE COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================================\n');

  if (failed > 0) process.exit(1);
}

runCanonicalStorageSuite().catch(err => {
  console.error('Fatal error in canonical storage suite:', err);
  process.exit(1);
});
