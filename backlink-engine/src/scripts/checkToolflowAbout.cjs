const https = require('https');
https.get('https://www.ai-toolflow.com/about', res => {
  let html = '';
  res.on('data', c => html += c);
  res.on('end', () => {
    console.log(html.slice(0, 1500));
  });
});
