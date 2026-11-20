// scripts/index-high-priority-plg.cjs
// Ping Google Indexing API for top PLG entry points

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const candidateKeys = [
  path.resolve('talentxcel-indexing.json'),
  path.resolve('gcp-key.json'),
  path.resolve('gsc-service-account.json'),
];

const keyPath = candidateKeys.find(p => fs.existsSync(p));
if (!keyPath) {
  console.error('❌ Google service account key not found.');
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf-8'));
console.log(`✓ Loaded GCP IAM Key: ${serviceAccount.client_email}`);

async function getAccessToken() {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claimSet = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/indexing',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  const b64 = obj => Buffer.from(JSON.stringify(obj)).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const encodedHeader = b64(header);
  const encodedClaim = b64(claimSet);
  const signatureInput = `${encodedHeader}.${encodedClaim}`;

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(signatureInput);
  signer.end();
  const signature = signer.sign(serviceAccount.private_key, 'base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const jwt = `${signatureInput}.${signature}`;

  const resp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  if (!resp.ok) {
    throw new Error(`Token exchange failed: ${await resp.text()}`);
  }
  const data = await resp.json();
  return data.access_token;
}

async function publishUrl(url, token) {
  const resp = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ url, type: 'URL_UPDATED' }),
  });
  const data = await resp.json();
  if (!resp.ok) {
    throw new Error(data.error?.message || `HTTP ${resp.status}`);
  }
  return data;
}

const PLG_URLS = [
  'https://talentxcel.in/resume/ats-check',
  'https://talentxcel.in/resume/build',
  'https://talentxcel.in/career-map',
  'https://talentxcel.in/jobs',
  'https://talentxcel.in/jobs/freshers',
  'https://talentxcel.in/colleges',
  'https://talentxcel.in/companies',
  'https://talentxcel.in/ats-check',
  'https://talentxcel.in/resume-builder',
  'https://talentxcel.in/network',
  'https://talentxcel.in/passport',
  'https://talentxcel.in/salary',
  'https://talentxcel.in/salary/scenarios',
  'https://talentxcel.in/salary/software-engineer-in-bangalore',
  'https://talentxcel.in/u/arshidwani',
  'https://talentxcel.in/verify/arshidwani'
];

async function main() {
  console.log('🚀 Pinging Google Indexing API for High-Priority PLG Entrypoints...\n');
  const token = await getAccessToken();
  console.log('🔑 Bearer token acquired. Submitting URLs:\n');

  for (const url of PLG_URLS) {
    try {
      const res = await publishUrl(url, token);
      console.log(`✅ [SUBMITTED] ${url} -> notifyTime: ${res.urlNotificationMetadata?.latestUpdate?.notifyTime || 'OK'}`);
    } catch (err) {
      console.warn(`⚠️ [NOTICE] ${url} -> ${err.message}`);
    }
  }

  console.log('\n🏁 High-Priority PLG Indexing Dispatch Complete!');
}

main().catch(err => {
  console.error('Fatal indexing error:', err);
  process.exit(1);
});
