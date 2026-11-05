// backlink-engine/src/scripts/inspectTechPlutoRealSubmit.cjs
const https = require('https');

https.get('https://www.techpluto.com/submit-startup/', {
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0' }
}, res => {
  let html = '';
  res.on('data', c => html += c);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    const forms = [...html.matchAll(/<form[\s\S]*?<\/form>/gi)];
    console.log('Forms count:', forms.length);
    const clean = html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    console.log('Content preview:');
    console.log(clean.slice(0, 1500));
  });
});
