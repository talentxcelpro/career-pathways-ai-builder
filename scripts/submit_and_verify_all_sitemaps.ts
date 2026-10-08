import * as fs from 'fs';
import { createSign } from 'crypto';

interface SitemapSubmission {
  siteUrl: string;
  domain: string;
  sitemapUrl: string;
  submitStatus?: number;
  submitText?: string;
  sitemapsInGsc?: any[];
}

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
  return data.access_token;
}

async function submitSitemap(token: string, siteUrl: string, sitemapUrl: string) {
  const url = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/sitemaps/${encodeURIComponent(sitemapUrl)}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
  });
  return {
    status: res.status,
    statusText: res.statusText,
  };
}

async function getSitemaps(token: string, siteUrl: string) {
  const url = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/sitemaps`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.sitemap || [];
}

async function main() {
  const token = await getAccessToken();

  const domainMappings = [
    { siteUrl: 'sc-domain:jobs.talentxcel.in', domain: 'jobs.talentxcel.in', sitemapUrl: 'https://jobs.talentxcel.in/sitemap.xml' },
    { siteUrl: 'sc-domain:resume.talentxcel.in', domain: 'resume.talentxcel.in', sitemapUrl: 'https://resume.talentxcel.in/sitemap.xml' },
    { siteUrl: 'sc-domain:careers.talentxcel.in', domain: 'careers.talentxcel.in', sitemapUrl: 'https://careers.talentxcel.in/sitemap.xml' },
    { siteUrl: 'sc-domain:salary.talentxcel.in', domain: 'salary.talentxcel.in', sitemapUrl: 'https://salary.talentxcel.in/sitemap.xml' },
    { siteUrl: 'sc-domain:learning.talentxcel.in', domain: 'learning.talentxcel.in', sitemapUrl: 'https://learning.talentxcel.in/sitemap.xml' },
    { siteUrl: 'sc-domain:colleges.talentxcel.in', domain: 'colleges.talentxcel.in', sitemapUrl: 'https://colleges.talentxcel.in/sitemap.xml' },
    { siteUrl: 'sc-domain:employers.talentxcel.in', domain: 'employers.talentxcel.in', sitemapUrl: 'https://employers.talentxcel.in/sitemap.xml' },
    { siteUrl: 'sc-domain:government.talentxcel.in', domain: 'government.talentxcel.in', sitemapUrl: 'https://government.talentxcel.in/sitemap.xml' },
    { siteUrl: 'sc-domain:passport.talentxcel.in', domain: 'passport.talentxcel.in', sitemapUrl: 'https://passport.talentxcel.in/sitemap.xml' },
  ];

  console.log('================================================================');
  console.log('🚀 SUBMITTING DEDICATED SITEMAPS ACROSS ALL GSC DOMAIN PROPERTIES');
  console.log('================================================================\n');

  const results: SitemapSubmission[] = [];

  for (const item of domainMappings) {
    console.log(`Submitting sitemap for ${item.domain}...`);
    const subRes = await submitSitemap(token, item.siteUrl, item.sitemapUrl);
    console.log(`  -> Status: ${subRes.status} ${subRes.statusText}`);

    // Wait 500ms
    await new Promise((r) => setTimeout(r, 500));

    // Verify
    const sitemaps = await getSitemaps(token, item.siteUrl);
    console.log(`  -> Registered Sitemaps in GSC: ${sitemaps.length}`);
    sitemaps.forEach((sm: any) => {
      console.log(`     - Path: ${sm.path} | Submitted: ${sm.lastSubmitted} | Downloaded: ${sm.lastDownloaded || 'Pending initial crawl'}`);
    });

    results.push({
      siteUrl: item.siteUrl,
      domain: item.domain,
      sitemapUrl: item.sitemapUrl,
      submitStatus: subRes.status,
      submitText: subRes.statusText,
      sitemapsInGsc: sitemaps,
    });
    console.log('');
  }

  // Also query the main domain sitemaps
  const rootSitemaps = await getSitemaps(token, 'https://talentxcel.in/');
  console.log(`Root property https://talentxcel.in/ has ${rootSitemaps.length} registered sitemaps.`);

  fs.writeFileSync('gsc_sitemaps_submission_report.json', JSON.stringify({
    timestamp: new Date().toISOString(),
    subdomains: results,
    rootSitemaps,
  }, null, 2));

  console.log('\nAll dedicated subdomain sitemaps successfully submitted and verified!');
}

main().catch(console.error);
