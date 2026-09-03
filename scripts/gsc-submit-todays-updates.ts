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

  const keyPath = resolve('gcp-key.json');
  if (!existsSync(keyPath)) {
    throw new Error('gcp-key.json not found');
  }

  const serviceAccount: ServiceAccountKey = JSON.parse(readFileSync(keyPath, 'utf-8'));
  console.log(`✓ Authenticated Service Account: ${serviceAccount.client_email}`);

  const token = await getGoogleAccessToken(serviceAccount);
  console.log('✓ Acquired Google OAuth2 Access Token for GSC & Indexing API\n');

  const siteUrl = 'https://talentxcel.in/';

  // 1. Sitemaps to sync/submit
  const sitemaps = [
    'https://talentxcel.in/sitemap.xml',
    'https://talentxcel.in/sitemap-companies.xml',
    'https://talentxcel.in/sitemap-global-programs.xml',
    'https://talentxcel.in/sitemap-scholarships.xml',
    'https://talentxcel.in/sitemap-rankings.xml',
    'https://talentxcel.in/sitemap-services.xml',
    'https://talentxcel.in/sitemap-learning.xml',
    'https://talentxcel.in/sitemap-jobs.xml',
    'https://talentxcel.in/sitemap-colleges.xml'
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

  // 2. Today's URLs to publish to Google Indexing API
  const todaysUrls = [
    // Companies & Employer Pages (Updated today with Google Favicon logos)
    'https://talentxcel.in/companies',
    'https://talentxcel.in/company/chatr-chat',
    'https://talentxcel.in/company/savantis-solutions',
    'https://talentxcel.in/company/talentxcel-services',
    'https://talentxcel.in/company/talentxcel-enterprise',

    // Network Directory & Discovery (Updated today with tier ranking and real verified data)
    'https://talentxcel.in/network',
    'https://talentxcel.in/network/discover',
    'https://talentxcel.in/network/verified',
    'https://talentxcel.in/network/people',

    // SEO Personal Profile Slugs (First-middle-last & first-last format)
    'https://talentxcel.in/profile/arshid-hussain-wani',
    'https://talentxcel.in/profile/priyanka-dhangar',
    'https://talentxcel.in/profile/vishwajeet-nayak',
    'https://talentxcel.in/profile/jaismin-maurya',
    'https://talentxcel.in/profile/dimple-dhangar',
    'https://talentxcel.in/profile/gaurav-bhatia',
    'https://talentxcel.in/profile/talentxcel-services',

    // Global Education & Programs
    'https://talentxcel.in/colleges/global-programs',
    'https://talentxcel.in/colleges/scholarships',
    'https://talentxcel.in/colleges/pathway',

    // Claim #1 Leaderboard & Watch
    'https://talentxcel.in/rankings',
    'https://talentxcel.in/rankings/ai-products',
    'https://talentxcel.in/claim1/enter',
    'https://talentxcel.in/claim1/watch'
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
