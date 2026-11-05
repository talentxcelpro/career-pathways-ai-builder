const https = require('https');
https.get('https://www.ai-toolflow.com/about', res => {
  let html = '';
  res.on('data', c => html += c);
  res.on('end', () => {
    const textOnly = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    const idx = textOnly.indexOf('hello@toolflow.io');
    console.log(textOnly.slice(Math.max(0, idx - 200), idx + 300));
  });
});
