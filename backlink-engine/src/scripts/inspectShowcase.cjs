const https = require('https');

https.get('https://www.startupindia.gov.in/startup-india-showcase', { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    const scripts = data.match(/\/startup-india-showcase\/static\/js\/[^"']+/g) || [];
    console.log('Scripts:', scripts);
    if (scripts.length > 0) {
      const scriptUrl = 'https://www.startupindia.gov.in' + scripts[0];
      https.get(scriptUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } }, sRes => {
        let sData = '';
        sRes.on('data', c => { if (sData.length < 100000) sData += c; });
        sRes.on('end', () => {
          const apiMatches = sData.match(/https?:\/\/[^"']+(?:api|showcase|startup)[^"']*/gi) || [];
          console.log('API matches:', [...new Set(apiMatches)].slice(0, 10));
        });
      });
    }
  });
});
