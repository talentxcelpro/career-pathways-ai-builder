// backlink-engine/src/scripts/fetchSoftwareSuggestVendorJs.cjs
const https = require('https');

https.get('https://www.softwaresuggest.com/assets2/componentwise/vendors/registervendors.js?v=19.85', {
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0' }
}, res => {
  let js = '';
  res.on('data', c => js += c);
  res.on('end', () => {
    console.log('JS Length:', js.length);
    // find ajax calls
    const ajaxUrls = [...js.matchAll(/url\s*:\s*["']([^"']+)["']/gi)].map(m => m[1]);
    console.log('AJAX endpoints:', ajaxUrls);
    // find post endpoints
    const fetch = [...js.matchAll(/fetch\s*\(["']([^"']+)["']/gi)].map(m => m[1]);
    console.log('Fetch calls:', fetch);
    const axiosPosts = [...js.matchAll(/axios\.(post|put)\s*\(["']([^"']+)["']/gi)].map(m => m[2]);
    console.log('Axios posts:', axiosPosts);
    // snippet around GetListed
    const idx = js.indexOf('GetListed');
    if (idx !== -1) {
      console.log('Snippet around GetListed:');
      console.log(js.substring(Math.max(0, idx - 200), idx + 600));
    }
  });
});
