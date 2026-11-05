// backlink-engine/src/scripts/inspectTechPlutoForms.cjs
const https = require('https');

https.get('https://www.techpluto.com/submit-a-startup/', {
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0' }
}, res => {
  let html = '';
  res.on('data', c => html += c);
  res.on('end', () => {
    const forms = [...html.matchAll(/<form[\s\S]*?<\/form>/gi)];
    console.log(`Total forms: ${forms.length}`);
    forms.forEach((f, i) => {
      console.log(`\n--- FORM ${i+1} ---`);
      console.log(f[0].slice(0, 1000));
    });
  });
});
