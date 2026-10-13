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
  const tokenData = await tokenRes.json();
  const token = tokenData.access_token;
  if (!token) {
    console.error('Failed to get token:', tokenData);
    return;
  }

  // 1. List all sites
  const sitesRes = await fetch('https://searchconsole.googleapis.com/webmasters/v3/sites', {
    headers: { Authorization: 'Bearer ' + token }
  });
  const sitesData = await sitesRes.json();
  console.log('\n========================================');
  console.log('1. REGISTERED SITES IN GSC:');
  console.log('========================================');
  const siteList = sitesData.siteEntry || [];
  for (const s of siteList) {
    console.log(`- ${s.siteUrl} (permission: ${s.permissionLevel})`);
  }

  // 2. Sitemaps for each property
  console.log('\n========================================');
  console.log('2. SITEMAP STATUS ACROSS PROPERTIES:');
  console.log('========================================');
  for (const s of siteList) {
    const encoded = encodeURIComponent(s.siteUrl);
    const smRes = await fetch(`https://searchconsole.googleapis.com/webmasters/v3/sites/${encoded}/sitemaps`, {
      headers: { Authorization: 'Bearer ' + token }
    });
    const smData = await smRes.json();
    console.log(`\nSite: ${s.siteUrl}`);
    if (!smData.sitemap || smData.sitemap.length === 0) {
      console.log('  No sitemaps found.');
    } else {
      for (const sm of smData.sitemap) {
        console.log(`  Path: ${sm.path}`);
        console.log(`  Last Submitted: ${sm.lastSubmitted || 'N/A'}`);
        console.log(`  Last Downloaded: ${sm.lastDownloaded || 'Pending / Never'}`);
        console.log(`  Errors: ${sm.errors || 0}`);
        console.log(`  Warnings: ${sm.warnings || 0}`);
        console.log(`  isPending: ${sm.isPending}`);
        if (sm.contents) {
          console.log(`  Contents:`, sm.contents);
        }
      }
    }
  }

  // 3. Search Analytics (Last 28 days performance)
  console.log('\n========================================');
  console.log('3. SEARCH PERFORMANCE (LAST 28 DAYS):');
  console.log('========================================');
  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  for (const s of siteList) {
    const encoded = encodeURIComponent(s.siteUrl);
    const queryRes = await fetch(`https://searchconsole.googleapis.com/webmasters/v3/sites/${encoded}/searchAnalytics/query`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        startDate,
        endDate,
        dimensions: ['date'],
        rowLimit: 5
      })
    });
    const qData = await queryRes.json();
    console.log(`\nPerformance for ${s.siteUrl}:`);
    if (qData.rows && qData.rows.length > 0) {
      let totalClicks = 0;
      let totalImpressions = 0;
      for (const r of qData.rows) {
        totalClicks += r.clicks || 0;
        totalImpressions += r.impressions || 0;
      }
      console.log(`  Recent Rows: ${qData.rows.length}, Total Clicks in sample: ${totalClicks}, Impressions: ${totalImpressions}`);
    } else {
      console.log(`  No search query telemetry recorded yet (New property / zero clicks).`);
    }
  }
}

run().catch(console.error);
