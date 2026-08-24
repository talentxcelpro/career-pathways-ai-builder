// scripts/gsc-health-check.ts
// Queries Google Search Console API directly using our GCP Service Account key

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
    scope: 'https://www.googleapis.com/auth/webmasters https://www.googleapis.com/auth/webmasters.readonly https://www.googleapis.com/auth/indexing',
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

async function main() {
  console.log('================================================================');
  console.log('🔍 TalentXcel Direct Google Search Console API Health Check');
  console.log('================================================================\n');

  const keyPath = resolve('gcp-key.json');
  if (!existsSync(keyPath)) throw new Error('gcp-key.json not found');

  const serviceAccount: ServiceAccountKey = JSON.parse(readFileSync(keyPath, 'utf-8'));
  console.log(`✓ Service Account: ${serviceAccount.client_email}`);

  const token = await getGoogleAccessToken(serviceAccount);
  console.log('✓ OAuth2 Access Token acquired for Webmasters & Indexing API\n');

  // 1. List sites
  console.log('📡 Fetching Verified Sites from Google Search Console...');
  const sitesRes = await fetch('https://www.googleapis.com/webmasters/v3/sites', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const sitesData = await sitesRes.json();
  console.log('Sites response:', JSON.stringify(sitesData, null, 2));

  // 2. Fetch sitemaps for talentxcel.in
  const siteUrl = 'https://talentxcel.in/';
  console.log(`\n📡 Fetching Sitemaps for ${siteUrl}...`);
  const sitemapsRes = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/sitemaps`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const sitemapsData = await sitemapsRes.json();
  console.log('Sitemaps response:', JSON.stringify(sitemapsData, null, 2));

  // 3. Query Search Analytics (Impressions, Clicks, Top Queries)
  console.log(`\n📊 Querying Top Search Performance & Analytics for ${siteUrl}...`);
  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];

  const analyticsRes = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      startDate: '2026-07-24',
      endDate: '2026-08-24',
      dimensions: ['query', 'page'],
      rowLimit: 20,
    })
  });
  const analyticsData = await analyticsRes.json();
  console.log('Search Analytics Top Queries & Pages:', JSON.stringify(analyticsData, null, 2));
}

main().catch(console.error);
