const https = require('https');

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, data }));
    }).on('error', reject);
  });
}

async function checkJob() {
  const url = 'https://talentxcel.in/jobs/93a378a5-f004-4aa9-894d-189e304ddec4';
  console.log('Probing:', url);
  const res = await get(url);
  console.log('Status:', res.status);
  
  // Look for any scripts
  const scripts = [...res.data.matchAll(/src=["']([^"']+\.js)["']/g)].map(m => m[1]);
  console.log('Scripts:', scripts);
}

checkJob().catch(console.error);
