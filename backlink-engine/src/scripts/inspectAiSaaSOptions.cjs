const https = require('https');

https.get('https://aisaasradar.com/submit', (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    // Extract select options
    const selectMatches = [...body.matchAll(/<select[^>]+name=["']([^"']+)["'][^>]*>([\s\S]*?)<\/select>/gi)];
    selectMatches.forEach(sm => {
      console.log(`Select [${sm[1]}]:`);
      const options = [...sm[2].matchAll(/<option[^>]*value=["']([^"']*)["'][^>]*>([\s\S]*?)<\/option>/gi)].map(o => `${o[1]}: ${o[2].trim()}`);
      console.log(options);
    });

    // Check submit button
    const submitBtn = body.match(/<button[^>]*type=["']submit["'][^>]*>([\s\S]*?)<\/button>|<input[^>]*type=["']submit["'][^>]*>/gi);
    console.log('Submit button:', submitBtn);
  });
}).on('error', err => console.log('Error:', err.message));
