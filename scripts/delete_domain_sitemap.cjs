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
  const domainProp = 'sc-domain:talentxcel.in';
  const encodedSite = encodeURIComponent(domainProp);
  const sm = encodeURIComponent('https://talentxcel.in/sitemap.xml');

  console.log('Testing delete on sc-domain:talentxcel.in...');
  const res = await fetch(
    `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodedSite}/sitemaps/${sm}`,
    {
      method: 'DELETE',
      headers: { Authorization: 'Bearer ' + token }
    }
  );
  console.log('DELETE status:', res.status);
  const text = await res.text();
  console.log('Response:', text);
}

run().catch(console.error);
