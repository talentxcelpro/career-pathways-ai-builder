// backlink-engine/src/scripts/extractHRStackSlugs.cjs
const https = require('https');

https.get('https://hrstack.tech/submit', {
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0' }
}, res => {
  let html = '';
  res.on('data', c => html += c);
  res.on('end', () => {
    // Look for __NEXT_DATA__ or RSC payloads
    const nextDataMatch = html.match(/<script\b[^>]*id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/i);
    if (nextDataMatch) {
      console.log('__NEXT_DATA__ found');
      const data = JSON.parse(nextDataMatch[1]);
      console.log(JSON.stringify(data, null, 2).slice(0, 2000));
    } else {
      console.log('Next 13/14 App Router format detected. Searching for capability strings...');
      // search for strings like "applicant" or slugs
      const selfPayload = [...html.matchAll(/self\.__next_f\.push\(\[1,"([\s\S]*?)"\]\)/g)];
      console.log('RSC chunks found:', selfPayload.length);
      const combined = selfPayload.map(m => m[1]).join('');
      // find slugs
      const slugMatches = [...combined.matchAll(/\\"slug\\":\\"([^"\\]+)\\"/g)].map(m => m[1]);
      console.log('Slugs found in RSC:', [...new Set(slugMatches)]);
    }
  });
});
