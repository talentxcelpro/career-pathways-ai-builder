// backlink-engine/src/scripts/verifyDpasteHtml.cjs
const https = require('https');

https.get('https://dpaste.org/Stpdw', {
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0' },
  agent: false
}, res => {
  let html = '';
  res.on('data', c => html += c);
  res.on('end', () => {
    console.log('HTTP Status:', res.statusCode);
    const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
    console.log('Title:', titleMatch ? titleMatch[1] : 'N/A');
    const links = [...html.matchAll(/<a\b([^>]*)href=[\"'](https?:\/\/[^\"']*talentxcel[^\"']*)[\"']([^>]*)>([\s\S]*?)<\/a>/gi)];
    console.log('TalentXcel links count:', links.length);
    links.forEach(l => {
      console.log('  Anchor href:', l[2]);
      console.log('  Anchor text:', l[4]);
      console.log('  Full tag:', l[0]);
    });
    if (links.length === 0) {
      console.log('No <a> tag found. Checking if URL text exists in DOM:');
      console.log('Contains talentxcel.in:', html.includes('talentxcel.in'));
      const snippet = html.match(/.{0,50}talentxcel\.in.{0,50}/i);
      console.log('Snippet:', snippet ? snippet[0] : 'None');
    }
    process.exit(0);
  });
}).on('error', e => {
  console.log('Err:', e.message);
  process.exit(1);
});
