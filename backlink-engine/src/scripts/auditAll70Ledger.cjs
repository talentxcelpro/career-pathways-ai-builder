// backlink-engine/src/scripts/auditAll70Ledger.cjs
const https = require('https');
const path = require('path');
const fs = require('fs');
const Database = require('node:sqlite').DatabaseSync;

const DB_PATH = path.join(__dirname, '../../data/backlink_engine.db');
const db = new Database(DB_PATH);
const REPORTS_DIR = path.resolve(__dirname, '../../../reports');

async function verifyUrl(url) {
  return new Promise(resolve => {
    const start = Date.now();
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, agent: false }, res => {
      let html = '';
      res.on('data', c => html += c);
      res.on('end', () => {
        const latency = Date.now() - start;
        const links = [...html.matchAll(/<a\b([^>]*)href=["'](https?:\/\/[^"']*talentxcel[^"']*)["']([^>]*)>([\s\S]*?)<\/a>/gi)];
        const linksFound = links.map(l => ({
          href: l[2],
          anchor: l[4].replace(/<[^>]+>/g, '').trim(),
          rel: (l[1] + ' ' + l[3]).includes('rel="nofollow"') ? 'nofollow' : 'follow'
        }));
        resolve({
          statusCode: res.statusCode,
          latencyMs: latency,
          linksFound
        });
      });
    }).on('error', e => resolve({ statusCode: 0, error: e.message, linksFound: [] }));
  });
}

async function run() {
  console.log('=== AUDITING ALL 70 LIVE PAGES FOR LINK LEDGER ===\n');

  const rows = db.prepare("SELECT url, notes FROM backlinks WHERE status = 'LIVE' ORDER BY id ASC").all();
  console.log(`Found ${rows.length} LIVE pages in SQLite database.`);

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
  let successfulPages = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    let verif = await verifyUrl(row.url);

    // If rate-limited or failed, wait and retry once
    if (verif.statusCode !== 200 || verif.linksFound.length === 0) {
      await new Promise(r => setTimeout(r, 2000));
      verif = await verifyUrl(row.url);
    }

    if (verif.statusCode === 200 && verif.linksFound.length > 0) {
      successfulPages++;
      for (const link of verif.linksFound) {
        const linkId = `LNK_${String(linkCounter++).padStart(3, '0')}`;
        ledgerRows.push([
          linkId,
          row.url,
          'rentry.co',
          link.href,
          `"${link.anchor.replace(/"/g, '""')}"`,
          'SELF_PUBLISHED_CITATION',
          'RESEARCH_CITATIONS',
          link.rel,
          verif.statusCode,
          verif.latencyMs,
          'NO (Self-published paste)',
          'PERSISTENT_ACTIVE',
          new Date().toISOString(),
          `"${(row.notes || 'TalentXcel Resource').replace(/"/g, '""')}"`
        ].join(','));
      }
      console.log(`[${i+1}/${rows.length}] ✓ ${row.url} -> HTTP ${verif.statusCode} (${verif.linksFound.length} links)`);
    } else {
      console.log(`[${i+1}/${rows.length}] ✗ ${row.url} -> HTTP ${verif.statusCode} (Links: ${verif.linksFound.length})`);
    }

    // Pacing delay between GET requests (400ms)
    await new Promise(r => setTimeout(r, 400));
  }

  const ledgerPath = path.join(REPORTS_DIR, 'TXC_BACKLINK_009_LINK_LEDGER.csv');
  fs.writeFileSync(ledgerPath, ledgerRows.join('\n'));
  console.log(`\n================================================================================`);
  console.log(`LEDGER AUDIT COMPLETE:`);
  console.log(`  Pages verified: ${successfulPages} / ${rows.length}`);
  console.log(`  Total verified live hyperlinks in ledger: ${linkCounter - 1}`);
  console.log(`  Ledger saved to: ${ledgerPath}`);
  console.log(`================================================================================`);
}

run().catch(e => console.error(e));
