// scripts/gsc-submit-todays-updates.ts
// Submits all new & updated URLs from today's work to Google Indexing API & Google Search Console

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

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

async function submitUrlToIndexingApi(url: string, accessToken: string) {
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

async function main() {
  console.log('================================================================');
  console.log('🌐 Google Search Console & Indexing API Submission Pipeline');
  console.log('================================================================\n');

  const keyPath = existsSync(resolve('gcp-key.json'))
    ? resolve('gcp-key.json')
    : resolve('C:/Users/Arshid.Wani/talentxcel-local/gcp-key.json');
  if (!existsSync(keyPath)) {
    throw new Error('gcp-key.json not found at ' + keyPath);
  }

  const serviceAccount: ServiceAccountKey = JSON.parse(readFileSync(keyPath, 'utf-8'));
  console.log(`✓ Authenticated Service Account: ${serviceAccount.client_email}`);

  const token = await getGoogleAccessToken(serviceAccount);
  console.log('✓ Acquired Google OAuth2 Access Token for GSC & Indexing API\n');

  const siteUrl = 'https://talentxcel.in/';

  // 1. Sitemaps to sync/submit
  const sitemaps = [
    'https://talentxcel.in/sitemap.xml',
    'https://talentxcel.in/sitemaps/jobs-matrix-index.xml',
    'https://talentxcel.in/sitemaps/jobs-matrix-india.xml',
    'https://talentxcel.in/sitemaps/jobs-matrix-global.xml',
    'https://talentxcel.in/sitemap-companies.xml',
    'https://talentxcel.in/sitemap-global-programs.xml',
    'https://talentxcel.in/sitemap-scholarships.xml',
    'https://talentxcel.in/sitemap-rankings.xml',
    'https://talentxcel.in/sitemap-services.xml',
    'https://talentxcel.in/sitemap-learning.xml',
    'https://talentxcel.in/sitemap-jobs.xml',
    'https://talentxcel.in/sitemap-posts.xml',
    'https://talentxcel.in/sitemap-videos.xml',
    'https://talentxcel.in/sitemap-colleges.xml',
    'https://talentxcel.in/sitemap-blog.xml',
    'https://talentxcel.in/sitemap-news.xml'
  ];

  console.log('📡 Submitting Updated Sitemaps to Google Search Console...');
  for (const sm of sitemaps) {
    try {
      const res = await submitSitemapToGsc(siteUrl, sm, token);
      if (res.ok) {
        console.log(`  ✅ Submitted sitemap: ${sm}`);
      } else {
        console.log(`  ⚠️ Sitemap status ${res.status}: ${sm}`);
      }
    } catch (e: any) {
      console.log(`  ❌ Sitemap error for ${sm}: ${e?.message}`);
    }
  }

  // 2. Initialize Supabase client
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(
    'https://dthlgsnakhoftinssokm.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc'
  );

  // 2A. Query Supabase for top new enterprise jobs
  console.log('📦 Fetching top newly seeded jobs from Supabase for Google Indexing API...');
  const newJobUrls: string[] = [];
  try {
    const { data: dbJobs } = await supabase
      .from('jobs')
      .select('seo_slug, id')
      .eq('is_active', true)
      .eq('job_status', 'open')
      .order('posted_at', { ascending: false })
      .limit(30);

    if (dbJobs) {
      for (const j of dbJobs) {
        const slug = j.seo_slug || j.id;
        newJobUrls.push(`https://talentxcel.in/jobs/${slug}`);
      }
    }
  } catch (err) {
    console.warn('Could not fetch DB jobs for indexing:', err);
  }

  // 2B. Query Supabase for top video posts
  console.log('🎬 Fetching top video & media posts from Supabase for Google Indexing API...');
  const newPostUrls: string[] = [];
  try {
    const { data: dbMediaPosts } = await supabase
      .from('posts')
      .select('id, media_urls, post_type')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(25);

    if (dbMediaPosts) {
      for (const p of dbMediaPosts) {
        newPostUrls.push(`https://talentxcel.in/post/${p.id}`);
      }
    }
  } catch (err) {
    console.warn('Could not fetch DB posts for indexing:', err);
  }

  // 3. Today's URLs to publish to Google Indexing API
  const todaysUrls = [
    // Dynamic Professional Network Hub + Pagination
    'https://talentxcel.in/network',
    'https://talentxcel.in/network/page/2',
    'https://talentxcel.in/network/page/3',
    'https://talentxcel.in/network/page/4',
    'https://talentxcel.in/network/page/5',

    // Topic Hubs (newly prerendered static pages)
    'https://talentxcel.in/network/jobs',
    'https://talentxcel.in/network/careers',
    'https://talentxcel.in/network/technology',
    'https://talentxcel.in/network/ai',
    'https://talentxcel.in/network/hr',
    'https://talentxcel.in/network/leadership',

    // Newly Published Video & Media Posts
    ...newPostUrls,

    // Newly Seeded Enterprise Jobs (Directly from database)
    ...newJobUrls.slice(0, 30),

    // Regional Hubs & High-Performing Location Pages
    'https://talentxcel.in/locations/varanasi',
    'https://talentxcel.in/locations/noida',
    'https://talentxcel.in/locations/bengaluru',
    'https://talentxcel.in/locations/gurugram',
    'https://talentxcel.in/locations/mumbai',
    'https://talentxcel.in/locations/hyderabad',
    'https://talentxcel.in/locations/pune',
    'https://talentxcel.in/locations/lucknow',
    'https://talentxcel.in/locations/delhi',

    // Core Jobs Catalog
    'https://talentxcel.in/jobs',
    'https://talentxcel.in/jobs/it-jobs',
    'https://talentxcel.in/jobs/engineering-jobs',
    'https://talentxcel.in/jobs/marketing-jobs',

    // Canonical Brand Entity Hub
    'https://talentxcel.in/about/talentxcel',
  ];

  console.log(`\n🚀 Submitting ${todaysUrls.length} Updated URLs to Google Indexing API...`);
  let successCount = 0;
  let failCount = 0;

  for (const url of todaysUrls) {
    try {
      const res = await submitUrlToIndexingApi(url, token);
      if (res.ok) {
        console.log(`  ✅ [200 OK] Published: ${url}`);
        successCount++;
      } else {
        console.log(`  ⚠️ [${res.status}] ${url}: ${JSON.stringify(res.data)}`);
        failCount++;
      }
      // Small pause to respect Google API rate limits
      await new Promise(r => setTimeout(r, 150));
    } catch (e: any) {
      console.log(`  ❌ Error publishing ${url}: ${e?.message}`);
      failCount++;
    }
  }

  console.log('\n================================================================');
  console.log(`📊 SUBMISSION SUMMARY:`);
  console.log(`  Total URLs Submitted: ${todaysUrls.length}`);
  console.log(`  Successfully Accepted: ${successCount}`);
  console.log(`  Failed / Skipped: ${failCount}`);
  console.log(`  Target Domain: ${siteUrl}`);
  console.log('================================================================\n');
}

main().catch(err => {
  console.error('Fatal GSC submission error:', err);
  process.exit(1);
});
