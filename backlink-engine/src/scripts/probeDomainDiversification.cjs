// backlink-engine/src/scripts/probeDomainDiversification.cjs
const https = require('https');

const CANDIDATE_DOMAINS = [
  { name: 'SaaSHub', url: 'https://www.saashub.com/talentxcel-alternatives', submitUrl: 'https://www.saashub.com/submit' },
  { name: 'Launching Next', url: 'https://www.launchingnext.com/', submitUrl: 'https://www.launchingnext.com/submit/' },
  { name: 'PitchWall', url: 'https://pitchwall.co/', submitUrl: 'https://pitchwall.co/submit' },
  { name: 'SourceForge', url: 'https://sourceforge.net/', submitUrl: 'https://sourceforge.net/create/' },
  { name: 'AlternativeTo', url: 'https://alternativeto.net/', submitUrl: 'https://alternativeto.net/software/new/' },
  { name: 'StartupBase', url: 'https://startupbase.io/', submitUrl: 'https://startupbase.io/submit' },
  { name: 'Feedough', url: 'https://www.feedough.com/', submitUrl: 'https://www.feedough.com/startup-directory/' },
  { name: 'StartupStash', url: 'https://startupstash.com/', submitUrl: 'https://startupstash.com/submit-your-tools/' }
];

async function checkUrl(name, url) {
  return new Promise(resolve => {
    const start = Date.now();
    const req = https.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0' },
      agent: false,
      timeout: 8000
    }, res => {
      resolve({ name, url, statusCode: res.statusCode, latencyMs: Date.now() - start });
    });
    req.on('error', e => resolve({ name, url, statusCode: 0, error: e.message }));
    req.on('timeout', () => { req.destroy(); resolve({ name, url, statusCode: 0, error: 'TIMEOUT' }); });
  });
}

async function run() {
  console.log('=== PROBING DOMAIN DIVERSIFICATION PLATFORMS ===\n');
  for (const c of CANDIDATE_DOMAINS) {
    const home = await checkUrl(c.name + ' (Home)', c.url);
    const sub = await checkUrl(c.name + ' (Submit)', c.submitUrl);
    console.log(`- ${c.name}: Home HTTP ${home.statusCode} (${home.latencyMs || 0}ms), Submit HTTP ${sub.statusCode} (${sub.latencyMs || 0}ms)`);
  }
}

run();
