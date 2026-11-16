const { createClient } = require('@supabase/supabase-js');
const { runSql, STAGING_REF } = require('./db-audit-helper.cjs');

const SUPABASE_URL = `https://${STAGING_REF}.supabase.co`;
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2d3d0cXV1ZXhoeXlkd2loamJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM1OTI1NzYsImV4cCI6MjEwOTE2ODU3Nn0.ZBevJqFcBzb2UAwwr_o5zgUcrrI5uf1rFgsn-cMFXnQ";
const anonClient = createClient(SUPABASE_URL, ANON_KEY, { auth: { persistSession: false } });

async function main() {
  const { data: authRec, error: loginErrRec } = await anonClient.auth.signInWithPassword({
    email: 'audit_rec1@talentxcel-audit.local',
    password: 'AuditPassword123!Secure'
  });
  console.log('Recruiter login:', authRec?.user?.id, loginErrRec);

  const clientRec = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${authRec.session.access_token}` } },
    auth: { persistSession: false }
  });

  const res = await clientRec.from('applicant_profiles').select('*');
  console.log('clientRec select * from applicant_profiles result:');
  console.log('Error:', res.error);
  console.log('Data:', res.data);

  // Check direct SQL as rec1
  const sqlCheck = await runSql(`
    SELECT 
      ja.id AS application_id,
      ja.job_id,
      ja.user_id AS candidate_id,
      p.full_name,
      j.posted_by,
      j.company_id
    FROM public.job_applications ja
    JOIN public.jobs j ON j.id = ja.job_id
    JOIN public.profiles p ON p.id = ja.user_id;
  `, 'staging');
  console.log('Direct SQL join check:', JSON.stringify(sqlCheck, null, 2));
}

main().catch(console.error);
