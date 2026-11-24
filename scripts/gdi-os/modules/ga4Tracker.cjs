const fs = require('fs');
const crypto = require('crypto');
const https = require('https');
const path = require('path');

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

function queryGa4(endpoint, token, body) {
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

async function measureGa4Traffic(propertyId = '499367883', dateRange = { startDate: '7daysAgo', endDate: 'today' }) {
  console.log('[Step 8] Measuring External Campaign Traffic in GA4...');
  const keyPath = path.join(__dirname, '..', '..', '..', 'gsc-service-account.json');
  const key = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
  const token = await getAccessToken(key);

  const report = await queryGa4(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    token,
    {
      dateRanges: [dateRange],
      dimensions: [
        { name: 'sessionSourceMedium' },
        { name: 'sessionCampaignName' }
      ],
      metrics: [
        { name: 'sessions' },
        { name: 'activeUsers' },
        { name: 'screenPageViews' },
        { name: 'bounceRate' },
        { name: 'averageSessionDuration' }
      ],
      limit: 50
    }
  );

  const rows = report.data?.rows || [];
  const campaigns = rows.map(r => ({
    sourceMedium: r.dimensionValues[0].value,
    campaign: r.dimensionValues[1].value,
    sessions: parseInt(r.metricValues[0].value, 10),
    activeUsers: parseInt(r.metricValues[1].value, 10),
    pageviews: parseInt(r.metricValues[2].value, 10),
    bounceRate: (parseFloat(r.metricValues[3].value) * 100).toFixed(1) + '%',
    avgDuration: parseFloat(r.metricValues[4].value).toFixed(1) + 's'
  }));

  console.log(`   ✓ Retrieved ${campaigns.length} external traffic sources from GA4.`);
  return campaigns;
}

module.exports = { measureGa4Traffic };
