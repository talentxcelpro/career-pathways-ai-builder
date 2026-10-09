import * as fs from 'fs';
import { createSign } from 'crypto';

async function inspectSitemaps() {
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

  const properties = [
    'sc-domain:jobs.talentxcel.in',
    'sc-domain:salary.talentxcel.in',
    'sc-domain:resume.talentxcel.in',
    'sc-domain:careers.talentxcel.in',
    'sc-domain:learning.talentxcel.in',
    'sc-domain:colleges.talentxcel.in',
    'sc-domain:employers.talentxcel.in',
    'sc-domain:government.talentxcel.in',
    'sc-domain:passport.talentxcel.in',
  ];

  for (const siteUrl of properties) {
    const encoded = encodeURIComponent(siteUrl);
    const res = await fetch(`https://searchconsole.googleapis.com/webmasters/v3/sites/${encoded}/sitemaps`, {
      headers: { Authorization: 'Bearer ' + access_token }
    });
    const data = await res.json();
    console.log(`\n=== Sitemaps for ${siteUrl} ===`);
    console.log(JSON.stringify(data, null, 2));
  }
}

inspectSitemaps().catch(console.error);
