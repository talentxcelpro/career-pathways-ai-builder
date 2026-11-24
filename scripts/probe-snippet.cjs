const https = require('https');

https.get('https://talentxcel.in/assets/index-DsGSNLTD.js', res => {
  console.log('Status:', res.statusCode);
  console.log('Headers:', res.headers);
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => console.log('Snippet:', d.substring(0, 300)));
});
