// backlink-engine/src/scripts/submitHRStack.cjs
const https = require('https');

const payload = {
  name: "TalentXcel ATS Resume Diagnostic Scanner",
  website: "https://talentxcel.in/resume/ats-check",
  description: "Free AI-powered ATS resume diagnostic framework and parser compatibility scorer. Analyzes keyword distribution, parsing integrity, and format compatibility for Indian and global tech roles.",
  countries: "IN, US, SG, AE, GB",
  capabilities: ["applicant-tracking", "sourcing"],
  submitterEmail: "partnerships@talentxcel.in",
  contactEmail: "support@talentxcel.in",
  contactRole: "support",
  company_url_hp: ""
};

const data = JSON.stringify(payload);

const options = {
  hostname: 'hrstack.tech',
  port: 443,
  path: '/api/submissions',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data),
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Origin': 'https://hrstack.tech',
    'Referer': 'https://hrstack.tech/submit'
  }
};

console.log('Sending submission payload to HRStack...');
const req = https.request(options, res => {
  let resBody = '';
  res.on('data', chunk => resBody += chunk);
  res.on('end', () => {
    console.log('HTTP Status:', res.statusCode);
    console.log('Response Headers:', res.headers);
    console.log('Response Body:', resBody);
  });
});

req.on('error', e => console.error('Request error:', e));
req.write(data);
req.end();
