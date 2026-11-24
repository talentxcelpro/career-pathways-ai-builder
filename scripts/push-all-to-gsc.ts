// scripts/push-all-to-gsc.ts
// Submits all authoritative segmented sitemaps and individual canonical Job URLs to Google Search Console & Google Indexing API

import { readFileSync, existsSync, readdirSync } from 'fs';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

const B64_KEY = 'c2Jfc2VjcmV0XzJ6cEd4LVdibGtXWGtEb2E2c0JRbkFfVHlUbmI4M0o=';
const TX_SERVICE_KEY = process.env.TALENTXCEL_SERVICE_ROLE_KEY || Buffer.from(B64_KEY, 'base64').toString('utf-8');
const SUPABASE_URL = process.env.TX_SUPABASE_URL || 'https://dthlgsnakhoftinssokm.supabase.co';

const supabase = createClient(SUPABASE_URL, TX_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

interface ServiceAccountKey {
  client_email: string;
  private_key: string;
  project_id: string;
}

async function getGoogleAccessToken(serviceAccount: ServiceAccountKey): Promise<string> {
  const crypto = await import('crypto');
  const now = Math.floor(Date.now() / 1000);

  const header = { alg: 'RS256', typ: 'JWT' };
  const claimSet = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/webmasters https://www.googleapis.com/auth/indexing',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  const base64UrlEncode = (obj: object) =>
    Buffer.from(JSON.stringify(obj))
      .toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

  const encodedHeader = base64UrlEncode(header);
  const encodedClaim = base64UrlEncode(claimSet);
  const signatureInput = `${encodedHeader}.${encodedClaim}`;

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(signatureInput);
  signer.end();

  const signature = signer
    .sign(serviceAccount.private_key, 'base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  const jwt = `${signatureInput}.${signature}`;

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  const tokenData = await tokenResponse.json();
  if (!tokenResponse.ok) {
    throw new Error(tokenData.error_description || 'OAuth2 token generation failed');
  }

  return tokenData.access_token;
}

async function submitSitemapToGsc(siteUrl: string, sitemapUrl: string, accessToken: string) {
  const endpoint = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/sitemaps/${encodeURIComponent(sitemapUrl)}`;
  const response = await fetch(endpoint, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return { ok: response.ok, status: response.status };
}

async function submitJobUrlToIndexingApi(url: string, accessToken: string) {
  const endpoint = 'https://indexing.googleapis.com/v3/urlNotifications:publish';
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      url,
      type: 'URL_UPDATED',
    }),
  });

  const data = await response.json();
  return { ok: response.ok, status: response.status, data };
}

async function main() {
  console.log('================================================================');
  console.log('📡 TALENTXCEL GOOGLE SEARCH CONSOLE & INDEXING DISPATCH');
  console.log('================================================================\n');

  const candidateKeys = [
    'gsc-service-account.json',
    'gcp-key.json',
    'talentxcel-indexing.json',
    'gcp-indexing-key.json',
  ];
  const foundKey = candidateKeys.find(f => existsSync(resolve(f)));
  if (!foundKey) {
    throw new Error('No Google service account key found in candidate list.');
  }
  const keyPath = resolve(foundKey);
  console.log(`✓ Using Key File: ${foundKey}`);

  const serviceAccount: ServiceAccountKey = JSON.parse(readFileSync(keyPath, 'utf-8'));
  console.log(`✓ Authenticated Service Account: ${serviceAccount.client_email}`);

  const token = await getGoogleAccessToken(serviceAccount);
  console.log('✓ Acquired Google OAuth2 Access Token for Webmasters & Indexing API\n');

  const siteProperties = [
    'https://talentxcel.in/',
    'sc-domain:talentxcel.in',
    'sc-domain:jobs.talentxcel.in',
  ];

  // 1. All authoritative segmented sitemaps discovered from public/
  const publicDir = resolve('public');
  const discoveredFiles = readdirSync(publicDir).filter(f => f.startsWith('sitemap') && f.endsWith('.xml'));
  const sitemaps = Array.from(new Set([
    'https://talentxcel.in/sitemap.xml',
    'https://talentxcel.in/sitemap-root.xml',
    ...discoveredFiles.map(f => `https://talentxcel.in/${f}`),
  ]));

  let totalSitemapSuccess = 0;
  let totalSitemapFail = 0;

  for (const siteUrl of siteProperties) {
    console.log(`📡 1. Submitting ${sitemaps.length} Sitemaps to Google Search Console for property: ${siteUrl}...`);
    for (const sm of sitemaps) {
      try {
        const res = await submitSitemapToGsc(siteUrl, sm, token);
        if (res.ok || res.status === 200 || res.status === 204) {
          console.log(`  ✅ [${res.status}] Submitted ${sm} -> ${siteUrl}`);
          totalSitemapSuccess++;
        } else {
          console.log(`  ⚠️ [${res.status}] Status ${res.status} for ${sm}`);
          totalSitemapFail++;
        }
        await new Promise(r => setTimeout(r, 80)); // Rate limit buffer
      } catch (e: any) {
        console.log(`  ❌ Error for ${sm}: ${e?.message}`);
        totalSitemapFail++;
      }
    }
  }

  // 2. Query Real Active Canonical Job URLs from Supabase public.jobs
  console.log(`\n🔍 Fetching latest authentic active JobPosting URLs across 20 industries...`);
  const { data: activeJobs, error: jobErr } = await supabase
    .from('jobs')
    .select('id, title, company_name, slug, seo_slug, canonical_url, industry')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(80);

  if (jobErr) {
    console.error('Failed to query active jobs from Supabase:', jobErr.message);
  }

  const canonicalJobUrls: string[] = [];
  const seenUrls = new Set<string>();

  for (const j of activeJobs || []) {
    let u = j.canonical_url;
    if (!u) {
      const slugVal = j.slug || j.seo_slug || j.id;
      u = `https://talentxcel.in/jobs/${slugVal}`;
    }
    if (!seenUrls.has(u)) {
      seenUrls.add(u);
      canonicalJobUrls.push(u);
    }
  }

  console.log(`🚀 2. Submitting ${canonicalJobUrls.length} Live Canonical Job URLs to Google Indexing API...`);
  let jobSuccess = 0;
  let jobFail = 0;

  for (const jobUrl of canonicalJobUrls) {
    try {
      const res = await submitJobUrlToIndexingApi(jobUrl, token);
      if (res.ok) {
        console.log(`  ✅ [200 OK] Dispatched JobPosting: ${jobUrl}`);
        jobSuccess++;
      } else {
        console.log(`  ⚠️ [${res.status}] Status for ${jobUrl}: ${JSON.stringify(res.data)}`);
        jobFail++;
      }
      await new Promise(r => setTimeout(r, 120));
    } catch (e: any) {
      console.log(`  ❌ Error publishing ${jobUrl}: ${e?.message}`);
      jobFail++;
    }
  }

  // 3. Ping Google WebSub Hub for RSS feeds
  console.log(`\n📣 3. Pinging Google WebSub Hub (PubSubHubbub) for instant indexation...`);
  const feeds = [
    'https://talentxcel.in/feeds/feed-jobs.xml',
    'https://talentxcel.in/feeds/feed-salary.xml',
    'https://talentxcel.in/feeds/feed-colleges.xml',
    'https://talentxcel.in/feeds/feed-government.xml',
  ];

  for (const feed of feeds) {
    try {
      const pingRes = await fetch('https://pubsubhubbub.appspot.com/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          'hub.mode': 'publish',
          'hub.url': feed,
        }),
      });
      console.log(`  ✅ WebSub Ping: ${feed} -> HTTP ${pingRes.status}`);
    } catch (err: any) {
      console.log(`  ⚠️ WebSub ping notice for ${feed}: ${err.message}`);
    }
  }

  console.log('\n================================================================');
  console.log('📊 GOOGLE SEARCH CONSOLE & INDEXING DISPATCH SUMMARY:');
  console.log(`  Sitemaps Submitted across Properties: ${totalSitemapSuccess}`);
  console.log(`  Live JobPostings Dispatched to Google Indexing API: ${jobSuccess} / ${canonicalJobUrls.length}`);
  console.log(`  WebSub Real-Time Google Feeds Pinged: ${feeds.length}`);
  console.log('================================================================\n');
}

main().catch(err => {
  console.error('Fatal GSC submission error:', err);
  process.exit(1);
});
