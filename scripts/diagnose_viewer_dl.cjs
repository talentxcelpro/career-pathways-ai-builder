const { createClient } = require('@supabase/supabase-js');
const { runSql, STAGING_REF } = require('./db-audit-helper.cjs');

const SUPABASE_URL = `https://${STAGING_REF}.supabase.co`;
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2d3d0cXV1ZXhoeXlkd2loamJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM1OTI1NzYsImV4cCI6MjEwOTE2ODU3Nn0.ZBevJqFcBzb2UAwwr_o5zgUcrrI5uf1rFgsn-cMFXnQ";
const anonClient = createClient(SUPABASE_URL, ANON_KEY, { auth: { persistSession: false } });

async function checkWhy() {
  const rec_id = 'd5336939-770b-442b-88d0-a6edd6850657';
  const TEAM_MEMBER_ID = '11111111-cccc-cccc-cccc-111111111111';
  const REAL_COMPANY_ID = '11111111-aaaa-aaaa-aaaa-111111111111';
  const doc1Path = '0b28a473-bcbb-4c49-b291-f9ea0daf4add/attached_application_resume.pdf';

  console.log('1. Setting team member to viewer...');
  runSql(`
    UPDATE public.company_team_members 
    SET role = 'viewer', is_active = true, permissions = '{"manage_jobs": false}'::jsonb, company_id = '${REAL_COMPANY_ID}'
    WHERE id = '${TEAM_MEMBER_ID}';
  `, 'staging');

  console.log('2. Querying can_employer_access_document via SQL with rec_id...');
  const checkSql = runSql(`
    CREATE OR REPLACE FUNCTION public.check_access(p_doc text, p_owner uuid, p_rec uuid)
    RETURNS boolean
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = ''
    AS $$
    BEGIN
      PERFORM set_config('request.jwt.claim.sub', p_rec::text, true);
      PERFORM set_config('request.jwt.claim.role', 'authenticated', true);
      RETURN public.can_employer_access_document(p_doc, p_owner, auth.uid());
    END;
    $$;

    SELECT public.check_access('${doc1Path}', '0b28a473-bcbb-4c49-b291-f9ea0daf4add'::uuid, '${rec_id}'::uuid);
    DROP FUNCTION public.check_access(text, uuid, uuid);
  `, 'staging');
  console.log('SQL check_access result:', checkSql);

  console.log('3. Attempting download via clientRec...');
  const { data: authRec } = await anonClient.auth.signInWithPassword({
    email: 'audit_rec1@talentxcel-audit.local',
    password: 'AuditPassword123!Secure'
  });
  const clientRec = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${authRec.session.access_token}` } },
    auth: { persistSession: false }
  });

  const dl = await clientRec.storage.from('documents').download(doc1Path);
  console.log('Download hasData:', !!dl.data, 'error:', dl.error);
}

checkWhy();
