// backlink-engine/src/scripts/deepInspect.cjs
const https = require('https');

async function fetchPage(url) {
  return new Promise(resolve => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, rejectUnauthorized: false }, res => {
      let data = '';
      res.on('data', c => { if (data.length < 300000) data += c; });
      res.on('end', () => resolve(data));
    }).on('error', () => resolve(''));
  });
}

async function run() {
  const bHtml = await fetchPage('https://www.biziffy.com/free-listing');
  // Check pricing/plans text in Biziffy
  console.log('--- Biziffy Content Snippets ---');
  const bMatches = bHtml.match(/(?:free|₹0|\$0|plan|pricing|website|dofollow|nofollow|features)[^<]{10,100}/gi) || [];
  console.log(bMatches.slice(0, 10));

  // Check Ventmark text
  const vHtml = await fetchPage('https://useventmark.com/');
  console.log('\n--- Ventmark Content Snippets ---');
  const vMatches = vHtml.match(/(?:startup|directory|free|submit|founder|backlink|dofollow|nofollow)[^<]{10,100}/gi) || [];
  console.log(vMatches.slice(0, 10));
}

run();
