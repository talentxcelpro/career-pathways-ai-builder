// backlink-engine/src/scripts/syncNewBatchToDb.cjs
const Database = require('node:sqlite').DatabaseSync;
const path = require('path');
const https = require('https');

const DB_PATH = path.join(__dirname, '../../data/backlink_engine.db');
const db = new Database(DB_PATH);

const NEW_PAGES = [
  { city: 'Bengaluru', url: 'https://rentry.co/qdmy65ub', title: 'Bengaluru Technology Salary Benchmark 2026' },
  { city: 'Hyderabad', url: 'https://rentry.co/gdxuwyx9', title: 'Hyderabad Technology Salary Benchmark 2026' },
  { city: 'Pune', url: 'https://rentry.co/57comcd5', title: 'Pune Technology Salary Benchmark 2026' },
  { city: 'Delhi-NCR', url: 'https://rentry.co/rook4ose', title: 'Delhi-NCR Technology Salary Benchmark 2026' },
  { city: 'Mumbai', url: 'https://rentry.co/mqndu5x4', title: 'Mumbai Technology Salary Benchmark 2026' }
];

async function verifyAndSync(p) {
  return new Promise(resolve => {
    const start = Date.now();
    https.get(p.url, { headers: { 'User-Agent': 'Mozilla/5.0' }, agent: false }, res => {
      let html = '';
      res.on('data', c => html += c);
      res.on('end', () => {
        const latency = Date.now() - start;
        const links = [...html.matchAll(/<a\b([^>]*)href=[\"'](https?:\/\/[^\"']*talentxcel[^\"']*)[\"']([^>]*)>([\s\S]*?)<\/a>/gi)];
        const linksFound = links.map(l => ({
          href: l[2],
          anchor: l[4].replace(/<[^>]+>/g, '').trim(),
          rel: (l[1] + ' ' + l[3]).includes('rel="nofollow"') ? 'nofollow' : 'follow'
        }));

        if (res.statusCode === 200 && linksFound.length > 0) {
          const primaryLink = linksFound[0];
          const allAnchors = linksFound.map(l => l.anchor).join(' | ');
          const allTargets = linksFound.map(l => l.href).join(' | ');

          db.prepare(`
            INSERT OR REPLACE INTO backlinks (
              url, referring_domain, target_url, anchor_text, rel_type,
              link_category, channel, link_placement, status, is_external,
              http_status_code, last_latency_ms, first_verified_at, last_verified_at,
              notes, created_at, updated_at
            ) VALUES (
              ?, 'rentry.co', ?, ?, 'follow',
              'SELF_PUBLISHED_CITATION', 'RESEARCH_CITATIONS', 'OPEN_MARKDOWN_PASTE', 'LIVE', 1,
              ?, ?, datetime('now'), datetime('now'),
              ?, datetime('now'), datetime('now')
            )
          `).run(
            p.url,
            primaryLink.href,
            allAnchors,
            res.statusCode,
            latency,
            `TXC-BACKLINK-009 Salary Benchmark Hub: ${p.title} (Targets: ${allTargets})`
          );
          console.log(`Synced: ${p.title} -> ${p.url} (HTTP ${res.statusCode}, Links: ${linksFound.length})`);
        }
        resolve();
      });
    }).on('error', e => {
      console.log(`Error checking ${p.url}:`, e.message);
      resolve();
    });
  });
}

async function run() {
  console.log('Syncing newly published hub pages to DB...');
  for (const p of NEW_PAGES) {
    await verifyAndSync(p);
  }

  const total = db.prepare("SELECT COUNT(*) as c FROM backlinks WHERE status = 'LIVE'").get().c;
  const distinctDom = db.prepare("SELECT COUNT(DISTINCT referring_domain) as c FROM backlinks WHERE status = 'LIVE'").get().c;
  console.log(`\nUpdated DB Baseline:`);
  console.log(`  Live Verified Backlinks: ${total}`);
  console.log(`  Verified Referring Domains: ${distinctDom}`);
}

run();
