// backlink-engine/src/scripts/probeSaaSDirectories.cjs
const https = require('https');

function fetchPage(url) {
  return new Promise(resolve => {
    https.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0' },
      timeout: 10000
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, location: res.headers.location, data }));
    }).on('error', err => resolve({ status: 500, error: err.message }));
  });
}

async function run() {
  const sw = await fetchPage('https://www.saasworthy.com/add-vendor');
  console.log('SaaSworthy add-vendor status:', sw.status, sw.location || '');

  const cd = await fetchPage('https://crozdesk.com/vendors');
  console.log('Crozdesk vendors status:', cd.status, cd.location || '');

  const ss = await fetchPage('https://www.softwaresuggest.com/list-your-software');
  console.log('SoftwareSuggest status:', ss.status, ss.location || '');
}

run();
