const https = require('https');

const supabaseUrl = "https://dthlgsnakhoftinssokm.supabase.co";
const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc";

const payload = JSON.stringify({
  p_session_fingerprint: 'test-fingerprint-456',
  p_target_role: 'Full Stack Developer',
  p_raw_text: 'Sample resume text for anonymous scan verification',
  p_ats_score: 82,
  p_parse_metrics: { wordCount: 420, hasEmail: true, hasPhone: true },
  p_missing_keywords: ['GraphQL', 'Next.js']
});

const req = https.request(`${supabaseUrl}/rest/v1/rpc/save_public_ats_scan`, {
  method: 'POST',
  headers: {
    'apikey': anonKey,
    'Authorization': `Bearer ${anonKey}`,
    'Content-Type': 'application/json'
  }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('RPC Status:', res.statusCode);
    console.log('Returned Scan ID:', body);
  });
});

req.on('error', err => console.error(err));
req.write(payload);
req.end();
