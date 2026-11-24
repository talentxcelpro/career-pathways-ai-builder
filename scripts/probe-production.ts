// scripts/probe-production.ts
import https from 'https';

const routes = [
  '/',
  '/resume/ats-check',
  '/talent-score',
  '/passport',
  '/jobs',
  '/talent',
  '/network',
  '/employer',
  '/network/communities',
  '/robots.txt',
  '/sitemap.xml',
  '/talentxcel-entity-graph.json',
  '/api/discovery/knowledge-graph',
  '/llms.txt',
  '/llms-full.txt'
];

function checkUrl(path: string): Promise<string> {
  return new Promise((resolve) => {
    const options = {
      hostname: 'talentxcel.in',
      port: 443,
      path: path,
      method: 'GET',
      headers: {
        'User-Agent': 'OAI-SearchBot/1.0 (+https://openai.com/searchbot)'
      },
      timeout: 8000
    };

    const req = https.request(options, (res) => {
      resolve(`${path.padEnd(30)} -> HTTP ${res.statusCode} (content-type: ${res.headers['content-type'] || 'none'})`);
    });

    req.on('timeout', () => {
      req.destroy();
      resolve(`${path.padEnd(30)} -> TIMEOUT`);
    });

    req.on('error', (err) => {
      resolve(`${path.padEnd(30)} -> ERROR: ${err.message}`);
    });

    req.end();
  });
}

async function main() {
  console.log('Testing live production https://talentxcel.in endpoints with OAI-SearchBot User-Agent:\n');
  for (const r of routes) {
    const result = await checkUrl(r);
    console.log(result);
  }
}

main();
