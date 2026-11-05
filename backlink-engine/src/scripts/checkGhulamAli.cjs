const https = require('https');

const targetUrl = 'https://ghulamaliseo.com/backlinks/';

function fetchPage(urlStr) {
  return new Promise((resolve) => {
    try {
      const u = new URL(urlStr);
      const req = https.request(
        {
          hostname: u.hostname,
          path: u.pathname + u.search,
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
          },
          timeout: 10000
        },
        (res) => {
          let data = '';
          res.on('data', chunk => {
            if (data.length < 500000) data += chunk; // capture up to 500kb
          });
          res.on('end', () => {
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              body: data
            });
          });
        }
      );
      req.on('error', err => resolve({ error: err.message }));
      req.on('timeout', () => { req.destroy(); resolve({ error: 'TIMEOUT' }); });
      req.end();
    } catch (e) {
      resolve({ error: e.message });
    }
  });
}

async function audit() {
  console.log(`Fetching ${targetUrl}...`);
  const res = await fetchPage(targetUrl);
  if (res.error) {
    console.log(`Error: ${res.error}`);
    return;
  }
  console.log(`Status Code: ${res.statusCode}`);
  if (res.statusCode >= 300 && res.statusCode < 400) {
    console.log(`Redirect Location: ${res.headers.location}`);
  }
  console.log(`Content-Type: ${res.headers['content-type']}`);
  console.log(`Body Length: ${res.body.length}`);

  // Extract title
  const titleMatch = res.body.match(/<title>([^<]+)<\/title>/i);
  console.log(`Title: ${titleMatch ? titleMatch[1].trim() : 'N/A'}`);

  // Extract meta description
  const descMatch = res.body.match(/<meta[^>]+name=["']description["'][^>]*content=["']([^"']+)["']/i);
  console.log(`Meta Description: ${descMatch ? descMatch[1].trim() : 'N/A'}`);

  // Extract H1 and H2 tags
  const h1Matches = [...res.body.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map(m => m[1].replace(/<[^>]+>/g, '').trim());
  console.log('H1:', h1Matches);

  const h2Matches = [...res.body.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)].map(m => m[1].replace(/<[^>]+>/g, '').trim());
  console.log('H2 (sample):', h2Matches.slice(0, 10));

  // Extract outbound links / tables / lists
  const links = [...res.body.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)]
    .map(m => ({ href: m[1], text: m[2].replace(/<[^>]+>/g, '').trim() }))
    .filter(l => l.href.startsWith('http'));

  console.log(`Total external links found: ${links.length}`);
  console.log('Sample links:', links.slice(0, 15));

  // Check if there are tables with backlink lists
  const tableMatches = [...res.body.matchAll(/<table[^>]*>([\s\S]*?)<\/table>/gi)];
  console.log(`Tables found: ${tableMatches.length}`);
}

audit();
