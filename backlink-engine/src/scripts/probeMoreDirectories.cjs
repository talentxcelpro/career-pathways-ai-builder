// backlink-engine/src/scripts/probeMoreDirectories.cjs
const https = require('https');

const candidates = [
  { name: 'BetaList', host: 'betalist.com', path: '/' },
  { name: 'LaunchingNext', host: 'www.launchingnext.com', path: '/' },
  { name: 'PitchWall', host: 'pitchwall.co', path: '/' },
  { name: 'SaaStery / SaaSHub', host: 'www.saashub.com', path: '/' },
  { name: 'StartupRanking', host: 'www.startupranking.com', path: '/' },
  { name: 'AlternativeTo', host: 'alternativeto.net', path: '/' },
  { name: 'SideProjectors', host: 'www.sideprojectors.com', path: '/' },
  { name: 'RiseupPad', host: 'pad.riseup.net', path: '/' }
];

async function checkHost(c) {
  return new Promise(resolve => {
    const req = https.request({
      host: c.host,
      path: c.path,
      method: 'GET',
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0' },
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
  console.log('Testing Additional Directories & Platforms...');
  for (const c of candidates) {
    const r = await checkHost(c);
    console.log(`- ${r.name} (${c.host}): ${r.status || r.error}`);
  }
}

run();
