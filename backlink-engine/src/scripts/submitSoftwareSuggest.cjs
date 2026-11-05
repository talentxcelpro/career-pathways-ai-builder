// backlink-engine/src/scripts/submitSoftwareSuggest.cjs
// SoftwareSuggest vendor registration - requires business email (no gmail/consumer)
// The form at /vendors uses an AJAX action — we need to find the POST endpoint first
const https = require('https');

// Search scripts for vendor form submission endpoint
https.get('https://www.softwaresuggest.com/vendors', {
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0' }
}, res => {
  let html = '';
  res.on('data', c => html += c);
  res.on('end', () => {
    // Find ajax actions or vendor form handlers
    const vendorAjax = [...html.matchAll(/["'](https?:\/\/[^"']*softwaresuggest[^"']*vendor[^"']*)["']/gi)].map(m => m[1]);
    const ajaxUrls = [...html.matchAll(/\burl\s*:\s*["']([^"']+)["']/gi)].map(m => m[1]);
    const vendorJs = [...html.matchAll(/<script\b[^>]*src=["']([^"']*vendor[^"']*)["'][^>]*>/gi)].map(m => m[1]);
    console.log('Vendor form-related ajax:', vendorAjax);
    console.log('All AJAX URLs in scripts:', ajaxUrls.filter(u => u.includes('vendor') || u.includes('GetListed')));
    console.log('Vendor JS includes:', vendorJs);
  });
});
