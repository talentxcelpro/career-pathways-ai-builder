const fs = require('fs');
const { createSign } = require('crypto');

async function getToken() {
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
  const tokenData = await tokenRes.json();
  return tokenData.access_token;
}

async function run() {
  const token = await getToken();
  const site = 'https://talentxcel.in/';
  const encoded = encodeURIComponent(site);

  // Delete obsolete/phantom sitemaps
  const toDelete = [
    'https://talentxcel.in/sitemap-network.xml',
    'https://talentxcel.in/sitemap-users.xml',
    'https://talentxcel.in/sitemap.xml'
  ];

  for (const item of toDelete) {
    console.log(`Deleting ${item}...`);
    const r = await fetch(
      `https://searchconsole.googleapis.com/webmasters/v3/sites/${encoded}/sitemaps/${encodeURIComponent(item)}`,
      { method: 'DELETE', headers: { Authorization: 'Bearer ' + token } }
    );
    console.log(`  Status: ${r.status}`);
  }

  console.log('Waiting 3 seconds before resubmitting...');
  await new Promise(r => setTimeout(r, 3000));

  // Resubmit valid master sitemaps
  const toSubmit = [
    'https://talentxcel.in/sitemap-root.xml',
    'https://talentxcel.in/sitemap.xml'
  ];

  for (const item of toSubmit) {
    console.log(`Submitting ${item}...`);
    const r = await fetch(
      `https://searchconsole.googleapis.com/webmasters/v3/sites/${encoded}/sitemaps/${encodeURIComponent(item)}`,
      { method: 'PUT', headers: { Authorization: 'Bearer ' + token } }
    );
    console.log(`  Status: ${r.status}`);
  }

  await new Promise(r => setTimeout(r, 3000));

  console.log('\n--- Current Sitemaps in GSC ---');
  const listRes = await fetch(
    `https://searchconsole.googleapis.com/webmasters/v3/sites/${encoded}/sitemaps`,
    { headers: { Authorization: 'Bearer ' + token } }
  );
  const data = await listRes.json();
  const maps = data.sitemap || [];

  for (const sm of maps) {
    const contents = (sm.contents || []).map(c => `${c.submitted} submitted, ${c.indexed} indexed`).join(', ');
    const flag = sm.errors > 0 ? '❌' : '✅';
    console.log(`${flag} ${sm.path} (errors: ${sm.errors || 0})`);
    if (contents) console.log(`   ${contents}`);
    console.log(`   lastDownloaded: ${sm.lastDownloaded || 'never'}, isPending: ${sm.isPending}`);
  }
}

run().catch(console.error);
