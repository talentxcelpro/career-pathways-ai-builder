const https = require('https');

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function verifyLive() {
  console.log('Fetching live deployed bundle: https://talentxcel.in/assets/index-DsGSNLTD.js ...');
  const bundle = await get('https://talentxcel.in/assets/index-DsGSNLTD.js');
  console.log('Bundle length:', bundle.length);
  console.log('1. Contains GoogleAnalytics G-CMYNTTNT56?', bundle.includes('G-CMYNTTNT56'));
  console.log('2. Contains Referral shortlink /r/:code?', bundle.includes('/r/:code'));
  console.log('3. Contains Peer endorsement /verify/:username?', bundle.includes('/verify/:username'));
  console.log('4. Contains Priority route /auth?', bundle.includes('path:"/auth"'));
}

verifyLive().catch(console.error);
