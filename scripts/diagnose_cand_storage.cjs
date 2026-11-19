const https = require('https');
const { createClient } = require('@supabase/supabase-js');
const { STAGING_REF } = require('./db-audit-helper.cjs');

const SUPABASE_URL = `https://${STAGING_REF}.supabase.co`;
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2d3d0cXV1ZXhoeXlkd2loamJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM1OTI1NzYsImV4cCI6MjEwOTE2ODU3Nn0.ZBevJqFcBzb2UAwwr_o5zgUcrrI5uf1rFgsn-cMFXnQ";
const anonClient = createClient(SUPABASE_URL, ANON_KEY, { auth: { persistSession: false } });

async function checkCandDownload() {
  const { data: authCand } = await anonClient.auth.signInWithPassword({
    email: 'audit_cand1@talentxcel-audit.local',
    password: 'AuditPassword123!Secure'
  });
  const clientCand = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${authCand.session.access_token}` } },
    auth: { persistSession: false }
  });

  const doc1Path = '0b28a473-bcbb-4c49-b291-f9ea0daf4add/attached_application_resume.pdf';
  const res = await clientCand.storage.from('documents').download(doc1Path);
  console.log('Candidate download:', {
    hasData: !!res.data,
    size: res.data?.size,
    error: res.error
  });
  if (res.data) {
    console.log('Candidate text:', await res.data.text());
  }

  // Now do the raw HTTP GET with Candidate token
  const options = {
    hostname: `${STAGING_REF}.supabase.co`,
    port: 443,
    path: `/storage/v1/object/documents/${doc1Path}`,
    method: 'GET',
    headers: {
      'apikey': ANON_KEY,
      'Authorization': `Bearer ${authCand.session.access_token}`
    }
  };

  https.get(options, (resHttp) => {
    let data = '';
    resHttp.on('data', chunk => data += chunk);
    resHttp.on('end', () => {
      console.log('HTTP Status with Candidate token:', resHttp.statusCode);
      console.log('Response Body with Candidate token:', data);
    });
  }).on('error', err => console.error(err));
}

checkCandDownload();
