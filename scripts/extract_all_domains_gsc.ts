import * as fs from 'fs';
import { createSign } from 'crypto';

interface GscSiteReport {
  siteUrl: string;
  domain: string;
  totals7Day: {
    impressions: number;
    clicks: number;
    ctrPct: number;
    position: number;
  };
  topQueries: Array<{ query: string; impressions: number; clicks: number; ctr: number; position: number }>;
  topPages: Array<{ page: string; impressions: number; clicks: number; ctr: number; position: number }>;
  sitemaps: any[];
  error?: string;
}

async function getAccessToken(): Promise<string> {
  const sa = JSON.parse(fs.readFileSync('gsc-service-account.json', 'utf8'));
  const SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';
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

async function queryAnalytics(token: string, siteUrl: string, body: any): Promise<any> {
  const res = await fetch(`https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errText = await res.text();
    return { error: `HTTP ${res.status}: ${errText}` };
  }
  return await res.json();
}

async function querySitemaps(token: string, siteUrl: string): Promise<any[]> {
  const res = await fetch(`https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/sitemaps`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    return [];
  }
  const data = await res.json();
  return data.sitemap || [];
}

async function main() {
  const token = await getAccessToken();

  const targetSites = [
    { siteUrl: 'https://talentxcel.in/', domain: 'talentxcel.in (Root Property)' },
    { siteUrl: 'sc-domain:jobs.talentxcel.in', domain: 'jobs.talentxcel.in' },
    { siteUrl: 'sc-domain:resume.talentxcel.in', domain: 'resume.talentxcel.in' },
    { siteUrl: 'sc-domain:careers.talentxcel.in', domain: 'careers.talentxcel.in' },
    { siteUrl: 'sc-domain:salary.talentxcel.in', domain: 'salary.talentxcel.in' },
    { siteUrl: 'sc-domain:learning.talentxcel.in', domain: 'learning.talentxcel.in' },
    { siteUrl: 'sc-domain:colleges.talentxcel.in', domain: 'colleges.talentxcel.in' },
    { siteUrl: 'sc-domain:employers.talentxcel.in', domain: 'employers.talentxcel.in' },
    { siteUrl: 'sc-domain:government.talentxcel.in', domain: 'government.talentxcel.in' },
    { siteUrl: 'sc-domain:passport.talentxcel.in', domain: 'passport.talentxcel.in' },
  ];

  const startDate = '2026-09-29';
  const endDate = '2026-10-06';

  console.log('Fetching live GSC performance across all 10 domain properties...');
  console.log(`Window: ${startDate} to ${endDate}\n`);

  const results: GscSiteReport[] = [];

  for (const target of targetSites) {
    console.log(`Auditing: ${target.siteUrl} (${target.domain})...`);

    // 1. Overall Totals
    const totalsRes = await queryAnalytics(token, target.siteUrl, {
      startDate,
      endDate,
    });

    let totals = { impressions: 0, clicks: 0, ctrPct: 0, position: 0 };
    let error: string | undefined;

    if (totalsRes.error) {
      error = totalsRes.error;
      console.log(`  -> Warning/Error: ${totalsRes.error}`);
    } else if (totalsRes.rows && totalsRes.rows.length > 0) {
      const row = totalsRes.rows[0];
      totals = {
        impressions: row.impressions,
        clicks: row.clicks,
        ctrPct: parseFloat((row.ctr * 100).toFixed(2)),
        position: parseFloat(row.position.toFixed(1)),
      };
    }

    // 2. Top Queries
    let topQueries: any[] = [];
    if (!error) {
      const queriesRes = await queryAnalytics(token, target.siteUrl, {
        startDate,
        endDate,
        dimensions: ['query'],
        rowLimit: 10,
      });
      if (queriesRes.rows) {
        topQueries = queriesRes.rows.map((r: any) => ({
          query: r.keys[0],
          impressions: r.impressions,
          clicks: r.clicks,
          ctr: parseFloat((r.ctr * 100).toFixed(2)),
          position: parseFloat(r.position.toFixed(1)),
        }));
      }
    }

    // 3. Top Pages
    let topPages: any[] = [];
    if (!error) {
      const pagesRes = await queryAnalytics(token, target.siteUrl, {
        startDate,
        endDate,
        dimensions: ['page'],
        rowLimit: 10,
      });
      if (pagesRes.rows) {
        topPages = pagesRes.rows.map((r: any) => ({
          page: r.keys[0],
          impressions: r.impressions,
          clicks: r.clicks,
          ctr: parseFloat((r.ctr * 100).toFixed(2)),
          position: parseFloat(r.position.toFixed(1)),
        }));
      }
    }

    // 4. Sitemaps
    const sitemaps = await querySitemaps(token, target.siteUrl);

    console.log(`  -> Impressions: ${totals.impressions}, Clicks: ${totals.clicks}, CTR: ${totals.ctrPct}%, Avg Pos: ${totals.position}, Sitemaps: ${sitemaps.length}`);

    results.push({
      siteUrl: target.siteUrl,
      domain: target.domain,
      totals7Day: totals,
      topQueries,
      topPages,
      sitemaps,
      error,
    });
  }

  fs.writeFileSync('gsc_all_domains_baseline.json', JSON.stringify({
    timestamp: new Date().toISOString(),
    window: { startDate, endDate },
    properties: results,
  }, null, 2));

  console.log('\nAudit complete! Saved snapshot to gsc_all_domains_baseline.json');
}

main().catch(console.error);
