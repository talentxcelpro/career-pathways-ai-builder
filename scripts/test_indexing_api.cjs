const fs = require('fs');
const crypto = require('crypto');
const https = require('https');

async function test() {
  const candidateKeys = [
    'talentxcel-indexing.json',
    'gcp-indexing-key.json',
    'indexing-key.json',
    'gcp-key.json',
    'gsc-service-account.json'
  ];
  const keyFile = candidateKeys.find(f => fs.existsSync(f)) || 'talentxcel-indexing.json';
  const key = JSON.parse(fs.readFileSync(keyFile, 'utf8'));
  console.log('Testing Key:', keyFile);
  console.log('Account Email:', key.client_email);
  console.log('Project ID:', key.project_id);

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
        try {
          const parsed = JSON.parse(data);
          if (parsed.access_token) resolve(parsed.access_token);
          else reject(new Error(data));
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });

  console.log('✅ Google OAuth2 Token acquired successfully!');

  // Check metadata for a URL
  const testUrl = 'https://talentxcel.in/jobs/software-engineer';
  const metadataRes = await new Promise((resolve) => {
    const req = https.request(`https://indexing.googleapis.com/v3/urlNotifications/metadata?url=${encodeURIComponent(testUrl)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', (err) => resolve({ status: 500, body: err.message }));
    req.end();
  });

  console.log('Indexing API Metadata Status:', metadataRes.status);
  console.log('Indexing API Metadata Body:', metadataRes.body);
}

test().catch(console.error);
