const https = require('https');

function checkPage(url) {
  https.get(url, res => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => {
      const lower = data.toLowerCase();
      const hasInputs = [...data.matchAll(/<input[^>]+name=["']([^"']+)["']/gi)].map(m => m[1]);
      const prices = [...data.matchAll(/\$\d+/g)].map(m => m[0]);
      console.log(url);
      console.log('Inputs:', hasInputs);
      console.log('Prices:', prices);
      console.log('Has Free:', /free/i.test(data));
      const text = data.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
      console.log('Snippet around submit/pricing:', text.slice(text.indexOf('Submit'), text.indexOf('Submit') + 500));
    });
  });
}

checkPage('https://hypertools.so/submit');
checkPage('https://intelligenttools.co/submit');
