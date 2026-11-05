const https = require('https');
const http = require('http');

const platforms = [
  { name: 'StartupTalky', url: 'https://startuptalky.com/submit-startup/', domain: 'startuptalky.com' },
  { name: 'IndianWeb2', url: 'https://www.indianweb2.com/p/submit-startup.html', domain: 'indianweb2.com' },
  { name: 'NextBigWhat', url: 'https://nextbigwhat.com', domain: 'nextbigwhat.com' },
  { name: 'Headstart', url: 'https://headstart.in', domain: 'headstart.in' },
  { name: 'TechJockey List Product', url: 'https://www.techjockey.com/sell-with-us', domain: 'techjockey.com' },
  { name: 'Inc42 Pitch', url: 'https://inc42.com/submit-your-startup-pitch/', domain: 'inc42.com' },
  { name: 'YourStory Companies', url: 'https://yourstory.com/companies', domain: 'yourstory.com' },
  { name: 'Startup India Directory', url: 'https://www.startupindia.gov.in/content/sih/en/search.html', domain: 'startupindia.gov.in' }
];

async function checkUrl(p) {
  return new Promise((resolve) => {
    try {
      const u = new URL(p.url);
      const req = (u.protocol === 'https:' ? https : http).get(
        p.url,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          },
          timeout: 8000
        },
        (res) => {
          let body = '';
          res.on('data', chunk => { if (body.length < 50000) body += chunk; });
          res.on('end', () => {
            const hasForm = body.includes('<form');
            const hasInput = body.includes('<input');
            const titleMatch = body.match(/<title>([^<]+)<\/title>/i);
            resolve({
              name: p.name,
              domain: p.domain,
              url: p.url,
              statusCode: res.statusCode,
              title: titleMatch ? titleMatch[1].trim() : 'N/A',
              hasForm,
              hasInput,
              redirect: res.headers.location || null
            });
          });
        }
      );
      req.on('error', err => resolve({ name: p.name, domain: p.domain, url: p.url, error: err.message }));
      req.on('timeout', () => { req.destroy(); resolve({ name: p.name, domain: p.domain, error: 'Timeout' }); });
    } catch (e) {
      resolve({ name: p.name, domain: p.domain, error: e.message });
    }
  });
}

async function run() {
  console.log('Auditing Indian Startup Backlink & Submission Portals...');
  for (const p of platforms) {
    const res = await checkUrl(p);
    console.log(JSON.stringify(res, null, 2));
  }
}

run();
