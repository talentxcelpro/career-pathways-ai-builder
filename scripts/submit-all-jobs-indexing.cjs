// scripts/submit-all-jobs-indexing.cjs
// Automated TalentXcel Google Indexing API Broadcaster for All Active Database Jobs
// Fetches 100% of live, verified jobs from Supabase and broadcasts URL_UPDATED to Google

const fs = require('fs');
const crypto = require('crypto');
const https = require('https');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://dthlgsnakhoftinssokm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const BASE_URL = 'https://talentxcel.in';

async function getAccessToken(key) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claimSet = {
    iss: key.client_email,
    scope: 'https://www.googleapis.com/auth/indexing',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };
  const base64Url = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
  const unsignedToken = `${base64Url(header)}.${base64Url(claimSet)}`;
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(unsignedToken);
  const signature = sign.sign(key.private_key, 'base64url');
  const jwt = `${unsignedToken}.${signature}`;

  return new Promise((resolve, reject) => {
    const postData = `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`;
    const req = https.request('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData),
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.access_token) resolve(parsed.access_token);
          else reject(new Error(JSON.stringify(parsed)));
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function publishUrl(url, token, type = 'URL_UPDATED') {
  return new Promise((resolve) => {
    const body = JSON.stringify({ url, type });
    const req = https.request('https://indexing.googleapis.com/v3/urlNotifications:publish', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data || '{}') });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    req.on('error', (err) => resolve({ status: 500, error: err.message }));
    req.write(body);
    req.end();
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  console.log('================================================================');
  console.log('🚀 TALENTXCEL GOOGLE INDEXING API — ACTIVE JOBS BROADCASTER');
  console.log('================================================================\n');

  // Prioritize dedicated indexing key if present, otherwise fall back to gcp-key.json
  const candidateKeys = [
    'talentxcel-indexing.json',
    'gcp-indexing-key.json',
    'indexing-key.json',
    'gcp-key.json',
    'gsc-service-account.json'
  ];
  const keyFile = candidateKeys.find(f => fs.existsSync(f)) || 'gcp-key.json';
  const key = JSON.parse(fs.readFileSync(keyFile, 'utf8'));
  console.log(`Using Key File:       ${keyFile}`);
  console.log(`Using Service Account: ${key.client_email}`);
  console.log(`GCP Project:          ${key.project_id}`);

  const token = await getAccessToken(key);
  console.log('✅ Google OAuth2 Token acquired for Indexing API!\n');

  console.log('Fetching active, open jobs from Supabase...');
  const { data: jobs, error } = await supabase
    .from('jobs')
    .select('id, title, company_name, description, posted_at, date_posted, expires_at, is_active, job_status, seo_slug')
    .eq('is_active', true)
    .eq('job_status', 'open');

  if (error || !jobs) {
    console.error('Failed to fetch jobs from Supabase:', error);
    process.exit(1);
  }

  console.log(`Retrieved ${jobs.length} candidate jobs from database.`);

  // Filter for eligibility
  const eligibleJobs = [];
  const now = new Date();

  for (const j of jobs) {
    const slug = j.seo_slug || j.id;
    const url = `${BASE_URL}/jobs/${slug}`;
    const rawDate = j.posted_at || j.date_posted;
    const hasDate = !!rawDate;
    const hasDesc = (j.description || '').length >= 30;
    const hasCo = !!(j.company_name || '').trim();
    const hasTitle = (j.title || '').length >= 3;
    const exp = j.expires_at ? new Date(j.expires_at) : null;
    const notExpired = !exp || exp > now;

    if (hasDate && hasDesc && hasCo && hasTitle && notExpired) {
      eligibleJobs.push({
        id: j.id,
        title: j.title,
        company: j.company_name,
        url,
        posted_at: rawDate,
      });
    }
  }

  console.log(`Eligible jobs for Google Indexing: ${eligibleJobs.length} / ${jobs.length}\n`);

  let successCount = 0;
  let failCount = 0;
  let quotaHit = false;

  const results = [];

  for (let i = 0; i < eligibleJobs.length; i++) {
    const job = eligibleJobs[i];
    const res = await publishUrl(job.url, token, 'URL_UPDATED');

    if (res.status === 200) {
      successCount++;
      if ((i + 1) % 10 === 0 || i === 0 || i === eligibleJobs.length - 1) {
        console.log(`[${i + 1}/${eligibleJobs.length}] ✅ 200 OK: ${job.url}`);
      }
      results.push({ url: job.url, status: 'SUCCESS' });
    } else if (res.status === 429) {
      console.warn(`[${i + 1}/${eligibleJobs.length}] ⚠️  Google Quota Limit Reached (429 Too Many Requests): ${job.url}`);
      quotaHit = true;
      results.push({ url: job.url, status: 'QUOTA_EXCEEDED' });
      break;
    } else {
      failCount++;
      console.warn(`[${i + 1}/${eligibleJobs.length}] ❌ HTTP ${res.status}: ${job.url} - ${JSON.stringify(res.data)}`);
      results.push({ url: job.url, status: `ERROR_${res.status}` });
    }

    // Gentle pacing: 100ms delay between calls
    await sleep(100);
  }

  console.log('\n================================================================');
  console.log('📊 SUBMISSION SUMMARY');
  console.log('================================================================');
  console.log(`  Total Eligible Jobs:     ${eligibleJobs.length}`);
  console.log(`  Successfully Submitted:  ${successCount}`);
  console.log(`  Failed Submissions:      ${failCount}`);
  if (quotaHit) {
    console.log(`  Quota Status:            Google Daily Quota reached at ${successCount} URLs.`);
    console.log(`                           The remaining URLs will be submitted in the next daily cycle.`);
  } else {
    console.log(`  Quota Status:            All jobs broadcast within quota!`);
  }
  console.log('================================================================\n');

  // Save log of submissions
  fs.writeFileSync('indexing_api_submission_log.json', JSON.stringify({
    timestamp: new Date().toISOString(),
    totalEligible: eligibleJobs.length,
    submitted: successCount,
    failed: failCount,
    quotaHit,
    results: results.slice(0, 100)
  }, null, 2));
}

run().catch(console.error);
