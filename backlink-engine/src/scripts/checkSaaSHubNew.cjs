const https = require('https');

https.get('https://www.saashub.com/services/new?url=https%3A%2F%2Ftalentxcel.in%2Fresume%2Fats-check', { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    const formMatch = d.match(/<form[\s\S]*?<\/form>/i);
    if (formMatch) {
      console.log('Form on /services/new:');
      console.log(formMatch[0].slice(0, 1500));
    } else {
      console.log('No form on /services/new. Snippet:');
      console.log(d.slice(0, 1000).replace(/\s+/g, ' '));
    }
  });
});
