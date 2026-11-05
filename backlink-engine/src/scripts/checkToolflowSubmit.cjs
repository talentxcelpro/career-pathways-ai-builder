const https = require('https');
https.get('https://www.ai-toolflow.com/', res => {
  let html = '';
  res.on('data', c => html += c);
  res.on('end', () => {
    const matches = html.match(/<a[^>]+href=["'][^"']+["'][^>]*>[\s\S]*?Submit[\s\S]*?<\/a>/gi);
    console.log(matches);
  });
});
