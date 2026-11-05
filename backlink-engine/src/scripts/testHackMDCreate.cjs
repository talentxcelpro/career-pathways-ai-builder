// backlink-engine/src/scripts/testHackMDCreate.cjs
const https = require('https');

async function testHackMD() {
  // 1. GET /new
  const init = await new Promise((resolve, reject) => {
    https.get('https://hackmd.io/new', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0' },
      agent: false
    }, res => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        const cookies = (res.headers['set-cookie'] || []).map(c => c.split(';')[0]).join('; ');
        const csrfMatch = body.match(/_csrf=([^'"]+)/);
        resolve({ cookies, csrf: csrfMatch ? csrfMatch[1] : null });
      });
    }).on('error', reject);
  });

  console.log('Init cookies:', init.cookies);
  console.log('Init CSRF:', init.csrf);

  if (!init.csrf) return;

  // 2. POST /new
  const postData = `_csrf=${encodeURIComponent(init.csrf)}`;
  const postRes = await new Promise((resolve, reject) => {
    const req = https.request('https://hackmd.io/new?title=&alias=false&sync=&type=', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData),
        'Cookie': init.cookies,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0',
        'Referer': 'https://hackmd.io/new'
      },
      agent: false
    }, res => {
      let respBody = '';
      res.on('data', c => respBody += c);
      res.on('end', () => {
        resolve({ status: res.statusCode, headers: res.headers, body: respBody });
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });

  console.log('POST status:', postRes.status);
  console.log('POST location:', postRes.headers.location);
  console.log('POST body:', postRes.body.slice(0, 300));
}

testHackMD().catch(e => console.error(e));
