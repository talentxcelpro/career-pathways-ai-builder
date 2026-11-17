const https = require('https');
const { runSql } = require('./db-audit-helper.cjs');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const req = https.request({
      hostname: parsed.hostname,
      port: 443,
      path: parsed.pathname + parsed.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        'Accept': 'text/html,application/xhtml+xml'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({
        status: res.statusCode,
        headers: res.headers,
        body: data
      }));
    });
    req.on('error', reject);
    req.end();
  });
}

async function runGate2() {
  console.log('========================================================================');
  console.log('TALENTXCEL GATE 2 — PUBLIC PROFILE ACCESS VERIFICATION');
  console.log('Target: Production (dthlgsnakhoftinssokm) | Origin: https://talentxcel.in');
  console.log('========================================================================\n');

  // 1. Column Sanitization Check
  console.log('--- 1. View Schema Sanitization Check ---');
  const viewCols = await runSql(`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'public_profiles'
    ORDER BY ordinal_position;
  `, 'production');

  const piiBlacklist = [
    'email', 'phone', 'phone_number', 'phone_hash', 'resume_url', 'salary', 
    'salary_expected', 'compensation', 'date_of_birth', 'address', 'tax_id', 
    'ssn', 'emergency_contact', 'id_proof_url', 'national_id'
  ];

  const colNames = viewCols.map(c => c.column_name);
  const foundPii = piiBlacklist.filter(c => colNames.includes(c));
  console.log('Exposed View Columns (' + colNames.length + '):', colNames.join(', '));
  console.log('PII Columns Found:', foundPii.length === 0 ? 'NONE (PASSED)' : foundPii.join(', '));

  // 2. Direct database query checks for consent states
  console.log('\n--- 2. Database View Visibility Rules ---');
  const ruleCheck = await runSql(`
    SELECT
      -- Consented & Public
      (
        SELECT count(*)
        FROM public.public_profiles pp
        JOIN public.candidate_privacy_consents c ON c.user_id = pp.id AND c.consent_type = 'public_profile_indexing'
        WHERE c.consent_status = 'granted' AND c.revocation_timestamp IS NULL
      ) as consented_count,

      -- Revoked status
      (
        SELECT count(*)
        FROM public.public_profiles pp
        JOIN public.candidate_privacy_consents c ON c.user_id = pp.id AND c.consent_type = 'public_profile_indexing'
        WHERE c.consent_status = 'revoked' OR c.revocation_timestamp IS NOT NULL
      ) as revoked_count,

      -- Non-public visibility
      (
        SELECT count(*)
        FROM public.public_profiles pp
        JOIN public.profiles p ON p.id = pp.id
        WHERE p.profile_visibility != 'public' OR p.is_profile_public = false
      ) as private_count;
  `, 'production');

  console.log('Rule evaluation in public_profiles:');
  console.log('  Consented candidates visible:', ruleCheck[0].consented_count);
  console.log('  Revoked candidates visible (must be 0):', ruleCheck[0].revoked_count);
  console.log('  Private candidates visible (must be 0):', ruleCheck[0].private_count);

  // 3. HTTP Rendering on live production origin
  console.log('\n--- 3. Live Production HTTP Edge Rendering ---');
  
  // Test 3A: Consented candidate discoverability
  const testUsername = 'candidatetest1790836546334476';
  const urlConsented = `https://talentxcel.in/p/${testUsername}`;
  console.log(`Testing consented profile route: ${urlConsented}`);
  try {
    const resConsented = await fetchUrl(urlConsented);
    console.log(`  HTTP Status: ${resConsented.status}`);
    console.log(`  Cache-Control: ${resConsented.headers['cache-control'] || 'none'}`);
    console.log(`  X-Robots-Tag: ${resConsented.headers['x-robots-tag'] || 'none'}`);
    console.log(`  Has Candidate Data: ${resConsented.body.includes(testUsername)}`);
  } catch (e) {
    console.error('  Fetch failed:', e.message);
  }

  // Test 3B: Non-existent / private candidate route
  const fakeId = '00000000-0000-0000-0000-000000000000';
  const urlPrivate = `https://talentxcel.in/p/${fakeId}`;
  console.log(`\nTesting non-existent/private profile route: ${urlPrivate}`);
  try {
    const resPrivate = await fetchUrl(urlPrivate);
    console.log(`  HTTP Status: ${resPrivate.status}`);
    console.log(`  Cache-Control: ${resPrivate.headers['cache-control'] || 'none'}`);
    console.log(`  X-Robots-Tag: ${resPrivate.headers['x-robots-tag'] || 'none'}`);
    console.log(`  Has Profile Unavailable: ${resPrivate.body.includes('Profile Unavailable') || resPrivate.status === 404}`);
  } catch (e) {
    console.error('  Fetch failed:', e.message);
  }

  // Test 3C: Alternate API routes / direct table endpoints
  console.log('\n--- 4. Alternate API Routes Verification ---');
  const restUrl = `https://dthlgsnakhoftinssokm.supabase.co/rest/v1/profiles?select=id,full_name,email&limit=1`;
  const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc';
  try {
    const restRes = await new Promise((resolve, reject) => {
      const parsed = new URL(restUrl);
      const req = https.request({
        hostname: parsed.hostname,
        port: 443,
        path: parsed.pathname + parsed.search,
        method: 'GET',
        headers: {
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`
        }
      }, (res) => {
        let body = '';
        res.on('data', d => body += d);
        res.on('end', () => resolve({ status: res.statusCode, body }));
      });
      req.on('error', reject);
      req.end();
    });

    console.log(`Direct REST API anon query on /rest/v1/profiles:`);
    console.log(`  HTTP Status: ${restRes.status}`);
    console.log(`  Response: ${restRes.body}`);
  } catch (e) {
    console.error('REST query failed:', e.message);
  }
}

runGate2().catch(err => {
  console.error('Gate 2 error:', err);
  process.exit(1);
});
