// backlink-engine/src/scripts/deepInspectBatch2.cjs
const fs = require('fs');
const https = require('https');
const http = require('http');
const { URL } = require('url');

const raw = JSON.parse(fs.readFileSync('backlink-engine/src/scripts/batch2_probe_results.json', 'utf8'));

async function inspectCandidate(c) {
  // Deep examine submission page HTML
  return new Promise(resolve => {
    try {
      const parsed = new URL(c.probe.finalUrl || c.subUrl);
      const client = parsed.protocol === 'https:' ? https : http;
      
      const req = client.get(parsed.toString(), {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        },
        timeout: 10000
      }, res => {
        let html = '';
        res.on('data', chunk => { html += chunk; });
        res.on('end', () => {
          // Analyze forms and inputs
          const formMatches = [...html.matchAll(/<form\b([^>]*)>([\s\S]*?)<\/form>/gi)];
          const forms = formMatches.map(m => {
            const formAttr = m[1];
            const formBody = m[2];
            const action = (formAttr.match(/action=["']([^"']*)["']/i) || [])[1] || '';
            const method = (formAttr.match(/method=["']([^"']*)["']/i) || [])[1] || 'GET';
            const inputs = [...formBody.matchAll(/<input\b([^>]*)>/gi)].map(i => {
              const name = (i[1].match(/name=["']([^"']*)["']/i) || [])[1] || '';
              const type = (i[1].match(/type=["']([^"']*)["']/i) || [])[1] || 'text';
              return { name, type };
            });
            const textareas = [...formBody.matchAll(/<textarea\b([^>]*)>/gi)].map(t => {
              return (t[1].match(/name=["']([^"']*)["']/i) || [])[1] || '';
            });
            return { action, method, inputs, textareas };
          });

          const cleanText = html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

          // Detect policies
          const mentionsFree = /free/i.test(cleanText);
          const mentionsBadge = /badge|embed|backlink|reciprocal/i.test(cleanText);
          const mentionsOAuth = /github|google|discord|sign in|login|oauth/i.test(cleanText);
          const mentionsPricing = /pricing|\$|stripe|checkout|paid/i.test(cleanText);

          resolve({
            id: c.id,
            name: c.name,
            domain: c.domain,
            finalUrl: c.probe.finalUrl || c.subUrl,
            status: c.probe.status,
            formsCount: forms.length,
            forms,
            cleanTextSnippet: cleanText.slice(0, 500),
            mentionsFree,
            mentionsBadge,
            mentionsOAuth,
            mentionsPricing
          });
        });
      });

      req.on('error', err => resolve({ id: c.id, name: c.name, domain: c.domain, error: err.message }));
      req.on('timeout', () => { req.destroy(); resolve({ id: c.id, name: c.name, domain: c.domain, error: 'TIMEOUT' }); });
    } catch (e) {
      resolve({ id: c.id, name: c.name, domain: c.domain, error: e.message });
    }
  });
}

async function run() {
  console.log('Running deep inspection on active candidates...');
  const deepResults = [];

  for (const c of raw) {
    if (c.probe.status === 200) {
      process.stdout.write(`Inspecting ${c.name}... `);
      const res = await inspectCandidate(c);
      console.log(`Forms: ${res.formsCount} | Free: ${res.mentionsFree} | Badge: ${res.mentionsBadge} | OAuth: ${res.mentionsOAuth}`);
      deepResults.push(res);
      await new Promise(r => setTimeout(r, 200));
    } else {
      deepResults.push({ id: c.id, name: c.name, domain: c.domain, status: c.probe.status, error: c.probe.error });
    }
  }

  fs.writeFileSync('backlink-engine/src/scripts/batch2_deep_results.json', JSON.stringify(deepResults, null, 2), 'utf8');
  console.log('Saved deep results to backlink-engine/src/scripts/batch2_deep_results.json');
}

run();
