const https = require('https');
const querystring = require('querystring');

const postData = querystring.stringify({
  tool_name: 'TalentXcel Resume ATS Compatibility Checker',
  website_url: 'https://talentxcel.in/resume/ats-check',
  submitter_email: 'partnerships@talentxcel.in',
  category: 'Productivity & Translation',
  pricing: 'Free',
  description: 'TalentXcel provides a free online resume ATS compatibility checker that analyses resume formatting, keyword alignment and potential content gaps. It helps job seekers identify areas for improvement and prepare their resumes for online job applications.',
  tags: 'ATS, Resume Checker, Career Tools, Productivity',
  company_website: '',
  no_offers: '1'
});

console.log('Dispatching submission to AI SaaS Radar (https://aisaasradar.com/submit-process.php)...');
console.log('Payload bytes:', Buffer.byteLength(postData));

const req = https.request(
  {
    hostname: 'aisaasradar.com',
    path: '/submit-process.php',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData),
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Referer': 'https://aisaasradar.com/submit',
      'Origin': 'https://aisaasradar.com'
    },
    timeout: 10000
  },
  (res) => {
    let responseBody = '';
    console.log('Response Status:', res.statusCode);
    console.log('Response Headers:', res.headers);

    res.on('data', chunk => responseBody += chunk);
    res.on('end', () => {
      console.log('Response Body Snippet (first 1000 chars):');
      console.log(responseBody.slice(0, 1000).replace(/\s+/g, ' '));
    });
  }
);

req.on('error', err => {
  console.log('Network Error:', err.message);
});

req.on('timeout', () => {
  req.destroy();
  console.log('Request Timeout.');
});

req.write(postData);
req.end();
