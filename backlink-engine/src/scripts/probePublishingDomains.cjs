// backlink-engine/src/scripts/probePublishingDomains.cjs
const https = require('https');
const http = require('http');

const candidates = [
  { name: 'Paste.ee', host: 'api.paste.ee', path: '/v1/pastes' },
  { name: 'JustPaste.it', host: 'justpaste.it', path: '/' },
  { name: 'ControlC', host: 'controlc.com', path: '/' },
  { name: 'PasteCode', host: 'pastecode.io', path: '/' },
  { name: 'Telegraph', host: 'api.telegra.ph', path: '/createAccount?short_name=TalentXcel&author_name=TalentXcel' },
  { name: 'Rentry', host: 'rentry.co', path: '/' }
];

async function checkHost(c) {
  return new Promise(resolve => {
    const req = https.request({
      host: c.host,
      path: c.path,
      method: 'GET',
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      timeout: 5000,
      rejectUnauthorized: false
    }, res => {
      resolve({ name: c.name, host: c.host, status: res.statusCode });
    });
    req.on('error', e => resolve({ name: c.name, host: c.host, error: e.message }));
    req.on('timeout', () => { req.destroy(); resolve({ name: c.name, host: c.host, error: 'TIMEOUT' }); });
    req.end();
  });
}

async function run() {
  console.log('Testing Publishing Platforms...');
  for (const c of candidates) {
    const r = await checkHost(c);
    console.log(`- ${r.name} (${r.host}): ${r.status || r.error}`);
  }
}

run();
