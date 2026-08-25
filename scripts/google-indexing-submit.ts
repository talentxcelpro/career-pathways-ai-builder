// scripts/google-indexing-submit.ts
// Production Google Indexing API Execution Script for TalentXcel
// Service Account: indexing-api-publisher@talentxcel-indexing.iam.gserviceaccount.com (Owner in GSC)

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

interface ServiceAccountKey {
  client_email: string;
  private_key: string;
  project_id: string;
}

/**
 * Creates a JWT and exchanges it for a Google OAuth2 access token
 * using standard Node.js crypto.
 */
async function getGoogleAccessToken(serviceAccount: ServiceAccountKey): Promise<string> {
  const crypto = await import('crypto');

  const now = Math.floor(Date.now() / 1000);
  const header = {
    alg: 'RS256',
    typ: 'JWT',
  };

  const claimSet = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/indexing',
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

  if (!tokenResponse.ok) {
    const errorBody = await tokenResponse.text();
    throw new Error(`Google OAuth2 Token Exchange Failed (${tokenResponse.status}): ${errorBody}`);
  }

  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
}

/** Submit a URL to Google Indexing API */
async function publishUrlToGoogle(
  url: string,
  accessToken: string,
  type: 'URL_UPDATED' | 'URL_DELETED' = 'URL_UPDATED'
) {
  const endpoint = 'https://indexing.googleapis.com/v3/urlNotifications:publish';
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      url,
      type,
    }),
  });

  const body = await response.json();
  if (!response.ok) {
    throw new Error(body.error?.message || `HTTP ${response.status}`);
  }

  return body;
}

export async function runGoogleIndexingPipeline() {
  console.log('================================================================');
  console.log('🚀 TalentXcel Rapid Google Indexing API Automation Pipeline');
  console.log('================================================================\n');

  const keyPath = resolve('gcp-key.json');
  if (!existsSync(keyPath)) {
    throw new Error('gcp-key.json not found in root.');
  }

  const serviceAccount: ServiceAccountKey = JSON.parse(readFileSync(keyPath, 'utf-8'));
  console.log(`✓ Loaded GCP IAM Key: ${serviceAccount.client_email}`);
  console.log(`✓ GCP Project ID: ${serviceAccount.project_id}`);

  console.log('\n🔑 Generating OAuth2 JWT Token for Google Indexing Scope...');
  const accessToken = await getGoogleAccessToken(serviceAccount);
  console.log('✅ Google OAuth2 Bearer Access Token Acquired!\n');

  const domain = 'https://talentxcel.in';

  const relativePaths = [
    // 1. Core Platform & Entity
    '/',
    '/company/talentxcel',
    '/company/talentxcel-services',
    '/jobs',
    '/network',
    '/colleges',
    '/colleges/global-programs',
    '/colleges/scholarships',
    '/colleges/pathway',
    '/learning',
    '/resume',
    '/resume-builder',
    '/tools',
    '/employer',
    '/rankings',
    '/rankings/ai-products',
    '/claim1/enter',
    '/claim1/watch',

    // 2. All 10 Strategic Services
    '/services/ai-recruitment',
    '/services/staffing-recruitment',
    '/services/rpo',
    '/services/it-services',
    '/services/ai-solutions',
    '/services/corporate-training',
    '/services/career-services',
    '/services/resume-building',
    '/services/talent-management',
    '/services/job-placement',

    // 3. All 11 Topic Hubs
    '/topics/artificial-intelligence',
    '/topics/recruitment',
    '/topics/careers',
    '/topics/education',
    '/topics/technology',
    '/topics/leadership',
    '/topics/business',
    '/topics/resume-writing',
    '/topics/job-search',
    '/topics/interview-preparation',
    '/topics/future-of-work',

    // 4. Active Job Postings (Schema.org JobPosting)
    '/jobs/content-writer-chatr-charchat-talentxcel-services-noida-uttar-pradesh-india-1',
    '/jobs/marketing-executive-chatr-charchat-talentxcel-services-noida-uttar-pradesh-india-1',
    '/jobs/marketing-manager-chatr-charchat-talentxcel-services-noida-uttar-pradesh-india-1',
    '/jobs/sales-executive-chatr-charchat-talentxcel-services-noida-uttar-pradesh-india-1',
    '/jobs/b2b-sales-executive-chatr-charchat-talentxcel-services-noida-uttar-pradesh-india-1',
    '/jobs/customer-service-executive-chatr-charchat-talentxcel-services-noida-uttar-pradesh-india-1',

    // 5. Priority Tier-A Institutions
    '/colleges/indian-institute-of-technology-madras',
    '/colleges/indian-institute-of-technology-delhi',
    '/colleges/indian-institute-of-technology-bombay',
    '/colleges/indian-institute-of-technology-kanpur',
    '/colleges/indian-institute-of-technology-kharagpur',
    '/colleges/indian-institute-of-science-bangalore',
    '/colleges/indian-institute-of-management-ahmedabad',

    // 6. Public Network Posts
    '/post/718e7888-97cc-41ba-8a1a-88a6c063615d',
    '/post/f815fc92-e678-4785-98fe-e3c1d2030411',
    '/post/fda6e304-6f44-4458-9145-ed061ad04ecf',
    '/post/cc30c261-4d86-43ba-b7d7-b14e46a5facb',
    '/post/2a14422a-c698-465f-9a9f-ec265e393f82',

    // 7. Editorial News & Guides
    '/news/talentxcel-launches-ai-career-ecosystem-2026',
    '/news/talentxcel-unveils-resume-command-center-ats-intelligence',
    '/news/global-degrees-scholarships-and-career-pathway-feed',
    '/news/verified-providers-and-free-learning-certificates',
    '/news/india-tech-hiring-trends-2026-skills-over-pedigree',
  ];

  let successCount = 0;
  let errorCount = 0;

  console.log(`📡 Submitting ${relativePaths.length} priority production URLs to Google Indexing API...`);

  for (const p of relativePaths) {
    const fullUrl = `${domain}${p === '/' ? '/' : p}`;
    try {
      const res = await publishUrlToGoogle(fullUrl, accessToken, 'URL_UPDATED');
      const notifyTime = res.urlNotificationMetadata?.latestUpdate?.notifyTime || 'OK';
      console.log(`  ✓ [200 OK] ${fullUrl} (Notified: ${notifyTime})`);
      successCount++;
      // Minor delay to respect Google rate limits
      await new Promise((r) => setTimeout(r, 90));
    } catch (err: any) {
      console.warn(`  ⚠️ [Notice] ${fullUrl}: ${err.message}`);
      errorCount++;
    }
  }

  console.log('\n================================================================');
  console.log(`🎉 Google Indexing API Broadcast Completed!`);
  console.log(`   - Successfully Pushed: ${successCount} URLs`);
  console.log(`   - Alerts: ${errorCount}`);
  console.log('================================================================\n');
}

runGoogleIndexingPipeline().catch(console.error);
