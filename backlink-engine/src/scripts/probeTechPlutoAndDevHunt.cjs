// backlink-engine/src/scripts/probeTechPlutoAndDevHunt.cjs
const https = require('https');

function fetchPage(url) {
  return new Promise(resolve => {
    https.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0' },
      timeout: 10000
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    }).on('error', err => resolve({ status: 500, error: err.message }));
  });
}

async function run() {
  const tp = await fetchPage('https://www.techpluto.com/submit-a-startup/');
  console.log('TechPluto status:', tp.status);
  if (tp.data) {
    const forms = [...tp.data.matchAll(/<form[\s\S]*?<\/form>/gi)];
    console.log('TechPluto forms:', forms.length);
    if (forms.length > 0) {
      console.log('TechPluto form snippet:', forms[0][0].slice(0, 800));
    }
  }

  const dh = await fetchPage('https://devhunt.org/');
  console.log('DevHunt status:', dh.status);

  const sb = await fetchPage('https://startupbase.io/');
  console.log('StartupBase status:', sb.status);
}

run();
