const fs = require('fs');
const crypto = require('crypto');
const https = require('https');

async function getAccessToken(key) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claimSet = {
    iss: key.client_email,
    scope: 'https://www.googleapis.com/auth/webmasters https://www.googleapis.com/auth/webmasters.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  };

  const base64Url = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
  const unsignedToken = `${base64Url(header)}.${base64Url(claimSet)}`;

  const sign = crypto.createSign('RSA-SHA256');
  sign.update(unsignedToken);
  const signature = sign.sign(key.private_key, 'base64url');
  const jwt = `${unsignedToken}.${signature}`;

  return new Promise((resolve, reject) => {
    const postData = `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`;
    const req = https.request('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.access_token) resolve(parsed.access_token);
          else reject(new Error(JSON.stringify(parsed)));
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function gscQuery(siteUrl, token, body) {
  return new Promise((resolve, reject) => {
    const endpoint = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`;
    const postData = JSON.stringify(body);
    const req = https.request(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (e) {
          reject(new Error(`Failed to parse response: ${data.slice(0, 200)}`));
        }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function runCopilot() {
  console.log('=== GSC COPILOT TELEMETRY ENGINE ===');
  const keyFile = fs.existsSync('gsc-service-account.json') ? 'gsc-service-account.json' : 'gcp-key.json';
  const key = JSON.parse(fs.readFileSync(keyFile, 'utf8'));
  console.log(`Using credentials from: ${keyFile} (${key.client_email})`);

  const token = await getAccessToken(key);
  console.log('Authentication successful.');

  const siteUrl = 'https://talentxcel.in/';
  
  // Date range: last 28 days (excluding last 2-3 days which Google takes to finalize)
  const endDt = new Date();
  endDt.setDate(endDt.getDate() - 2);
  const endDate = endDt.toISOString().slice(0, 10);
  const startDt = new Date(endDt);
  startDt.setDate(startDt.getDate() - 28);
  const startDate = startDt.toISOString().slice(0, 10);

  console.log(`Analyzing GSC data from ${startDate} to ${endDate} for ${siteUrl}\n`);

  // 1. Overall Aggregates
  console.log('--- 1. OVERALL TOTALS (Last 28 Days) ---');
  const overallRes = await gscQuery(siteUrl, token, {
    startDate,
    endDate,
    rowLimit: 1
  });
  console.log('Overall totals response:', overallRes);

  // 2. Query breakdown
  console.log('\n--- 2. TOP QUERIES (By Impressions & Clicks) ---');
  const queryRes = await gscQuery(siteUrl, token, {
    startDate,
    endDate,
    dimensions: ['query'],
    rowLimit: 50
  });
  const queries = queryRes.rows || [];
  console.log(`Total active queries found: ${queries.length}`);
  if (queries.length > 0) {
    console.table(queries.slice(0, 20).map(q => ({
      query: q.keys[0],
      clicks: q.clicks,
      impressions: q.impressions,
      ctr: (q.ctr * 100).toFixed(2) + '%',
      avgPosition: q.position.toFixed(1)
    })));
  }

  // 3. Striking Distance (Position 8 to 25, high impressions)
  console.log('\n--- 3. STRIKING DISTANCE OPPORTUNITIES (Position 8.0 - 25.0) ---');
  const strikingDistance = queries.filter(q => q.position >= 8.0 && q.position <= 25.0 && q.impressions >= 10);
  strikingDistance.sort((a, b) => b.impressions - a.impressions);
  console.log(`Found ${strikingDistance.length} striking distance queries`);
  if (strikingDistance.length > 0) {
    console.table(strikingDistance.slice(0, 15).map(q => ({
      query: q.keys[0],
      impressions: q.impressions,
      clicks: q.clicks,
      position: q.position.toFixed(1),
      potentialClicksIfTop3: Math.round(q.impressions * 0.12)
    })));
  }

  // 4. Top Landing Pages
  console.log('\n--- 4. TOP LANDING PAGES ---');
  const pageRes = await gscQuery(siteUrl, token, {
    startDate,
    endDate,
    dimensions: ['page'],
    rowLimit: 50
  });
  const pages = pageRes.rows || [];
  console.log(`Total active pages found: ${pages.length}`);
  if (pages.length > 0) {
    console.table(pages.slice(0, 20).map(p => ({
      page: p.keys[0].replace('https://talentxcel.in', ''),
      clicks: p.clicks,
      impressions: p.impressions,
      ctr: (p.ctr * 100).toFixed(2) + '%',
      avgPos: p.position.toFixed(1)
    })));
  }

  // 5. Country breakdown (Global vs Domestic)
  console.log('\n--- 5. GLOBAL VS DOMESTIC SEARCH DEMAND (By Country) ---');
  const countryRes = await gscQuery(siteUrl, token, {
    startDate,
    endDate,
    dimensions: ['country'],
    rowLimit: 50
  });
  const countries = countryRes.rows || [];
  console.log(`Total countries with impressions: ${countries.length}`);
  if (countries.length > 0) {
    console.table(countries.slice(0, 15).map(c => ({
      country: c.keys[0].toUpperCase(),
      clicks: c.clicks,
      impressions: c.impressions,
      ctr: (c.ctr * 100).toFixed(2) + '%',
      avgPos: c.position.toFixed(1)
    })));
  }

  // 6. Search Appearance (Rich Results / Google for Jobs)
  console.log('\n--- 6. SEARCH APPEARANCE (Rich Results / Jobs) ---');
  const appearanceRes = await gscQuery(siteUrl, token, {
    startDate,
    endDate,
    dimensions: ['searchAppearance'],
    rowLimit: 20
  });
  const appearances = appearanceRes.rows || [];
  console.log(`Search appearances found: ${appearances.length}`);
  if (appearances.length > 0) {
    console.table(appearances.map(a => ({
      type: a.keys[0],
      clicks: a.clicks,
      impressions: a.impressions,
      ctr: (a.ctr * 100).toFixed(2) + '%'
    })));
  }

  // Save report to disk
  const report = {
    generatedAt: new Date().toISOString(),
    siteUrl,
    dateRange: { startDate, endDate },
    overall: overallRes,
    topQueries: queries.slice(0, 50),
    strikingDistance: strikingDistance.slice(0, 50),
    topPages: pages.slice(0, 50),
    countries: countries.slice(0, 30),
    searchAppearances: appearances
  };

  fs.writeFileSync('gsc_copilot_snapshot.json', JSON.stringify(report, null, 2));
  console.log('\nFull snapshot written to gsc_copilot_snapshot.json');
}

runCopilot().catch(err => {
  console.error('Copilot run failed:', err);
  process.exit(1);
});
