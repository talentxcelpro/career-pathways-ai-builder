const fs = require('fs');
const crypto = require('crypto');
const https = require('https');

async function getAccessToken(key) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claimSet = {
    iss: key.client_email,
    scope: 'https://www.googleapis.com/auth/webmasters https://www.googleapis.com/auth/webmasters.readonly',
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
          resolve(parsed.access_token);
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

async function run() {
  const key = JSON.parse(fs.readFileSync('gsc-service-account.json', 'utf8'));
  const token = await getAccessToken(key);
  const siteUrl = 'https://talentxcel.in/';

  const endDt = new Date();
  endDt.setDate(endDt.getDate() - 2);
  const endDate = endDt.toISOString().slice(0, 10);
  const startDt = new Date(endDt);
  startDt.setDate(startDt.getDate() - 28);
  const startDate = startDt.toISOString().slice(0, 10);

  const endpoint = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`;
  const body = JSON.stringify({
    startDate,
    endDate,
    dimensions: ['query', 'page'],
    rowLimit: 250
  });

  const req = https.request(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body)
    }
  }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const parsed = JSON.parse(data);
        fs.writeFileSync('gsc_query_page_pairs.json', JSON.stringify(parsed, null, 2));
        console.log(`Successfully fetched ${(parsed.rows || []).length} query-page pairs!`);
      } catch (err) {
        console.error('Failed to parse:', err);
      }
    });
  });
  req.on('error', console.error);
  req.write(body);
  req.end();
}

run();
