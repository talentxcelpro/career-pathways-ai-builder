const fs = require('fs');
const crypto = require('crypto');
const https = require('https');
const path = require('path');

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

function queryGsc(siteUrl, token, body) {
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

async function extractGscSignals(siteUrl = 'https://talentxcel.in/') {
  console.log('[Step 1] Extracting Live GSC Demand Signals...');
  const keyPath = path.join(__dirname, '..', '..', '..', 'gsc-service-account.json');
  const key = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
  const token = await getAccessToken(key);

  const now = new Date();
  const getIsoDate = (d) => d.toISOString().split('T')[0];

  // 3-day data lag in GSC
  const end = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const start7d = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
  const start28d = new Date(end.getTime() - 28 * 24 * 60 * 60 * 1000);

  const endDate = getIsoDate(end);
  const startDate7d = getIsoDate(start7d);
  const startDate28d = getIsoDate(start28d);

  // 1. Fetch 7-day queries
  const q7dRes = await queryGsc(siteUrl, token, {
    startDate: startDate7d,
    endDate,
    dimensions: ['query'],
    rowLimit: 5000
  });

  // 2. Fetch 28-day queries
  const q28dRes = await queryGsc(siteUrl, token, {
    startDate: startDate28d,
    endDate,
    dimensions: ['query'],
    rowLimit: 5000
  });

  // 3. Fetch countries (28 days)
  const countriesRes = await queryGsc(siteUrl, token, {
    startDate: startDate28d,
    endDate,
    dimensions: ['country'],
    rowLimit: 100
  });

  // 4. Fetch query-page pairs (28 days)
  const qpRes = await queryGsc(siteUrl, token, {
    startDate: startDate28d,
    endDate,
    dimensions: ['query', 'page'],
    rowLimit: 5000
  });

  const queries7d = q7dRes.data?.rows || [];
  const queries28d = q28dRes.data?.rows || [];
  const countries = countriesRes.data?.rows || [];
  const queryPages = qpRes.data?.rows || [];

  console.log(`   ✓ Retrieved ${queries7d.length} queries (7d), ${queries28d.length} queries (28d), ${countries.length} countries, ${queryPages.length} query-page pairs.`);

  return {
    timeRange: { startDate7d, startDate28d, endDate },
    queries7d: queries7d.map(r => ({ query: r.keys[0], clicks: r.clicks, impressions: r.impressions, ctr: r.ctr, position: r.position })),
    queries28d: queries28d.map(r => ({ query: r.keys[0], clicks: r.clicks, impressions: r.impressions, ctr: r.ctr, position: r.position })),
    countries: countries.map(r => ({ country: r.keys[0], clicks: r.clicks, impressions: r.impressions, ctr: r.ctr, position: r.position })),
    queryPages: queryPages.map(r => ({ query: r.keys[0], page: r.keys[1], clicks: r.clicks, impressions: r.impressions, ctr: r.ctr, position: r.position }))
  };
}

module.exports = { extractGscSignals };
