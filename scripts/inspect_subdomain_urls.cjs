const fs = require('fs');
const { createSign } = require('crypto');

async function run() {
  const sa = JSON.parse(fs.readFileSync('gsc-service-account.json', 'utf8'));
  const SCOPE = 'https://www.googleapis.com/auth/webmasters https://www.googleapis.com/auth/webmasters.readonly';
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

  const tests = [
    { siteUrl: 'https://talentxcel.in/', inspectionUrl: 'https://talentxcel.in/' },
    { siteUrl: 'sc-domain:jobs.talentxcel.in', inspectionUrl: 'https://jobs.talentxcel.in/' },
    { siteUrl: 'sc-domain:salary.talentxcel.in', inspectionUrl: 'https://salary.talentxcel.in/' },
    { siteUrl: 'sc-domain:careers.talentxcel.in', inspectionUrl: 'https://careers.talentxcel.in/' },
    { siteUrl: 'sc-domain:colleges.talentxcel.in', inspectionUrl: 'https://colleges.talentxcel.in/' },
    { siteUrl: 'sc-domain:learning.talentxcel.in', inspectionUrl: 'https://learning.talentxcel.in/' }
  ];

  console.log('Inspecting URLs across GSC properties...\n');
  for (const t of tests) {
    const res = await fetch('https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + access_token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(t)
    });
    const data = await res.json();
    const result = data.inspectionResult && data.inspectionResult.indexStatusResult;
    console.log(`URL: ${t.inspectionUrl} (property: ${t.siteUrl})`);
    if (result) {
      console.log(`  Verdict: ${result.verdict}`);
      console.log(`  Coverage State: ${result.coverageState}`);
      console.log(`  Crawled As: ${result.crawledAs || 'Not yet crawled'}`);
      console.log(`  Last Crawl Time: ${result.lastCrawlTime || 'None'}`);
      console.log(`  Indexing State: ${result.indexingState || 'None'}`);
      console.log(`  Robots: ${result.robotsTxtState}`);
    } else {
      console.log(`  Response:`, JSON.stringify(data));
    }
    console.log('');
  }
}

run().catch(console.error);
