// backlink-engine/src/scripts/testRentry.cjs
const https = require('https');

async function testPublish() {
  // 1. Get CSRF Token
  const { cookie, csrfToken } = await new Promise((resolve, reject) => {
    https.get('https://rentry.co', { headers: { 'User-Agent': 'Mozilla/5.0' }, rejectUnauthorized: false }, res => {
      const setCookies = res.headers['set-cookie'] || [];
      let token = '';
      let cookieStr = '';
      setCookies.forEach(c => {
        cookieStr += c.split(';')[0] + '; ';
        if (c.includes('csrftoken=')) {
          token = c.split('csrftoken=')[1].split(';')[0];
        }
      });
      resolve({ cookie: cookieStr, csrfToken: token });
    }).on('error', reject);
  });

  console.log('Got CSRF Token:', csrfToken);

  // 2. Post test page
  const textContent = `# TalentXcel Open Technical Research
  
This is a verified educational resource published by TalentXcel Technologies.

- [TalentXcel Career OS](https://talentxcel.in)
- [TalentXcel ATS Resume Diagnostic Scanner](https://talentxcel.in/resume-scanner)
`;

  const postData = new URLSearchParams({
    csrfmiddlewaretoken: csrfToken,
    text: textContent,
    edit_code: 'talentxcel2026'
  }).toString();

  const publishRes = await new Promise((resolve, reject) => {
    const req = https.request('https://rentry.co/api/new', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData),
        'Cookie': cookie,
        'Referer': 'https://rentry.co',
        'User-Agent': 'Mozilla/5.0'
      },
      rejectUnauthorized: false
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });

  console.log('Publish result:', publishRes);
}

testPublish().catch(e => console.error(e));
