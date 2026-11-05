// backlink-engine/src/scripts/findHRStackApi.cjs
const https = require('https');

async function fetchUrl(url) {
  return new Promise(resolve => {
    https.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0' }
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    }).on('error', () => resolve(''));
  });
}

async function run() {
  const chunks = [
    'https://hrstack.tech/_next/static/immutable/chunks/0meshd4c712hl.js',
    'https://hrstack.tech/_next/static/immutable/chunks/00h0g8e83t1za.js',
    'https://hrstack.tech/_next/static/immutable/chunks/1-pmlk8bexi12.js',
    'https://hrstack.tech/_next/static/immutable/chunks/0orhf5bg_0sk-.js',
    'https://hrstack.tech/_next/static/immutable/chunks/3l9jlg1uolzhi.js',
    'https://hrstack.tech/_next/static/immutable/chunks/00z4pmesk2f4f.js',
    'https://hrstack.tech/_next/static/immutable/chunks/13ec6wb9ey27o.js',
    'https://hrstack.tech/_next/static/immutable/chunks/0c0hxoamwjsbw.js',
    'https://hrstack.tech/_next/static/immutable/chunks/2-qk6wn3pw9-g.js'
  ];

  for (const c of chunks) {
    const text = await fetchUrl(c);
    if (text.includes('/api/') || text.includes('Submit product') || text.includes('Product name')) {
      console.log('Found match in:', c);
      // look for fetch or api routes
      const apiMatches = [...text.matchAll(/["'](\/api\/[^"']+)["']/g)].map(m => m[1]);
      console.log('API routes:', apiMatches);
      // let's see snippets around submit
      const idx = text.indexOf('Submit product');
      if (idx !== -1) {
        console.log('Snippet around Submit product:');
        console.log(text.substring(Math.max(0, idx - 400), Math.min(text.length, idx + 400)));
      }
    }
  }
}

run();
