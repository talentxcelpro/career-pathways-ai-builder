// backlink-engine/src/scripts/checkPlatforms.cjs
const https = require('https');

async function fetchPage(url) {
  return new Promise(resolve => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, rejectUnauthorized: false }, res => {
      let data = '';
      res.on('data', c => { if (data.length < 200000) data += c; });
      res.on('end', () => resolve(data));
    }).on('error', () => resolve(''));
  });
}

async function check() {
  const vHtml = await fetchPage('https://useventmark.com/');
  const cHtml = await fetchPage('https://www.companyinfo.in/');
  const bHtml = await fetchPage('https://www.biziffy.com/');

  function extractLinks(html, pattern) {
    const regex = new RegExp(`href=["']([^"']*(?:${pattern})[^"']*)["']`, 'gi');
    const matches = [];
    let m;
    while ((m = regex.exec(html)) !== null) {
      matches.push(m[1]);
    }
    return [...new Set(matches)];
  }

  console.log('--- Ventmark Submit Links ---');
  console.log(extractLinks(vHtml, 'submit|add|list|register|new'));

  console.log('--- CompanyInfo.in Submit Links ---');
  console.log(extractLinks(cHtml, 'submit|add|list|register|new|business'));

  console.log('--- Biziffy Submit Links ---');
  console.log(extractLinks(bHtml, 'submit|add|list|register|new|listing'));
}

check();
