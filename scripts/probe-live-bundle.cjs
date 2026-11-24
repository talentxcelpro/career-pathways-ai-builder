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

async function main() {
  const cb = Date.now();
  console.log('Probing live talentxcel.in with cache-buster:', cb);
  const res = await get(`https://talentxcel.in/?_cb=${cb}`);
  console.log('Status:', res.status);
  console.log('Vercel ID:', res.headers['x-vercel-id']);
  
  const scripts = [...res.data.matchAll(/<script[^>]+src=["']([^"']+)["']/g)].map(m => m[1]);
  console.log('Scripts:', scripts);

  const indexJs = scripts.find(s => s.includes('/assets/index-'));
  if (indexJs) {
    const fullUrl = (indexJs.startsWith('http') ? indexJs : `https://talentxcel.in${indexJs}`) + `?_cb=${cb}`;
    console.log('Fetching live bundle:', fullUrl);
    const bundleRes = await get(fullUrl);
    console.log('Bundle length:', bundleRes.data.length);
    console.log('Contains GoogleAnalytics measurement ID (G-CMYNTTNT56)?', bundleRes.data.includes('G-CMYNTTNT56'));
    console.log('Contains /r/:code shortlink?', bundleRes.data.includes('/r/:code') || bundleRes.data.includes('ReferralShortlinkRedirect'));
    console.log('Contains PeerEndorsementPage (/verify/:username)?', bundleRes.data.includes('PeerEndorsementPage') || bundleRes.data.includes('peer_endorsements'));
  }
}

main().catch(console.error);
