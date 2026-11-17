const { createClient } = require('@supabase/supabase-js');
const { runSql, STAGING_REF } = require('./db-audit-helper.cjs');

const SUPABASE_URL = `https://${STAGING_REF}.supabase.co`;
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2d3d0cXV1ZXhoeXlkd2loamJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM1OTI1NzYsImV4cCI6MjEwOTE2ODU3Nn0.ZBevJqFcBzb2UAwwr_o5zgUcrrI5uf1rFgsn-cMFXnQ";

async function main() {
  console.log('========================================================================');
  console.log('GATE 5: COMPANY AUTHORIZATION HELPER & APPLICANT ROLE MATRIX RETEST');
  console.log('========================================================================\n');

  const anonClient = createClient(SUPABASE_URL, ANON_KEY, { auth: { persistSession: false } });

  // Login Recruiter 1
  const { data: authRec } = await anonClient.auth.signInWithPassword({
    email: 'audit_rec1@talentxcel-audit.local',
    password: 'AuditPassword123!Secure'
  });
  const clientRec = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${authRec.session.access_token}` } },
    auth: { persistSession: false }
  });
  const rec_id = authRec.user.id;

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
  function assert(name, condition, details = '') {
    total++;
    if (condition) {
      console.log(`✅ PASS: ${name} ${details ? '(' + details + ')' : ''}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${name} ${details ? '(' + details + ')' : ''}`);
    }
  }

  const COMPANY_ID = '11111111-aaaa-aaaa-aaaa-111111111111';
  const OTHER_COMPANY_ID = '22222222-bbbb-bbbb-bbbb-222222222222';
  const CANDIDATE_1_ID = '0b28a473-bcbb-4c49-b291-f9ea0daf4add';
  const JOB_ID = '44444444-4444-4444-4444-444444444444';

  // Setup company and jobs
  await runSql(`
    INSERT INTO public.jobs (id, company_id, title, status, description, created_at)
    VALUES ('${JOB_ID}', '${COMPANY_ID}', 'Cloud Architect', 'published', 'Job description', NOW())
    ON CONFLICT (id) DO UPDATE SET company_id = '${COMPANY_ID}', status = 'published';

    INSERT INTO public.job_applications (id, job_id, user_id, status, applied_at)
    VALUES ('55555555-5555-5555-5555-555555555555', '${JOB_ID}', '${CANDIDATE_1_ID}', 'applied', NOW())
    ON CONFLICT (id) DO UPDATE SET status = 'applied';
  `, 'staging');

  // Test 5.1: Active Recruiter can view applicant
  await runSql(`
    INSERT INTO public.company_team_members (company_id, user_id, role, is_active)
    VALUES ('${COMPANY_ID}', '${rec_id}', 'recruiter', true)
    ON CONFLICT (company_id, user_id) DO UPDATE SET role = 'recruiter', is_active = true, permissions = '{}'::jsonb;
  `, 'staging');
  const { data: dRec } = await clientRec.from('applicant_profiles').select('*').eq('candidate_id', CANDIDATE_1_ID).maybeSingle();
  assert('5.1 Active recruiter can view applicant in applicant_profiles', dRec !== null && dRec.candidate_id === CANDIDATE_1_ID);

  // Test 5.2: Active HR Manager can view applicant
  await runSql(`
    UPDATE public.company_team_members SET role = 'hr_manager', is_active = true WHERE company_id = '${COMPANY_ID}' AND user_id = '${rec_id}';
  `, 'staging');
  const { data: dHR } = await clientRec.from('applicant_profiles').select('*').eq('candidate_id', CANDIDATE_1_ID).maybeSingle();
  assert('5.2 Active HR manager can view applicant in applicant_profiles', dHR !== null && dHR.candidate_id === CANDIDATE_1_ID);

  // Test 5.3: Team member with manage_jobs permission can view applicant
  await runSql(`
    UPDATE public.company_team_members SET role = 'viewer', permissions = '{"manage_jobs": true}'::jsonb, is_active = true WHERE company_id = '${COMPANY_ID}' AND user_id = '${rec_id}';
  `, 'staging');
  const { data: dPerm } = await clientRec.from('applicant_profiles').select('*').eq('candidate_id', CANDIDATE_1_ID).maybeSingle();
  assert('5.3 Team member with manage_jobs permission can view applicant', dPerm !== null && dPerm.candidate_id === CANDIDATE_1_ID);

  // Test 5.4: Team member WITHOUT manage_jobs permission is BLOCKED
  await runSql(`
    UPDATE public.company_team_members SET role = 'viewer', permissions = '{"manage_jobs": false}'::jsonb, is_active = true WHERE company_id = '${COMPANY_ID}' AND user_id = '${rec_id}';
  `, 'staging');
  const { data: dNoPerm } = await clientRec.from('applicant_profiles').select('*').eq('candidate_id', CANDIDATE_1_ID).maybeSingle();
  assert('5.4 Team viewer without manage_jobs is BLOCKED (0 rows)', dNoPerm === null);

  // Test 5.5: Suspended team member (is_active = false) is BLOCKED
  await runSql(`
    UPDATE public.company_team_members SET role = 'recruiter', is_active = false WHERE company_id = '${COMPANY_ID}' AND user_id = '${rec_id}';
  `, 'staging');
  const { data: dSusp } = await clientRec.from('applicant_profiles').select('*').eq('candidate_id', CANDIDATE_1_ID).maybeSingle();
  assert('5.5 Suspended team member is BLOCKED (0 rows)', dSusp === null);

  // Test 5.6: Member of different company is BLOCKED
  await runSql(`
    UPDATE public.company_team_members SET company_id = '${OTHER_COMPANY_ID}', role = 'recruiter', is_active = true WHERE user_id = '${rec_id}';
  `, 'staging');
  const { data: dOtherCo } = await clientRec.from('applicant_profiles').select('*').eq('candidate_id', CANDIDATE_1_ID).maybeSingle();
  assert('5.6 Recruiter from different company is BLOCKED (0 rows)', dOtherCo === null);

  // Test 5.7: Candidate B querying applicant_profiles is BLOCKED
  const { data: dCandB } = await clientB.from('applicant_profiles').select('*').eq('candidate_id', CANDIDATE_1_ID).maybeSingle();
  assert('5.7 Arbitrary Candidate B is BLOCKED (0 rows)', dCandB === null);

  // Test 5.8: Caller querying arbitrary user's permission via helper is BLOCKED (Oracle protection)
  // Candidate B attempts to call can_manage_company_job passing Recruiter's ID to check if Recruiter has permissions
  const oracleCheck = await runSql(`
    DO $$
    DECLARE
      v_can boolean;
    BEGIN
      -- Set session as Candidate B
      PERFORM set_config('request.jwt.claim.sub', '${userB_id}', true);
      PERFORM set_config('request.jwt.claim.role', 'authenticated', true);
      
      -- Candidate B queries Recruiter's permissions
      SELECT public.can_manage_company_job('${COMPANY_ID}', '${rec_id}') INTO v_can;
      IF v_can IS TRUE THEN
        RAISE EXCEPTION 'Oracle vulnerability: Caller was able to inspect arbitrary user permissions!';
      END IF;
    END $$;
  `, 'staging');
  assert('5.8 Helper blocks caller from probing arbitrary users permissions', !oracleCheck.error && !oracleCheck.stderr?.includes('Oracle vulnerability'));

  // Test 5.9: Anonymous EXECUTE on can_manage_company_job is DENIED
  const anonCheck = await runSql(`
    DO $$
    BEGIN
      PERFORM set_config('role', 'anon', true);
      PERFORM public.can_manage_company_job('${COMPANY_ID}', '${rec_id}');
    END $$;
  `, 'staging');
  const anonMsg = [anonCheck.stdout, anonCheck.stderr, anonCheck.error].join(' ');
  assert('5.9 Anonymous EXECUTE on helper is DENIED (42501)', anonMsg.includes('permission denied') || anonMsg.includes('42501'));

  // Restore Recruiter membership
  await runSql(`
    UPDATE public.company_team_members SET company_id = '${COMPANY_ID}', role = 'recruiter', is_active = true WHERE user_id = '${rec_id}';
  `, 'staging');

  console.log(`\nGATE 5 RESULTS: ${passed} / ${total} TESTS PASSED.`);
}

main().catch(e => console.error(e));
