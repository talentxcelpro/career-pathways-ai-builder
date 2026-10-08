// scripts/extract_gsc_live_baseline.ts
/**
 * Google Search Console Live Canary Baseline Extractor
 * 
 * Fetches:
 * 1. 7-Day Performance Totals (Impressions, Clicks, CTR, Avg Position)
 * 2. Daily Time-Series Trend (Last 7 Days)
 * 3. Top Search Queries (Ranked by Impressions & Clicks)
 * 4. Top Landing Pages (Mapped to Product Intent & Subdomain Surface)
 * 5. Country Demographics
 * 6. Search Appearance Features (e.g. Job Postings, Rich Results)
 * 7. Live Sitemap Submission & Processing Status
 */

import * as fs from 'fs';
import * as path from 'path';
import { createSign } from 'crypto';

interface GscRow {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
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
  const tokenData = await tokenRes.json() as any;
  return tokenData.access_token;
}

async function queryGsc(token: string, siteUrl: string, body: any): Promise<any> {
  const res = await fetch(`https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  return await res.json();
}

async function fetchSitemaps(token: string, siteUrl: string): Promise<any> {
  const res = await fetch(`https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/sitemaps`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return await res.json();
}

async function main() {
  console.log('================================================================');
  console.log('📡 EXTRACTING LIVE GOOGLE SEARCH CONSOLE CANARY BASELINE');
  console.log('================================================================\n');

  const token = await getAccessToken();
  const siteUrl = 'https://talentxcel.in/';

  // Determine standard 7-day window with 2-day GSC lag (2026-09-29 to 2026-10-06)
  const endDate = '2026-10-06';
  const startDate = '2026-09-29';

  console.log(`Auditing GSC Property: ${siteUrl}`);
  console.log(`7-Day Measurement Window: ${startDate} to ${endDate}\n`);

  // 1. Overall Totals
  const totalsRes = await queryGsc(token, siteUrl, {
    startDate,
    endDate,
  });
  const overallTotals = totalsRes.rows?.[0] || { clicks: 0, impressions: 0, ctr: 0, position: 0 };

  // 2. Daily breakdown
  const dailyRes = await queryGsc(token, siteUrl, {
    startDate,
    endDate,
    dimensions: ['date'],
  });
  const dailyRows = (dailyRes.rows || []) as GscRow[];

  // 3. Top Queries
  const queryRes = await queryGsc(token, siteUrl, {
    startDate,
    endDate,
    dimensions: ['query'],
    rowLimit: 100,
  });
  const queryRows = (queryRes.rows || []) as GscRow[];

  // 4. Top Landing Pages
  const pageRes = await queryGsc(token, siteUrl, {
    startDate,
    endDate,
    dimensions: ['page'],
    rowLimit: 100,
  });
  const pageRows = (pageRes.rows || []) as GscRow[];

  // 5. Query + Page Pairs
  const queryPageRes = await queryGsc(token, siteUrl, {
    startDate,
    endDate,
    dimensions: ['query', 'page'],
    rowLimit: 100,
  });
  const queryPageRows = (queryPageRes.rows || []) as GscRow[];

  // 6. Countries
  const countryRes = await queryGsc(token, siteUrl, {
    startDate,
    endDate,
    dimensions: ['country'],
    rowLimit: 20,
  });
  const countryRows = (countryRes.rows || []) as GscRow[];

  // 7. Search Appearance
  const searchAppearanceRes = await queryGsc(token, siteUrl, {
    startDate,
    endDate,
    dimensions: ['searchAppearance'],
    rowLimit: 10,
  });
  const searchAppearanceRows = (searchAppearanceRes.rows || []) as GscRow[];

  // 8. Sitemaps
  const sitemapsData = await fetchSitemaps(token, siteUrl);

  // 9. Categorize Pages by Intent / Subdomain Product Surface
  const surfaceStats: Record<string, { impressions: number; clicks: number; pagesCount: number }> = {
    'JOBS (/jobs/*)': { impressions: 0, clicks: 0, pagesCount: 0 },
    'COLLEGES (/colleges/*)': { impressions: 0, clicks: 0, pagesCount: 0 },
    'RESUME (/resume/*)': { impressions: 0, clicks: 0, pagesCount: 0 },
    'CAREERS (/career-map, /how-to-become)': { impressions: 0, clicks: 0, pagesCount: 0 },
    'SALARY (/salary/*)': { impressions: 0, clicks: 0, pagesCount: 0 },
    'LEARNING (/learning/*, /skills/*)': { impressions: 0, clicks: 0, pagesCount: 0 },
    'COMPANIES (/companies/*, /hire)': { impressions: 0, clicks: 0, pagesCount: 0 },
    'GOVERNMENT (/government-jobs/*)': { impressions: 0, clicks: 0, pagesCount: 0 },
    'CORE (/about, /network, /)': { impressions: 0, clicks: 0, pagesCount: 0 },
  };

  pageRows.forEach(r => {
    const p = r.keys[0];
    let matched = false;
    if (p.includes('/jobs')) {
      surfaceStats['JOBS (/jobs/*)'].impressions += r.impressions;
      surfaceStats['JOBS (/jobs/*)'].clicks += r.clicks;
      surfaceStats['JOBS (/jobs/*)'].pagesCount++;
      matched = true;
    } else if (p.includes('/colleges')) {
      surfaceStats['COLLEGES (/colleges/*)'].impressions += r.impressions;
      surfaceStats['COLLEGES (/colleges/*)'].clicks += r.clicks;
      surfaceStats['COLLEGES (/colleges/*)'].pagesCount++;
      matched = true;
    } else if (p.includes('/resume')) {
      surfaceStats['RESUME (/resume/*)'].impressions += r.impressions;
      surfaceStats['RESUME (/resume/*)'].clicks += r.clicks;
      surfaceStats['RESUME (/resume/*)'].pagesCount++;
      matched = true;
    } else if (p.includes('/career') || p.includes('/how-to-become')) {
      surfaceStats['CAREERS (/career-map, /how-to-become)'].impressions += r.impressions;
      surfaceStats['CAREERS (/career-map, /how-to-become)'].clicks += r.clicks;
      surfaceStats['CAREERS (/career-map, /how-to-become)'].pagesCount++;
      matched = true;
    } else if (p.includes('/salary')) {
      surfaceStats['SALARY (/salary/*)'].impressions += r.impressions;
      surfaceStats['SALARY (/salary/*)'].clicks += r.clicks;
      surfaceStats['SALARY (/salary/*)'].pagesCount++;
      matched = true;
    } else if (p.includes('/learning') || p.includes('/skills')) {
      surfaceStats['LEARNING (/learning/*, /skills/*)'].impressions += r.impressions;
      surfaceStats['LEARNING (/learning/*, /skills/*)'].clicks += r.clicks;
      surfaceStats['LEARNING (/learning/*, /skills/*)'].pagesCount++;
      matched = true;
    } else if (p.includes('/companies') || p.includes('/hire') || p.includes('/recruiters')) {
      surfaceStats['COMPANIES (/companies/*, /hire)'].impressions += r.impressions;
      surfaceStats['COMPANIES (/companies/*, /hire)'].clicks += r.clicks;
      surfaceStats['COMPANIES (/companies/*, /hire)'].pagesCount++;
      matched = true;
    } else if (p.includes('/government')) {
      surfaceStats['GOVERNMENT (/government-jobs/*)'].impressions += r.impressions;
      surfaceStats['GOVERNMENT (/government-jobs/*)'].clicks += r.clicks;
      surfaceStats['GOVERNMENT (/government-jobs/*)'].pagesCount++;
      matched = true;
    } else {
      surfaceStats['CORE (/about, /network, /)'].impressions += r.impressions;
      surfaceStats['CORE (/about, /network, /)'].clicks += r.clicks;
      surfaceStats['CORE (/about, /network, /)'].pagesCount++;
    }
  });

  const baselineData = {
    extractionTimestamp: new Date().toISOString(),
    property: siteUrl,
    timeframe: {
      startDate,
      endDate,
      durationDays: 7,
    },
    overallTotals: {
      impressions: overallTotals.impressions,
      clicks: overallTotals.clicks,
      ctrPct: Number((overallTotals.ctr * 100).toFixed(2)),
      averagePosition: Number(overallTotals.position.toFixed(1)),
    },
    dailyTrend: dailyRows.map(r => ({
      date: r.keys[0],
      impressions: r.impressions,
      clicks: r.clicks,
      ctrPct: Number((r.ctr * 100).toFixed(2)),
      position: Number(r.position.toFixed(1)),
    })),
    productSurfaceBreakdown: surfaceStats,
    topQueries: queryRows.slice(0, 50).map(r => ({
      query: r.keys[0],
      impressions: r.impressions,
      clicks: r.clicks,
      ctrPct: Number((r.ctr * 100).toFixed(2)),
      position: Number(r.position.toFixed(1)),
    })),
    topLandingPages: pageRows.slice(0, 50).map(r => ({
      page: r.keys[0],
      impressions: r.impressions,
      clicks: r.clicks,
      ctrPct: Number((r.ctr * 100).toFixed(2)),
      position: Number(r.position.toFixed(1)),
    })),
    queryPagePairsSample: queryPageRows.slice(0, 25).map(r => ({
      query: r.keys[0],
      page: r.keys[1],
      impressions: r.impressions,
      clicks: r.clicks,
      position: Number(r.position.toFixed(1)),
    })),
    topCountries: countryRows.map(r => ({
      country: r.keys[0],
      impressions: r.impressions,
      clicks: r.clicks,
      ctrPct: Number((r.ctr * 100).toFixed(2)),
      position: Number(r.position.toFixed(1)),
    })),
    searchAppearance: searchAppearanceRows.map(r => ({
      feature: r.keys[0],
      impressions: r.impressions,
      clicks: r.clicks,
      ctrPct: Number((r.ctr * 100).toFixed(2)),
    })),
    sitemapsStatus: sitemapsData.sitemap || [],
  };

  const outPath = path.resolve(process.cwd(), 'gsc_canary_7day_baseline.json');
  fs.writeFileSync(outPath, JSON.stringify(baselineData, null, 2), 'utf8');

  console.log(`✅ Baseline successfully extracted to ${outPath}`);
  console.log('\n--- 7-DAY CANARY PERFORMANCE SUMMARY ---');
  console.log(`  • Total Impressions : ${overallTotals.impressions.toLocaleString()}`);
  console.log(`  • Total Clicks       : ${overallTotals.clicks.toLocaleString()}`);
  console.log(`  • Average CTR        : ${(overallTotals.ctr * 100).toFixed(2)}%`);
  console.log(`  • Average Position   : ${overallTotals.position.toFixed(1)}`);
  console.log(`  • Unique Landing Pages with Impressions : ${pageRows.length}`);
  console.log(`  • Unique Search Queries                 : ${queryRows.length}\n`);

  console.log('--- PRODUCT SURFACE DEMAND BREAKDOWN ---');
  console.table(surfaceStats);

  console.log('\n--- TOP 10 SEARCH QUERIES ---');
  console.table(queryRows.slice(0, 10).map(r => ({
    query: r.keys[0],
    impressions: r.impressions,
    clicks: r.clicks,
    ctr: `${(r.ctr * 100).toFixed(1)}%`,
    position: r.position.toFixed(1),
  })));

  console.log('\n--- TOP 10 LANDING PAGES ---');
  console.table(pageRows.slice(0, 10).map(r => ({
    page: r.keys[0].replace('https://talentxcel.in', ''),
    impressions: r.impressions,
    clicks: r.clicks,
    ctr: `${(r.ctr * 100).toFixed(1)}%`,
    position: r.position.toFixed(1),
  })));
}

main().catch(console.error);
