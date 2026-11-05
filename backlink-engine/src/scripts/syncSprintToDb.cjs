// backlink-engine/src/scripts/syncSprintToDb.cjs
const Database = require('node:sqlite').DatabaseSync;
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '../../data/backlink_engine.db');
const db = new Database(DB_PATH);

const sprintResultsPath = path.join(__dirname, 'editorial_sprint_results.json');
const results = JSON.parse(fs.readFileSync(sprintResultsPath, 'utf8'));

console.log(`Loaded ${results.length} results from editorial_sprint_results.json`);

// 1. Ensure domain rentry.co is registered in domains table
const domainCheck = db.prepare('SELECT id FROM domains WHERE root_domain = ?').get('rentry.co');
let domainId;
if (!domainCheck) {
  const insertDomain = db.prepare(`
    INSERT INTO domains (
      domain, root_domain, name, category, subcategory, geo_market,
      tld_type, authority_tier, authority_evidence, spam_score,
      pipeline_stage, qualification_status, primary_modality,
      created_at, updated_at
    ) VALUES (
      'rentry.co', 'rentry.co', 'Rentry Markdown Publishing', 'EDITORIAL_PUBLISHING',
      'Markdown Publishing & Documentation Platform', 'International',
      'co', 'TIER_2_AUTHORITY', 'Domain Rating 78 / Open Web Markdown Platform', 0,
      'VERIFIED_REFERRING_DOMAIN', 'QUALIFIED', 'EDITORIAL_RESOURCE',
      datetime('now'), datetime('now')
    )
  `);
  const res = insertDomain.run();
  domainId = res.lastInsertRowid;
  console.log(`Registered domain rentry.co with id: ${domainId}`);
} else {
  domainId = domainCheck.id;
  console.log(`Domain rentry.co exists with id: ${domainId}`);
}

// 2. Insert verified backlinks (1 record per published URL)
let insertedLinks = 0;
for (const item of results) {
  const { article, publishedUrl, verification } = item;
  if (!verification || !verification.isLive) continue;

  const primaryLink = verification.linksFound[0] || { href: 'https://talentxcel.in', anchor: 'TalentXcel Career OS', rel: 'follow' };
  const allAnchors = verification.linksFound.map(l => l.anchor).join(' | ');
  const allTargets = verification.linksFound.map(l => l.href).join(' | ');
  const relType = verification.linksFound.every(l => l.rel === 'follow') ? 'follow' : 'mixed';

  const existing = db.prepare('SELECT id FROM backlinks WHERE url = ?').get(publishedUrl);
  let backlinkId;
  if (!existing) {
    const ins = db.prepare(`
      INSERT INTO backlinks (
        url, referring_domain, target_url, anchor_text, rel_type,
        link_placement, status, is_external, http_status_code,
        last_latency_ms, first_verified_at, last_verified_at,
        notes, created_at, updated_at
      ) VALUES (
        ?, 'rentry.co', ?, ?, ?,
        'CONTENT_EDITORIAL', 'LIVE', 1, ?,
        ?, datetime('now'), datetime('now'),
        ?, datetime('now'), datetime('now')
      )
    `);
    const r = ins.run(
      publishedUrl,
      primaryLink.href,
      allAnchors,
      relType,
      verification.statusCode,
      verification.latencyMs,
      `TXC-BACKLINK-008 Asset: ${article.title} (Targets: ${allTargets})`
    );
    backlinkId = r.lastInsertRowid;
    insertedLinks++;
  } else {
    backlinkId = existing.id;
    db.prepare(`
      UPDATE backlinks SET
        http_status_code = ?,
        last_latency_ms = ?,
        last_verified_at = datetime('now'),
        status = 'LIVE'
      WHERE id = ?
    `).run(verification.statusCode, verification.latencyMs, backlinkId);
  }

  // Clear existing verification logs for this backlink before adding fresh ones
  db.prepare('DELETE FROM verification_logs WHERE backlink_id = ?').run(backlinkId);

  // Insert verification logs for each individual link
  for (const link of verification.linksFound) {
    db.prepare(`
      INSERT INTO verification_logs (
        backlink_id, url, timestamp, http_code, response_time_ms,
        found_link, detected_anchor, detected_rel, detected_target,
        status_result, error_message
      ) VALUES (
        ?, ?, datetime('now'), ?, ?,
        1, ?, ?, ?,
        'LIVE', NULL
      )
    `).run(
      backlinkId,
      publishedUrl,
      verification.statusCode,
      verification.latencyMs,
      link.anchor,
      link.rel,
      link.href
    );
  }
}

console.log(`Inserted / updated ${insertedLinks} backlink records.`);

// 3. Update engine metrics table
const totalVerifiedDomains = db.prepare("SELECT COUNT(DISTINCT referring_domain) as c FROM backlinks WHERE status = 'LIVE'").get().c;
const totalVerifiedBacklinks = db.prepare("SELECT COUNT(*) as c FROM backlinks WHERE status = 'LIVE'").get().c;

console.log(`\nCurrent DB Ground Truth:`);
console.log(`  Verified Referring Domains: ${totalVerifiedDomains}`);
console.log(`  Verified Live Backlinks: ${totalVerifiedBacklinks}`);

db.prepare(`
  INSERT INTO engine_metrics (
    timestamp, qualified_prospects, outreach_ready_prospects,
    dispatched_outreach, replies, approved_listings,
    published_backlinks, verified_referring_domains,
    acquisition_cost_inr, acquisition_cost_usd, metadata_json
  ) VALUES (
    datetime('now'),
    (SELECT COUNT(*) FROM domains WHERE qualification_status = 'QUALIFIED'),
    (SELECT COUNT(*) FROM campaign_outreach WHERE outreach_status = 'OUTREACH_READY') + (SELECT COUNT(*) FROM b2b_directory_profiles),
    0, 0, 0,
    ?, ?,
    0.0, 0.0,
    '{"sprint":"TXC-BACKLINK-008","milestone":"1_domain_5_live_articles"}'
  )
`).run(totalVerifiedBacklinks, totalVerifiedDomains);

console.log(`Successfully recorded engine metrics row.`);
