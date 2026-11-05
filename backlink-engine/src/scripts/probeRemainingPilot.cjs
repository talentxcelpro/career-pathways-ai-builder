const https = require('https');

const candidates = [
  { name: 'AI Bookmarks', url: 'https://aibookmarks.net/submit' },
  { name: 'Stackdrop', url: 'https://getstackdrop.com/submit' },
  { name: 'AI Gear Base', url: 'https://aigearbase.com/submit' }
];

candidates.forEach(c => {
  https.get(c.url, { timeout: 8000 }, res => {
    let d = '';
    res.on('data', chunk => { if (d.length < 50000) d += chunk; });
    res.on('end', () => {
      console.log(`${c.name} Status:`, res.statusCode);
      const hasForm = /<form/i.test(d);
      const action = d.match(/<form[^>]+action=["']([^"']*)["']/i);
      const hasCaptcha = /recaptcha|turnstile|hcaptcha/i.test(d);
      console.log(`  hasForm: ${hasForm}, action: ${action ? action[1] : 'N/A'}, CAPTCHA: ${hasCaptcha}`);
    });
  }).on('error', e => console.log(`${c.name} error:`, e.message));
});
