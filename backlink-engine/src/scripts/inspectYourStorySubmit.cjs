// backlink-engine/src/scripts/inspectYourStorySubmit.cjs
const https = require('https');

function fetchPage(url) {
  return new Promise(resolve => {
    https.get(url, { 
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0' }, 
      timeout: 10000 
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    }).on('error', err => resolve({ status: 500, error: err.message }));
  });
}

async function run() {
  // YourStory
  const ys = await fetchPage('https://yourstory.com/companysearch/submit');
  console.log('YourStory status:', ys.status);
  if (ys.data) {
    const forms = [...ys.data.matchAll(/<form[\s\S]*?<\/form>/gi)];
    console.log('YourStory forms:', forms.length);
    const clean = ys.data.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    console.log('YourStory text:', clean.slice(0, 800));
  }

  // Dev.to
  const dt = await fetchPage('https://dev.to/enter');
  console.log('\nDev.to status:', dt.status);
  if (dt.data) {
    const forms = [...dt.data.matchAll(/<form[\s\S]*?<\/form>/gi)];
    console.log('Dev.to forms:', forms.length);
    const clean = dt.data.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    console.log('Dev.to text:', clean.slice(0, 500));
  }

  // StartupRanking
  const sr = await fetchPage('https://www.startupranking.com/api');
  console.log('\nStartupRanking /api status:', sr.status);
}

run();
