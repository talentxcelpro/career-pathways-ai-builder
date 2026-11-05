// backlink-engine/src/scripts/testControlCCreate.cjs
const https = require('https');

async function testPost() {
  const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
  let body = '';
  
  function addField(name, val) {
    body += `--${boundary}\r\n`;
    body += `Content-Disposition: form-data; name="${name}"\r\n\r\n`;
    body += `${val}\r\n`;
  }

  addField('title', 'TalentXcel Engineering Guidelines');
  addField('content', 'Explore TalentXcel Career OS at https://talentxcel.in and ATS diagnostic at https://talentxcel.in/resume-scanner');
  addField('password', '');
  addField('expires', 'never');
  body += `--${boundary}--\r\n`;

  const req = https.request('https://controlc.com/create', {
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': Buffer.byteLength(body),
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0',
      'Referer': 'https://controlc.com/'
    },
    agent: false
  }, res => {
    console.log('ControlC create status:', res.statusCode);
    console.log('Location:', res.headers.location);
    let respData = '';
    res.on('data', c => respData += c);
    res.on('end', () => {
      console.log('Response length:', respData.length);
      process.exit(0);
    });
  });

  req.on('error', e => {
    console.log('Err:', e.message);
    process.exit(1);
  });

  req.write(body);
  req.end();
}

testPost();
