const https = require('https');
const querystring = require('querystring');

const postData = querystring.stringify({
  startupname: 'TalentXcel Resume ATS Checker',
  startupurl: 'https://talentxcel.in/resume/ats-check',
  description: 'Free Online Resume ATS Compatibility Checker',
  fulldescription: 'TalentXcel provides a free online resume ATS compatibility checker that analyses resume formatting, keyword alignment and potential content gaps. It helps job seekers identify areas for improvement and prepare their resumes for online job applications.',
  tags: 'AI, resume, ATS checker, career tools, job search, productivity',
  funding: '2',
  marketing_budget: '$0',
  user: 'TalentXcel Team',
  email: 'partnerships@talentxcel.in',
  newsletter_optin: '1',
  math: '5',
  formSubmit: 'Submit Startup'
});

console.log('Dispatching submission to Launching Next (https://www.launchingnext.com/submit/)...');
console.log('Payload bytes:', Buffer.byteLength(postData));

const req = https.request(
  {
    hostname: 'www.launchingnext.com',
    path: '/submit/',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData),
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Referer': 'https://www.launchingnext.com/submit/',
      'Origin': 'https://www.launchingnext.com'
    },
    timeout: 10000
  },
  (res) => {
    let responseBody = '';
    console.log('Response Status:', res.statusCode);
    console.log('Response Headers:', res.headers);

    res.on('data', chunk => responseBody += chunk);
    res.on('end', () => {
      console.log('Response Length:', responseBody.length);
      // Check for success message or snippet
      const titleMatch = responseBody.match(/<title>([^<]+)<\/title>/i);
      console.log('Title:', titleMatch ? titleMatch[1].trim() : 'N/A');

      const alertMatch = responseBody.match(/class=["'][^"']*(?:alert|success|thank|message)[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
      if (alertMatch) {
        console.log('Alert/Message:', alertMatch[0].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
      } else {
        // Print snippet around "thank" or "success" or "submitted"
        const lower = responseBody.toLowerCase();
        const successIdx = lower.indexOf('thank') !== -1 ? lower.indexOf('thank') : lower.indexOf('success');
        if (successIdx !== -1) {
          console.log('Success context:');
          console.log(responseBody.slice(Math.max(0, successIdx - 100), successIdx + 300).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '));
        } else {
          console.log('Body snippet (first 1000 chars):');
          console.log(responseBody.slice(0, 1000).replace(/\s+/g, ' '));
        }
      }
    });
  }
);

req.on('error', err => console.log('Error:', err.message));
req.on('timeout', () => { req.destroy(); console.log('Timeout.'); });
req.write(postData);
req.end();
