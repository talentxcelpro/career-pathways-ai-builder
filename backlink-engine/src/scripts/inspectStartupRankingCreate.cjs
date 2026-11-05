// backlink-engine/src/scripts/inspectStartupRankingCreate.cjs
const https = require('https');

https.get('https://www.startupranking.com/startup/create/url-validation', {
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0' }
}, res => {
  let html = '';
  res.on('data', c => html += c);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    const forms = [...html.matchAll(/<form[\s\S]*?<\/form>/gi)];
    console.log('Forms:', forms.length);
    if (forms.length > 0) {
      console.log('Form snippet:', forms[0][0].slice(0, 1200));
    } else {
      const clean = html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
      console.log('Clean text:', clean.slice(0, 1000));
    }
  });
});
