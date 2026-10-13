const fs = require('fs');
const { createSign } = require('crypto');

async function getAccessToken() {
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
  const data = await tokenRes.json();
  return data.access_token;
}

async function run() {
  const token = await getAccessToken();
  console.log('Got access token.');

  // Check passport.talentxcel.in sitemaps
  console.log('\n--- Checking passport.talentxcel.in ---');
  const passRes = await fetch(`https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent('sc-domain:passport.talentxcel.in')}/sitemaps`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log('passport sitemaps:', await passRes.json());

  // Check employers.talentxcel.in sitemaps
  console.log('\n--- Checking employers.talentxcel.in ---');
  const empRes = await fetch(`https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent('sc-domain:employers.talentxcel.in')}/sitemaps`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log('employers sitemaps:', await empRes.json());

  // Delete and resubmit sitemap.xml on https://talentxcel.in/
  console.log('\n--- Deleting and Resubmitting sitemap.xml on https://talentxcel.in/ ---');
  const delRes = await fetch(`https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent('https://talentxcel.in/')}/sitemaps/${encodeURIComponent('https://talentxcel.in/sitemap.xml')}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log('Delete status:', delRes.status, delRes.statusText);

  // Submit sitemap.xml fresh
  const subRes = await fetch(`https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent('https://talentxcel.in/')}/sitemaps/${encodeURIComponent('https://talentxcel.in/sitemap.xml')}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log('Submit sitemap.xml status:', subRes.status, subRes.statusText);

  // Also submit sitemap-root.xml
  const subRootRes = await fetch(`https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent('https://talentxcel.in/')}/sitemaps/${encodeURIComponent('https://talentxcel.in/sitemap-root.xml')}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log('Submit sitemap-root.xml status:', subRootRes.status, subRootRes.statusText);

  // Submit passport sitemap if missing
  const passSubRes = await fetch(`https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent('sc-domain:passport.talentxcel.in')}/sitemaps/${encodeURIComponent('https://passport.talentxcel.in/sitemap.xml')}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log('Submit passport status:', passSubRes.status, passSubRes.statusText);

  // Re-submit jobs, salary, resume to refresh their submission timestamp and ping
  const subdomains = ['jobs', 'salary', 'resume', 'careers', 'colleges', 'learning', 'employers', 'government'];
  for (const sub of subdomains) {
    const sUrl = `https://${sub}.talentxcel.in/sitemap.xml`;
    const r = await fetch(`https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(`sc-domain:${sub}.talentxcel.in`)}/sitemaps/${encodeURIComponent(sUrl)}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`Re-submitted ${sub}.talentxcel.in/sitemap.xml: status ${r.status}`);
  }
}

run().catch(console.error);
