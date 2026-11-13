// scripts/push-all-subdomains-gsc.cjs
// Submits all authoritative segmented sitemaps directly to all verified Google Search Console site properties

const fs = require('fs');
const crypto = require('crypto');
const https = require('https');

async function getGoogleAccessToken(serviceAccount) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claimSet = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/webmasters https://www.googleapis.com/auth/indexing',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  const base64Url = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
  const unsignedToken = `${base64Url(header)}.${base64Url(claimSet)}`;
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(unsignedToken);
  const signature = sign.sign(serviceAccount.private_key, 'base64url');
  const jwt = `${unsignedToken}.${signature}`;

  return new Promise((resolve, reject) => {
    const postData = `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`;
    const req = https.request('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData),
      },
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

function submitSitemap(siteProperty, sitemapUrl, token) {
  return new Promise((resolve) => {
    const endpoint = `/webmasters/v3/sites/${encodeURIComponent(siteProperty)}/sitemaps/${encodeURIComponent(sitemapUrl)}`;
    const req = https.request({
      hostname: 'www.googleapis.com',
      path: endpoint,
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, ok: res.statusCode >= 200 && res.statusCode < 300, data });
      });
    });
    req.on('error', (err) => resolve({ status: 500, ok: false, error: err.message }));
    req.end();
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  console.log('================================================================');
  console.log('🛰️ TALENTXCEL MULTI-SUBDOMAIN GOOGLE SEARCH CONSOLE BROADCASTER');
  console.log('================================================================\n');

  const key = JSON.parse(fs.readFileSync('gsc-service-account.json', 'utf8'));
  console.log(`Service Account: ${key.client_email}`);

  const token = await getGoogleAccessToken(key);
  console.log('✅ Google OAuth2 Token acquired for Search Console API!\n');

  // Multi-subdomain deployment matrix
  const domainTargets = [
    {
      property: 'https://talentxcel.in/',
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
        'https://talentxcel.in/sitemap-services.xml',
        'https://talentxcel.in/sitemap-rankings.xml',
      ]
    },
    {
      property: 'sc-domain:jobs.talentxcel.in',
      sitemaps: [
        'https://jobs.talentxcel.in/sitemap.xml',
        'https://jobs.talentxcel.in/sitemap-jobs.xml',
      ]
    },
    {
      property: 'sc-domain:salary.talentxcel.in',
      sitemaps: [
        'https://salary.talentxcel.in/sitemap.xml',
        'https://salary.talentxcel.in/sitemap-salary.xml',
      ]
    },
    {
      property: 'sc-domain:passport.talentxcel.in',
      sitemaps: [
        'https://passport.talentxcel.in/sitemap.xml',
        'https://passport.talentxcel.in/sitemap-passport.xml',
      ]
    },
    {
      property: 'sc-domain:careers.talentxcel.in',
      sitemaps: [
        'https://careers.talentxcel.in/sitemap.xml',
        'https://careers.talentxcel.in/sitemap-careers.xml',
        'https://careers.talentxcel.in/sitemap-career-paths.xml',
      ]
    },
    {
      property: 'sc-domain:colleges.talentxcel.in',
      sitemaps: [
        'https://colleges.talentxcel.in/sitemap.xml',
        'https://colleges.talentxcel.in/sitemap-colleges.xml',
      ]
    },
    {
      property: 'sc-domain:learning.talentxcel.in',
      sitemaps: [
        'https://learning.talentxcel.in/sitemap.xml',
        'https://learning.talentxcel.in/sitemap-learning.xml',
      ]
    },
    {
      property: 'sc-domain:resume.talentxcel.in',
      sitemaps: [
        'https://resume.talentxcel.in/sitemap.xml',
        'https://resume.talentxcel.in/sitemap-resume.xml',
      ]
    },
    {
      property: 'sc-domain:government.talentxcel.in',
      sitemaps: [
        'https://government.talentxcel.in/sitemap.xml',
        'https://government.talentxcel.in/sitemap-government.xml',
      ]
    },
    {
      property: 'sc-domain:employers.talentxcel.in',
      sitemaps: [
        'https://employers.talentxcel.in/sitemap.xml',
        'https://employers.talentxcel.in/sitemap-employers.xml',
      ]
    },
  ];

  let totalSuccess = 0;
  let totalFail = 0;

  for (const target of domainTargets) {
    console.log(`📡 Pushing to Property: ${target.property} (${target.sitemaps.length} sitemaps)...`);
    for (const sm of target.sitemaps) {
      const res = await submitSitemap(target.property, sm, token);
      if (res.ok || res.status === 200 || res.status === 204) {
        console.log(`   ✅ [${res.status}] ${sm}`);
        totalSuccess++;
      } else {
        console.log(`   ⚠️ [${res.status}] ${sm} - ${res.data || res.error || ''}`);
        totalFail++;
      }
      await sleep(150);
    }
  }

  console.log('\n================================================================');
  console.log('📊 MULTI-SUBDOMAIN GSC DISPATCH COMPLETE');
  console.log('================================================================');
  console.log(`  Properties Targeted:  ${domainTargets.length}`);
  console.log(`  Sitemaps Submitted:   ${totalSuccess}`);
  console.log(`  Failed Submissions:   ${totalFail}`);
  console.log('================================================================\n');
}

run().catch(console.error);
