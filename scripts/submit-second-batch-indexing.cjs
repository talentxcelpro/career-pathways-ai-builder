// scripts/submit-second-batch-indexing.cjs
// Dispatches batch 2 of active jobs to Google Indexing API using gsc-service-account.json

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

function publishUrl(url, token) {
  return new Promise((resolve) => {
    const body = JSON.stringify({ url, type: 'URL_UPDATED' });
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
  console.log('🚀 GOOGLE INDEXING API — BATCH 2 BROADCASTER');
  console.log('================================================================\n');

  const key = JSON.parse(fs.readFileSync('gsc-service-account.json', 'utf8'));
  console.log(`Using Service Account: ${key.client_email}`);

  const token = await getAccessToken(key);
  console.log('✅ Google OAuth2 Token acquired for Indexing API!\n');

  const { data: jobs, error } = await supabase
    .from('jobs')
    .select('id, title, company_name, description, posted_at, date_posted, expires_at, is_active, job_status, seo_slug')
    .eq('is_active', true)
    .eq('job_status', 'open');

  if (error || !jobs) {
    console.error('Failed to fetch jobs from Supabase:', error);
    process.exit(1);
  }

  const eligibleJobs = [];
  const now = new Date();

  for (const j of jobs) {
    const slug = j.seo_slug || j.id;
    const url = `${BASE_URL}/jobs/${slug}`;
    const rawDate = j.posted_at || j.date_posted;
    const exp = j.expires_at ? new Date(j.expires_at) : null;
    const notExpired = !exp || exp > now;

    if (rawDate && (j.description || '').length >= 30 && (j.company_name || '').trim() && (j.title || '').length >= 3 && notExpired) {
      eligibleJobs.push({ url });
    }
  }

  // Slice batch 2: jobs from index 211 to 411
  const batch2 = eligibleJobs.slice(211, 411);
  console.log(`Broadcasting Batch 2: ${batch2.length} jobs (from #212 to #${211 + batch2.length})...\n`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < batch2.length; i++) {
    const job = batch2[i];
    const res = await publishUrl(job.url, token);
    if (res.status === 200) {
      successCount++;
      if ((i + 1) % 15 === 0 || i === 0 || i === batch2.length - 1) {
        console.log(`[${i + 1}/${batch2.length}] ✅ 200 OK: ${job.url}`);
      }
    } else if (res.status === 429) {
      console.warn(`[${i + 1}/${batch2.length}] ⚠️  Google Quota Reached (429): ${job.url}`);
      break;
    } else {
      failCount++;
    }
    await sleep(100);
  }

  console.log('\n================================================================');
  console.log(`Batch 2 Complete: ${successCount} successfully submitted, ${failCount} failed.`);
  console.log('================================================================\n');
}

run().catch(console.error);
