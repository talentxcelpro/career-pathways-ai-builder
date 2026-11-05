const https = require('https');

const list = [
  'https://www.aitoollist.org/submit-a-tool',
  'https://www.basedtools.ai/submit',
  'https://www.listyourtool.com/submit-tool'
];

list.forEach(u => {
  https.get(u, { headers: { 'User-Agent': 'Mozilla/5.0' }, rejectUnauthorized: false }, res => {
    let data = '';
    res.on('data', c => { if (data.length < 50000) data += c; });
    res.on('end', () => {
      console.log(u, 'Status:', res.statusCode, 'Inputs:', /<input/i.test(data), 'Free:', /free/i.test(data), 'Prices:', [...data.matchAll(/\$\d+/g)].map(m => m[0]));
    });
  }).on('error', e => console.log(u, 'Error:', e.message));
});
