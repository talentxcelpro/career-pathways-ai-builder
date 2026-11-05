const https = require('https');

const checks = [
  { name: 'AI SaaS Radar Tool Page', url: 'https://aisaasradar.com/tool/talentxcel' },
  { name: 'AI SaaS Radar Search', url: 'https://aisaasradar.com/?s=talentxcel' },
  { name: 'Launching Next Listing', url: 'https://www.launchingnext.com/s/talentxcel-resume-ats-checker' },
  { name: 'Launching Next Search', url: 'https://www.launchingnext.com/search/?q=talentxcel' },
  { name: 'SoftwareSuggest Profile', url: 'https://www.softwaresuggest.com/talentxcel' },
  { name: 'HRStack Directory', url: 'https://hrstack.tech/tools/talentxcel' },
  { name: 'TechPluto Search', url: 'https://www.techpluto.com/?s=talentxcel' }
];

async function check(c) {
  return new Promise(resolve => {
    try {
      https.get(c.url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 8000 }, res => {
        let body = '';
        res.on('data', chunk => { if (body.length < 30000) body += chunk; });
        res.on('end', () => {
          const hasTalentxcel = body.toLowerCase().includes('talentxcel');
          resolve({ name: c.name, url: c.url, status: res.statusCode, hasTalentxcel });
        });
      }).on('error', e => resolve({ name: c.name, url: c.url, error: e.message }))
        .on('timeout', () => resolve({ name: c.name, url: c.url, error: 'Timeout' }));
    } catch (e) {
      resolve({ name: c.name, url: c.url, error: e.message });
    }
  });
}

async function run() {
  console.log('Auditing live publication status of submitted directories...');
  for (const c of checks) {
    const res = await check(c);
    console.log(JSON.stringify(res));
  }
}

run();
