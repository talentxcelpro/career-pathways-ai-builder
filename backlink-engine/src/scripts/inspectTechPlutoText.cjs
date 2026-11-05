// backlink-engine/src/scripts/inspectTechPlutoText.cjs
const https = require('https');

https.get('https://www.techpluto.com/submit-a-startup/', {
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0' }
}, res => {
  let html = '';
  res.on('data', c => html += c);
  res.on('end', () => {
    const clean = html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    console.log('TechPluto text:');
    console.log(clean.slice(0, 2000));
    // check for google form or typeform or mailto or iframe
    const iframes = [...html.matchAll(/<iframe\b[^>]*src=["']([^"']+)["'][^>]*>/gi)].map(m => m[1]);
    console.log('Iframes:', iframes);
    const mailtos = [...html.matchAll(/mailto:([^"'\s>]+)/gi)].map(m => m[1]);
    console.log('Mailtos:', mailtos);
  });
});
