// backlink-engine/src/scripts/inspectBatch1Forms.cjs
const https = require('https');

const TARGETS = [
  { id: 'TGT_001', name: 'HRStack', url: 'https://hrstack.tech/submit' },
  { id: 'TGT_002', name: 'Global HR World', url: 'https://globalhrworld.com/directory/' },
  { id: 'TGT_003', name: 'Candidately', url: 'https://www.candidately.com/directory' },
  { id: 'TGT_004', name: 'Veritas HR', url: 'https://veritashrsolutions.com/list-your-company/' },
  { id: 'TGT_005', name: 'SourceForge', url: 'https://sourceforge.net/create/' }
];

async function inspect(t) {
  return new Promise(resolve => {
    const start = Date.now();
    const req = https.get(t.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      agent: false,
      timeout: 10000
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        const latency = Date.now() - start;
        const forms = [...data.matchAll(/<form\b([^>]*)>([\s\S]*?)<\/form>/gi)];
        const inputs = [...data.matchAll(/<input\b([^>]*)>/gi)].map(m => m[1]);
        const textareas = [...data.matchAll(/<textarea\b([^>]*)>/gi)].map(m => m[1]);
        const titleMatch = data.match(/<title>([^<]*)<\/title>/i);
        const title = titleMatch ? titleMatch[1].trim() : '';

        resolve({
          id: t.id,
          name: t.name,
          url: t.url,
          statusCode: res.statusCode,
          latencyMs: latency,
          title,
          formsCount: forms.length,
          inputsSummary: inputs.slice(0, 10).map(i => {
            const name = i.match(/name=["']([^"']*)["']/i);
            const type = i.match(/type=["']([^"']*)["']/i);
            return `${name ? name[1] : 'unnamed'} (${type ? type[1] : 'text'})`;
          }),
          bodySnippet: data.slice(0, 300).replace(/\s+/g, ' ')
        });
      });
    });
    req.on('error', e => resolve({ id: t.id, name: t.name, url: t.url, statusCode: 0, error: e.message }));
    req.on('timeout', () => { req.destroy(); resolve({ id: t.id, name: t.name, url: t.url, statusCode: 0, error: 'TIMEOUT' }); });
  });
}

async function run() {
  console.log('=== INSPECTING BATCH 1 SUBMISSION FORMS ===\n');
  for (const t of TARGETS) {
    const r = await inspect(t);
    console.log(`[${r.id}] ${r.name} -> HTTP ${r.statusCode} (${r.latencyMs || 0}ms)`);
    console.log(`  Title: "${r.title || r.error}"`);
    console.log(`  Forms: ${r.formsCount || 0} | Inputs: ${r.inputsSummary ? r.inputsSummary.join(', ') : 'none'}\n`);
  }
}

run();
