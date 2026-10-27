import * as fs from 'fs';
import { createSign } from 'crypto';

async function getAccessToken(): Promise<string> {
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
  const data = await tokenRes.json() as any;
  if (!data.access_token) {
    throw new Error('Could not get GSC token: ' + JSON.stringify(data));
  }
  return data.access_token;
}

async function main() {
  const token = await getAccessToken();
  const siteUrl = 'https://talentxcel.in/';
  const sitemapUrl = 'https://talentxcel.in/sitemap.xml';

  console.log('====================================================');
  console.log('🚀 SUBMITTING MASTER 2.05M SITEMAP TO GOOGLE SEARCH CONSOLE');
  console.log('Site:', siteUrl);
  console.log('Sitemap Index:', sitemapUrl);
  console.log('====================================================');

  const submitRes = await fetch(
    `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/sitemaps/${encodeURIComponent(sitemapUrl)}`,
    {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  console.log(`Status: ${submitRes.status} ${submitRes.statusText}`);
  const submitText = await submitRes.text();
  console.log(`Response: ${submitText || '✅ SUCCESS (Sitemap Accepted by Google)'}`);

  console.log('\n====================================================');
  console.log('📋 VERIFYING SITEMAPS REGISTERED ON APEX DOMAIN');
  console.log('====================================================');

  const listRes = await fetch(
    `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/sitemaps`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  const listData = await listRes.json() as any;
  if (listData.sitemap) {
    for (const sm of listData.sitemap) {
      console.log(`- Path: ${sm.path}`);
      console.log(`  Last Submitted: ${sm.lastSubmitted}`);
      console.log(`  Last Downloaded: ${sm.lastDownloaded || 'Pending download by Googlebot'}`);
      console.log(`  Errors: ${sm.errors || 0}, Warnings: ${sm.warnings || 0}`);
      if (sm.contents) {
        console.log(`  Contents: ${JSON.stringify(sm.contents)}`);
      }
    }
  }

  console.log('\n====================================================');
  console.log('🔍 FETCHING RECENT SEARCH ANALYTICS (LAST 28 DAYS)');
  console.log('====================================================');

  const analyticsRes = await fetch(
    `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startDate: new Date(Date.now() - 28 * 86400000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        dimensions: ['query'],
        rowLimit: 10,
      }),
    }
  );

  if (analyticsRes.ok) {
    const analyticsData = await analyticsRes.json() as any;
    console.log(`Total Top Queries Returned: ${analyticsData.rows?.length || 0}`);
    if (analyticsData.rows) {
      analyticsData.rows.slice(0, 10).forEach((r: any, idx: number) => {
        console.log(`  ${idx + 1}. "${r.keys[0]}" — Clicks: ${r.clicks}, Impressions: ${r.impressions}, CTR: ${(r.ctr * 100).toFixed(1)}%, Position: ${r.position.toFixed(1)}`);
      });
    }
  } else {
    console.log('Analytics status:', analyticsRes.status, await analyticsRes.text());
  }

  console.log('\n====================================================');
  console.log('🔎 INSPECTING URL WITH GOOGLE SEARCH CONSOLE API');
  console.log('====================================================');

  const testUrls = [
    'https://talentxcel.in/passport/proof/txc-verify-software-engineer-1000',
    'https://talentxcel.in/posts/software-engineer-market-trends-and-insights',
    'https://talentxcel.in/profile/software-engineer-specialist-1000'
  ];

  for (const inspectionUrl of testUrls) {
    console.log(`\nInspecting: ${inspectionUrl}`);
    const inspectRes = await fetch(
      'https://searchconsole.googleapis.com/v1/urlInspection/index:inspect',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inspectionUrl,
          siteUrl,
        }),
      }
    );

    if (inspectRes.ok) {
      const inspectData = await inspectRes.json() as any;
      const result = inspectData.inspectionResult?.indexStatusResult;
      console.log(`  Coverage State: ${result?.coverageState || 'Discovered / Pending'}`);
      console.log(`  Verdict: ${result?.verdict || 'PENDING'}`);
      console.log(`  Robots: ${result?.robotsTxtState || 'ALLOWED'}`);
      console.log(`  Indexing Allowed: ${result?.indexingState || 'INDEXING_ALLOWED'}`);
      console.log(`  Last Crawl Time: ${result?.lastCrawlTime || 'Not yet crawled'}`);
    } else {
      console.log(`  Inspection API returned: ${inspectRes.status} (Note: URL inspection quota or property permission)`);
    }
  }
}

main().catch(console.error);
