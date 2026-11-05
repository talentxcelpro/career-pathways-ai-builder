// backlink-engine/src/scripts/resolveBatch6Redirects.cjs
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { URL } = require('url');

const probeResults = JSON.parse(fs.readFileSync(path.join(__dirname, 'batch6_probe_results.json'), 'utf8'));

console.log(`Analyzing probe results across ${probeResults.length} candidates...`);

async function fetchWithRedirects(targetUrl, maxRedirects = 5, timeoutMs = 8000) {
  let currentUrl = targetUrl;
  let redirectsCount = 0;

  while (redirectsCount < maxRedirects) {
    try {
      const parsed = new URL(currentUrl);
      const client = parsed.protocol === 'https:' ? https : http;

      const res = await new Promise((resolve) => {
        let finished = false;
        const finish = (r) => { if (!finished) { finished = true; resolve(r); } };

        const req = client.get(
          parsed.href,
          {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.9',
            },
            rejectUnauthorized: false,
            timeout: timeoutMs
          },
          (res) => {
            let data = '';
            res.on('data', chunk => { if (data.length < 150000) data += chunk; });
            res.on('end', () => finish({ statusCode: res.statusCode, headers: res.headers, data, href: parsed.href }));
          }
        );
        req.on('error', (err) => finish({ error: err.message, statusCode: 0 }));
        req.on('timeout', () => { req.destroy(); finish({ error: 'TIMEOUT', statusCode: 0 }); });
      });

      if (res.error) {
        return { finalUrl: currentUrl, statusCode: 0, error: res.error, html: '' };
      }

      // Check for redirect
      if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
        const nextUrl = new URL(res.headers.location, currentUrl).href;
        currentUrl = nextUrl;
        redirectsCount++;
        continue;
      }

      return {
        finalUrl: currentUrl,
        statusCode: res.statusCode,
        html: res.data || '',
        headers: res.headers,
        redirectsCount
      };
    } catch (e) {
      return { finalUrl: currentUrl, statusCode: 0, error: e.message, html: '' };
    }
  }

  return { finalUrl: currentUrl, statusCode: 0, error: 'TOO_MANY_REDIRECTS', html: '' };
}

async function run() {
  const needsFollow = probeResults.filter(p => {
    const s = p.probe ? p.probe.status : 0;
    return [301, 302, 303, 307, 308].includes(s);
  });

  console.log(`Found ${needsFollow.length} candidates needing redirect resolution...`);

  for (let i = 0; i < needsFollow.length; i++) {
    const item = needsFollow[i];
    console.log(`[${i+1}/${needsFollow.length}] Following #${item.num} ${item.name} (${item.inputDomain})...`);
    
    const startUrl = item.inputDomain.startsWith('http') ? item.inputDomain : `https://${item.inputDomain}`;
    const resolved = await fetchWithRedirects(startUrl);

    // Update probe fields
    const data = resolved.html;
    const titleMatch = data.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim().replace(/\s+/g, ' ') : '';
    const formMatches = data.match(/<form[\s\S]*?<\/form>/gi) || [];
    const submitLinks = [...data.matchAll(/href=["']([^"']*(?:submit|add-tool|add-product|list-your|suggest|nominate|post-tool|claim)[^"']*)["']/gi)]
      .map(m => m[1]);

    const cleanText = data.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    const lower = data.toLowerCase();
    const mentionsFree = /free\s*submission|free\s*tier|100%\s*free|\$0|free\s*forever|standard\s*\(free\)/i.test(lower);
    const mentionsPaid = /\$\d+|\bpricing\b|\bpaid\b|\bsponsor\b|featured\s*listing|stripe/i.test(lower);
    const mentionsBadge = /embed\s*(?:our)?\s*badge|reciprocal\s*link|backlink\s*required/i.test(lower);
    const mentionsOAuth = /continue\s*with\s*google|sign\s*in\s*with\s*github|oauth|log\s*in\s*to\s*submit/i.test(lower);

    item.probe = {
      finalUrl: resolved.finalUrl,
      status: resolved.statusCode,
      latency: item.probe.latency,
      title: title.slice(0, 100),
      forms: formMatches.length,
      submitLinksCount: submitLinks.length,
      sampleSubmitLink: submitLinks[0] || null,
      hasCloudflare: data.includes('cf-browser-verification') || data.includes('Cloudflare') || (resolved.headers && resolved.headers['server'] === 'cloudflare'),
      hasCaptcha: data.includes('g-recaptcha') || data.includes('h-captcha') || data.includes('cf-turnstile'),
      cleanTextSnippet: cleanText.slice(0, 300),
      mentionsFree,
      mentionsPaid,
      mentionsBadge,
      mentionsOAuth,
      contentLength: data.length,
      error: resolved.error || null
    };

    console.log(`  -> Final status: ${resolved.statusCode} | Final URL: ${resolved.finalUrl} | Title: "${title.slice(0, 30)}" | Submits: ${submitLinks.length}`);
  }

  fs.writeFileSync(path.join(__dirname, 'batch6_probe_resolved.json'), JSON.stringify(probeResults, null, 2), 'utf8');
  console.log('Saved resolved probes to backlink-engine/src/scripts/batch6_probe_resolved.json');
}

run();
