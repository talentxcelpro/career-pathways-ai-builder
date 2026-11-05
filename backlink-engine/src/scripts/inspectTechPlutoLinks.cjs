// backlink-engine/src/scripts/inspectTechPlutoLinks.cjs
const https = require('https');

https.get('https://www.techpluto.com/submit-a-startup/', {
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0' }
}, res => {
  let html = '';
  res.on('data', c => html += c);
  res.on('end', () => {
    const links = [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)]
      .map(m => ({ href: m[1], text: m[2].replace(/<[^>]+>/g, '').trim() }))
      .filter(l => l.text.toLowerCase().includes('submit') || l.href.includes('submit') || l.href.includes('pricing') || l.text.toLowerCase().includes('advertise'));
    console.log('Links:', links);
  });
});
