// backlink-engine/src/scripts/auditBatch6SubmitEndpoints.cjs
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { URL } = require('url');

const resolved = JSON.parse(fs.readFileSync(path.join(__dirname, 'batch6_probe_resolved.json'), 'utf8'));

// Filter unique candidates that are live (status 200)
const candidates = resolved.filter(r => !r.isDuplicate && r.probe && r.probe.status === 200);

console.log(`Starting submission endpoints probe on ${candidates.length} live candidates...`);

async function checkSubmitEndpoint(c, timeoutMs = 7000) {
  const p = c.probe;
  let submitUrl = null;

  if (p.sampleSubmitLink && !p.sampleSubmitLink.endsWith('.png') && !p.sampleSubmitLink.endsWith('.jpg')) {
    try {
      submitUrl = new URL(p.sampleSubmitLink, p.finalUrl).href;
    } catch (e) {
      submitUrl = `${p.finalUrl.replace(/\/$/, '')}/submit`;
    }
  } else {
    submitUrl = `${p.finalUrl.replace(/\/$/, '')}/submit`;
  }

  return new Promise((resolve) => {
    let finished = false;
    const finish = (res) => { if (!finished) { finished = true; resolve(res); } };

    try {
      const parsed = new URL(submitUrl);
      const client = parsed.protocol === 'https:' ? https : http;

      const req = client.get(
        parsed.href,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          },
          rejectUnauthorized: false,
          timeout: timeoutMs
        },
        (res) => {
          let data = '';
          res.on('data', chunk => { if (data.length < 150000) data += chunk; });
          res.on('end', () => {
            const loc = res.headers.location || '';
            const lower = data.toLowerCase();
            const hasForm = /<form/i.test(data);
            const hasInputs = /<input[^>]+type=["']?(?:text|url|email)/i.test(data);
            const isRedirectToLogin = [301, 302, 303, 307, 308].includes(res.statusCode) && /login|signin|sign-in|auth/i.test(loc);
            const hasLoginWall = /continue with google|sign in to submit|log in to submit|create an account|login to submit/i.test(lower);
            const hasReciprocal = /embed our badge|reciprocal backlink|backlink required|add our logo|badge on your/i.test(lower);
            
            const freeMatches = lower.match(/free\s*submission|free\s*tier|100%\s*free|\$0|standard\s*\(free\)|free\s*forever/gi) || [];
            const prices = [...lower.matchAll(/\$\d+/g)].map(m => m[0]);
            
            const hasPaidOnly = prices.length > 0 && freeMatches.length === 0;

            finish({
              num: c.num,
              name: c.name,
              domain: c.canonicalRoot,
              submitUrl,
              statusCode: res.statusCode,
              location: loc,
              isRedirectToLogin,
              hasLoginWall,
              hasForm,
              hasInputs,
              hasReciprocal,
              freeMatches,
              prices: [...new Set(prices)],
              hasPaidOnly,
              contentLength: data.length,
              error: null
            });
          });
        }
      );

      const errFallback = (errMsg) => ({
        num: c.num,
        name: c.name,
        domain: c.canonicalRoot,
        submitUrl,
        statusCode: 0,
        location: '',
        isRedirectToLogin: false,
        hasLoginWall: false,
        hasForm: false,
        hasInputs: false,
        hasReciprocal: false,
        freeMatches: [],
        prices: [],
        hasPaidOnly: false,
        contentLength: 0,
        error: errMsg
      });

      req.on('error', (err) => finish(errFallback(err.message)));
      req.on('timeout', () => { req.destroy(); finish(errFallback('TIMEOUT')); });
    } catch (e) {
      finish({
        num: c.num,
        name: c.name,
        domain: c.canonicalRoot,
        submitUrl,
        statusCode: 0,
        location: '',
        isRedirectToLogin: false,
        hasLoginWall: false,
        hasForm: false,
        hasInputs: false,
        hasReciprocal: false,
        freeMatches: [],
        prices: [],
        hasPaidOnly: false,
        contentLength: 0,
        error: e.message
      });
    }
  });
}

async function run() {
  const results = [];
  const CONCURRENCY = 6;

  for (let i = 0; i < candidates.length; i += CONCURRENCY) {
    const chunk = candidates.slice(i, i + CONCURRENCY);
    const chunkPromises = chunk.map(async (c) => {
      const res = await checkSubmitEndpoint(c);
      console.log(`[${c.num}] ${c.name} (${c.canonicalRoot}) -> Status: ${res.statusCode} | Loc: ${res.location || 'NONE'} | Form: ${res.hasForm} | Inputs: ${res.hasInputs} | Free: ${res.freeMatches.length > 0} | PaidOnly: ${res.hasPaidOnly} | Reciprocal: ${res.hasReciprocal}`);
      return res;
    });

    const chunkResults = await Promise.all(chunkPromises);
    results.push(...chunkResults);
  }

  fs.writeFileSync(path.join(__dirname, 'batch6_submit_endpoints_audit.json'), JSON.stringify(results, null, 2), 'utf8');
  console.log(`Saved submit audit to backlink-engine/src/scripts/batch6_submit_endpoints_audit.json`);
}

run();
