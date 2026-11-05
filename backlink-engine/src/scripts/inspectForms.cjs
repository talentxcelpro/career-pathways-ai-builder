// backlink-engine/src/scripts/inspectForms.cjs
const https = require('https');

async function fetchPage(url) {
  return new Promise(resolve => {
    try {
      const u = new URL(url);
      const req = https.request(u, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        },
        timeout: 6000,
        rejectUnauthorized: false
      }, res => {
        let data = '';
        res.on('data', c => { if (data.length < 200000) data += c; });
        res.on('end', () => resolve(data));
      });
      req.on('error', e => resolve(''));
      req.on('timeout', () => { req.destroy(); resolve(''); });
      req.end();
    } catch (e) {
      resolve('');
    }
  });
}

function parseForms(html, siteName) {
  console.log(`\n=== FORMS ON ${siteName} ===`);
  if (!html) {
    console.log('No HTML retrieved or timed out.');
    return;
  }
  const formRegex = /<form\b([^>]*)>([\s\S]*?)<\/form>/gi;
  let formMatch;
  let found = 0;
  while ((formMatch = formRegex.exec(html)) !== null) {
    found++;
    console.log(`Form #${found} action/attrs:`, formMatch[1].slice(0, 150));
    const inputs = [...formMatch[2].matchAll(/<(?:input|textarea|select)\b([^>]*)>/gi)].map(m => m[1].replace(/\s+/g, ' ').slice(0, 80));
    console.log(`Fields (${inputs.length}):`, inputs.slice(0, 8));
  }
  if (found === 0) {
    console.log('No <form> tags found. Might be client-side rendered (React/Next.js/Vue).');
    const hasNext = html.includes('__NEXT_DATA__');
    const hasReact = html.includes('react');
    console.log('Client-side SPA flags: Next.js =', hasNext, 'React =', hasReact);
  }
}

async function run() {
  console.log('Inspecting Ventmark...');
  const vHtml = await fetchPage('https://useventmark.com/new');
  parseForms(vHtml, 'Ventmark');

  console.log('\nInspecting Biziffy...');
  const bHtml = await fetchPage('https://www.biziffy.com/free-listing');
  parseForms(bHtml, 'Biziffy');

  console.log('\nInspecting CompanyInfo...');
  const cHtml = await fetchPage('https://www.companyinfo.in/register');
  parseForms(cHtml, 'CompanyInfo');
}

run();
