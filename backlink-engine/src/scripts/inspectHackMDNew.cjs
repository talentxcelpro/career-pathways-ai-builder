// backlink-engine/src/scripts/inspectHackMDNew.cjs
const https = require('https');

https.get('https://hackmd.io/new', {
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0' },
  agent: false
}, res => {
  let html = '';
  res.on('data', c => { if (html.length < 50000) html += c; });
  res.on('end', () => {
    const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
    console.log('Title:', titleMatch ? titleMatch[1] : 'No title');
    const hasSignIn = html.includes('Sign In') || html.includes('login');
    console.log('Has Sign In:', hasSignIn);
    process.exit(0);
  });
}).on('error', e => {
  console.log('Err:', e.message);
  process.exit(1);
});
