// backlink-engine/src/scripts/probeBatch5Candidates.cjs
const https = require('https');
const http = require('http');
const { URL } = require('url');
const fs = require('fs');

const dedup = JSON.parse(fs.readFileSync('backlink-engine/src/scripts/batch5_dedup_initial.json', 'utf8'));

function probeUrl(targetUrl, maxRedirects = 3) {
  return new Promise((resolve) => {
    let redirects = 0;

    function doRequest(currentUrl) {
      try {
        const parsed = new URL(currentUrl);
        const client = parsed.protocol === 'https:' ? https : http;
        const start = Date.now();

        const req = client.get(currentUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
          },
          timeout: 8000
        }, (res) => {
          const latency = Date.now() - start;
          const status = res.statusCode;
          const location = res.headers.location;

          if ([301, 302, 303, 307, 308].includes(status) && location && redirects < maxRedirects) {
            redirects++;
            const nextUrl = new URL(location, currentUrl).toString();
            return doRequest(nextUrl);
          }

          let body = '';
          res.on('data', chunk => {
            if (body.length < 50000) body += chunk;
          });

          res.on('end', () => {
            const titleMatch = body.match(/<title[^>]*>([^<]*)<\/title>/i);
            const title = titleMatch ? titleMatch[1].replace(/\s+/g, ' ').trim() : '';
            const forms = [...body.matchAll(/<form\b[^>]*>/gi)].length;
            const hasCloudflare = body.includes('cf-browser-verification') || body.includes('Just a moment...') || body.includes('Cloudflare');
            const hasTurnstile = body.includes('turnstile') || body.includes('cf-turnstile');
            const hasCaptcha = body.includes('recaptcha') || body.includes('hcaptcha') || hasTurnstile;
            const cleanText = body.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

            // Find submit / add links
            const submitLinks = [...body.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)]
              .map(m => ({ href: m[1], text: m[2].replace(/<[^>]+>/g, '').trim() }))
              .filter(l => l.text.toLowerCase().includes('submit') || 
                           l.text.toLowerCase().includes('add tool') || 
                           l.text.toLowerCase().includes('list tool') ||
                           l.text.toLowerCase().includes('submit tool') ||
                           l.text.toLowerCase().includes('submit ai') ||
                           l.href.includes('submit') || 
                           l.href.includes('add'));

            resolve({
              finalUrl: currentUrl,
              status,
              latency,
              title: title.slice(0, 100),
              forms,
              submitLinksCount: submitLinks.length,
              sampleSubmitLink: submitLinks.length > 0 ? submitLinks[0].href : null,
              hasCloudflare,
              hasCaptcha,
              cleanTextSnippet: cleanText.slice(0, 300),
              mentionsFree: /free\b|submit for free|free listing/i.test(cleanText),
              mentionsPaid: /pricing|\$|€|stripe|checkout|paid plan|sponsored/i.test(cleanText),
              mentionsBadge: /badge|reciprocal|embed.*backlink/i.test(cleanText),
              mentionsOAuth: /google|github|sign in|login|oauth/i.test(cleanText),
              contentLength: body.length,
              error: null
            });
          });
        });

        req.on('timeout', () => {
          req.destroy();
          resolve({ finalUrl: currentUrl, status: 0, error: 'TIMEOUT', latency: 8000 });
        });

        req.on('error', (err) => {
          resolve({ finalUrl: currentUrl, status: 0, error: err.message, latency: Date.now() - start });
        });

      } catch (err) {
        resolve({ finalUrl: currentUrl, status: 0, error: err.message, latency: 0 });
      }
    }

    doRequest(targetUrl);
  });
}

async function run() {
  console.log(`Starting Batch 5 automated probe across ${dedup.length} candidates...`);
  const results = [];

  for (let i = 0; i < dedup.length; i++) {
    const c = dedup[i];
    const targetUrl = `https://${c.inputDomain.split('/')[0]}`;
    process.stdout.write(`[${i+1}/${dedup.length}] Probing #${c.num} ${c.name} (${targetUrl})... `);
    
    const probe = await probeUrl(targetUrl);
    console.log(`HTTP ${probe.status} | Lat: ${probe.latency}ms | Title: "${(probe.title || probe.error || '').slice(0, 30)}"`);
    
    results.push({
      ...c,
      probe
    });

    // Pacing delay 150ms between probes
    await new Promise(r => setTimeout(r, 150));
  }

  fs.writeFileSync('backlink-engine/src/scripts/batch5_probe_results.json', JSON.stringify(results, null, 2), 'utf8');
  console.log('Saved 100 probe results to backlink-engine/src/scripts/batch5_probe_results.json');
}

run();
