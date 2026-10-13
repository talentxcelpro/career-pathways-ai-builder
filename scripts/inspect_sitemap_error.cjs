const fs = require('fs');
const { createSign } = require('crypto');

async function run() {
  const sa = JSON.parse(fs.readFileSync('gsc-service-account.json', 'utf8'));
  const SCOPE = 'https://www.googleapis.com/auth/webmasters';
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    iss: sa.client_email,
    scope: SCOPE,
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
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });
  const { access_token } = await tokenRes.json();
  if (!access_token) {
    console.error('Could not get token');
    return;
  }

  // Inspect sitemaps for https://talentxcel.in/
  const siteUrl = 'https://talentxcel.in/';
  const encoded = encodeURIComponent(siteUrl);
  const smRes = await fetch(`https://searchconsole.googleapis.com/webmasters/v3/sites/${encoded}/sitemaps`, {
    headers: { Authorization: 'Bearer ' + access_token }
  });
  const data = await smRes.json();
  console.log('Sitemaps on https://talentxcel.in/:');
  console.log(JSON.stringify(data, null, 2));

  // Also query specific sitemap error details for https://talentxcel.in/sitemap.xml
  const sitemapUrl = encodeURIComponent('https://talentxcel.in/sitemap.xml');
  const detailRes = await fetch(`https://searchconsole.googleapis.com/webmasters/v3/sites/${encoded}/sitemaps/${sitemapUrl}`, {
    headers: { Authorization: 'Bearer ' + access_token }
  });
  const detailData = await detailRes.json();
  console.log('\nDetail for https://talentxcel.in/sitemap.xml:');
  console.log(JSON.stringify(detailData, null, 2));
}

run().catch(console.error);
