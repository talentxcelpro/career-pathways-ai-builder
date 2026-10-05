// scripts/gsc_clean_and_submit.cjs
// TalentXcel Google Search Console Sitemap Cleanup & Submission Engine
// 1. Lists all registered sitemaps in GSC.
// 2. Deletes all obsolete/phantom matrix sitemaps from GSC.
// 3. Submits the pruned master sitemap.xml and its 10 verified quality-core sub-sitemaps.

const fs = require('fs');
const crypto = require('crypto');
const https = require('https');

async function getAccessToken(key) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claimSet = {
    iss: key.client_email,
    scope: 'https://www.googleapis.com/auth/webmasters',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
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
        'Content-Length': Buffer.byteLength(postData)
      }
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

function gscRequest(endpoint, method, token, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint);
    const req = https.request(url, {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
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
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function run() {
  const key = JSON.parse(fs.readFileSync('gcp-key.json', 'utf8'));
  const token = await getAccessToken(key);
  console.log('✅ Google OAuth2 Token acquired successfully!');

  const siteUrl = encodeURIComponent('https://talentxcel.in/');

  console.log('\n--- 1. Fetching current sitemaps for https://talentxcel.in/ ---');
  const listRes = await gscRequest(`https://www.googleapis.com/webmasters/v3/sites/${siteUrl}/sitemaps`, 'GET', token);
  const sitemaps = (listRes.data && listRes.data.sitemap) || [];
  console.log(`Found ${sitemaps.length} sitemaps currently in GSC.`);

  // 10 Verified Quality Core Sitemaps
  const verifiedSitemaps = new Set([
    'https://talentxcel.in/sitemap.xml',
    'https://talentxcel.in/sitemap-base.xml',
    'https://talentxcel.in/sitemap-jobs.xml',
    'https://talentxcel.in/sitemap-colleges.xml',
    'https://talentxcel.in/sitemap-career-paths.xml',
    'https://talentxcel.in/sitemap-locations.xml',
    'https://talentxcel.in/sitemap-posts.xml',
    'https://talentxcel.in/sitemap-blog.xml',
    'https://talentxcel.in/sitemap-news.xml',
    'https://talentxcel.in/sitemap-companies.xml',
    'https://talentxcel.in/sitemap-services.xml',
    'https://talentxcel.in/sitemap-rankings.xml',
    'https://talentxcel.in/sitemap-learning.xml'
  ]);

  console.log('\n--- 2. Deleting obsolete / phantom matrix sitemaps from GSC ---');
  let deletedCount = 0;
  for (const s of sitemaps) {
    if (!verifiedSitemaps.has(s.path)) {
      console.log(`Deleting obsolete sitemap: ${s.path}...`);
      const del = await gscRequest(`https://www.googleapis.com/webmasters/v3/sites/${siteUrl}/sitemaps/${encodeURIComponent(s.path)}`, 'DELETE', token);
      console.log(`  -> Status: ${del.status} (204 = Successfully Deleted)`);
      deletedCount++;
    }
  }
  console.log(`Total obsolete sitemaps deleted: ${deletedCount}`);

  console.log('\n--- 3. Submitting Clean Master Sitemap (sitemap.xml) ---');
  const master = 'https://talentxcel.in/sitemap.xml';
  const subMaster = await gscRequest(`https://www.googleapis.com/webmasters/v3/sites/${siteUrl}/sitemaps/${encodeURIComponent(master)}`, 'PUT', token);
  console.log(`Submitted ${master}: status ${subMaster.status} (204 = SUCCESS)`);

  console.log('\n--- 4. Submitting Verified Quality Core Sub-Sitemaps ---');
  for (const c of verifiedSitemaps) {
    if (c === master) continue;
    const res = await gscRequest(`https://www.googleapis.com/webmasters/v3/sites/${siteUrl}/sitemaps/${encodeURIComponent(c)}`, 'PUT', token);
    console.log(`Submitted ${c}: status ${res.status} (204 = SUCCESS)`);
  }

  console.log('\n--- 5. Verifying active sitemap registrations in GSC ---');
  const verifyRes = await gscRequest(`https://www.googleapis.com/webmasters/v3/sites/${siteUrl}/sitemaps`, 'GET', token);
  const updatedSitemaps = (verifyRes.data && verifyRes.data.sitemap) || [];
  console.log(`Total active sitemaps now registered in GSC: ${updatedSitemaps.length}`);
  updatedSitemaps.forEach(s => console.log(`  ✓ ${s.path} (lastSubmitted: ${s.lastSubmitted})`));
}

run().catch(console.error);
