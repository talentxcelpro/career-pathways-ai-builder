// backlink-engine/src/scripts/generateBatch2Deliverables.cjs
const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const DB_PATH = path.join(__dirname, '../../data/backlink_engine.db');
const db = new DatabaseSync(DB_PATH);
const REPORTS_DIR = path.resolve(__dirname, '../../../reports');
const ARTIFACT_DIR = 'C:\\Users\\Arshid.Wani\\.gemini\\antigravity\\brain\\bbd3c102-f165-47f7-9eef-eeb4b56d4fa1';

// 1. Fetch all Batch 2 prospects
const b2Rows = db.prepare('SELECT * FROM batch2_prospects ORDER BY prospect_id ASC').all();

// Generate TXC_DIVERSIFY_BATCH_002_PROSPECTS.csv
const b2Headers = Object.keys(b2Rows[0]);
const b2CsvLines = [b2Headers.join(',')];
b2Rows.forEach(r => {
  const line = b2Headers.map(h => {
    let val = r[h] === null ? '' : String(r[h]);
    if (val.includes(',') || val.includes('"') || val.includes('\n')) {
      val = '"' + val.replace(/"/g, '""') + '"';
    }
    return val;
  }).join(',');
  b2CsvLines.push(line);
});
const b2CsvContent = b2CsvLines.join('\n');
fs.writeFileSync(path.join(REPORTS_DIR, 'TXC_DIVERSIFY_BATCH_002_PROSPECTS.csv'), b2CsvContent, 'utf8');
if (fs.existsSync(ARTIFACT_DIR)) fs.writeFileSync(path.join(ARTIFACT_DIR, 'TXC_DIVERSIFY_BATCH_002_PROSPECTS.csv'), b2CsvContent, 'utf8');

// 2. Fetch existing verified links for TXC_DIVERSIFY_BATCH_002_LINK_LEDGER.csv
// Existing baseline: 240 links on rentry.co
const existingBacklinks = db.prepare(`SELECT * FROM backlinks WHERE status = 'ACTIVE' ORDER BY id ASC`).all();
const linkHeaders = ['id', 'url', 'referring_domain', 'target_url', 'anchor_text', 'rel_type', 'status', 'http_status_code', 'link_category', 'last_verified_at'];
const linkCsvLines = [linkHeaders.join(',')];
existingBacklinks.forEach(r => {
  const line = linkHeaders.map(h => {
    let val = r[h] === null ? '' : String(r[h]);
    if (val.includes(',') || val.includes('"') || val.includes('\n')) {
      val = '"' + val.replace(/"/g, '""') + '"';
    }
    return val;
  }).join(',');
  linkCsvLines.push(line);
});
const linkCsvContent = linkCsvLines.join('\n');
fs.writeFileSync(path.join(REPORTS_DIR, 'TXC_DIVERSIFY_BATCH_002_LINK_LEDGER.csv'), linkCsvContent, 'utf8');
if (fs.existsSync(ARTIFACT_DIR)) fs.writeFileSync(path.join(ARTIFACT_DIR, 'TXC_DIVERSIFY_BATCH_002_LINK_LEDGER.csv'), linkCsvContent, 'utf8');

// 3. Generate TXC_DIVERSIFY_BATCH_002_DOMAIN_SUMMARY.csv
// Aggregate all unique root domains across Pipeline
const domainSummaryRows = [
  // Live verified
  { root_domain: 'rentry.co', platform: 'Rentry Markdown Host', batch: 'Baseline (Frozen)', status: 'LIVE_VERIFIED', verified_links: 240, fee: '₹0_FREE', classification: 'SELF_PUBLISHED_CITATION' },
  // Active review queue (Batch 1 + Previous)
  { root_domain: 'hrstack.tech', platform: 'HRStack', batch: 'Batch 1', status: 'SUBMITTED_PENDING_REVIEW', verified_links: 0, fee: '₹0_FREE', classification: 'DIRECTORY_LISTING' },
  { root_domain: 'softwaresuggest.com', platform: 'SoftwareSuggest', batch: 'Batch 1', status: 'SUBMITTED_PENDING_REVIEW', verified_links: 0, fee: '₹0_FREE', classification: 'DIRECTORY_LISTING' },
  { root_domain: 'techpluto.com', platform: 'TechPluto', batch: 'Batch 1', status: 'SUBMITTED_PENDING_REVIEW', verified_links: 0, fee: '₹0_FREE', classification: 'EDITORIAL_MEDIA' },
  { root_domain: 'saashub.com', platform: 'SaaSHub', batch: 'Batch 1', status: 'SUBMITTED_PENDING_REVIEW', verified_links: 0, fee: '₹0_FREE', classification: 'DIRECTORY_LISTING' },
  { root_domain: 'launchingnext.com', platform: 'Launching Next', batch: 'Batch 1', status: 'SUBMITTED_PENDING_REVIEW', verified_links: 0, fee: '₹0_FREE', classification: 'DIRECTORY_LISTING' },
  { root_domain: 'pitchwall.co', platform: 'PitchWall', batch: 'Batch 1', status: 'SUBMITTED_PENDING_REVIEW', verified_links: 0, fee: '₹0_FREE', classification: 'DIRECTORY_LISTING' },
  { root_domain: 'iitm.ac.in', platform: 'IIT Madras CDC', batch: 'Institutional', status: 'SUBMITTED_PENDING_REVIEW', verified_links: 0, fee: '₹0_FREE', classification: 'ACADEMIC_RESOURCE' },
  { root_domain: 'iitd.ac.in', platform: 'IIT Delhi OCS', batch: 'Institutional', status: 'SUBMITTED_PENDING_REVIEW', verified_links: 0, fee: '₹0_FREE', classification: 'ACADEMIC_RESOURCE' },
  { root_domain: 'iitb.ac.in', platform: 'IIT Bombay Placement', batch: 'Institutional', status: 'SUBMITTED_PENDING_REVIEW', verified_links: 0, fee: '₹0_FREE', classification: 'ACADEMIC_RESOURCE' },
  { root_domain: 'iitk.ac.in', platform: 'IIT Kanpur SPO', batch: 'Institutional', status: 'SUBMITTED_PENDING_REVIEW', verified_links: 0, fee: '₹0_FREE', classification: 'ACADEMIC_RESOURCE' },
  { root_domain: 'bits-pilani.ac.in', platform: 'BITS Pilani Placement', batch: 'Institutional', status: 'SUBMITTED_PENDING_REVIEW', verified_links: 0, fee: '₹0_FREE', classification: 'ACADEMIC_RESOURCE' }
];

// Append Batch 2 prospects
b2Rows.forEach(r => {
  domainSummaryRows.push({
    root_domain: r.root_domain,
    platform: r.platform_name,
    batch: 'Batch 2',
    status: r.submission_status,
    verified_links: 0,
    fee: r.fee_amount,
    classification: r.category
  });
});

const domHeaders = ['root_domain', 'platform', 'batch', 'status', 'verified_links', 'fee', 'classification'];
const domCsvLines = [domHeaders.join(',')];
domainSummaryRows.forEach(r => {
  const line = domHeaders.map(h => {
    let val = r[h] === null ? '' : String(r[h]);
    if (val.includes(',') || val.includes('"') || val.includes('\n')) {
      val = '"' + val.replace(/"/g, '""') + '"';
    }
    return val;
  }).join(',');
  domCsvLines.push(line);
});
const domCsvContent = domCsvLines.join('\n');
fs.writeFileSync(path.join(REPORTS_DIR, 'TXC_DIVERSIFY_BATCH_002_DOMAIN_SUMMARY.csv'), domCsvContent, 'utf8');
if (fs.existsSync(ARTIFACT_DIR)) fs.writeFileSync(path.join(ARTIFACT_DIR, 'TXC_DIVERSIFY_BATCH_002_DOMAIN_SUMMARY.csv'), domCsvContent, 'utf8');

console.log('CSVs generated successfully.');
