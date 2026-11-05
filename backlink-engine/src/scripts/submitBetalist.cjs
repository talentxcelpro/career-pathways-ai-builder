// backlink-engine/src/scripts/submitBetalist.cjs
const https = require('https');

// Step 1: GET the form to extract authenticity token
https.get('https://betalist.com/submissions/new', {
  headers: { 
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
  }
}, res => {
  let html = '';
  let setCookies = res.headers['set-cookie'] || [];
  res.on('data', c => html += c);
  res.on('end', () => {
    // Extract authenticity token
    const tokenMatch = html.match(/name="authenticity_token" value="([^"]+)"/);
    if (!tokenMatch) {
      console.log('No authenticity_token found');
      return;
    }
    const token = tokenMatch[1];
    const cookieStr = setCookies.map(c => c.split(';')[0]).join('; ');
    console.log('Got token:', token.slice(0, 30) + '...');
    console.log('Cookies:', cookieStr.slice(0, 80) + '...');

    // Step 2: POST submission
    const querystring = require('querystring');
    const payload = querystring.stringify({
      'authenticity_token': token,
      'submission[startup_attributes][website_url]': 'https://talentxcel.in',
      'submission[startup_attributes][name]': 'TalentXcel',
      'submission[startup_attributes][tagline]': 'AI-powered ATS resume diagnostic and career intelligence platform for engineers and recruiters',
      'submission[startup_attributes][description]': 'TalentXcel is an AI-driven career OS and talent intelligence platform. It offers free ATS resume diagnostics, parser compatibility scoring, salary benchmarks for Indian tech roles, and employer-to-campus hiring pipelines. Built for engineers, technical recruiters, and university placement cells across India.',
      'submission[email]': 'founder@talentxcel.in'
    });

    const postOptions = {
      hostname: 'betalist.com',
      port: 443,
      path: '/submissions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(payload),
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36',
        'Referer': 'https://betalist.com/submissions/new',
        'Origin': 'https://betalist.com',
        'Cookie': cookieStr
      }
    };

    console.log('Submitting to Betalist...');
    const req = https.request(postOptions, postRes => {
      let body = '';
      postRes.on('data', chunk => body += chunk);
      postRes.on('end', () => {
        console.log('HTTP Status:', postRes.statusCode);
        console.log('Location:', postRes.headers.location);
        if (postRes.statusCode === 200 || postRes.statusCode === 302) {
          console.log('SUCCESS: Betalist submission accepted!');
        }
        console.log('Body preview:', body.slice(0, 300));
      });
    });

    req.on('error', e => console.error('Error:', e));
    req.write(payload);
    req.end();
  });
}).on('error', e => console.error('GET error:', e));
