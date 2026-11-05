const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { URL } = require('url');

const probeResults = JSON.parse(fs.readFileSync(path.join(__dirname, 'batch5_probe_results.json'), 'utf8'));

const targets = [
  { num: 2, name: 'AI App Review', domain: 'ai-appreview.com', url: 'https://www.ai-appreview.com/submit-your-listing/' },
  { num: 5, name: 'AI Toolflow', domain: 'ai-toolflow.com', url: 'mailto:hello@toolflow.io' },
  { num: 10, name: 'AI Dream Hub', domain: 'aidreamhub.com', url: 'https://aidreamhub.com/submit' },
  { num: 13, name: 'AI for Developers', domain: 'aifordevelopers.org', url: 'https://aifordevelopers.org/submit' },
  { num: 14, name: 'AI Hubs', domain: 'aihubs.ai', url: 'https://aihubs.ai/submit' },
  { num: 15, name: 'AI Hustle Tools', domain: 'aihustle.tools', url: 'https://aihustle.tools/submit/' },
  { num: 16, name: 'AI Kaptan', domain: 'aikaptan.com', url: 'https://www.aikaptan.com/submit' },
  { num: 18, name: 'AI Nave', domain: 'ainave.com', url: 'https://ainave.com/submit/products' },
  { num: 22, name: 'AI Tool List', domain: 'aitoollist.org', url: 'https://aitoollist.org/submit-a-tool' },
  { num: 30, name: 'AI Tools Prime', domain: 'aitoolsprime.com', url: 'https://aitoolsprime.com/submit-ai-tool' },
  { num: 33, name: 'AI Top Tools', domain: 'aitoptools.com', url: 'https://aitoptools.com/claim-your-tool/' },
  { num: 49, name: 'Based Tools', domain: 'basedtools.ai', url: 'https://basedtools.ai/submit' },
  { num: 63, name: 'Find An AI Tool', domain: 'findanaitools.com', url: 'https://findanaitools.com/s/submit' },
  { num: 64, name: 'Find My AI Tool', domain: 'findmyaitool.com', url: 'https://findmyaitool.com/submit-tool' },
  { num: 66, name: 'FlowTools', domain: 'flowtools.co', url: 'https://www.flowtools.co/submit' },
  { num: 73, name: 'HyperTools', domain: 'hypertools.so', url: 'https://hypertools.so/submit' },
  { num: 74, name: 'Intelligent Tools', domain: 'intelligenttools.co', url: 'https://intelligenttools.co/submit' },
  { num: 78, name: 'List Your Tool', domain: 'listyourtool.com', url: 'https://listyourtool.com/submit-tool' },
  { num: 79, name: 'Makerlist', domain: 'makerlist.io', url: 'https://makerlist.io/submit' },
  { num: 81, name: 'Most Popular AI Tools', domain: 'mostpopularaitools.com', url: 'https://mostpopularaitools.com/submit' },
  { num: 83, name: 'NavFolders', domain: 'navfolders.com', url: 'https://navfolders.com/submit' },
  { num: 84, name: 'NavTools AI', domain: 'navtools.ai', url: 'https://navtools.ai/submit' },
  { num: 89, name: 'Powered by AI', domain: 'poweredbyai.app', url: 'https://poweredbyai.app/submit-tool' },
  { num: 90, name: 'Selljam AI', domain: 'selljam.ai', url: 'https://selljam.ai/directory/submit' },
  { num: 91, name: 'Stackviv', domain: 'stackviv.ai', url: 'https://stackviv.ai/submit' },
  { num: 94, name: 'Submit AI Tools', domain: 'submitaitools.org', url: 'https://submitaitools.org/' },
  { num: 96, name: 'AI Hunt List', domain: 'aihuntlist.com', url: 'https://aihuntlist.com/submission/new' },
  { num: 98, name: 'Launch Vault', domain: 'launchvault.dev', url: 'https://www.launchvault.dev/projects/submit' },
  { num: 100, name: 'AI Agents Directory', domain: 'aiagentsdirectory.com', url: 'https://aiagentsdirectory.com/submit-agent' }
];

async function checkUrl(t) {
  if (t.url.startsWith('mailto:')) {
    return {
      num: t.num,
      name: t.name,
      domain: t.domain,
      url: t.url,
      type: 'EMAIL_PITCH',
      status: 200,
      notes: 'Direct editorial email submission'
    };
  }

  return new Promise(resolve => {
    try {
      const u = new URL(t.url);
      const client = u.protocol === 'https:' ? https : http;
      const req = client.get(u.href, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
        },
        rejectUnauthorized: false,
        timeout: 8000
      }, res => {
        let data = '';
        res.on('data', c => { if (data.length < 80000) data += c; });
        res.on('end', () => {
          const loc = res.headers.location || '';
          const lower = data.toLowerCase();
          const hasForm = /<form/i.test(data);
          const hasInputs = /<input[^>]+type=["']?(?:text|url|email)/i.test(data);
          const isRedirectToLogin = /login|signin|sign-in|auth/i.test(loc);
          const hasLoginText = /sign[\s-_]?in|log[\s-_]?in|continue with google/i.test(data);
          const hasReciprocal = /reciprocal|badge|embed our|backlink to/i.test(lower);
          const mentionsFree = /free\s*tier|free\s*plan|100%\s*free|\$0|free\s*submission/i.test(lower);
          const paidPrices = [...lower.matchAll(/\$\d+/g)].map(m => m[0]);

          resolve({
            num: t.num,
            name: t.name,
            domain: t.domain,
            url: t.url,
            statusCode: res.statusCode,
            location: loc,
            isRedirectToLogin,
            hasForm,
            hasInputs,
            hasLoginText,
            hasReciprocal,
            mentionsFree,
            paidPrices: [...new Set(paidPrices)],
            title: (data.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || ''
          });
        });
      });
      req.on('error', e => resolve({ num: t.num, name: t.name, domain: t.domain, url: t.url, error: e.message }));
      req.on('timeout', () => { req.destroy(); resolve({ num: t.num, name: t.name, domain: t.domain, url: t.url, error: 'TIMEOUT' }); });
    } catch (err) {
      resolve({ num: t.num, name: t.name, domain: t.domain, url: t.url, error: err.message });
    }
  });
}

async function run() {
  const results = [];
  for (const t of targets) {
    const r = await checkUrl(t);
    results.push(r);
  }
  fs.writeFileSync(path.join(__dirname, 'batch5_submit_endpoints_audit.json'), JSON.stringify(results, null, 2));
  console.log('Saved batch5_submit_endpoints_audit.json');
}

run();
