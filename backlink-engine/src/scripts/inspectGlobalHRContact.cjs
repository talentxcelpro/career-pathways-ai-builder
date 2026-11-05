// backlink-engine/src/scripts/inspectGlobalHRContact.cjs
const https = require('https');

https.get('https://globalhrworld.com/contact/', {
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0' }
}, res => {
  let html = '';
  res.on('data', c => html += c);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    const forms = [...html.matchAll(/<form[\s\S]*?<\/form>/gi)];
    console.log('Forms found:', forms.length);
    if (forms.length > 0) {
      console.log('Form snippet:');
      console.log(forms[0][0].slice(0, 1500));
    }
  });
});
