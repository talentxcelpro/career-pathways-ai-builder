// backlink-engine/src/scripts/probeMoreFreeDirectories.cjs
const https = require('https');

function fetchPage(url) {
  return new Promise(resolve => {
    https.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0' },
      timeout: 10000
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, location: res.headers.location, data }));
    }).on('error', err => resolve({ status: 500, error: err.message }));
  });
}

async function run() {
  const targets = [
    { name: 'Betalist', url: 'https://betalist.com/startup/new' },
    { name: 'Betalist submit', url: 'https://betalist.com/submit' },
    { name: 'Startup88', url: 'https://startup88.com/' },
    { name: 'TheStartupPitch', url: 'https://thestartuppitch.com/submit-a-startup-for-free/' },
    { name: 'Springwise', url: 'https://www.springwise.com/submit/' },
    { name: 'SaaSHub', url: 'https://www.saashub.com/services/submit' },
    { name: 'Launching Next', url: 'https://www.launchingnext.com/submit/' },
    { name: 'PitchWall', url: 'https://pitchwall.co/submit' },
    { name: 'Sideprojectors', url: 'https://www.sideprojectors.com/project/add-product' },
    { name: 'Hackerearth', url: 'https://www.hackerearth.com/challenges/submission/' }
  ];

  for (const t of targets) {
    const r = await fetchPage(t.url);
    console.log(`${t.name.padEnd(20)} | HTTP ${r.status}${r.location ? ` -> ${r.location}` : ''}`);
  }
}

run();
