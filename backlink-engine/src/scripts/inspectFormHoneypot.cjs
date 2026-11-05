const https = require('https');

https.get('https://aisaasradar.com/submit', (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    const formMatch = body.match(/<form[\s\S]*?<\/form>/i);
    if (formMatch) {
      console.log('Form HTML:');
      console.log(formMatch[0]);
    }
  });
});
