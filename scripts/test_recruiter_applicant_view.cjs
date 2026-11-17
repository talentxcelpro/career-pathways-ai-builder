const { createClient } = require('@supabase/supabase-js');
const { runSql, STAGING_REF } = require('./db-audit-helper.cjs');

const SUPABASE_URL = `https://${STAGING_REF}.supabase.co`;
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2d3d0cXV1ZXhoeXlkd2loamJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM1OTI1NzYsImV4cCI6MjEwOTE2ODU3Nn0.ZBevJqFcBzb2UAwwr_o5zgUcrrI5uf1rFgsn-cMFXnQ";
const anonClient = createClient(SUPABASE_URL, ANON_KEY, { auth: { persistSession: false } });

async function main() {
  const TEST_COMPANY_ID = 'e0000000-0000-0000-0000-000000000001';
  const TEST_JOB_ID = 'f0000000-0000-0000-0000-000000000001';
  const TEST_APP_ID = 'a0000000-0000-0000-0000-000000000001';
  const userA_id = '0b28a473-bcbb-4c49-b291-f9ea0daf4add';
  const rec_id = 'd5336939-770b-442b-88d0-a6edd6850657';

  await runSql(`
    INSERT INTO public.companies (id, name) VALUES ('${TEST_COMPANY_ID}', 'Audit Corp')
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.jobs (id, company_id, posted_by, title, is_active)
    VALUES ('${TEST_JOB_ID}', '${TEST_COMPANY_ID}', '${rec_id}', 'Principal Security Engineer', true)
    ON CONFLICT (id) DO UPDATE SET company_id = '${TEST_COMPANY_ID}', posted_by = '${rec_id}';

    INSERT INTO public.job_applications (id, job_id, user_id, status)
    VALUES ('${TEST_APP_ID}', '${TEST_JOB_ID}', '${userA_id}', 'submitted')
    ON CONFLICT (id) DO UPDATE SET status = 'submitted';

    INSERT INTO public.company_team_members (id, company_id, user_id, role, is_active)
    VALUES ('d0000000-0000-0000-0000-000000000001', '${TEST_COMPANY_ID}', '${rec_id}', 'recruiter', true)
    ON CONFLICT (id) DO UPDATE SET role = 'recruiter', is_active = true, company_id = '${TEST_COMPANY_ID}';
  `, 'staging');

  const { data: authRec } = await anonClient.auth.signInWithPassword({
    email: 'audit_rec1@talentxcel-audit.local',
    password: 'AuditPassword123!Secure'
  });
  const clientRec = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${authRec.session.access_token}` } },
    auth: { persistSession: false }
  });

  const res = await clientRec
    .from('applicant_profiles')
    .select('*')
    .eq('application_id', TEST_APP_ID);
  console.log('clientRec applicant_profiles query:', res);
}

main().catch(console.error);
