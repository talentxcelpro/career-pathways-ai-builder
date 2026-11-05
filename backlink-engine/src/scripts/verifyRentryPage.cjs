// backlink-engine/src/scripts/verifyRentryPage.cjs
const https = require('https');

https.get('https://rentry.co/8wb2ridu', {
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0' },
  agent: false
}, res => {
  let html = '';
  res.on('data', chunk => html += chunk);
  res.on('end', () => {
    console.log('HTTP Status:', res.statusCode);
    const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
    console.log('Page Title:', titleMatch ? titleMatch[1].trim() : 'N/A');
    
    // Find all links to talentxcel
    const regex = /<a\b([^>]*)href=[\"'](https?:\/\/[^\"']*talentxcel[^\"']*)[\"']([^>]*)>([\s\S]*?)<\/a>/gi;
    let match;
    let count = 0;
    while ((match = regex.exec(html)) !== null) {
      count++;
      const fullAttrs = match[1] + ' ' + match[3];
      const relMatch = fullAttrs.match(/rel=[\"']([^\"']*)[\"']/i);
      const rel = relMatch ? relMatch[1] : 'follow (implicit default)';
      console.log(`\nLink #${count}:`);
      console.log('  Href:', match[2]);
      console.log('  Anchor Text:', match[4].replace(/<[^>]+>/g, '').trim());
      console.log('  Rel Attribute:', rel);
    }
    console.log(`\nTotal verified TalentXcel links found: ${count}`);
    process.exit(0);
  });
}).on('error', e => {
  console.log('Err:', e.message);
  process.exit(1);
});
