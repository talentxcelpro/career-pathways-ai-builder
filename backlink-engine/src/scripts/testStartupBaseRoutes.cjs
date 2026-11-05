// backlink-engine/src/scripts/testStartupBaseRoutes.cjs
const https = require('https');

const routes = [
  'https://startupbase.io/submit',
  'https://startupbase.io/submit-a-startup',
  'https://startupbase.io/post-a-startup',
  'https://startupbase.io/add-startup'
];

routes.forEach(url => {
  https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
    console.log(`${url} => ${res.statusCode}`);
  }).on('error', e => console.log(`${url} => ERR`));
});
