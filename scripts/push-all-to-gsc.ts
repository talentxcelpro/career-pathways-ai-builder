// scripts/push-all-to-gsc.ts
// Submits all authoritative segmented sitemaps and individual canonical Job URLs to Google Search Console & Google Indexing API

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

  const keyPath = resolve('gcp-key.json');
  if (!existsSync(keyPath)) {
    throw new Error('gcp-key.json not found in root directory');
  }

  const serviceAccount: ServiceAccountKey = JSON.parse(readFileSync(keyPath, 'utf-8'));
  console.log(`✓ Authenticated Service Account: ${serviceAccount.client_email}`);

  const token = await getGoogleAccessToken(serviceAccount);
  console.log('✓ Acquired Google OAuth2 Access Token for Webmasters & Indexing API\n');

  const siteUrl = 'https://talentxcel.in/';

  // 1. All authoritative segmented sitemaps
  const sitemaps = [
    'https://talentxcel.in/sitemap.xml',
    'https://talentxcel.in/sitemap-base.xml',
    'https://talentxcel.in/sitemap-jobs.xml',
    'https://talentxcel.in/sitemap-colleges.xml',
    'https://talentxcel.in/sitemap-companies.xml',
    'https://talentxcel.in/sitemap-global-programs.xml',
    'https://talentxcel.in/sitemap-scholarships.xml',
    'https://talentxcel.in/sitemap-rankings.xml',
    'https://talentxcel.in/sitemap-learning.xml',
    'https://talentxcel.in/sitemap-services.xml',
    'https://talentxcel.in/sitemap-career-paths.xml',
    'https://talentxcel.in/sitemap-articles.xml',
    'https://talentxcel.in/sitemap-posts.xml',
    'https://talentxcel.in/sitemap-topics.xml',
    'https://talentxcel.in/sitemap-industries.xml',
    'https://talentxcel.in/sitemap-locations.xml',
    'https://talentxcel.in/sitemap-resources.xml',
    'https://talentxcel.in/sitemap-tools.xml',
    'https://talentxcel.in/sitemap-skills-1.xml',
    'https://talentxcel.in/sitemap-job-roles-1.xml',
    'https://talentxcel.in/sitemap-job-roles-2.xml',
    'https://talentxcel.in/sitemap-job-experience-1.xml',
    'https://talentxcel.in/sitemap-job-experience-2.xml',
    'https://talentxcel.in/sitemap-job-experience-3.xml',
    'https://talentxcel.in/sitemap-job-experience-4.xml',
    'https://talentxcel.in/sitemap-companies-hiring.xml',
  ];

  console.log(`📡 1. Submitting ${sitemaps.length} Sitemaps to Google Search Console...`);
  let sitemapSuccess = 0;
  let sitemapFail = 0;

  for (const sm of sitemaps) {
    try {
      const res = await submitSitemapToGsc(siteUrl, sm, token);
      if (res.ok || res.status === 200 || res.status === 204) {
        console.log(`  ✅ [${res.status}] Submitted sitemap: ${sm}`);
        sitemapSuccess++;
      } else {
        console.log(`  ⚠️ [${res.status}] Failed sitemap: ${sm}`);
        sitemapFail++;
      }
      await new Promise(r => setTimeout(r, 100)); // Respect Google API rate limits
    } catch (e: any) {
      console.log(`  ❌ Error for ${sm}: ${e?.message}`);
      sitemapFail++;
    }
  }

  // 2. Strict Google Indexing API submission (JobPosting URLs Only)
  const canonicalJobUrls = [
    'https://talentxcel.in/jobs/content-writer-chatr-charchat-talentxcel-services-noida-uttar-pradesh-india-1',
    'https://talentxcel.in/jobs/marketing-executive-chatr-charchat-talentxcel-services-noida-uttar-pradesh-india-1',
    'https://talentxcel.in/jobs/marketing-manager-chatr-charchat-talentxcel-services-noida-uttar-pradesh-india-1',
    'https://talentxcel.in/jobs/sales-executive-chatr-charchat-talentxcel-services-noida-uttar-pradesh-india-1',
    'https://talentxcel.in/jobs/b2b-sales-executive-chatr-charchat-talentxcel-services-noida-uttar-pradesh-india-1',
    'https://talentxcel.in/jobs/customer-service-executive-chatr-charchat-talentxcel-services-noida-uttar-pradesh-india-1',
  ];

  console.log(`\n🚀 2. Submitting ${canonicalJobUrls.length} Canonical Job URLs to Google Indexing API (JobPosting Only)...`);
  let jobSuccess = 0;
  let jobFail = 0;

  for (const jobUrl of canonicalJobUrls) {
    try {
      const res = await submitJobUrlToIndexingApi(jobUrl, token);
      if (res.ok) {
        console.log(`  ✅ [200 OK] Dispatched JobPosting: ${jobUrl}`);
        jobSuccess++;
      } else {
        console.log(`  ⚠️ [${res.status}] Failed ${jobUrl}: ${JSON.stringify(res.data)}`);
        jobFail++;
      }
      await new Promise(r => setTimeout(r, 150));
    } catch (e: any) {
      console.log(`  ❌ Error publishing ${jobUrl}: ${e?.message}`);
      jobFail++;
    }
  }

  console.log('\n================================================================');
  console.log('📊 GOOGLE SEARCH CONSOLE & INDEXING DISPATCH SUMMARY:');
  console.log(`  Site Property: ${siteUrl}`);
  console.log(`  Sitemaps Submitted to GSC: ${sitemapSuccess} / ${sitemaps.length}`);
  console.log(`  JobPosting URLs Dispatched to Indexing API: ${jobSuccess} / ${canonicalJobUrls.length}`);
  console.log('================================================================\n');
}

main().catch(err => {
  console.error('Fatal GSC submission error:', err);
  process.exit(1);
});
