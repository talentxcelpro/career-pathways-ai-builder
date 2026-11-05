// backlink-engine/src/scripts/probeBatch6Candidates.cjs
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { URL } = require('url');

const dedupList = JSON.parse(fs.readFileSync(path.join(__dirname, 'batch6_dedup_initial.json'), 'utf8'));

console.log(`Starting Batch 6 automated probe across ${dedupList.length} candidates...`);

async function probeTarget(target, timeoutMs = 7000) {
  const urlStr = target.inputDomain.startsWith('http') ? target.inputDomain : `https://${target.inputDomain}`;
  
  return new Promise((resolve) => {
    let finished = false;
    const finish = (result) => {
      if (!finished) {
        finished = true;
        resolve(result);
      }
    };

    try {
      const parsed = new URL(urlStr);
      const client = parsed.protocol === 'https:' ? https : http;

      const startTime = Date.now();
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
          res.on('data', chunk => {
            if (data.length < 150000) data += chunk;
          });
          res.on('end', () => {
            const latency = Date.now() - startTime;
            const finalUrl = res.headers.location || parsed.href;
            const titleMatch = data.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
            const title = titleMatch ? titleMatch[1].trim().replace(/\s+/g, ' ') : '';
            
            // Check for forms, submit links
            const formMatches = data.match(/<form[\s\S]*?<\/form>/gi) || [];
            const submitLinks = [...data.matchAll(/href=["']([^"']*(?:submit|add-tool|add-product|list-your|suggest|nominate|post-tool|claim)[^"']*)["']/gi)]
              .map(m => m[1]);

            const hasCloudflare = data.includes('cf-browser-verification') || data.includes('Cloudflare') || res.headers['server'] === 'cloudflare';
            const hasCaptcha = data.includes('g-recaptcha') || data.includes('h-captcha') || data.includes('cf-turnstile');
            
            // Text checks
            const cleanText = data.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
            const lower = data.toLowerCase();
            const mentionsFree = /free\s*submission|free\s*tier|100%\s*free|\$0|free\s*forever|standard\s*\(free\)/i.test(lower);
            const mentionsPaid = /\$\d+|\bpricing\b|\bpaid\b|\bsponsor\b|featured\s*listing|stripe/i.test(lower);
            const mentionsBadge = /embed\s*(?:our)?\s*badge|reciprocal\s*link|backlink\s*required/i.test(lower);
            const mentionsOAuth = /continue\s*with\s*google|sign\s*in\s*with\s*github|oauth|log\s*in\s*to\s*submit/i.test(lower);

            finish({
              finalUrl,
              status: res.statusCode,
              latency,
              title: title.slice(0, 100),
              forms: formMatches.length,
              submitLinksCount: submitLinks.length,
              sampleSubmitLink: submitLinks[0] || null,
              hasCloudflare,
              hasCaptcha,
              cleanTextSnippet: cleanText.slice(0, 300),
              mentionsFree,
              mentionsPaid,
              mentionsBadge,
              mentionsOAuth,
              contentLength: data.length,
              error: null
            });
          });
        }
      );

      req.on('error', (err) => {
        finish({
          finalUrl: urlStr,
          status: 0,
          latency: Date.now() - startTime,
          title: '',
          forms: 0,
          submitLinksCount: 0,
          sampleSubmitLink: null,
          hasCloudflare: false,
          hasCaptcha: false,
          cleanTextSnippet: '',
          mentionsFree: false,
          mentionsPaid: false,
          mentionsBadge: false,
          mentionsOAuth: false,
          contentLength: 0,
          error: err.message
        });
      });

      req.on('timeout', () => {
        req.destroy();
        finish({
          finalUrl: urlStr,
          status: 0,
          latency: timeoutMs,
          title: 'TIMEOUT',
          forms: 0,
          submitLinksCount: 0,
          sampleSubmitLink: null,
          hasCloudflare: false,
          hasCaptcha: false,
          cleanTextSnippet: '',
          mentionsFree: false,
          mentionsPaid: false,
          mentionsBadge: false,
          mentionsOAuth: false,
          contentLength: 0,
          error: 'TIMEOUT'
        });
      });
    } catch (e) {
      finish({
        finalUrl: urlStr,
        status: 0,
        latency: 0,
        title: '',
        forms: 0,
        submitLinksCount: 0,
        sampleSubmitLink: null,
        hasCloudflare: false,
        hasCaptcha: false,
        cleanTextSnippet: '',
        mentionsFree: false,
        mentionsPaid: false,
        mentionsBadge: false,
        mentionsOAuth: false,
        contentLength: 0,
        error: e.message
      });
    }
  });
}

async function run() {
  const results = [];
  const CONCURRENCY = 6;
  
  for (let i = 0; i < dedupList.length; i += CONCURRENCY) {
    const chunk = dedupList.slice(i, i + CONCURRENCY);
    const chunkPromises = chunk.map(async (item) => {
      console.log(`[${item.num}/200] Probing ${item.name} (${item.inputDomain})...`);
      const p = await probeTarget(item);
      console.log(`  -> #${item.num} Status: ${p.status} | Title: "${p.title.slice(0, 30)}" | Forms: ${p.forms} | Submits: ${p.submitLinksCount}`);
      return {
        ...item,
        probe: p
      };
    });

    const chunkResults = await Promise.all(chunkPromises);
    results.push(...chunkResults);
  }

  fs.writeFileSync(path.join(__dirname, 'batch6_probe_results.json'), JSON.stringify(results, null, 2), 'utf8');
  console.log(`\nCompleted probing all 200 candidates. Saved to backlink-engine/src/scripts/batch6_probe_results.json`);
}

run();
