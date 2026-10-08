import * as fs from 'fs';
import { createSign } from 'crypto';

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

async function testSubmitSitemap() {
  const token = await getAccessToken();
  const siteUrl = 'sc-domain:salary.talentxcel.in';
  const sitemapUrl = 'https://salary.talentxcel.in/sitemap.xml';

  console.log(`Submitting sitemap ${sitemapUrl} to ${siteUrl}...`);
  const res = await fetch(`https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/sitemaps/${encodeURIComponent(sitemapUrl)}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
  });

  console.log(`Response Status: ${res.status} ${res.statusText}`);
  const text = await res.text();
  console.log(`Response Body: ${text || '(empty success)'}`);
}

testSubmitSitemap().catch(console.error);
