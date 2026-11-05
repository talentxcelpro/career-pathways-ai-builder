const https = require('https');

// Inspect Launching Next full form
https.get('https://www.launchingnext.com/submit/', { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    const formMatch = d.match(/<form[\s\S]*?<\/form>/i);
    if (formMatch) {
      console.log('=== LAUNCHING NEXT FULL FORM ===');
      console.log(formMatch[0]);
    }
  });
});

// Inspect SaaSHub submit form
https.get('https://www.saashub.com/submit', { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    const formMatch = d.match(/<form[\s\S]*?<\/form>/i);
    if (formMatch) {
      console.log('\n=== SAASHUB FULL FORM ===');
      console.log(formMatch[0]);
    } else {
      console.log('\n=== SAASHUB NO FORM FOUND, SNIPPET: ===');
      console.log(d.slice(0, 1500).replace(/\s+/g, ' '));
    }
  });
});
