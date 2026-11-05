// backlink-engine/src/scripts/inspectSoftwareSuggestForm2.cjs
const https = require('https');

https.get('https://www.softwaresuggest.com/vendors', {
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0' }
}, res => {
  let html = '';
  res.on('data', c => html += c);
  res.on('end', () => {
    const forms = [...html.matchAll(/<form[\s\S]*?<\/form>/gi)];
    // full form 2 - vendor registration form
    if (forms[1]) {
      console.log('=== VENDOR REGISTRATION FORM (FULL) ===');
      console.log(forms[1][0].slice(0, 3000));
    }
    // look for form action
    const actions = [...html.matchAll(/action\s*=\s*["']([^"']+)["']/gi)].map(m => m[1]);
    console.log('Form actions:', actions);
    const postUrls = [...html.matchAll(/url\s*[:=]\s*["']([^"']*\/vendor[^"']*)["']/gi)].map(m => m[1]);
    console.log('Vendor post URLs:', postUrls);
  });
});
