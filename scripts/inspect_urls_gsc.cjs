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

function inspectUrl(inspectionUrl, siteUrl, token) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ inspectionUrl, siteUrl });
    const req = https.request('https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', {
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
          resolve({ status: res.statusCode, data: JSON.parse(data || '{}') });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function run() {
  const key = JSON.parse(fs.readFileSync('gcp-key.json', 'utf8'));
  const token = await getAccessToken(key);
  const siteUrl = 'https://talentxcel.in/';

  const sampleUrls = [
    'https://talentxcel.in/',
    'https://talentxcel.in/jobs',
    'https://talentxcel.in/jobs/marketing-manager-chatr-charchat-talentxcel-services-noida-uttar-pradesh-india-1',
    'https://talentxcel.in/colleges',
    'https://talentxcel.in/resume'
  ];

  console.log('Inspecting sample URLs via Google Search Console URL Inspection API...\n');
  for (const url of sampleUrls) {
    const res = await inspectUrl(url, siteUrl, token);
    const result = res.data && res.data.inspectionResult;
    const indexStatus = result && result.indexStatusResult;
    console.log(`URL: ${url}`);
    console.log(`  HTTP status: ${res.status}`);
    if (indexStatus) {
      console.log(`  verdict: ${indexStatus.verdict}`);
      console.log(`  coverageState: ${indexStatus.coverageState}`);
      console.log(`  crawledAs: ${indexStatus.crawledAs}`);
      console.log(`  googleCanonical: ${indexStatus.googleCanonical}`);
      console.log(`  userCanonical: ${indexStatus.userCanonical}`);
      console.log(`  lastCrawlTime: ${indexStatus.lastCrawlTime}`);
    } else {
      console.log(`  response:`, JSON.stringify(res.data));
    }
    console.log('');
  }
}

run().catch(console.error);
