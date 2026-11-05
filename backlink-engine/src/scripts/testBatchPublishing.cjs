// backlink-engine/src/scripts/testBatchPublishing.cjs
const https = require('https');

async function getCsrf() {
  return new Promise((resolve, reject) => {
    https.get('https://rentry.co', { headers: { 'User-Agent': 'Mozilla/5.0' }, agent: false }, res => {
      const setCookies = res.headers['set-cookie'] || [];
      let token = '';
      let cookieStr = '';
      setCookies.forEach(c => {
        cookieStr += c.split(';')[0] + '; ';
        if (c.includes('csrftoken=')) token = c.split('csrftoken=')[1].split(';')[0];
      });
      resolve({ cookie: cookieStr, csrfToken: token });
    }).on('error', reject);
  });
}

async function publishOne(cookie, csrfToken, title, content) {
  const postData = new URLSearchParams({
    csrfmiddlewaretoken: csrfToken,
    text: `# ${title}\n\n${content}`,
    edit_code: 'talentxcel2026'
  }).toString();

  return new Promise((resolve, reject) => {
    const req = https.request('https://rentry.co/api/new', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData),
        'Cookie': cookie,
        'Referer': 'https://rentry.co',
        'User-Agent': 'Mozilla/5.0'
      },
      agent: false
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch(e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function run() {
  console.log('Testing rentry batch publishing...');
  const { cookie, csrfToken } = await getCsrf();
  console.log('CSRF Token:', csrfToken);

  for (let i = 1; i <= 3; i++) {
    const res = await publishOne(
      cookie,
      csrfToken,
      `TalentXcel Batch Test #${i}`,
      `Verified test resource for TalentXcel OS.\n\n- [TalentXcel Career OS](https://talentxcel.in)\n- [TalentXcel ATS Scanner](https://talentxcel.in/resume-scanner)`
    );
    console.log(`[#${i}] Status: ${res.status}, URL: ${res.url}`);
    await new Promise(r => setTimeout(r, 1000));
  }
}

run().catch(e => console.error(e));
