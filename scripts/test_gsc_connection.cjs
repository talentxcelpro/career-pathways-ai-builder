const fs = require('fs');
const crypto = require('crypto');
const https = require('https');

async function getAccessToken(key, scope = 'https://www.googleapis.com/auth/webmasters https://www.googleapis.com/auth/webmasters.readonly https://www.googleapis.com/auth/indexing') {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claimSet = {
    iss: key.client_email,
    scope,
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
  console.log('================================================================');
  console.log('🔍 GOOGLE SEARCH CONSOLE & INDEXING API PERMISSION AUDIT');
  console.log('================================================================\n');

  const keyFiles = [
    'talentxcel-indexing.json',
    'gcp-indexing-key.json',
    'gcp-key.json',
    'gsc-service-account.json'
  ].filter(f => fs.existsSync(f));

  if (keyFiles.length === 0) {
    console.error('❌ No service account key files found on disk.');
    return;
  }

  for (const keyFile of keyFiles) {
    try {
      const key = JSON.parse(fs.readFileSync(keyFile, 'utf8'));
      console.log(`--- Auditing Key File: ${keyFile} ---`);
      console.log(`Service Account: ${key.client_email}`);
      console.log(`GCP Project ID:  ${key.project_id}`);

      const token = await getAccessToken(key);
      console.log('✅ Google OAuth2 Token acquired successfully!');

      // 1. Check verified sites
      const sitesRes = await gscRequest('https://www.googleapis.com/webmasters/v3/sites', 'GET', token);
      console.log('\nVerified GSC Properties:');
      if (sitesRes.data && sitesRes.data.siteEntry) {
        sitesRes.data.siteEntry.forEach(s => {
          console.log(`  - ${s.siteUrl} (${s.permissionLevel})`);
        });
      } else {
        console.log('  No verified site entries found or empty response:', JSON.stringify(sitesRes.data));
      }

      // 2. Test domain property sc-domain:talentxcel.in
      const domainUrl = encodeURIComponent('sc-domain:talentxcel.in');
      const domainRes = await gscRequest(`https://www.googleapis.com/webmasters/v3/sites/${domainUrl}`, 'GET', token);
      if (domainRes.status === 200) {
        console.log('\n✅ sc-domain:talentxcel.in Access: GRANTED (Owner/Full)');
      } else {
        console.log(`\n⚠️  sc-domain:talentxcel.in Access: HTTP ${domainRes.status} (${domainRes.data?.error?.message || 'Permission Denied'})`);
      }

      // 3. Test URL-prefix property https://talentxcel.in/
      const prefixUrl = encodeURIComponent('https://talentxcel.in/');
      const prefixRes = await gscRequest(`https://www.googleapis.com/webmasters/v3/sites/${prefixUrl}`, 'GET', token);
      if (prefixRes.status === 200) {
        console.log('✅ https://talentxcel.in/ Access: GRANTED (Owner/Full)');
      } else {
        console.log(`⚠️  https://talentxcel.in/ Access: HTTP ${prefixRes.status} (${prefixRes.data?.error?.message || 'Permission Denied'})`);
      }

      console.log('----------------------------------------------------------------\n');
    } catch (err) {
      console.error(`Error auditing ${keyFile}:`, err.message);
    }
  }
}

run();
