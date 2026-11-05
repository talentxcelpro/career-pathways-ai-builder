// backlink-engine/src/scripts/inspectHRStackHtml.cjs
const https = require('https');

https.get('https://hrstack.tech/submit', {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0'
  },
  agent: false
}, res => {
  let html = '';
  res.on('data', c => html += c);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    const formMatch = html.match(/<form[\s\S]*?<\/form>/i);
    if (formMatch) {
      console.log('Form HTML snippet:');
      console.log(formMatch[0].slice(0, 1500));
    } else {
      console.log('No direct <form> tag, searching for iframe or embedded forms...');
      const iframes = [...html.matchAll(/<iframe\b([^>]*)>/gi)].map(m => m[1]);
      console.log('Iframes:', iframes);
    }
  });
}).on('error', e => console.error(e));
