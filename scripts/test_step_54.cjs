const { createClient } = require('@supabase/supabase-js');
const { runSql, STAGING_REF } = require('./db-audit-helper.cjs');

const SUPABASE_URL = `https://${STAGING_REF}.supabase.co`;
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2d3d0cXV1ZXhoeXlkd2loamJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM1OTI1NzYsImV4cCI6MjEwOTE2ODU3Nn0.ZBevJqFcBzb2UAwwr_o5zgUcrrI5uf1rFgsn-cMFXnQ";

async function testStep54() {
  const anonClient = createClient(SUPABASE_URL, ANON_KEY, { auth: { persistSession: false } });
  const { data: authRec } = await anonClient.auth.signInWithPassword({
    email: 'audit_rec1@talentxcel-audit.local',
    password: 'AuditPassword123!Secure'
  });
  const clientRec = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${authRec.session.access_token}` } },
    auth: { persistSession: false }
  });
  const rec_id = authRec.user.id;
  const COMPANY_ID = '11111111-aaaa-aaaa-aaaa-111111111111';

  // Update to member without manage_jobs
  runSql(`
    UPDATE public.company_team_members 
    SET role = 'member', permissions = '{"manage_jobs": false}'::jsonb, is_active = true 
    WHERE company_id = '${COMPANY_ID}' AND user_id = '${rec_id}';
  `, 'staging');

  const ctmCheck = runSql(`
    SELECT company_id, user_id, role, permissions, is_active 
    FROM public.company_team_members 
    WHERE company_id = '${COMPANY_ID}' AND user_id = '${rec_id}';
  `, 'staging');
  console.log('CTM:', ctmCheck);

  const sqlCheck = runSql(`
    DO $$
    DECLARE
      v_res boolean;
    BEGIN
      PERFORM set_config('request.jwt.claim.sub', '${rec_id}', true);
      PERFORM set_config('request.jwt.claim.role', 'authenticated', true);
      SELECT public.can_manage_company_job('${COMPANY_ID}', '${rec_id}') INTO v_res;
      RAISE NOTICE 'can_manage_company_job: %', v_res;
    END $$;
  `, 'staging');
  console.log('sqlCheck:', sqlCheck);

  const { data, error } = await clientRec.from('applicant_profiles').select('*');
  console.log('Query result via clientRec:', data, error);
}

testStep54();
