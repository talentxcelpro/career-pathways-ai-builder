import * as fs from 'fs';
import * as path from 'path';
import { createSign } from 'crypto';
// Load .env.local manually if exists
if (fs.existsSync('.env.local')) {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  for (const line of envContent.split('\n')) {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let val = match[2].trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    }
  }
}

async function testGSC() {
  console.log('Testing GSC Connection...');
  
  let serviceEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  let serviceKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!serviceEmail || !serviceKey) {
    const saPath = path.resolve(process.cwd(), 'gsc-service-account.json');
    if (fs.existsSync(saPath)) {
      console.log('Reading from gsc-service-account.json...');
      const sa = JSON.parse(fs.readFileSync(saPath, 'utf8'));
      serviceEmail = sa.client_email;
      serviceKey = sa.private_key;
    }
  }

  console.log('Service Email:', serviceEmail);
  if (!serviceEmail || !serviceKey) {
    throw new Error('No service account credentials found');
  }

  const SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';
  const now = Math.floor(Date.now() / 1000);

  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    iss: serviceEmail,
    scope: SCOPE,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  })).toString('base64url');

  const sign = createSign('RSA-SHA256');
  sign.update(`${header}.${payload}`);
  const signature = sign.sign(serviceKey, 'base64url');
  const jwt = `${header}.${payload}.${signature}`;

  console.log('Exchanging JWT for access token...');
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  if (!tokenResponse.ok) {
    const err = await tokenResponse.text();
    console.error('Token exchange failed:', err);
    return;
  }

  const tokenData = await tokenResponse.json() as { access_token: string };
  console.log('Access token acquired successfully!');

  // Now query sites list
  console.log('Querying Google Search Console sites list...');
  const sitesRes = await fetch('https://www.googleapis.com/webmasters/v3/sites', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });

  console.log('Sites response status:', sitesRes.status);
  const sitesData = await sitesRes.json();
  console.log('Sites response:', JSON.stringify(sitesData, null, 2));

  // Query search analytics for https://talentxcel.in/
  const siteUrl = 'https://talentxcel.in/';
  console.log(`Querying Search Analytics for ${siteUrl}...`);
  
  const endDt = new Date();
  endDt.setDate(endDt.getDate() - 3);
  const endDate = endDt.toISOString().slice(0, 10);
  const startDt = new Date(endDt);
  startDt.setDate(startDt.getDate() - 7);
  const startDate = startDt.toISOString().slice(0, 10);

  const queryRes = await fetch(
    `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startDate,
        endDate,
        dimensions: ['query'],
        rowLimit: 10,
      }),
    }
  );

  console.log('Search Analytics response status:', queryRes.status);
  const queryData = await queryRes.json();
  console.log('Search Analytics data sample:', JSON.stringify(queryData, null, 2));
}

testGSC().catch(err => {
  console.error('Error in testGSC:', err);
});
