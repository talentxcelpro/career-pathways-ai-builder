// backlink-engine/src/scripts/inspectRoutes.cjs
const https = require('https');

async function fetchPage(url) {
  return new Promise(resolve => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, rejectUnauthorized: false }, res => {
      let data = '';
      res.on('data', c => { if (data.length < 200000) data += c; });
      res.on('end', () => resolve({ url, status: res.statusCode, data }));
    }).on('error', e => resolve({ url, status: null, data: e.message }));
  });
}

async function run() {
  const v = await fetchPage('https://useventmark.com/new');
  console.log('Ventmark /new status:', v.status, 'Length:', v.data.length);
  
  const b = await fetchPage('https://www.biziffy.com/free-listing');
  console.log('Biziffy /free-listing status:', b.status, 'Length:', b.data.length);
  const bTitle = b.data.match(/<title[^>]*>([^<]+)<\/title>/i);
  console.log('Biziffy /free-listing title:', bTitle ? bTitle[1] : 'NONE');

  const c = await fetchPage('https://www.companyinfo.in/register');
  console.log('CompanyInfo /register status:', c.status, 'Length:', c.data.length);
  const cTitle = c.data.match(/<title[^>]*>([^<]+)<\/title>/i);
  console.log('CompanyInfo /register title:', cTitle ? cTitle[1] : 'NONE');
}

run();
