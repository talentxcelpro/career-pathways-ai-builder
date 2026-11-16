const { createClient } = require('@supabase/supabase-js');
const { runSql, STAGING_REF } = require('./db-audit-helper.cjs');

const SUPABASE_URL = `https://${STAGING_REF}.supabase.co`;
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2d3d0cXV1ZXhoeXlkd2loamJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM1OTI1NzYsImV4cCI6MjEwOTE2ODU3Nn0.ZBevJqFcBzb2UAwwr_o5zgUcrrI5uf1rFgsn-cMFXnQ";

async function main() {
  const anon = createClient(SUPABASE_URL, ANON_KEY);
  const { data: rAuth } = await anon.auth.signInWithPassword({
    email: 'audit_rec1@talentxcel-audit.local',
    password: 'AuditPassword123!Secure'
  });
  const recClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${rAuth.session.access_token}` } }
  });

  const candA_id = '0b28a473-bcbb-4c49-b291-f9ea0daf4add';
  const key = `${candA_id}/audit_resume_doc1.pdf`;
  const { data, error } = await recClient.storage.from('documents').download(key);
  console.log('Download result:');
  console.log('error:', error);
  console.log('data:', data ? 'Blob received' : null);
}

main().catch(console.error);
