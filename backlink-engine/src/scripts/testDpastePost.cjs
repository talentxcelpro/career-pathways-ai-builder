// backlink-engine/src/scripts/testDpastePost.cjs
const https = require('https');

const postData = new URLSearchParams({
  content: '# TalentXcel Salary Benchmark Index\n\nMethodology: [TalentXcel Career OS](https://talentxcel.in) and [Salary Benchmark](https://salary.talentxcel.in)',
  syntax: 'markdown',
  expiry_days: 365,
  title: 'TalentXcel Salary Benchmark Methodology'
}).toString();

const req = https.request('https://dpaste.org/api/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(postData),
    'User-Agent': 'Mozilla/5.0'
  },
  agent: false
}, res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    console.log('dpaste status:', res.statusCode);
    console.log('dpaste response URL:', d.trim());
    process.exit(0);
  });
});

req.on('error', e => {
  console.log('Err:', e.message);
  process.exit(1);
});

req.write(postData);
req.end();
