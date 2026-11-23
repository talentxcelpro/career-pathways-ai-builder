/**
 * distribution-engine/src/discovery/evaluateCandidates11to25.cjs
 * Forensic evaluation of Candidates 11-25 against strict actionability criteria.
 */

const https = require('https');
const http = require('http');
const url = require('url');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const CANDIDATES_11_25 = [
  { name: 'DevClass', domain: 'devclass.com', candidatePaths: ['/contact', '/about', '/write-for-us', '/submit'] },
  { name: 'InfoQ', domain: 'infoq.com', candidatePaths: ['/contribute', '/write-for-infoq', '/contact', '/about'] },
  { name: 'Changelog', domain: 'changelog.com', candidatePaths: ['/submit', '/community', '/posts', '/contact'] },
  { name: 'Analytics Vidhya', domain: 'analyticsvidhya.com', candidatePaths: ['/blog-submission', '/write-for-us', '/contact-us', '/community'] },
  { name: 'CareerFoundry', domain: 'careerfoundry.com', candidatePaths: ['/write-for-us', '/en/blog/write-for-us', '/contact'] },
  { name: 'RecruitingDaily', domain: 'recruitingdaily.com', candidatePaths: ['/write-for-us', '/contribute', '/contact', '/guest-post'] },
  { name: 'HR Morning', domain: 'hrmorning.com', candidatePaths: ['/write-for-us', '/contact-us', '/editorial-team'] },
  { name: 'Job Board Doctor', domain: 'jobboarddoctor.com', candidatePaths: ['/contact', '/about', '/guest-posts'] },
  { name: 'Startup Grind', domain: 'startupgrind.com', candidatePaths: ['/blog', '/write-for-us', '/submit-article', '/contact'] },
  { name: 'SaaStr', domain: 'saastr.com', candidatePaths: ['/guest-post', '/contribute', '/write-for-saastr', '/contact'] },
  { name: 'Startupticker Switzerland', domain: 'startupticker.ch', candidatePaths: ['/en/submit-news', '/en/contact', '/en/about'] },
  { name: 'Starter Story', domain: 'starterstory.com', candidatePaths: ['/submit', '/share-your-story', '/contact'] },
  { name: 'MicroConf', domain: 'microconf.com', candidatePaths: ['/connect', '/contact', '/community'] },
  { name: 'Mind the Product', domain: 'mindtheproduct.com', candidatePaths: ['/write-for-us', '/contribute', '/contact'] },
  { name: 'GrowthRocks', domain: 'growthrocks.com', candidatePaths: ['/write-for-us', '/guest-post', '/contact'] },
  { name: 'JustRemote', domain: 'justremote.co', candidatePaths: ['/post-a-job', '/contact', '/about'] }
];

function probeUrl(domain, p) {
  return new Promise((resolve) => {
    const fullUrl = `https://${domain}${p}`;
    try {
      const parsed = new url.URL(fullUrl);
      const req = https.request({
        hostname: parsed.hostname,
        path: parsed.pathname,
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 7000
      }, (res) => {
        let body = '';
        res.on('data', chunk => { if (body.length < 25000) body += chunk.toString(); });
        res.on('end', () => {
          resolve({
            path: p,
            status: res.statusCode,
            location: res.headers['location'],
            hasForm: /<form/i.test(body),
            isCaptcha: /captcha|cf-turnstile|g-recaptcha/i.test(body),
            isEditorial: /write for us|guest post|contributor guidelines|submit your story|pitch an article/i.test(body),
            hasAuthGate: /login|sign in|create an account to post/i.test(body) && !/<form[^>]*action/i.test(body),
            bodyLength: body.length
          });
        });
      });
      req.on('error', (e) => resolve({ path: p, status: null, error: e.message }));
      req.on('timeout', () => { req.destroy(); resolve({ path: p, status: 408 }); });
      req.end();
    } catch (e) {
      resolve({ path: p, status: null, error: e.message });
    }
  });
}

async function evaluateAll() {
  console.log('Evaluating Candidates 11-25 for genuine designated publishing pathways...\n');
  const results = [];

  for (const c of CANDIDATES_11_25) {
    console.log(`[CHECKING] ${c.name} (${c.domain})`);
    let bestPathway = null;
    for (const p of c.candidatePaths) {
      const res = await probeUrl(c.domain, p);
      if (res.status === 200 || (res.status >= 300 && res.status < 400)) {
        console.log(`  -> ${p}: HTTP ${res.status} | Form: ${res.hasForm} | Captcha: ${res.isCaptcha} | Editorial: ${res.isEditorial}`);
        if (res.isEditorial || (res.hasForm && !res.isCaptcha)) {
          bestPathway = { path: p, ...res };
          break;
        } else if (!bestPathway && res.status === 200) {
          bestPathway = { path: p, ...res };
        }
      }
    }
    results.push({
      name: c.name,
      domain: c.domain,
      bestPathway: bestPathway
    });
    console.log(`  Result for ${c.name}: ${bestPathway ? bestPathway.path + ' (HTTP ' + bestPathway.status + ')' : 'No designated pathway found'}\n`);
  }

  return results;
}

evaluateAll().then(res => {
  const fs = require('fs');
  const path = require('path');
  fs.writeFileSync(
    path.join(process.cwd(), 'distribution-engine/data/exports/audit/candidates_11_25_detailed_audit.json'),
    JSON.stringify(res, null, 2)
  );
  console.log('Detailed audit completed.');
});
