const fs = require('fs');
const crypto = require('crypto');
const https = require('https');

async function testPublish() {
  const candidateKeys = [
    'talentxcel-indexing.json',
    'gcp-indexing-key.json',
    'indexing-key.json',
    'gcp-key.json',
    'gsc-service-account.json'
  ];
  const keyFile = candidateKeys.find(f => fs.existsSync(f)) || 'talentxcel-indexing.json';
  const key = JSON.parse(fs.readFileSync(keyFile, 'utf8'));
  console.log('Testing Key:', keyFile, '| Email:', key.client_email);

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

  const postData = `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`;
  const token = await new Promise((resolve, reject) => {
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
        const parsed = JSON.parse(data);
        if (parsed.access_token) resolve(parsed.access_token);
        else reject(new Error(data));
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });

  const testUrl = 'https://talentxcel.in/jobs/software-engineer';
  console.log('Attempting to publish URL:', testUrl);

  const publishRes = await new Promise((resolve) => {
    const body = JSON.stringify({ url: testUrl, type: 'URL_UPDATED' });
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
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', (err) => resolve({ status: 500, body: err.message }));
    req.write(body);
    req.end();
  });

  console.log('Publish Status:', publishRes.status);
  console.log('Publish Body:', publishRes.body);
}

testPublish().catch(console.error);
