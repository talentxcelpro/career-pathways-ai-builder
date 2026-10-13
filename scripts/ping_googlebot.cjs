// scripts/ping_googlebot.cjs
const https = require('https');

const sitemaps = [
  'https://talentxcel.in/sitemap-root.xml',
  'https://talentxcel.in/sitemap.xml',
  'https://jobs.talentxcel.in/sitemap.xml',
  'https://salary.talentxcel.in/sitemap.xml',
  'https://resume.talentxcel.in/sitemap.xml',
  'https://careers.talentxcel.in/sitemap.xml',
  'https://colleges.talentxcel.in/sitemap.xml',
  'https://learning.talentxcel.in/sitemap.xml',
  'https://employers.talentxcel.in/sitemap.xml',
  'https://government.talentxcel.in/sitemap.xml',
  'https://passport.talentxcel.in/sitemap.xml',
];

async function ping(sm) {
  const url = `https://www.google.com/ping?sitemap=${encodeURIComponent(sm)}`;
  return new Promise((resolve) => {
    https.get(url, (res) => {
      resolve({ url: sm, status: res.statusCode });
    }).on('error', (err) => {
      resolve({ url: sm, status: 'ERROR', error: err.message });
    });
  });
}

async function run() {
  console.log('Pinging Googlebot for all sitemaps...\n');
  for (const sm of sitemaps) {
    const res = await ping(sm);
    console.log(`Pinged: ${sm} -> Status: ${res.status}`);
  }
}

run().catch(console.error);
