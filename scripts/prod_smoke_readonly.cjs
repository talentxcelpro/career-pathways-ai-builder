const https = require('https');

const PROD_URL = "https://dthlgsnakhoftinssokm.supabase.co";
const PROD_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc";

function httpGet(path) {
  return new Promise((resolve, reject) => {
    const url = new URL(PROD_URL + path);
    const options = {
      method: 'GET',
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      headers: {
        'apikey': PROD_ANON_KEY,
        'Authorization': 'Bearer ' + PROD_ANON_KEY,
        'Prefer': 'count=exact'
      }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let parsed;
        try {
          parsed = JSON.parse(data);
        } catch {
          parsed = data;
        }
        resolve({
          status: res.statusCode,
          contentRange: res.headers['content-range'] || null,
          count: Array.isArray(parsed) ? parsed.length : 0,
          body: parsed
        });
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function runProdSmoke() {
  console.log('========================================================================');
  console.log('TALENTXCEL PRODUCTION READ-ONLY SMOKE AUDIT');
  console.log('Target: ' + PROD_URL + ' (STRICTLY READ-ONLY GET REQUESTS ONLY)');
  console.log('========================================================================\n');

  const tests = [
    { name: 'Public Feed Readability', path: '/rest/v1/posts?select=id,status,visibility&limit=5' },
    { name: 'Anon Draft Invisibility', path: '/rest/v1/posts?select=id&status=eq.draft' },
    { name: 'Anon Soft-Deleted Invisibility', path: '/rest/v1/posts?select=id&is_deleted=eq.true' },
    { name: 'Anon Private Visibility Invisibility', path: '/rest/v1/posts?select=id&visibility=eq.private' },
    { name: 'Anon Connections-Only Invisibility', path: '/rest/v1/posts?select=id&visibility=eq.connections' },
    { name: 'Profiles PII Exposure Check', path: '/rest/v1/profiles?select=id,email,phone&limit=3' }
  ];

  for (const t of tests) {
    const res = await httpGet(t.path);
    let note = '';
    if (t.name === 'Profiles PII Exposure Check') {
      const hasEmails = Array.isArray(res.body) && res.body.some(p => !!p.email);
      note = hasEmails ? 'CRITICAL EXPOSURE DETECTED (Active PII leak on production)' : 'Secure (No PII returned)';
    } else {
      note = res.contentRange ? `Content-Range: ${res.contentRange}` : `${res.count} rows`;
    }
    console.log(`[HTTP ${res.status}] ${t.name}: ${note}`);
  }

  console.log('\nProduction smoke audit complete. Zero write mutations performed.');
}

runProdSmoke().catch(console.error);
