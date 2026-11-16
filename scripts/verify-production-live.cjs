const https = require('https');

const urls = [
  'https://talentxcel.in/company/ntpc',
  'https://talentxcel.in/locations/varanasi',
  'https://talentxcel.in/locations/gurgaon',
  'https://talentxcel.in/locations/patiala',
  'https://talentxcel.in/sitemap-root.xml',
  'https://talentxcel.in/sitemap-companies.xml',
  'https://talentxcel.in/sitemap-locations.xml',
  'https://talentxcel.in/sitemap-combos.xml',
];

function checkUrl(url) {
  return new Promise((resolve) => {
    const req = https.request(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        'Accept': 'text/html,application/xhtml+xml,application/xml',
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const titleMatch = data.match(/<title[^>]*>([^<]+)<\/title>/i);
        const canonicalMatch = data.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
        const robotsMeta = data.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["']/i);
        resolve({
          url,
          status: res.statusCode,
          title: titleMatch ? titleMatch[1].trim() : '(none/xml)',
          canonical: canonicalMatch ? canonicalMatch[1] : '(none)',
          xRobotsTag: res.headers['x-robots-tag'] || '(none)',
          metaRobots: robotsMeta ? robotsMeta[1] : '(none)',
        });
      });
    });
    req.on('error', err => resolve({ url, status: 500, error: err.message }));
    req.end();
  });
}

async function run() {
  console.log('================================================================');
  console.log('🌐 TALENTXCEL LIVE PRODUCTION EDGE SSR VERIFICATION');
  console.log('================================================================\n');

  for (const url of urls) {
    const res = await checkUrl(url);
    console.log(`URL: ${res.url}`);
    console.log(`  HTTP Status : ${res.status}`);
    console.log(`  Title       : ${res.title}`);
    console.log(`  Canonical   : ${res.canonical}`);
    console.log(`  Meta Robots : ${res.metaRobots}`);
    console.log(`  X-Robots-Tag: ${res.xRobotsTag}\n`);
  }
}

run();
