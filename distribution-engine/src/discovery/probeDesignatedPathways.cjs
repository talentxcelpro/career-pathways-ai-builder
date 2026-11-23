/**
 * distribution-engine/src/discovery/probeDesignatedPathways.cjs
 * Probes designated submission pathways: Startup Discovery, SaaS Directories, Contributor Desks.
 */

const https = require('https');
const url = require('url');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const PATHWAYS = [
  { name: 'Launching Next', domain: 'launchingnext.com', url: 'https://www.launchingnext.com/submit/', type: 'STARTUP_DIRECTORY' },
  { name: 'KillerStartups', domain: 'killerstartups.com', url: 'https://www.killerstartups.com/submit-startup/', type: 'STARTUP_DIRECTORY' },
  { name: 'Startup Stash', domain: 'startupstash.com', url: 'https://startupstash.com/submit-a-tool/', type: 'SAAS_DIRECTORY' },
  { name: 'BetaList', domain: 'betalist.com', url: 'https://betalist.com/submit', type: 'STARTUP_DIRECTORY' },
  { name: 'SaaSHub', domain: 'saashub.com', url: 'https://www.saashub.com/submit', type: 'SAAS_DIRECTORY' },
  { name: 'TechRound UK', domain: 'techround.co.uk', url: 'https://techround.co.uk/submit-your-startup/', type: 'STARTUP_NEWS' },
  { name: 'StartupTalky', domain: 'startuptalky.com', url: 'https://startuptalky.com/submit-guest-post/', type: 'STARTUP_BLOG' },
  { name: 'TechStory India', domain: 'techstory.in', url: 'https://techstory.in/submit-a-story/', type: 'STARTUP_NEWS' },
  { name: 'Uneed Best', domain: 'uneed.best', url: 'https://www.uneed.best/submit-a-tool', type: 'SAAS_DIRECTORY' },
  { name: 'MicroLaunch', domain: 'microlaunch.net', url: 'https://microlaunch.net/submit', type: 'STARTUP_DIRECTORY' },
  { name: 'DZone Contribute', domain: 'dzone.com', url: 'https://dzone.com/pages/contribute', type: 'CONTRIBUTOR_PORTAL' },
  { name: 'Dev.to API / Web', domain: 'dev.to', url: 'https://dev.to/new', type: 'OPEN_BLOGGING' },
  { name: 'Hashnode', domain: 'hashnode.com', url: 'https://hashnode.com', type: 'OPEN_BLOGGING' },
  { name: 'Techboard Australia', domain: 'techboard.com.au', url: 'https://techboard.com.au/claim-profile', type: 'STARTUP_DIRECTORY' }
];

function probe(target) {
  return new Promise((resolve) => {
    try {
      const parsed = new url.URL(target.url);
      const req = https.request({
        hostname: parsed.hostname,
        path: parsed.pathname + parsed.search,
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        },
        timeout: 9000
      }, (res) => {
        let body = '';
        res.on('data', c => { if (body.length < 35000) body += c.toString(); });
        res.on('end', () => {
          const hasForm = /<form/i.test(body);
          const hasCaptcha = /captcha|cf-turnstile|g-recaptcha|hcaptcha/i.test(body);
          const hasAuth = /sign\s*in\s*to\s*continue|log\s*in\s*to\s*submit|create\s*account/i.test(body) && !hasForm;
          const formAction = (body.match(/<form[^>]*action=["']([^"']*)["']/i) || [])[1];
          const inputNames = [...body.matchAll(/name=["']([^"']*)["']/gi)].map(m => m[1]);
          resolve({
            name: target.name,
            url: target.url,
            type: target.type,
            status: res.statusCode,
            location: res.headers['location'],
            hasForm: hasForm,
            hasCaptcha: hasCaptcha,
            hasAuth: hasAuth,
            formAction: formAction,
            inputNames: inputNames.slice(0, 8),
            title: (body.match(/<title>([^<]*)<\/title>/i) || [])[1]
          });
        });
      });
      req.on('error', e => resolve({ name: target.name, url: target.url, status: null, error: e.message }));
      req.on('timeout', () => { req.destroy(); resolve({ name: target.name, url: target.url, status: 408 }); });
      req.end();
    } catch (e) {
      resolve({ name: target.name, url: target.url, status: null, error: e.message });
    }
  });
}

async function runAll() {
  console.log('Probing designated submission pathways for legitimate publishing...\n');
  const results = [];
  for (const t of PATHWAYS) {
    const r = await probe(t);
    results.push(r);
    console.log(`[${r.name}] -> HTTP ${r.status} | Form: ${r.hasForm} | Captcha: ${r.hasCaptcha} | Auth: ${r.hasAuth}`);
    if (r.formAction) console.log(`   Action: ${r.formAction} | Inputs: ${r.inputNames.join(', ')}`);
  }
  const fs = require('fs');
  const path = require('path');
  fs.writeFileSync(
    path.join(process.cwd(), 'distribution-engine/data/exports/audit/designated_pathways_audit.json'),
    JSON.stringify(results, null, 2)
  );
}

runAll();
