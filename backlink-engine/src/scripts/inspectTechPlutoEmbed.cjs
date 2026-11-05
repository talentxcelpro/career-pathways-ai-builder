// backlink-engine/src/scripts/inspectTechPlutoEmbed.cjs
const https = require('https');

https.get('https://www.techpluto.com/submit-startup/', {
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0' }
}, res => {
  let html = '';
  res.on('data', c => html += c);
  res.on('end', () => {
    const scripts = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]);
    const scriptSrcs = [...html.matchAll(/<script\b[^>]*src=["']([^"']+)["'][^>]*>/gi)].map(m => m[1]);
    console.log('Script srcs:');
    scriptSrcs.filter(s => !s.includes('wp-includes') && !s.includes('jquery')).forEach(s => console.log(s));
    
    // search for forms or embed
    const iframes = [...html.matchAll(/<iframe\b[^>]*src=["']([^"']+)["'][^>]*>/gi)].map(m => m[1]);
    console.log('Iframes:', iframes);
  });
});
