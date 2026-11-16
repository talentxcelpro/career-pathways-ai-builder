const { createClient } = require('@supabase/supabase-js');
const { runSql, STAGING_REF } = require('./db-audit-helper.cjs');

const SUPABASE_URL = `https://${STAGING_REF}.supabase.co`;
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2d3d0cXV1ZXhoeXlkd2loamJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM1OTI1NzYsImV4cCI6MjEwOTE2ODU3Nn0.ZBevJqFcBzb2UAwwr_o5zgUcrrI5uf1rFgsn-cMFXnQ";

const anonClient = createClient(SUPABASE_URL, ANON_KEY, { auth: { persistSession: false } });

async function diagnoseDownload() {
  const { data: authRec } = await anonClient.auth.signInWithPassword({
    email: 'audit_rec1@talentxcel-audit.local',
    password: 'AuditPassword123!Secure'
  });
  const clientRec = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${authRec.session.access_token}` } },
    auth: { persistSession: false }
  });

  const doc1Path = '0b28a473-bcbb-4c49-b291-f9ea0daf4add/attached_application_resume.pdf';

  console.log('Testing download as Recruiter...');
  const res = await clientRec.storage.from('documents').download(doc1Path);
  console.log('Download result:', {
    hasData: !!res.data,
    error: res.error,
    status: res.error?.status
  });
  if (res.data) {
    console.log('Text:', await res.data.text());
  }

  // Also test direct query on storage.objects via supabase client!
  const { data: objs, error: objErr } = await clientRec
    .schema('storage')
    .from('objects')
    .select('*')
    .eq('bucket_id', 'documents');
  console.log('Direct query on storage.objects:', { objs, objErr });
}

diagnoseDownload();
