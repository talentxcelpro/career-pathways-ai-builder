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
  if (!tokenData.access_token) {
    console.error('Token error:', tokenData);
    process.exit(1);
  }
  return tokenData.access_token;
}

async function run() {
  const token = await getToken();
  const site = 'https://talentxcel.in/';
  const encoded = encodeURIComponent(site);

  // Step 1: Delete sitemap.xml (the broken one)
  const toDelete = 'https://talentxcel.in/sitemap.xml';
  console.log(`\nDeleting ${toDelete}...`);
  const delRes = await fetch(
    `https://searchconsole.googleapis.com/webmasters/v3/sites/${encoded}/sitemaps/${encodeURIComponent(toDelete)}`,
    { method: 'DELETE', headers: { Authorization: 'Bearer ' + token } }
  );
  console.log('  DELETE status:', delRes.status, delRes.status === 204 ? '✅ Deleted' : await delRes.text());

  // Step 2: Wait 3 seconds
  await new Promise(r => setTimeout(r, 3000));

  // Step 3: Resubmit all key sitemaps
  const toSubmit = [
    'https://talentxcel.in/sitemap.xml',
    'https://talentxcel.in/sitemap-root.xml',
    'https://talentxcel.in/sitemap-posts.xml',
    'https://talentxcel.in/sitemap-passport.xml',
    'https://talentxcel.in/sitemap-network.xml',
    'https://talentxcel.in/sitemap-users.xml',
  ];

  console.log('\nSubmitting sitemaps...');
  for (const sm of toSubmit) {
    const r = await fetch(
      `https://searchconsole.googleapis.com/webmasters/v3/sites/${encoded}/sitemaps/${encodeURIComponent(sm)}`,
      { method: 'PUT', headers: { Authorization: 'Bearer ' + token } }
    );
    const txt = r.status === 204 ? '✅' : await r.text();
    console.log(`  ${sm} → ${r.status} ${txt}`);
    await new Promise(r => setTimeout(r, 500));
  }

  // Step 4: Final status check
  console.log('\n=== FINAL SITEMAP STATUS (talentxcel.in) ===');
  await new Promise(r => setTimeout(r, 2000));
  const listRes = await fetch(
    `https://searchconsole.googleapis.com/webmasters/v3/sites/${encoded}/sitemaps`,
    { headers: { Authorization: 'Bearer ' + token } }
  );
  const listData = await listRes.json();
  const maps = listData.sitemap || [];
  
  // Sort by errors first, then by path
  maps.sort((a, b) => (b.errors || 0) - (a.errors || 0));
  
  for (const m of maps) {
    const contents = (m.contents || []).map(c => `${c.submitted} submitted, ${c.indexed} indexed`).join(', ');
    const errorFlag = m.errors > 0 ? '❌' : '✅';
    const pending = m.isPending ? '[PENDING]' : '';
    console.log(`${errorFlag} ${m.path}`);
    console.log(`   errors=${m.errors||0} warnings=${m.warnings||0} ${pending}`);
    if (contents) console.log(`   ${contents}`);
    console.log(`   lastDownloaded: ${m.lastDownloaded||'never'}`);
  }
}

run().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
