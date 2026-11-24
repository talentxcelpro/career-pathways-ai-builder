const fs = require('fs');
const crypto = require('crypto');
const https = require('https');
const path = require('path');

async function getAccessToken(key) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claimSet = {
    iss: key.client_email,
    scope: 'https://www.googleapis.com/auth/webmasters.readonly',
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
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function querySearchAnalytics(siteUrl, token, body) {
  return new Promise((resolve, reject) => {
    const endpoint = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`;
    const req = https.request(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data || '{}') });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    req.on('error', reject);
    req.write(JSON.stringify(body));
    req.end();
  });
}

async function fetchPaginated(siteUrl, token, dimensions, startDate, endDate, maxRows = 25000) {
  let allRows = [];
  let startRow = 0;
  const rowLimit = 5000;

  while (startRow < maxRows) {
    const res = await querySearchAnalytics(siteUrl, token, {
      startDate,
      endDate,
      dimensions,
      rowLimit,
      startRow
    });

    const rows = res.data?.rows || [];
    if (rows.length === 0) break;
    allRows.push(...rows);
    if (rows.length < rowLimit) break;
    startRow += rowLimit;
  }
  return allRows;
}

async function extractCompleteGSC() {
  console.log('================================================================');
  console.log('TALENTXCEL FULL GOOGLE SEARCH CONSOLE EXTRACTION PIPELINE');
  console.log('Target Site: https://talentxcel.in/');
  console.log('Timestamp:', new Date().toISOString());
  console.log('================================================================\n');

  const key = JSON.parse(fs.readFileSync('gsc-service-account.json', 'utf8'));
  const token = await getAccessToken(key);
  const siteUrl = 'https://talentxcel.in/';

  // 16-month maximum historical window supported by GSC API
  const endDate = '2026-11-22';
  const startDate = '2025-10-01'; // 14 months

  console.log(`1. Extracting overall metrics for property (${startDate} to ${endDate})...`);
  const overallRes = await querySearchAnalytics(siteUrl, token, {
    startDate,
    endDate,
    aggregationType: 'byProperty'
  });
  const overall = overallRes.data.rows?.[0] || {};
  console.log('   ✓ Overall totals:', overall);

  console.log('2. Extracting queries (paginated)...');
  const queries = await fetchPaginated(siteUrl, token, ['query'], startDate, endDate);
  console.log(`   ✓ Total unique queries retrieved: ${queries.length}`);

  console.log('3. Extracting pages (paginated)...');
  const pages = await fetchPaginated(siteUrl, token, ['page'], startDate, endDate);
  console.log(`   ✓ Total unique pages retrieved: ${pages.length}`);

  console.log('4. Extracting query + page pairs (paginated)...');
  const queryPages = await fetchPaginated(siteUrl, token, ['query', 'page'], startDate, endDate);
  console.log(`   ✓ Total query-page combinations retrieved: ${queryPages.length}`);

  console.log('5. Extracting countries...');
  const countries = await fetchPaginated(siteUrl, token, ['country'], startDate, endDate);
  console.log(`   ✓ Total countries with search demand: ${countries.length}`);

  console.log('6. Extracting devices...');
  const devices = await fetchPaginated(siteUrl, token, ['device'], startDate, endDate);
  console.log(`   ✓ Total device segments: ${devices.length}`);

  console.log('7. Extracting search appearances...');
  const searchAppearances = await fetchPaginated(siteUrl, token, ['searchAppearance'], startDate, endDate);
  console.log(`   ✓ Total search appearances: ${searchAppearances.length}`);

  console.log('8. Extracting daily timeline trends...');
  const dates = await fetchPaginated(siteUrl, token, ['date'], startDate, endDate);
  console.log(`   ✓ Total days with search timeline: ${dates.length}`);

  // Branded vs Non-Branded classification
  let brandedClicks = 0;
  let brandedImpressions = 0;
  let nonBrandedClicks = 0;
  let nonBrandedImpressions = 0;
  const brandRegex = /talent\s*xcel|talentxcel|talentexcel/i;

  const categorizedQueries = queries.map(q => {
    const queryText = q.keys[0];
    const isBranded = brandRegex.test(queryText);
    if (isBranded) {
      brandedClicks += q.clicks;
      brandedImpressions += q.impressions;
    } else {
      nonBrandedClicks += q.clicks;
      nonBrandedImpressions += q.impressions;
    }
    return {
      query: queryText,
      clicks: q.clicks,
      impressions: q.impressions,
      ctr: q.ctr,
      position: q.position,
      isBranded
    };
  });

  // Monthly trends aggregation from dates
  const monthlyTrendsMap = {};
  dates.forEach(d => {
    const month = d.keys[0].slice(0, 7); // YYYY-MM
    if (!monthlyTrendsMap[month]) {
      monthlyTrendsMap[month] = { clicks: 0, impressions: 0, days: 0 };
    }
    monthlyTrendsMap[month].clicks += d.clicks;
    monthlyTrendsMap[month].impressions += d.impressions;
    monthlyTrendsMap[month].days += 1;
  });

  const monthlyTrends = Object.entries(monthlyTrendsMap).map(([month, stat]) => ({
    month,
    clicks: stat.clicks,
    impressions: stat.impressions,
    ctr: stat.impressions > 0 ? stat.clicks / stat.impressions : 0,
    dailyAverageClicks: (stat.clicks / stat.days).toFixed(1),
    dailyAverageImpressions: (stat.impressions / stat.days).toFixed(1)
  })).sort((a, b) => a.month.localeCompare(b.month));

  const dataset = {
    metadata: {
      extractedAt: new Date().toISOString(),
      siteUrl,
      dateRange: { startDate, endDate },
      totalQueries: queries.length,
      totalPages: pages.length,
      totalQueryPagePairs: queryPages.length,
      totalCountries: countries.length
    },
    overallTotals: overall,
    brandSplit: {
      branded: { clicks: brandedClicks, impressions: brandedImpressions },
      nonBranded: { clicks: nonBrandedClicks, impressions: nonBrandedImpressions },
      brandedClicksPct: (brandedClicks / (brandedClicks + nonBrandedClicks || 1) * 100).toFixed(1),
      nonBrandedClicksPct: (nonBrandedClicks / (brandedClicks + nonBrandedClicks || 1) * 100).toFixed(1)
    },
    devices: devices.map(d => ({ device: d.keys[0], clicks: d.clicks, impressions: d.impressions, ctr: d.ctr, position: d.position })),
    countries: countries.map(c => ({ country: c.keys[0], clicks: c.clicks, impressions: c.impressions, ctr: c.ctr, position: c.position })),
    searchAppearances: searchAppearances.map(s => ({ appearance: s.keys[0], clicks: s.clicks, impressions: s.impressions, ctr: s.ctr, position: s.position })),
    monthlyTrends,
    dailyTrends: dates.map(d => ({ date: d.keys[0], clicks: d.clicks, impressions: d.impressions, ctr: d.ctr, position: d.position })),
    queries: categorizedQueries,
    pages: pages.map(p => ({ page: p.keys[0], clicks: p.clicks, impressions: p.impressions, ctr: p.ctr, position: p.position })),
    queryPagePairs: queryPages.map(qp => ({ query: qp.keys[0], page: qp.keys[1], clicks: qp.clicks, impressions: qp.impressions, ctr: qp.ctr, position: qp.position }))
  };

  const outPath = path.join(__dirname, '..', 'scratch', 'unified_gsc_demand_intelligence.json');
  fs.writeFileSync(outPath, JSON.stringify(dataset, null, 2), 'utf8');
  console.log(`\n✅ Unified Demand Intelligence Dataset saved to: ${outPath} (${(fs.statSync(outPath).size / 1024).toFixed(1)} KB)`);
  console.log('================================================================');
}

extractCompleteGSC().catch(console.error);
