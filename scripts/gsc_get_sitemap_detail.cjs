const fs = require('fs');
const { createSign } = require('crypto');

async function getToken() {
  const sa = JSON.parse(fs.readFileSync('gsc-service-account.json', 'utf8'));
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(JSON.stringify({
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/webmasters',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  })).toString('base64url');
  const sign = createSign('RSA-SHA256');
  sign.update(header + '.' + payload);
  const jwt = header + '.' + payload + '.' + sign.sign(sa.private_key, 'base64url');
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt }),
  });
  return (await tokenRes.json()).access_token;
}

async function run() {
  const token = await getToken();
  const site = encodeURIComponent('https://talentxcel.in/');
  const sm = encodeURIComponent('https://talentxcel.in/sitemap.xml');
  const url = `https://searchconsole.googleapis.com/webmasters/v3/sites/${site}/sitemaps/${sm}`;
  const res = await fetch(url, {
    headers: { Authorization: 'Bearer ' + token }
  });
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}
run().catch(console.error);
