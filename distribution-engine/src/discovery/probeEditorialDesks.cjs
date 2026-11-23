/**
 * distribution-engine/src/discovery/probeEditorialDesks.cjs
 * Probes editorial guidelines and submission desks across verified publications.
 */

const https = require('https');
const url = require('url');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const TARGETS = [
  { name: 'People Matters', url: 'https://www.peoplematters.in/article-submission-guidelines' },
  { name: 'Analytics India Mag', url: 'https://analyticsindiamag.com/write-for-us/' },
  { name: 'Feedough', url: 'https://www.feedough.com/write-for-us/' },
  { name: 'Career Contessa', url: 'https://www.careercontessa.com/write-for-us/' },
  { name: 'Workology', url: 'https://workology.com/write-for-workology/' },
  { name: 'TechStory', url: 'https://techstory.in/submit-a-story/' },
  { name: 'YourStory', url: 'https://yourstory.com/submit-story' },
  { name: 'Ask a Manager', url: 'https://www.askamanager.org/ask-a-question' },
  { name: 'HR Bartender', url: 'https://www.hrbartender.com/contact/' },
  { name: 'BusinessCloud UK', url: 'https://businesscloud.co.uk/contact/' },
  { name: 'Startups.co.uk', url: 'https://startups.co.uk/contact-us/' },
  { name: 'Techcouver', url: 'https://techcouver.com/contact/' },
  { name: 'Startup Daily AU', url: 'https://www.startupdaily.net/contact/' },
  { name: 'InnovationAus', url: 'https://www.innovationaus.com/contact/' }
];

function checkPage(t) {
  return new Promise((resolve) => {
    try {
      const parsed = new url.URL(t.url);
      const req = https.request({
        hostname: parsed.hostname,
        path: parsed.pathname,
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 8000
      }, res => {
        let body = '';
        res.on('data', c => { if (body.length < 30000) body += c.toString(); });
        res.on('end', () => {
          const emails = [...new Set([...body.matchAll(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g)].map(m => m[0]))];
          const hasForm = /<form/i.test(body);
          const hasCaptcha = /captcha|cf-turnstile|g-recaptcha/i.test(body);
          const guidelines = /guidelines|word count|original content|pitch|guest author/i.test(body);
          resolve({
            name: t.name,
            url: t.url,
            status: res.statusCode,
            location: res.headers['location'],
            hasForm: hasForm,
            hasCaptcha: hasCaptcha,
            isEditorial: guidelines,
            emails: emails.slice(0, 3),
            title: (body.match(/<title>([^<]*)<\/title>/i) || [])[1]
          });
        });
      });
      req.on('error', e => resolve({ name: t.name, url: t.url, status: null, error: e.message }));
      req.on('timeout', () => { req.destroy(); resolve({ name: t.name, url: t.url, status: 408 }); });
      req.end();
    } catch (e) {
      resolve({ name: t.name, url: t.url, status: null, error: e.message });
    }
  });
}

async function run() {
  console.log('Probing verified editorial desks...\n');
  const results = [];
  for (const t of TARGETS) {
    const r = await checkPage(t);
    results.push(r);
    console.log(`[${r.name}] -> HTTP ${r.status} | Form: ${r.hasForm} | Captcha: ${r.hasCaptcha} | Editorial: ${r.isEditorial} | Emails: ${(r.emails || []).join(', ') || 'None'}`);
  }

  const fs = require('fs');
  const path = require('path');
  fs.writeFileSync(
    path.join(process.cwd(), 'distribution-engine/data/exports/audit/editorial_desks_audit.json'),
    JSON.stringify(results, null, 2)
  );
}

run();
