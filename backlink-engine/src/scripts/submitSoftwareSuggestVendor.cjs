// backlink-engine/src/scripts/submitSoftwareSuggestVendor.cjs
const https = require('https');
const querystring = require('querystring');

// Step 1: POST to /registerverifyvendor/vendorsave (form "one")
const payload1 = querystring.stringify({
  'GetListed[currentform]': 'one',
  'GetListed[country]': 'India',
  'GetListed[lastname]': 'Arshid Wani',
  'GetListed[email]': 'founder@talentxcel.in',
  'GetListed[company]': 'TalentXcel',
  'GetListed[phone]': '+917006000000',
  'GetListed[countrycode]': '+91',
  'GetListed[countryname]': 'India',
  'GetListed[product_url]': 'https://talentxcel.in'
});

const options = {
  hostname: 'www.softwaresuggest.com',
  port: 443,
  path: '/registerverifyvendor/vendorsave',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(payload1),
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Referer': 'https://www.softwaresuggest.com/vendors',
    'Origin': 'https://www.softwaresuggest.com',
    'Accept': 'application/json, text/javascript, */*; q=0.01',
    'X-Requested-With': 'XMLHttpRequest'
  }
};

console.log('Submitting SoftwareSuggest vendor registration (Step 1)...');
const req = https.request(options, res => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('HTTP Status:', res.statusCode);
    console.log('Response Body:', body.slice(0, 500));
  });
});

req.on('error', e => console.error('Error:', e));
req.write(payload1);
req.end();
