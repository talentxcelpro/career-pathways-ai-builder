const https = require('https');

https.get('https://aisaasradar.com/out.php?id=50146487fdcce4e1&src=list', { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
  console.log('Status Code:', res.statusCode);
  console.log('Location:', res.headers.location);
  console.log('Headers:', res.headers);
});
