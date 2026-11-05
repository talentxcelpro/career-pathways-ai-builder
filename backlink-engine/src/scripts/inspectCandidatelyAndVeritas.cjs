// backlink-engine/src/scripts/inspectCandidatelyAndVeritas.cjs
const https = require('https');

function fetchPage(url) {
  return new Promise(resolve => {
    https.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0' },
      timeout: 10000
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    }).on('error', err => resolve({ status: 500, error: err.message }));
  });
}

async function run() {
  const c = await fetchPage('https://www.candidately.com/directory');
  console.log('Candidately status:', c.status);
  if (c.data) {
    const forms = [...c.data.matchAll(/<form[\s\S]*?<\/form>/gi)];
    console.log('Candidately forms:', forms.length);
    const links = [...c.data.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)]
      .map(m => ({ href: m[1], text: m[2].replace(/<[^>]+>/g, '').trim() }))
      .filter(l => l.text.toLowerCase().includes('submit') || l.text.toLowerCase().includes('add') || l.text.toLowerCase().includes('list') || l.href.includes('submit'));
    console.log('Candidately submit links:', links);
  }

  const v = await fetchPage('https://veritashrsolutions.com/list-your-company/');
  console.log('Veritas HR status:', v.status);
  if (v.data) {
    const forms = [...v.data.matchAll(/<form[\s\S]*?<\/form>/gi)];
    console.log('Veritas forms:', forms.length);
    if (forms.length > 0) {
      console.log('Veritas form snippet:', forms[0][0].slice(0, 1000));
    }
  }
}

run();
