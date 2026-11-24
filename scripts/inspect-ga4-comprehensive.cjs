const fs = require('fs');
const crypto = require('crypto');
const https = require('https');

async function getAccessToken(key) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claimSet = {
    iss: key.client_email,
    scope: 'https://www.googleapis.com/auth/analytics.readonly',
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

function runGa4Report(endpoint, token, body) {
  return new Promise((resolve, reject) => {
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

async function main() {
  console.log('========================================================================');
  console.log('TALENTXCEL GA4 COMPREHENSIVE INTELLIGENCE AUDIT');
  console.log('Property ID: 499367883 (TalentXcel Services)');
  console.log('Timestamp:  ', new Date().toISOString());
  console.log('========================================================================\n');

  const key = JSON.parse(fs.readFileSync('gsc-service-account.json', 'utf8'));
  const token = await getAccessToken(key);
  const propertyId = '499367883';

  // 1. Realtime Active Users & Pages (Last 30 Minutes)
  console.log('--- 1. Realtime Active Pages & Traffic (Last 30 Min) ---');
  const realtimePages = await runGa4Report(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runRealtimeReport`,
    token,
    {
      dimensions: [{ name: 'unifiedScreenName' }],
      metrics: [{ name: 'activeUsers' }]
    }
  );
  if (realtimePages.data.rows) {
    realtimePages.data.rows.forEach(r => {
      console.log(`  - Page: "${r.dimensionValues[0].value}" | Active Users: ${r.metricValues[0].value}`);
    });
  } else {
    console.log('  No active pages in realtime.');
  }

  // 2. Realtime Events Stream
  console.log('\n--- 2. Realtime Event Stream (Last 30 Min) ---');
  const realtimeEvents = await runGa4Report(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runRealtimeReport`,
    token,
    {
      dimensions: [{ name: 'eventName' }],
      metrics: [{ name: 'eventCount' }]
    }
  );
  if (realtimeEvents.data.rows) {
    realtimeEvents.data.rows.forEach(r => {
      console.log(`  - Event: "${r.dimensionValues[0].value}" | Count: ${r.metricValues[0].value}`);
    });
  } else {
    console.log('  No events in realtime.');
  }

  // 3. Realtime Geographic Distribution
  console.log('\n--- 3. Realtime Geographic Location ---');
  const realtimeGeo = await runGa4Report(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runRealtimeReport`,
    token,
    {
      dimensions: [{ name: 'country' }, { name: 'city' }],
      metrics: [{ name: 'activeUsers' }]
    }
  );
  if (realtimeGeo.data.rows) {
    realtimeGeo.data.rows.forEach(r => {
      console.log(`  - Location: ${r.dimensionValues[1].value}, ${r.dimensionValues[0].value} | Users: ${r.metricValues[0].value}`);
    });
  }

  // 4. Historical Overview (Last 28 Days)
  console.log('\n--- 4. Historical Overview (Last 28 Days: 2026-10-27 to 2026-11-23) ---');
  const historicalOverview = await runGa4Report(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    token,
    {
      dateRanges: [{ startDate: '28daysAgo', endDate: 'yesterday' }],
      metrics: [
        { name: 'activeUsers' },
        { name: 'newUsers' },
        { name: 'sessions' },
        { name: 'screenPageViews' },
        { name: 'bounceRate' },
        { name: 'averageSessionDuration' }
      ]
    }
  );
  if (historicalOverview.data.rows && historicalOverview.data.rows[0]) {
    const m = historicalOverview.data.rows[0].metricValues;
    console.log(`  - Total Active Users: ${m[0].value}`);
    console.log(`  - New Users:          ${m[1].value}`);
    console.log(`  - Sessions:           ${m[2].value}`);
    console.log(`  - Screen Page Views:  ${m[3].value}`);
    console.log(`  - Bounce Rate:        ${(parseFloat(m[4].value) * 100).toFixed(1)}%`);
    console.log(`  - Avg Session Duration: ${(parseFloat(m[5].value)).toFixed(1)} seconds`);
  } else {
    console.log('  Historical report response:', JSON.stringify(historicalOverview.data));
  }

  // 5. Historical Daily Active Users
  console.log('\n--- 5. Daily Active Users Trend (Last 14 Days) ---');
  const dailyUsers = await runGa4Report(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    token,
    {
      dateRanges: [{ startDate: '14daysAgo', endDate: 'yesterday' }],
      dimensions: [{ name: 'date' }],
      metrics: [{ name: 'activeUsers' }, { name: 'sessions' }, { name: 'screenPageViews' }],
      orderBys: [{ dimension: { dimensionName: 'date' }, desc: false }]
    }
  );
  if (dailyUsers.data.rows) {
    dailyUsers.data.rows.forEach(r => {
      const d = r.dimensionValues[0].value;
      const formattedDate = `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`;
      console.log(`  - ${formattedDate}: ${r.metricValues[0].value} users | ${r.metricValues[1].value} sessions | ${r.metricValues[2].value} pageviews`);
    });
  }

  // 6. Historical Top Events
  console.log('\n--- 6. Historical Event Counts (Last 28 Days) ---');
  const historicalEvents = await runGa4Report(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    token,
    {
      dateRanges: [{ startDate: '28daysAgo', endDate: 'yesterday' }],
      dimensions: [{ name: 'eventName' }],
      metrics: [{ name: 'eventCount' }, { name: 'totalUsers' }],
      orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
      limit: 20
    }
  );
  if (historicalEvents.data.rows) {
    historicalEvents.data.rows.forEach(r => {
      console.log(`  - Event: "${r.dimensionValues[0].value}": ${r.metricValues[0].value} events (${r.metricValues[1].value} users)`);
    });
  }

  // 7. Top Acquisition Channels / Sources
  console.log('\n--- 7. Traffic Acquisition Channels (Last 28 Days) ---');
  const trafficChannels = await runGa4Report(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    token,
    {
      dateRanges: [{ startDate: '28daysAgo', endDate: 'yesterday' }],
      dimensions: [{ name: 'sessionDefaultChannelGroup' }, { name: 'sessionSourceMedium' }],
      metrics: [{ name: 'sessions' }, { name: 'activeUsers' }, { name: 'conversions' }],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 15
    }
  );
  if (trafficChannels.data.rows) {
    trafficChannels.data.rows.forEach(r => {
      console.log(`  - Channel: ${r.dimensionValues[0].value} (${r.dimensionValues[1].value}) | Sessions: ${r.metricValues[0].value} | Users: ${r.metricValues[1].value}`);
    });
  }

  // 8. Top 15 Most Visited Pages
  console.log('\n--- 8. Top 15 Most Visited Pages (Last 28 Days) ---');
  const topPages = await runGa4Report(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    token,
    {
      dateRanges: [{ startDate: '28daysAgo', endDate: 'yesterday' }],
      dimensions: [{ name: 'pagePath' }],
      metrics: [{ name: 'screenPageViews' }, { name: 'activeUsers' }],
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit: 15
    }
  );
  if (topPages.data.rows) {
    topPages.data.rows.forEach(r => {
      console.log(`  - Page: "${r.dimensionValues[0].value}" | Views: ${r.metricValues[0].value} | Users: ${r.metricValues[1].value}`);
    });
  }

  console.log('\n========================================================================');
  console.log('✅ GA4 AUDIT COMPLETE!');
  console.log('========================================================================');
}

main().catch(console.error);
