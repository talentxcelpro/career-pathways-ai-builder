const https = require('https');

const candidates = [
  'https://startuplanes.com',
  'https://startuptalky.com/contact/',
  'https://www.indianweb2.com',
  'https://thestartuppedia.com',
  'https://www.techjockey.com/vendor-registration',
  'https://www.headstart.in/get-involved',
  'https://www.crazyengineers.com',
  'https://entrackr.com/contact-us/'
];

async function probe(url) {
  return new Promise((resolve) => {
    try {
      const u = new URL(url);
      const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 8000 }, (res) => {
        let body = '';
        res.on('data', c => { if (body.length < 30000) body += c; });
        res.on('end', () => {
          const title = (body.match(/<title>([^<]+)<\/title>/i) || [])[1] || '';
          resolve({ url, status: res.statusCode, title: title.trim(), form: body.includes('<form'), redirect: res.headers.location });
        });
      });
      req.on('error', e => resolve({ url, error: e.message }));
      req.on('timeout', () => { req.destroy(); resolve({ url, error: 'timeout' }); });
    } catch(e) { resolve({ url, error: e.message }); }
  });
}

async function main() {
  for (const c of candidates) {
    const res = await probe(c);
    console.log(JSON.stringify(res));
  }
}

main();
