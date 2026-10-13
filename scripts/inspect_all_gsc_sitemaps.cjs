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

  const properties = [
    'https://talentxcel.in/',
    'sc-domain:jobs.talentxcel.in',
    'sc-domain:salary.talentxcel.in',
    'sc-domain:careers.talentxcel.in',
    'sc-domain:resume.talentxcel.in',
    'sc-domain:learning.talentxcel.in',
    'sc-domain:colleges.talentxcel.in',
    'sc-domain:employers.talentxcel.in',
    'sc-domain:government.talentxcel.in',
    'sc-domain:passport.talentxcel.in'
  ];

  for (const prop of properties) {
    console.log(`\n========================================`);
    console.log(`PROPERTY: ${prop}`);
    console.log(`========================================`);
    const encoded = encodeURIComponent(prop);
    const smRes = await fetch(`https://searchconsole.googleapis.com/webmasters/v3/sites/${encoded}/sitemaps`, {
      headers: { Authorization: 'Bearer ' + access_token }
    });
    if (!smRes.ok) {
      console.log(`HTTP ${smRes.status}: ${await smRes.text()}`);
      continue;
    }
    const data = await smRes.json();
    if (!data.sitemap || data.sitemap.length === 0) {
      console.log('No sitemaps found.');
      continue;
    }
    for (const sm of data.sitemap) {
      console.log(`- Path: ${sm.path}`);
      console.log(`  Last Downloaded: ${sm.lastDownloaded || 'never'}`);
      console.log(`  Last Submitted: ${sm.lastSubmitted || 'never'}`);
      console.log(`  Errors: ${sm.errors || 0}, Warnings: ${sm.warnings || 0}`);
      if (sm.contents) {
        console.log(`  Contents: ${JSON.stringify(sm.contents)}`);
      }
      
      // Fetch details of this sitemap
      const encodedSm = encodeURIComponent(sm.path);
      const detailRes = await fetch(`https://searchconsole.googleapis.com/webmasters/v3/sites/${encoded}/sitemaps/${encodedSm}`, {
        headers: { Authorization: 'Bearer ' + access_token }
      });
      if (detailRes.ok) {
        const detail = await detailRes.json();
        console.log(`  Detail:`, JSON.stringify(detail, null, 2));
      }
    }
  }
}

run().catch(console.error);
