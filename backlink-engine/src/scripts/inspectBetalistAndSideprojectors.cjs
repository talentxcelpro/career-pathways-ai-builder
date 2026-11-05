// backlink-engine/src/scripts/inspectBetalistAndSideprojectors.cjs
const https = require('https');

function fetchPage(url) {
  return new Promise(resolve => {
    https.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0' },
      timeout: 10000
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, location: res.headers.location, data }));
    }).on('error', err => resolve({ status: 500, error: err.message }));
  });
}

async function run() {
  // Betalist
  const b = await fetchPage('https://betalist.com/submissions/new');
  console.log('Betalist /submissions/new status:', b.status);
  const bForms = [...(b.data || '').matchAll(/<form[\s\S]*?<\/form>/gi)];
  console.log('Betalist forms:', bForms.length);
  if (bForms.length > 0) {
    console.log('Betalist form snippet:', bForms[0][0].slice(0, 1000));
  } else {
    const clean = (b.data || '').replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    console.log('Betalist text:', clean.slice(0, 500));
  }

  // Sideprojectors
  const sp = await fetchPage('https://www.sideprojectors.com/project/add-product');
  console.log('\nSideprojectors status:', sp.status);
  const spForms = [...(sp.data || '').matchAll(/<form[\s\S]*?<\/form>/gi)];
  console.log('Sideprojectors forms:', spForms.length);
  if (spForms.length > 0) {
    console.log('Sideprojectors form snippet:', spForms[0][0].slice(0, 1000));
  } else {
    const clean = (sp.data || '').replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    console.log('Sideprojectors text:', clean.slice(0, 500));
  }
}

run();
