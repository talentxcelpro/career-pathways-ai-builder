// backlink-engine/src/scripts/probeBatch2Prospects.cjs
const https = require('https');
const http = require('http');
const { URL } = require('url');

const PROSPECTS = [
  { id: 'TXC_B2_001', name: 'Ignlab Launch', domain: 'ignlab.net', subUrl: 'https://launch.ignlab.net/' },
  { id: 'TXC_B2_002', name: 'Maybe Labs', domain: 'maybelabs.ai', subUrl: 'https://maybelabs.ai/launch' },
  { id: 'TXC_B2_003', name: 'CodeHype', domain: 'codehype.in', subUrl: 'https://www.codehype.in/submit-saas' },
  { id: 'TXC_B2_004', name: 'Upfynd', domain: 'upfynd.com', subUrl: 'https://upfynd.com/submit' },
  { id: 'TXC_B2_005', name: 'SupaHunt', domain: 'supahunt.com', subUrl: 'https://www.supahunt.com/submit' },
  { id: 'TXC_B2_006', name: 'The Tool Directory', domain: 'thetooldirectory.com', subUrl: 'https://thetooldirectory.com/submit-a-tool/' },
  { id: 'TXC_B2_007', name: 'Linkrena', domain: 'linkrena.com', subUrl: 'https://linkrena.com/' },
  { id: 'TXC_B2_008', name: 'Makeroo', domain: 'makeroo.app', subUrl: 'https://makeroo.app/submit' },
  { id: 'TXC_B2_009', name: '10015 Product Finder', domain: '10015.io', subUrl: 'https://10015.io/product-finder/submit' },
  { id: 'TXC_B2_010', name: 'Hype Star', domain: 'hypestar.org', subUrl: 'https://hypestar.org/submit' },
  { id: 'TXC_B2_011', name: 'AppsGit', domain: 'appsgit.com', subUrl: 'https://appsgit.com/submit' },
  { id: 'TXC_B2_012', name: 'FindOpenSource.dev', domain: 'findopensource.dev', subUrl: 'https://findopensource.dev/submit' },
  { id: 'TXC_B2_013', name: 'LibHunt', domain: 'libhunt.com', subUrl: 'https://www.libhunt.com/' },
  { id: 'TXC_B2_014', name: 'TeaserTrack', domain: 'teasertrack.cc', subUrl: 'https://teasertrack.cc/submit' },
  { id: 'TXC_B2_015', name: 'JevList', domain: 'jevlist.ai', subUrl: 'https://jevlist.ai/submit' },
  { id: 'TXC_B2_016', name: 'Ventmark', domain: 'useventmark.com', subUrl: 'https://useventmark.com/' },
  { id: 'TXC_B2_017', name: 'Central India Tech', domain: 'centralindiatech.com', subUrl: 'https://centralindiatech.com/submit' },
  { id: 'TXC_B2_018', name: 'LaunchPad India', domain: 'launchpadindia.in', subUrl: 'https://launchpadindia.in/' },
  { id: 'TXC_B2_019', name: 'Index by Dodo Payments', domain: 'dodopayments.com', subUrl: 'https://index.dodopayments.com/' },
  { id: 'TXC_B2_020', name: 'Bootstrap Directory', domain: 'bootstrapdirectory.com', subUrl: 'https://bootstrapdirectory.com/submit' },
  { id: 'TXC_B2_021', name: 'Altern', domain: 'altern.to', subUrl: 'https://altern.to/' },
  { id: 'TXC_B2_022', name: 'SaaSpa.ge', domain: 'saaspa.ge', subUrl: 'https://saaspa.ge/' },
  { id: 'TXC_B2_023', name: 'PeerPush', domain: 'peerpush.net', subUrl: 'https://peerpush.net/' },
  { id: 'TXC_B2_024', name: 'HUNT0', domain: 'hunt0.com', subUrl: 'https://hunt0.com/' },
  { id: 'TXC_B2_025', name: 'BetaPage', domain: 'betapage.co', subUrl: 'https://betapage.co/' },
  { id: 'TXC_B2_026', name: 'Open Startup List', domain: 'openstartuplist.com', subUrl: 'https://openstartuplist.com/' },
  { id: 'TXC_B2_027', name: 'AppaList', domain: 'appalist.com', subUrl: 'https://appalist.com/' },
  { id: 'TXC_B2_028', name: 'BuildHop', domain: 'buildhop.com', subUrl: 'https://buildhop.com/' },
  { id: 'TXC_B2_029', name: 'LaunchDirectories', domain: 'launchdirectories.com', subUrl: 'https://launchdirectories.com/' },
  { id: 'TXC_B2_030', name: 'Ramen.Tools', domain: 'ramen.tools', subUrl: 'https://ramen.tools/' }
];

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
          timeout: 10000
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
            const hasPaidOnly = body.includes('Pricing') && (body.includes('$') || body.includes('stripe')) && !body.includes('Free');

            resolve({
              finalUrl: currentUrl,
              status,
              latency,
              title,
              forms,
              bodySnippet: body.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 300),
              hasCloudflare,
              hasCaptcha,
              hasTurnstile,
              hasPaidOnly,
              contentLength: body.length,
              error: null
            });
          });
        });

        req.on('timeout', () => {
          req.destroy();
          resolve({ finalUrl: currentUrl, status: 0, error: 'TIMEOUT', latency: 10000 });
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
  console.log(`Starting live pre-submission probe of ${PROSPECTS.length} Batch 2 prospects...`);
  const results = [];

  for (let i = 0; i < PROSPECTS.length; i++) {
    const p = PROSPECTS[i];
    process.stdout.write(`[${i+1}/${PROSPECTS.length}] Probing ${p.name} (${p.subUrl})... `);
    const res = await probeUrl(p.subUrl);
    console.log(`HTTP ${res.status} | Latency: ${res.latency}ms | Title: "${(res.title || res.error || '').slice(0, 35)}"`);
    results.push({ ...p, probe: res });
    // Pace requests slightly
    await new Promise(r => setTimeout(r, 250));
  }

  const fs = require('fs');
  fs.writeFileSync('backlink-engine/src/scripts/batch2_probe_results.json', JSON.stringify(results, null, 2), 'utf8');
  console.log('Saved probe results to backlink-engine/src/scripts/batch2_probe_results.json');
}

run();
