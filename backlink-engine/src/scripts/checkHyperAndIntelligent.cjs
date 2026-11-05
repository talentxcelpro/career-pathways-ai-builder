const https = require('https');

async function probe(url) {
  return new Promise(resolve => {
    https.get(url, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        resolve({ url, status: res.statusCode, text: data.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 500) });
      });
    });
  });
}

async function run() {
  console.log(await probe('https://hypertools.so/submit'));
  console.log(await probe('https://intelligenttools.co/submit'));
}
run();
