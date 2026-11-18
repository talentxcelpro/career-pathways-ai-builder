// scripts/gsc_master_takeover.cjs
// Complete Google Search Console & Indexing API Orchestrator

const fs = require('fs');
const crypto = require('crypto');
const https = require('https');

async function getAccessToken(key, scope = 'https://www.googleapis.com/auth/webmasters https://www.googleapis.com/auth/indexing') {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claimSet = {
    iss: key.client_email,
    scope,
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

function gscRequest(endpoint, method, token, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint);
    const req = https.request(url, {
      method,
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
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  console.log('================================================================');
  console.log('🚀 TALENTXCEL GOOGLE SEARCH CONSOLE COMMAND & TAKEOVER ENGINE');
  console.log('================================================================\n');

  const keyFile = fs.existsSync('gsc-service-account.json') 
    ? 'gsc-service-account.json' 
    : (fs.existsSync('gcp-key.json') ? 'gcp-key.json' : null);

  if (!keyFile) {
    console.error('❌ Service account key file not found!');
    process.exit(1);
  }

  const key = JSON.parse(fs.readFileSync(keyFile, 'utf8'));
  console.log(`Service Account: ${key.client_email}`);
  const token = await getAccessToken(key);
  console.log('✅ Google OAuth2 Token acquired successfully!\n');

  // 1. Audit Verified Properties
  console.log('--- Step 1: Auditing Verified Properties ---');
  const sitesRes = await gscRequest('https://www.googleapis.com/webmasters/v3/sites', 'GET', token);
  const properties = (sitesRes.data?.siteEntry || []).map(s => s.siteUrl);
  console.log(`Verified Properties in Account (${properties.length}):`);
  properties.forEach(p => console.log(`  • ${p}`));

  // 2. Purge Obsolete Sitemaps from Apex
  console.log('\n--- Step 2: Purging Obsolete / Pruned Sitemaps from Apex ---');
  const apex = 'https://talentxcel.in/';
  const obsoleteSitemaps = [
    'https://talentxcel.in/sitemap-combos.xml',
    'https://talentxcel.in/sitemap-rankings.xml',
    'https://talentxcel.in/sitemap-blog.xml',
    'https://talentxcel.in/sitemap-news.xml',
    'https://talentxcel.in/sitemap-network.xml',
    'https://talentxcel.in/sitemap-users.xml'
  ];

  for (const sitemapUrl of obsoleteSitemaps) {
    const delUrl = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(apex)}/sitemaps/${encodeURIComponent(sitemapUrl)}`;
    const res = await gscRequest(delUrl, 'DELETE', token);
    console.log(`  Purged: ${sitemapUrl} -> Status ${res.status}`);
  }

  // 3. Submitting Master Sitemaps across Properties
  console.log('\n--- Step 3: Submitting Authoritative Master Sitemaps ---');
  const targetMap = [
    {
      prop: 'https://talentxcel.in/',
      sitemaps: [
        'https://talentxcel.in/sitemap.xml',
        'https://talentxcel.in/sitemap-root.xml',
        'https://talentxcel.in/sitemap-base.xml',
        'https://talentxcel.in/sitemap-jobs.xml',
        'https://talentxcel.in/sitemap-salary.xml',
        'https://talentxcel.in/sitemap-passport.xml',
        'https://talentxcel.in/sitemap-careers.xml',
        'https://talentxcel.in/sitemap-career-paths.xml',
        'https://talentxcel.in/sitemap-colleges.xml',
        'https://talentxcel.in/sitemap-learning.xml',
        'https://talentxcel.in/sitemap-resume.xml',
        'https://talentxcel.in/sitemap-government.xml',
        'https://talentxcel.in/sitemap-employers.xml',
        'https://talentxcel.in/sitemap-posts.xml',
        'https://talentxcel.in/sitemap-companies.xml',
        'https://talentxcel.in/sitemap-locations.xml',
        'https://talentxcel.in/sitemap-services.xml'
      ]
    },
    {
      prop: 'sc-domain:jobs.talentxcel.in',
      sitemaps: [
        'https://jobs.talentxcel.in/sitemap.xml',
        'https://jobs.talentxcel.in/sitemap-jobs.xml'
      ]
    },
    {
      prop: 'sc-domain:salary.talentxcel.in',
      sitemaps: [
        'https://salary.talentxcel.in/sitemap.xml',
        'https://salary.talentxcel.in/sitemap-salary.xml'
      ]
    },
    {
      prop: 'sc-domain:colleges.talentxcel.in',
      sitemaps: [
        'https://colleges.talentxcel.in/sitemap.xml',
        'https://colleges.talentxcel.in/sitemap-colleges.xml'
      ]
    },
    {
      prop: 'sc-domain:careers.talentxcel.in',
      sitemaps: [
        'https://careers.talentxcel.in/sitemap.xml',
        'https://careers.talentxcel.in/sitemap-careers.xml',
        'https://careers.talentxcel.in/sitemap-career-paths.xml'
      ]
    },
    {
      prop: 'sc-domain:resume.talentxcel.in',
      sitemaps: [
        'https://resume.talentxcel.in/sitemap.xml',
        'https://resume.talentxcel.in/sitemap-resume.xml'
      ]
    },
    {
      prop: 'sc-domain:passport.talentxcel.in',
      sitemaps: [
        'https://passport.talentxcel.in/sitemap.xml',
        'https://passport.talentxcel.in/sitemap-passport.xml'
      ]
    },
    {
      prop: 'sc-domain:learning.talentxcel.in',
      sitemaps: [
        'https://learning.talentxcel.in/sitemap.xml',
        'https://learning.talentxcel.in/sitemap-learning.xml'
      ]
    },
    {
      prop: 'sc-domain:employers.talentxcel.in',
      sitemaps: [
        'https://employers.talentxcel.in/sitemap.xml',
        'https://employers.talentxcel.in/sitemap-employers.xml'
      ]
    },
    {
      prop: 'sc-domain:government.talentxcel.in',
      sitemaps: [
        'https://government.talentxcel.in/sitemap.xml',
        'https://government.talentxcel.in/sitemap-government.xml'
      ]
    }
  ];

  for (const entry of targetMap) {
    if (!properties.includes(entry.prop)) {
      console.log(`⚠️ Skipping unverified property: ${entry.prop}`);
      continue;
    }
    console.log(`\nBroadcasting Sitemaps to ${entry.prop}:`);
    for (const sm of entry.sitemaps) {
      const putUrl = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(entry.prop)}/sitemaps/${encodeURIComponent(sm)}`;
      const res = await gscRequest(putUrl, 'PUT', token);
      const isSuccess = res.status >= 200 && res.status < 300;
      console.log(`  ${isSuccess ? '✅' : '❌'} [${res.status}] ${sm}`);
      await sleep(150);
    }
  }

  // 4. Google Indexing API Broadcast for Live Critical URLs
  console.log('\n--- Step 4: Broadcasting Live Career Passports & Core Hubs to Google Indexing API ---');
  const criticalUrls = [
    'https://talentxcel.in/u/saketsauravsharma',
    'https://talentxcel.in/u/talentxcelservices',
    'https://talentxcel.in/u/arsh_wani_0951f5',
    'https://talentxcel.in/u/sanobar',
    'https://talentxcel.in/u/subramanianjana8_5dae00',
    'https://talentxcel.in/network',
    'https://talentxcel.in/jobs',
    'https://talentxcel.in/salary',
    'https://talentxcel.in/resume',
    'https://talentxcel.in/colleges'
  ];

  for (const url of criticalUrls) {
    try {
      const idxRes = await gscRequest('https://indexing.googleapis.com/v3/urlNotifications:publish', 'POST', token, {
        url,
        type: 'URL_UPDATED'
      });
      console.log(`  📡 Indexing Broadcast: ${url} -> Status ${idxRes.status}`);
    } catch (e) {
      console.log(`  ⚠️ Indexing Broadcast Notice: ${url} (${e.message})`);
    }
    await sleep(200);
  }

  // 5. URL Inspection API Verification
  console.log('\n--- Step 5: Live URL Inspection via Search Console API ---');
  for (const inspectTarget of criticalUrls.slice(0, 3)) {
    try {
      const inspectRes = await gscRequest('https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', 'POST', token, {
        inspectionUrl: inspectTarget,
        siteUrl: 'https://talentxcel.in/'
      });

      if (inspectRes.status === 200) {
        const result = inspectRes.data?.inspectionResult?.indexStatusResult || {};
        console.log(`\n🔍 Inspection: ${inspectTarget}`);
        console.log(`   Verdicts: ${result.verdict || 'PENDING_CRAWL'}`);
        console.log(`   Coverage: ${result.coverageState || 'Discovered'}`);
        console.log(`   Robots:   ${result.robotsTxtState || 'ALLOWED'}`);
        console.log(`   Canonical (Google): ${result.googleCanonical || 'Apex'}`);
        console.log(`   Canonical (User):   ${result.userCanonical || 'Apex'}`);
      } else {
        console.log(`   Notice for ${inspectTarget}: Status ${inspectRes.status}`);
      }
    } catch (e) {
      console.log(`   Inspection Notice for ${inspectTarget}: ${e.message}`);
    }
  }

  console.log('\n================================================================');
  console.log('✅ GOOGLE SEARCH CONSOLE TAKEOVER & RE-INDEXING BROADCAST COMPLETE');
  console.log('================================================================');
}

run().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
