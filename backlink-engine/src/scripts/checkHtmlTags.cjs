const https = require('https');

const urls = [
  'https://talentxcel.in/resume-scanner',
  'https://talentxcel.in',
  'https://salary.talentxcel.in',
  'https://talentxcel.in/employers',
  'https://talentxcel.in/colleges',
  'https://talentxcel.in/learning'
];

function fetchHtml(urlStr) {
  return new Promise((resolve) => {
    https.get(urlStr, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const canonicalMatch = data.match(/<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);
        const robotsMatch = data.match(/<meta[^>]+name=["']robots["'][^>]*content=["']([^"']+)["']/i);
        resolve({
          url: urlStr,
          status: res.statusCode,
          canonical: canonicalMatch ? canonicalMatch[1] : 'DEFAULT_SELF',
          robots: robotsMatch ? robotsMatch[1] : 'index, follow'
        });
      });
    }).on('error', err => resolve({ url: urlStr, error: err.message }));
  });
}

async function run() {
  for (const u of urls) {
    const r = await fetchHtml(u);
    console.log(r);
  }
}

run();
