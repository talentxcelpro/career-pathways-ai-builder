// backlink-engine/src/scripts/auditRentryPersistence.cjs
const https = require('https');
const path = require('path');
const fs = require('fs');
const Database = require('node:sqlite').DatabaseSync;

const DB_PATH = path.join(__dirname, '../../data/backlink_engine.db');
const db = new Database(DB_PATH);
const REPORTS_DIR = path.resolve(__dirname, '../../../reports');

const RENTRY_URLS = [
  // 5 Core Editorial Assets
  { id: 'ASSET_001', url: 'https://rentry.co/q4ofexi2', title: 'TalentXcel ATS Resume Diagnostic Framework' },
  { id: 'ASSET_002', url: 'https://rentry.co/hfnfmzmh', title: 'TalentXcel Engineering Salary Benchmark Index' },
  { id: 'ASSET_003', url: 'https://rentry.co/b7raewys', title: 'Modern Structured Technical Hiring Playbook' },
  { id: 'ASSET_004', url: 'https://rentry.co/6fy7ioyi', title: 'Institutional Placement Modernization Framework' },
  { id: 'ASSET_005', url: 'https://rentry.co/ywv4r74o', title: '2026 Tech Competency Taxonomy' },
  // Batch 1: 5 City Salary Benchmark Hubs
  { id: 'HUB_BLR', url: 'https://rentry.co/qdmy65ub', title: 'Bengaluru Technology Salary Benchmark 2026' },
  { id: 'HUB_HYD', url: 'https://rentry.co/gdxuwyx9', title: 'Hyderabad Technology Salary Benchmark 2026' },
  { id: 'HUB_PUN', url: 'https://rentry.co/57comcd5', title: 'Pune Technology Salary Benchmark 2026' },
  { id: 'HUB_DEL', url: 'https://rentry.co/rook4ose', title: 'Delhi-NCR Technology Salary Benchmark 2026' },
  { id: 'HUB_MUM', url: 'https://rentry.co/mqndu5x4', title: 'Mumbai Technology Salary Benchmark 2026' },
  // Batch 2: 5 City Salary Benchmark Hubs
  { id: 'HUB_CHE', url: 'https://rentry.co/cmm5f9go', title: 'Chennai Technology Salary Benchmark 2026' },
  { id: 'HUB_CCU', url: 'https://rentry.co/vru7n4yn', title: 'Kolkata Technology Salary Benchmark 2026' },
  { id: 'HUB_AMD', url: 'https://rentry.co/n9kgvmqo', title: 'Ahmedabad Technology Salary Benchmark 2026' },
  { id: 'HUB_JAI', url: 'https://rentry.co/zer4cfya', title: 'Jaipur Technology Salary Benchmark 2026' },
  { id: 'HUB_COK', url: 'https://rentry.co/tfmbzwk8', title: 'Kochi Technology Salary Benchmark 2026' },
  // Batch 3: 5 City Salary Benchmark Hubs
  { id: 'HUB_NAG', url: 'https://rentry.co/nayn9v8z', title: 'Nagpur IT Corridor & Cloud Infrastructure Salary Benchmark 2026' },
  { id: 'HUB_LKO', url: 'https://rentry.co/g8a2feso', title: 'Lucknow Technology Talent & Software Services Salary Benchmark 2026' },
  { id: 'HUB_BDQ', url: 'https://rentry.co/e83wc64i', title: 'Vadodara Industrial Automation & Cloud Engineering Compensation 2026' },
  { id: 'HUB_VTZ', url: 'https://rentry.co/ye6aoxbd', title: 'Visakhapatnam Fintech Valley & Cloud Delivery Compensation 2026' },
  { id: 'HUB_GOA', url: 'https://rentry.co/9iynswz4', title: 'Goa Remote Engineering Hub & Distributed Systems Salary Index 2026' }
];

async function checkUrl(item) {
  return new Promise(resolve => {
    const start = Date.now();
    https.get(item.url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0' },
      agent: false
    }, res => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        const latency = Date.now() - start;
        const links = [...body.matchAll(/<a\b([^>]*)href=[\"'](https?:\/\/[^\"']*talentxcel[^\"']*)[\"']([^>]*)>([\s\S]*?)<\/a>/gi)];
        const linksFound = links.map(l => ({
          href: l[2],
          anchor: l[4].replace(/<[^>]+>/g, '').trim(),
          rel: (l[1] + ' ' + l[3]).includes('rel="nofollow"') ? 'nofollow' : 'follow'
        }));
        resolve({
          item,
          statusCode: res.statusCode,
          latencyMs: latency,
          linksFound,
          accessible: res.statusCode === 200,
          verifiedLinksCount: linksFound.length
        });
      });
    }).on('error', e => {
      resolve({
        item,
        statusCode: 0,
        error: e.message,
        accessible: false,
        linksFound: []
      });
    });
  });
}

async function run() {
  console.log('--- AUDITING RENTRY PERSISTENCE & RESOLUTION (20 LIVE PAGES) ---');
  const results = [];
  for (const item of RENTRY_URLS) {
    const res = await checkUrl(item);
    console.log(`[${res.item.id}] ${res.item.url} -> HTTP ${res.statusCode} (${res.latencyMs || 0}ms), Links: ${res.verifiedLinksCount}`);
    results.push(res);
  }

  // Generate TXC_BACKLINK_009_LINK_LEDGER.csv
  const ledgerHeaders = [
    'link_id',
    'source_url',
    'referring_root_domain',
    'target_url',
    'anchor_text',
    'link_category',
    'acquisition_channel',
    'rel_attribute',
    'http_status',
    'latency_ms',
    'is_earned_editorial_endorsement',
    'persistence_audit_status',
    'last_verified_at',
    'notes'
  ];

  const ledgerRows = [ledgerHeaders.join(',')];
  let linkCounter = 1;

  for (const r of results) {
    for (const link of r.linksFound) {
      const linkId = `LNK_${String(linkCounter++).padStart(3, '0')}`;
      ledgerRows.push([
        linkId,
        r.item.url,
        'rentry.co',
        link.href,
        `"${link.anchor.replace(/"/g, '""')}"`,
        'SELF_PUBLISHED_CITATION',
        'RESEARCH_CITATIONS',
        link.rel,
        r.statusCode,
        r.latencyMs,
        'NO (Self-published paste)',
        'PERSISTENT_ACTIVE',
        new Date().toISOString(),
        `"${r.item.title} - Reclassified under TXC-BACKLINK-009 strictly as self-published citation"`
      ].join(','));
    }
  }

  const ledgerPath = path.join(REPORTS_DIR, 'TXC_BACKLINK_009_LINK_LEDGER.csv');
  fs.writeFileSync(ledgerPath, ledgerRows.join('\n'));
  console.log(`\nGenerated Link Ledger: ${ledgerPath}`);
  console.log(`Total live verified links in ledger: ${linkCounter - 1}`);
}

run();
