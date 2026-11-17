const https = require('https');
const { createClient } = require('@supabase/supabase-js');
const { runSql, STAGING_REF } = require('./db-audit-helper.cjs');

const SUPABASE_URL = `https://${STAGING_REF}.supabase.co`;
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2d3d0cXV1ZXhoeXlkd2loamJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM1OTI1NzYsImV4cCI6MjEwOTE2ODU3Nn0.ZBevJqFcBzb2UAwwr_o5zgUcrrI5uf1rFgsn-cMFXnQ";
const anonClient = createClient(SUPABASE_URL, ANON_KEY, { auth: { persistSession: false } });

async function checkQueryParam() {
  const { data: authRec } = await anonClient.auth.signInWithPassword({
    email: 'audit_rec1@talentxcel-audit.local',
    password: 'AuditPassword123!Secure'
  });

  const path = `/storage/v1/object/authenticated/documents/0b28a473-bcbb-4c49-b291-f9ea0daf4add/attached_application_resume.pdf?nocache=${Date.now()}`;

  const res = await new Promise((resolve) => {
    https.get({
      hostname: `${STAGING_REF}.supabase.co`,
      port: 443,
      path: path,
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${authRec.session.access_token}`
      }
    }, (res) => {
      let b = '';
      res.on('data', chunk => b += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: b }));
    });
  });
  console.log('Request with nocache query param:', res.status, res.headers['cf-cache-status'], res.body);
}

checkQueryParam();
