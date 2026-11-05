// backlink-engine/src/scripts/inspectPageText.cjs
const https = require('https');

function fetchPage(url) {
  return new Promise(resolve => {
    https.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0' },
      timeout: 10000
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    }).on('error', err => resolve(''));
  });
}

async function run() {
  const v = await fetchPage('https://veritashrsolutions.com/list-your-company/');
  const cleanV = v.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  console.log('Veritas clean text:', cleanV.slice(0, 1500));

  const c = await fetchPage('https://www.candidately.com/directory');
  const cleanC = c.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  console.log('\nCandidately clean text:', cleanC.slice(0, 1500));
}

run();
