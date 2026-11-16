const https = require('https');

const STAGING_URL = "https://pvwwtquuexhyydwihjbi.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2d3d0cXV1ZXhoeXlkd2loamJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM1OTI1NzYsImV4cCI6MjEwOTE2ODU3Nn0.ZBevJqFcBzb2UAwwr_o5zgUcrrI5uf1rFgsn-cMFXnQ";

function httpReq(method, path, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(STAGING_URL + path);
    const options = {
      method,
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      headers
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let parsed;
        try { parsed = JSON.parse(data); } catch { parsed = data; }
        resolve({
          status: res.statusCode,
          statusMessage: res.statusMessage,
          headers: res.headers,
          body: parsed
        });
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function runGate4Tests() {
  console.log('=== GATE 4: ANONYMOUS ACCESS TEST ACCURACY ON STAGING ===\n');

  // Test 1: Anonymous request with anon apikey (standard unauthenticated user in browser)
  console.log('--- Test 1.1: GET /candidate_privacy_consents (with anon apikey) ---');
  const res1_1 = await httpReq('GET', '/rest/v1/candidate_privacy_consents?select=*', {
    'apikey': ANON_KEY
  });
  console.log('HTTP Status:', res1_1.status, res1_1.statusMessage);
  console.log('Response Body:', JSON.stringify(res1_1.body, null, 2));

  console.log('\n--- Test 1.2: GET /candidate_consent_events (with anon apikey) ---');
  const res1_2 = await httpReq('GET', '/rest/v1/candidate_consent_events?select=*', {
    'apikey': ANON_KEY
  });
  console.log('HTTP Status:', res1_2.status, res1_2.statusMessage);
  console.log('Response Body:', JSON.stringify(res1_2.body, null, 2));

  // Test 2: Completely naked anonymous request (NO apikey, NO auth header)
  console.log('\n--- Test 2.1: GET /candidate_privacy_consents (NO apikey, NO auth) ---');
  const res2_1 = await httpReq('GET', '/rest/v1/candidate_privacy_consents?select=*');
  console.log('HTTP Status:', res2_1.status, res2_1.statusMessage);
  console.log('Response Body:', JSON.stringify(res2_1.body, null, 2));

  console.log('\n--- Test 2.2: GET /candidate_consent_events (NO apikey, NO auth) ---');
  const res2_2 = await httpReq('GET', '/rest/v1/candidate_consent_events?select=*');
  console.log('HTTP Status:', res2_2.status, res2_2.statusMessage);
  console.log('Response Body:', JSON.stringify(res2_2.body, null, 2));

  // Test 3: Anonymous call to RPC /rest/v1/rpc/set_public_profile_consent (with anon apikey)
  console.log('\n--- Test 3.1: POST /rpc/set_public_profile_consent (with anon apikey) ---');
  const res3_1 = await new Promise((resolve, reject) => {
    const url = new URL(STAGING_URL + '/rest/v1/rpc/set_public_profile_consent');
    const req = https.request({
      method: 'POST',
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      headers: {
        'apikey': ANON_KEY,
        'Content-Type': 'application/json'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let parsed;
        try { parsed = JSON.parse(data); } catch { parsed = data; }
        resolve({ status: res.statusCode, body: parsed });
      });
    });
    req.on('error', reject);
    req.write(JSON.stringify({ p_granted: true, p_visibility: 'public' }));
    req.end();
  });
  console.log('HTTP Status:', res3_1.status);
  console.log('Response Body:', JSON.stringify(res3_1.body, null, 2));

  // Test 4: Anonymous GET /rest/v1/public_profiles (sanitized public view)
  console.log('\n--- Test 4.1: GET /public_profiles?select=* (with anon apikey) ---');
  const res4_1 = await httpReq('GET', '/rest/v1/public_profiles?select=*', {
    'apikey': ANON_KEY
  });
  console.log('HTTP Status:', res4_1.status);
  console.log('Rows count:', Array.isArray(res4_1.body) ? res4_1.body.length : res4_1.body);
  if (Array.isArray(res4_1.body) && res4_1.body.length > 0) {
    console.log('First row columns exposed:', Object.keys(res4_1.body[0]));
  }
}

runGate4Tests().catch(err => {
  console.error('Error in Gate 4 tests:', err);
  process.exit(1);
});
