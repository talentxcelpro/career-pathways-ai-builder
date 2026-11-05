// backlink-engine/src/scripts/reassessPilot15.cjs
const https = require('https');
const http = require('http');
const fs = require('fs');

const pilot15 = [
  { rank: 1, num: 13, name: 'AI SaaS Radar', domain: 'aisaasradar.com', submitUrl: 'https://aisaasradar.com/submit' },
  { rank: 2, num: 92, name: 'ToolDock', domain: 'zalize.com', submitUrl: 'https://tools.zalize.com/submit' },
  { rank: 3, num: 17, name: 'AI Tool Index', domain: 'aitoolindex.io', submitUrl: 'https://aitoolindex.io/submit' },
  { rank: 4, num: 94, name: 'ToolVerity', domain: 'toolverity.com', submitUrl: 'https://toolverity.com/submit' },
  { rank: 5, num: 90, name: 'ThatsMyAI', domain: 'thatsmy.ai', submitUrl: 'https://thatsmy.ai/submit-tool' },
  { rank: 6, num: 48, name: 'Deekoya AI', domain: 'deekoyaai.in', submitUrl: 'https://deekoyaai.in/submit-tool' },
  { rank: 7, num: 24, name: 'AI ToolsXplorer', domain: 'aitoolsxplorer.in', submitUrl: 'https://www.aitoolsxplorer.in/submit-tool' },
  { rank: 8, num: 3, name: 'AI Bookmarks', domain: 'aibookmarks.net', submitUrl: 'https://aibookmarks.net/submit' },
  { rank: 9, num: 16, name: 'AI Tool Finder', domain: 'aitoolfinder.org', submitUrl: 'https://aitoolfinder.org/submit' },
  { rank: 10, num: 7, name: 'AI Gear Base', domain: 'aigearbase.com', submitUrl: 'https://aigearbase.com/submit' },
  { rank: 11, num: 87, name: 'Stackdrop', domain: 'getstackdrop.com', submitUrl: 'https://getstackdrop.com/submit' },
  { rank: 12, num: 77, name: 'NeedAITool', domain: 'needaitool.com', submitUrl: 'https://www.needaitool.com/submit' },
  { rank: 13, num: 80, name: 'Next Week AI', domain: 'nextweekai.com', submitUrl: 'https://nextweekai.com/submit/' },
  { rank: 14, num: 43, name: 'Catch AI Info', domain: 'catchaiinfo.com', submitUrl: 'https://catchaiinfo.com/submit-a-tool/' },
  { rank: 15, num: 9, name: 'AI Kendra', domain: 'aikendra.com', submitUrl: 'https://aikendra.com/submit' }
];

async function checkRobotsAndHome(target) {
  return new Promise(resolve => {
    const url = `https://${target.domain}/robots.txt`;
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 8000 }, res => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        const isDisallowedAll = data.includes('Disallow: /') && !data.includes('Disallow: /admin');
        resolve({
          domain: target.domain,
          robotsStatus: res.statusCode,
          isDisallowedAll,
          robotsSnippet: data.slice(0, 150).replace(/\s+/g, ' ')
        });
      });
    }).on('error', err => {
      resolve({ domain: target.domain, robotsStatus: 0, isDisallowedAll: false, error: err.message });
    });
  });
}

async function run() {
  console.log('Testing robots.txt for all 15 candidates...');
  const results = [];
  for (const t of pilot15) {
    const r = await checkRobotsAndHome(t);
    results.push({ ...t, ...r });
    console.log(`[#${t.num}] ${t.domain} -> robots: ${r.robotsStatus} (disallowAll: ${r.isDisallowedAll})`);
  }
  fs.writeFileSync('backlink-engine/src/scripts/pilot15_robots_audit.json', JSON.stringify(results, null, 2));
}

run();
