// scripts/google-indexing-submit.ts
// Production Google Indexing API Execution Script for TalentXcel
// Service Account: antigravity-search@talentxcel-login.iam.gserviceaccount.com

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

  const domains = ['https://talentxcel.in', 'https://talentxcel.com'];

  const relativePaths = [
    '/',
    '/rankings',
    '/rankings/ai-products',
    '/rankings/ai-products/global',
    '/rankings/ai-products/emerging',
    '/rankings/ai-products/india',
    '/rankings/ai-products/usa',
    '/rankings/ai-products/uae',
    '/rankings/ai-products/uk',
    '/rankings/ai-products/singapore',
    '/rankings/ai-products/canada',
    '/rankings/ai-products/australia',
    '/claim1/enter',
    '/claim1/watch',
    '/jobs',
    '/colleges',
    '/colleges/global-programs',
    '/colleges/scholarships',
    '/colleges/pathway',
    '/colleges/state/maharashtra',
    '/colleges/state/delhi',
    '/colleges/state/karnataka',
    '/colleges/state/tamil-nadu',
    '/colleges/state/telangana',
    '/colleges/exam/jee-advanced',
    '/colleges/exam/jee-main',
    '/colleges/exam/neet-ug',
    '/colleges/exam/cat',
    '/colleges/exam/gate',
    '/learning',
    '/passport',
    '/companies',
    '/news',
    '/roles/ai-engineer',
    '/roles/software-engineer',
    '/roles/data-scientist',
    '/roles/product-manager',
    '/skills/python',
    '/skills/machine-learning',
    '/skills/react',
  ];

  let successCount = 0;
  let errorCount = 0;

  for (const domain of domains) {
    console.log(`\n📡 Submitting priority URLs for domain: ${domain}...`);
    for (const p of relativePaths) {
      const fullUrl = `${domain}${p === '/' ? '/' : p}`;
      try {
        const res = await publishUrlToGoogle(fullUrl, accessToken, 'URL_UPDATED');
        const notifyTime = res.urlNotificationMetadata?.latestUpdate?.notifyTime || 'OK';
        console.log(`  ✓ [200 OK] ${fullUrl} (Notified: ${notifyTime})`);
        successCount++;
        // Minor delay to respect Google rate limits
        await new Promise((r) => setTimeout(r, 80));
      } catch (err: any) {
        console.warn(`  ⚠️ [GSC Permission / Domain Notice] ${fullUrl}: ${err.message}`);
        errorCount++;
      }
    }
  }

  console.log('\n================================================================');
  console.log(`🎉 Google Indexing Run Completed!`);
  console.log(`   - Successfully Pushed: ${successCount} URLs`);
  if (errorCount > 0) {
    console.log(`   - Domain/Permission Alerts: ${errorCount}`);
    console.log(`   👉 Reminder: In Google Search Console (search.google.com/search-console):`);
    console.log(`      Ensure ${serviceAccount.client_email} is added with 'Owner' permissions on both talentxcel.in and talentxcel.com properties.`);
  }
  console.log('================================================================\n');
}

runGoogleIndexingPipeline().catch(console.error);
