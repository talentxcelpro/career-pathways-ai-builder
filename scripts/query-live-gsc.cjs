const fs = require('fs');
const crypto = require('crypto');
const https = require('https');

async function getAccessToken(key) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claimSet = {
    iss: key.client_email,
    scope: 'https://www.googleapis.com/auth/webmasters.readonly',
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
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function querySearchAnalytics(siteUrl, token, body) {
  return new Promise((resolve, reject) => {
    const endpoint = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`;
    const req = https.request(endpoint, {
      method: 'POST',
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
    req.write(JSON.stringify(body));
    req.end();
  });
}

async function main() {
  const key = JSON.parse(fs.readFileSync('gsc-service-account.json', 'utf8'));
  const token = await getAccessToken(key);
  console.log('OAuth token acquired.');

  const siteUrl = 'https://talentxcel.in/';

  // Query 1: Totals for last 90 days (2026-08-25 to 2026-11-22)
  const endDate = '2026-11-22'; // GSC data has 2-3 day lag
  const startDate = '2026-08-25'; // 90 days

  console.log(`Querying GSC totals for ${siteUrl} from ${startDate} to ${endDate}...`);
  const totals = await querySearchAnalytics(siteUrl, token, {
    startDate,
    endDate,
    aggregationType: 'byProperty'
  });
  console.log('Totals:', totals.data);

  // Query 2: Top 25 Queries
  console.log('\nQuerying Top 25 Queries...');
  const topQueries = await querySearchAnalytics(siteUrl, token, {
    startDate,
    endDate,
    dimensions: ['query'],
    rowLimit: 25
  });
  console.log(`Top queries count: ${topQueries.data.rows?.length}`);
  topQueries.data.rows?.slice(0, 10).forEach(r => console.log(`  - "${r.keys[0]}": ${r.clicks} clicks, ${r.impressions} imp, pos ${r.position.toFixed(1)}`));

  // Query 3: Top Countries
  console.log('\nQuerying Top Countries...');
  const countries = await querySearchAnalytics(siteUrl, token, {
    startDate,
    endDate,
    dimensions: ['country'],
    rowLimit: 25
  });
  console.log(`Countries count: ${countries.data.rows?.length}`);
  countries.data.rows?.slice(0, 10).forEach(r => console.log(`  - ${r.keys[0]}: ${r.clicks} clicks, ${r.impressions} imp, pos ${r.position.toFixed(1)}`));

  // Query 4: Devices
  console.log('\nQuerying Devices...');
  const devices = await querySearchAnalytics(siteUrl, token, {
    startDate,
    endDate,
    dimensions: ['device']
  });
  devices.data.rows?.forEach(r => console.log(`  - ${r.keys[0]}: ${r.clicks} clicks, ${r.impressions} imp, pos ${r.position.toFixed(1)}`));
}

main().catch(console.error);
