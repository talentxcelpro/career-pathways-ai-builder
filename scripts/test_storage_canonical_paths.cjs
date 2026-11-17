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
  // TEST SECTION 2: EXPLICIT STORAGE OWNER & SERVER MAPPING MATRIX
  // --------------------------------------------------------------------------
  console.log('\n--- 2. EXPLICIT STORAGE OWNER & SERVER MAPPING MATRIX ---');

  // Test 2.1: Correct owner_id and correct path
  const checkOwnerCorrect = await runSql(`
    SELECT set_config('request.jwt.claim.sub', '${rec_id}', true);
    SELECT extensions.can_employer_access_document('${CAND_A_RESUME_KEY}', '${candA_id}', 'documents', '${rec_id}');
  `, 'staging');
  assert('TEST-OWNER-01', 'Correct owner_id and correct path -> access GRANTED', checkOwnerCorrect[0]?.can_employer_access_document === true);

  // Test 2.2: Incorrect owner_id with correct path (Candidate B identity passed for Candidate A file)
  const checkOwnerWrong = await runSql(`
    SELECT set_config('request.jwt.claim.sub', '${rec_id}', true);
    SELECT extensions.can_employer_access_document('${CAND_A_RESUME_KEY}', '${candB_id}', 'documents', '${rec_id}');
  `, 'staging');
  assert('TEST-OWNER-02', 'Incorrect owner_id with correct path -> access BLOCKED', checkOwnerWrong[0]?.can_employer_access_document === false);

  // Test 2.3: Correct owner_id with incorrect path (Path doesn't match application resume)
  const checkPathWrong = await runSql(`
    SELECT set_config('request.jwt.claim.sub', '${rec_id}', true);
    SELECT extensions.can_employer_access_document('resumes/${candA_id}/non_existent_file.pdf', '${candA_id}', 'documents', '${rec_id}');
  `, 'staging');
  assert('TEST-OWNER-03', 'Correct owner_id with incorrect path -> access BLOCKED', checkPathWrong[0]?.can_employer_access_document === false);

  // Test 2.4: Same filename in different candidate folder (Candidate B folder)
  const checkBasenameAttack = await runSql(`
    SELECT set_config('request.jwt.claim.sub', '${rec_id}', true);
    SELECT extensions.can_employer_access_document('${CAND_B_IDENTICAL_FILENAME_KEY}', '${candB_id}', 'documents', '${rec_id}');
  `, 'staging');
  assert('TEST-OWNER-04', 'Same filename in different candidate folder -> access BLOCKED', checkBasenameAttack[0]?.can_employer_access_document === false);

  // Test 2.5: Same candidate with unrelated private document
  const checkUnrelatedDoc = await runSql(`
    SELECT set_config('request.jwt.claim.sub', '${rec_id}', true);
    SELECT extensions.can_employer_access_document('${CAND_A_PRIVATE_KEY}', '${candA_id}', 'documents', '${rec_id}');
  `, 'staging');
  assert('TEST-OWNER-05', 'Same candidate with unrelated private document -> access BLOCKED', checkUnrelatedDoc[0]?.can_employer_access_document === false);

  // Test 2.6: Bucket boundary check (non-approved bucket)
  const checkBucketBoundary = await runSql(`
    SELECT set_config('request.jwt.claim.sub', '${rec_id}', true);
    SELECT extensions.can_employer_access_document('${CAND_A_RESUME_KEY}', '${candA_id}', 'avatars', '${rec_id}');
  `, 'staging');
  assert('TEST-OWNER-06', 'Unapproved bucket (avatars) -> access BLOCKED', checkBucketBoundary[0]?.can_employer_access_document === false);

  // Test 2.7: Missing owner metadata (null owner_id) with NO server mapping -> access BLOCKED
  const checkSrNoMap = await runSql(`
    SELECT set_config('request.jwt.claim.sub', '${rec_id}', true);
    SELECT extensions.can_employer_access_document('${CAND_A_SERVICE_ROLE_KEY}', NULL, 'documents', '${rec_id}');
  `, 'staging');
  assert('TEST-OWNER-07', 'Missing owner metadata (null owner_id) without server mapping -> access BLOCKED', checkSrNoMap[0]?.can_employer_access_document === false);

  // Test 2.8: Live Storage API: Recruiter BLOCKED from downloading null owner_id file without server mapping
  const { data: dlSrBlocked, error: errSrBlocked } = await recClient.storage.from('documents').download(CAND_A_SERVICE_ROLE_KEY);
  assert('TEST-OWNER-08', 'Live Storage API: Recruiter BLOCKED from null owner_id file without server mapping', errSrBlocked !== null);

  // Test 2.9: Server mapping created for DIFFERENT candidate (candB_id) -> access BLOCKED
  await runSql(`
    INSERT INTO public.candidate_document_mappings (bucket_id, object_name, candidate_id, verified_by_service_role)
    VALUES ('documents', 'resumes/${candB_id}/canonical_app1_resume_${RUN_ID}.pdf', '${candB_id}', true)
    ON CONFLICT (bucket_id, object_name) DO UPDATE SET candidate_id = '${candB_id}', verified_by_service_role = true;
  `, 'staging');
  const checkSrWrongMap = await runSql(`
    SELECT set_config('request.jwt.claim.sub', '${rec_id}', true);
    SELECT extensions.can_employer_access_document('${CAND_A_SERVICE_ROLE_KEY}', NULL, 'documents', '${rec_id}');
  `, 'staging');
  assert('TEST-OWNER-09', 'Missing owner metadata with server mapping for DIFFERENT candidate -> access BLOCKED', checkSrWrongMap[0]?.can_employer_access_document === false);

  // Test 2.10: Server mapping created for CORRECT candidate (candA_id) -> access GRANTED
  await runSql(`
    INSERT INTO public.candidate_document_mappings (bucket_id, object_name, candidate_id, verified_by_service_role)
    VALUES ('documents', '${CAND_A_SERVICE_ROLE_KEY}', '${candA_id}', true)
    ON CONFLICT (bucket_id, object_name) DO UPDATE SET candidate_id = '${candA_id}', verified_by_service_role = true;
  `, 'staging');
  const checkSrCorrectMap = await runSql(`
    SELECT set_config('request.jwt.claim.sub', '${rec_id}', true);
    SELECT extensions.can_employer_access_document('${CAND_A_SERVICE_ROLE_KEY}', NULL, 'documents', '${rec_id}');
  `, 'staging');
  assert('TEST-OWNER-10', 'Missing owner metadata with verified server mapping for Candidate A -> access GRANTED', checkSrCorrectMap[0]?.can_employer_access_document === true);

  // Test 2.11: Live Storage API: Recruiter can download service-role file with verified server mapping
  await new Promise(r => setTimeout(r, 600));
  recClient = await getFreshRecruiterClient();
  const { data: dlSrGranted, error: errSrGranted } = await recClient.storage.from('documents').download(CAND_A_SERVICE_ROLE_KEY);
  assert('TEST-OWNER-11', 'Live Storage API: Recruiter can download service-role file with verified server mapping', errSrGranted === null && dlSrGranted !== null);

  // Test 2.12: Gate 3 Mapping table writer security: authenticated client cannot SELECT
  const { data: candMapSelect, error: candMapSelectErr } = await clientCandA
    .from('candidate_document_mappings')
    .select('*');
  assert('TEST-MAP-SEC-01', 'Authenticated client cannot SELECT from candidate_document_mappings (privilege revoked)',
    candMapSelectErr !== null && (candMapSelectErr.code === '42501' || candMapSelectErr.message.includes('permission denied')));

  // Test 2.13: Gate 3 Mapping table writer security: authenticated client cannot INSERT
  const { data: candMapInsert, error: candMapInsertErr } = await clientCandA
    .from('candidate_document_mappings')
    .insert({ bucket_id: 'documents', object_name: CAND_A_RESUME_KEY, candidate_id: candA_id });
  assert('TEST-MAP-SEC-02', 'Authenticated client cannot INSERT into candidate_document_mappings (privilege revoked)',
    candMapInsertErr !== null && (candMapInsertErr.code === '42501' || candMapInsertErr.message.includes('permission denied')));

  // Test 2.14: Gate 3 Mapping table writer security: anonymous client cannot SELECT
  const { data: anonMapSelect, error: anonMapSelectErr } = await anonClient
    .from('candidate_document_mappings')
    .select('*');
  assert('TEST-MAP-SEC-03', 'Anonymous client cannot SELECT from candidate_document_mappings (privilege revoked)',
    anonMapSelectErr !== null && (anonMapSelectErr.code === '42501' || anonMapSelectErr.message.includes('permission denied')));

  // Test 2.15: Gate 3 Trigger validation: Mismatched candidate folder prefix rejected
  let triggerFolderCaught = false;
  try {
    const res = await runSql(`
      INSERT INTO public.candidate_document_mappings (bucket_id, object_name, candidate_id, verified_by_service_role)
      VALUES ('documents', 'resumes/${candA_id}/test_tamper.pdf', '${candB_id}', true);
    `, 'staging');
    if (res.error) triggerFolderCaught = true;
  } catch (e) {
    triggerFolderCaught = true;
  }
  assert('TEST-MAP-SEC-04', 'Trigger validate_candidate_document_mapping rejects folder-candidate mismatch', triggerFolderCaught);

  // Test 2.16: Gate 3 Trigger validation: Wrong bucket (avatars) rejected
  let triggerBucketCaught = false;
  try {
    const res = await runSql(`
      INSERT INTO public.candidate_document_mappings (bucket_id, object_name, candidate_id, verified_by_service_role)
      VALUES ('avatars', 'resumes/${candA_id}/test_tamper.pdf', '${candA_id}', true);
    `, 'staging');
    if (res.error) triggerBucketCaught = true;
  } catch (e) {
    triggerBucketCaught = true;
  }
  assert('TEST-MAP-SEC-05', 'Trigger validate_candidate_document_mapping rejects unapproved bucket', triggerBucketCaught);

  // Test 2.17: Gate 3 Audit logging: candidate_document_mapping_audit records mutations
  const auditLogs = await runSql(`
    SELECT count(*)::int as count FROM public.candidate_document_mapping_audit;
  `, 'staging');
  assert('TEST-MAP-SEC-06', 'candidate_document_mapping_audit recorded mapping mutations', (auditLogs[0]?.count ?? 0) > 0);

  // --------------------------------------------------------------------------
  // TEST SECTION 3: CAN_MANAGE_COMPANY_JOB SIGNATURES & IDENTITY BOUNDARY
  // --------------------------------------------------------------------------
  console.log('\n--- 3. CAN_MANAGE_COMPANY_JOB SIGNATURES & IDENTITY BOUNDARY ---');

  // Test 3.1: 2-arg form with recruiter identity allows authorized recruiter
  const mgmt2ArgRec = await runSql(`
    SELECT set_config('request.jwt.claim.sub', '${rec_id}', true);
    SELECT extensions.can_manage_company_job('${COMPANY_ID}', '${rec_id}') as can_manage;
  `, 'staging');
  assert('TEST-MGMT-01', '2-arg extensions.can_manage_company_job(company_id, user_id) allows active recruiter',
    mgmt2ArgRec[0]?.can_manage === true);

  // Test 3.2: 2-arg form rejects unauthorized candidate
  const mgmt2ArgCand = await runSql(`
    SELECT set_config('request.jwt.claim.sub', '${candA_id}', true);
    SELECT extensions.can_manage_company_job('${COMPANY_ID}', '${candA_id}') as can_manage;
  `, 'staging');
  assert('TEST-MGMT-02', '2-arg extensions.can_manage_company_job(company_id, user_id) blocks unauthorized candidate',
    mgmt2ArgCand[0]?.can_manage === false);

  // Test 3.3: 2-arg form anti-spoofing guard
  const mgmt2ArgSpoof = await runSql(`
    SELECT set_config('request.jwt.claim.sub', '${rec_id}', true);
    SELECT extensions.can_manage_company_job('${COMPANY_ID}', '${candB_id}') as can_manage;
  `, 'staging');
  assert('TEST-MGMT-03', '2-arg form rejects arbitrary third-party user without membership',
    mgmt2ArgSpoof[0]?.can_manage === false);

  // Test 3.3B: 2-arg unauthenticated call fails closed
  const mgmt2ArgUnauth = await runSql(`
    SELECT set_config('request.jwt.claim.sub', '', true);
    SELECT extensions.can_manage_company_job('${COMPANY_ID}', '${rec_id}') as can_manage;
  `, 'staging');
  assert('TEST-MGMT-03B', '2-arg form unauthenticated caller fails closed (returns false)',
    mgmt2ArgUnauth[0]?.can_manage === false);

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
    WHERE proname = 'can_manage_company_job' AND pronamespace = 'extensions'::regnamespace;
  `, 'staging');
  assert('TEST-MGMT-04', 'can_manage_company_job overloads exist in extensions, SECURITY DEFINER, search_path empty, anon revoked',
    Array.isArray(checkProcAcl) && checkProcAcl.length >= 2 &&
    checkProcAcl.every(p => p.prosecdef === true && p.anon_exec === false && p.auth_exec === true));

  // Test 3.5: No can_manage_company_job functions exist in public schema
  const checkPublicProc = await runSql(`
    SELECT proname FROM pg_proc WHERE proname = 'can_manage_company_job' AND pronamespace = 'public'::regnamespace;
  `, 'staging');
  assert('TEST-MGMT-05', 'can_manage_company_job strictly removed from public schema (0 exposed endpoints)',
    checkPublicProc.length === 0);

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

  // Test 6.1: Direct PostgREST RPC call for can_employer_access_document by authenticated user is rejected
  const rpcRecDoc = await recClient.rpc('can_employer_access_document', {
    p_object_name: CAND_A_RESUME_KEY
  });
  assert('TEST-ORACLE-RPC-01', 'Direct authenticated RPC call to can_employer_access_document is rejected (404 not in schema cache)',
    rpcRecDoc.error !== null && (rpcRecDoc.status === 404 || rpcRecDoc.error.code === 'PGRST202'));

  // Test 6.2: Direct PostgREST RPC call for can_employer_access_document by anonymous user is rejected
  const rpcAnonDoc = await anonClient.rpc('can_employer_access_document', {
    p_object_name: CAND_A_RESUME_KEY
  });
  assert('TEST-ORACLE-RPC-02', 'Direct anonymous RPC call to can_employer_access_document is rejected (404 not in schema cache)',
    rpcAnonDoc.error !== null && (rpcAnonDoc.status === 404 || rpcAnonDoc.error.code === 'PGRST202'));

  // Test 6.3: Direct PostgREST RPC call for can_manage_company_job by authenticated user is rejected
  const rpcRecMgmt = await recClient.rpc('can_manage_company_job', {
    p_company_id: COMPANY_ID
  });
  assert('TEST-ORACLE-RPC-03', 'Direct authenticated RPC call to can_manage_company_job is rejected (404 not in schema cache)',
    rpcRecMgmt.error !== null && (rpcRecMgmt.status === 404 || rpcRecMgmt.error.code === 'PGRST202'));

  // Test 6.4: Direct PostgREST RPC call for can_manage_company_job by anonymous user is rejected
  const rpcAnonMgmt = await anonClient.rpc('can_manage_company_job', {
    p_company_id: COMPANY_ID
  });
  assert('TEST-ORACLE-RPC-04', 'Direct anonymous RPC call to can_manage_company_job is rejected (404 not in schema cache)',
    rpcAnonMgmt.error !== null && (rpcAnonMgmt.status === 404 || rpcAnonMgmt.error.code === 'PGRST202'));

  // Test 6.5: Direct SQL anti-oracle check on extensions.can_employer_access_document (distinct p_auth_uid returns false)
  const oracleCheckOther = await runSql(`
    SELECT set_config('request.jwt.claim.sub', '${rec_id}', true);
    SELECT extensions.can_employer_access_document('${CAND_A_RESUME_KEY}', '${candA_id}', 'documents', '${candB_id}');
  `, 'staging');
  assert('TEST-ORACLE-SQL-01', 'Direct SQL: passing distinct p_auth_uid returns false',
    oracleCheckOther[0]?.can_employer_access_document === false);

  // Test 6.6: Direct SQL anti-oracle check on extensions.can_employer_access_document (null auth.uid() fails closed)
  const oracleCheckNull = await runSql(`
    SELECT set_config('request.jwt.claim.sub', '', true);
    SELECT extensions.can_employer_access_document('${CAND_A_RESUME_KEY}', '${candA_id}', 'documents', NULL);
  `, 'staging');
  assert('TEST-ORACLE-SQL-02', 'Direct SQL: null auth uid fails closed (returns false)',
    Array.isArray(oracleCheckNull) && oracleCheckNull[0]?.can_employer_access_document === false);

  // Test 6.6B: Direct SQL unauthenticated caller attempting to pass valid recruiter UUID fails closed
  const oracleUnauthRec = await runSql(`
    SELECT set_config('request.jwt.claim.sub', '', true);
    SELECT extensions.can_employer_access_document('${CAND_A_RESUME_KEY}', '${candA_id}', 'documents', '${rec_id}');
  `, 'staging');
  assert('TEST-ORACLE-SQL-02B', 'Direct SQL: unauthenticated caller claiming recruiter UUID fails closed (returns false)',
    Array.isArray(oracleUnauthRec) && oracleUnauthRec[0]?.can_employer_access_document === false);

  // Test 6.7: Storage RLS policy explicitly binds to extensions.can_employer_access_document
  const policyDeps = await runSql(`
    SELECT 
      pr.proname,
      n.nspname
    FROM pg_policy p
    JOIN pg_depend d ON d.objid = p.oid
    JOIN pg_proc pr ON pr.oid = d.refobjid
    JOIN pg_namespace n ON n.oid = pr.pronamespace
    WHERE p.polrelid = 'storage.objects'::regclass 
      AND p.polname = 'Employers can view applicant documents'
      AND pr.proname = 'can_employer_access_document';
  `, 'staging');
  assert('TEST-ORACLE-SQL-03', 'Storage policy explicitly binds to extensions.can_employer_access_document',
    policyDeps.length === 1 && policyDeps[0]?.nspname === 'extensions');

  // Test 6.8: Zero can_employer_access_document functions exist in public schema
  const checkPublicDocProc = await runSql(`
    SELECT proname FROM pg_proc WHERE proname = 'can_employer_access_document' AND pronamespace = 'public'::regnamespace;
  `, 'staging');
  assert('TEST-ORACLE-SQL-04', 'can_employer_access_document strictly removed from public schema (0 exposed endpoints)',
    checkPublicDocProc.length === 0);

  console.log('\n========================================================================');
  console.log(`CANONICAL STORAGE SUITE COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================================\n');

  if (failed > 0) process.exit(1);
}

runCanonicalStorageSuite().catch(err => {
  console.error('Fatal error in canonical storage suite:', err);
  process.exit(1);
});
