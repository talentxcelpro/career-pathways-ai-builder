// backlink-engine/src/scripts/generateBatch4Deliverables.cjs
const fs = require('fs');
const path = require('path');

const REPORTS_DIR = path.resolve(__dirname, '../../../reports');
const ARTIFACT_DIR = 'C:\\Users\\Arshid.Wani\\.gemini\\antigravity\\brain\\bbd3c102-f165-47f7-9eef-eeb4b56d4fa1';

const items = JSON.parse(fs.readFileSync('backlink-engine/src/scripts/batch4_classified_refined.json', 'utf8'));

// Helper to escape CSV values
function toCsvRow(arr) {
  return arr.map(val => {
    let s = val === null || val === undefined ? '' : String(val);
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      s = '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  }).join(',');
}

// 1. TXC-BATCH-004-DEDUP.csv
const dedupHeaders = ['candidate_num', 'platform_name', 'input_domain', 'canonical_root_domain', 'category', 'dedup_status', 'database_source_reference'];
const dedupRows = [toCsvRow(dedupHeaders)];
items.forEach(item => {
  dedupRows.push(toCsvRow([
    item.num,
    item.name,
    item.inputDomain,
    item.canonicalRoot,
    item.category,
    item.isDuplicate ? 'CANONICAL_DUPLICATE' : 'UNIQUE_NEW_DOMAIN',
    item.duplicateDetails || 'NONE_UNIQUE'
  ]));
});
const dedupCsv = dedupRows.join('\n');
fs.writeFileSync(path.join(REPORTS_DIR, 'TXC-BATCH-004-DEDUP.csv'), dedupCsv, 'utf8');
if (fs.existsSync(ARTIFACT_DIR)) fs.writeFileSync(path.join(ARTIFACT_DIR, 'TXC-BATCH-004-DEDUP.csv'), dedupCsv, 'utf8');

// 2. TXC-BATCH-004-READY.csv
const readyItems = items.filter(i => i.classification === 'READY_FOR_HUMAN_APPROVAL');
const readyHeaders = ['candidate_num', 'platform_name', 'canonical_root_domain', 'official_submission_url', 'product_positioning', 'canonical_target_url', 'fee_amount', 'reciprocal_requirement', 'submission_method', 'verification_evidence'];
const readyRows = [toCsvRow(readyHeaders)];
readyItems.forEach(item => {
  const isAts = item.name.toLowerCase().includes('tool') || item.name.toLowerCase().includes('ai') || item.category.includes('AI') || item.name.toLowerCase().includes('app');
  const prodFit = isAts ? 'TalentXcel ATS Resume Diagnostic Scanner' : 'TalentXcel Career OS / Company Profile';
  const targetUrl = isAts ? 'https://talentxcel.in/resume/ats-check' : 'https://talentxcel.in/';

  readyRows.push(toCsvRow([
    item.num,
    item.name,
    item.canonicalRoot,
    item.sampleSubmitLink || item.finalUrl,
    prodFit,
    targetUrl,
    '₹0_FREE',
    'NONE',
    'WEB_FORM',
    `HTTP ${item.httpStatus} Live (${item.latencyMs}ms). Page: "${item.pageTitle}". Verified free route.`
  ]));
});
const readyCsv = readyRows.join('\n');
fs.writeFileSync(path.join(REPORTS_DIR, 'TXC-BATCH-004-READY.csv'), readyCsv, 'utf8');
if (fs.existsSync(ARTIFACT_DIR)) fs.writeFileSync(path.join(ARTIFACT_DIR, 'TXC-BATCH-004-READY.csv'), readyCsv, 'utf8');

// 3. TXC-BATCH-004-BLOCKED.csv
const blockedItems = items.filter(i => ['BLOCKED', 'PAID', 'IRRELEVANT', 'RECIPROCAL_REQUIRED'].includes(i.classification));
const blockedHeaders = ['candidate_num', 'platform_name', 'canonical_root_domain', 'classification', 'http_status', 'page_title', 'disqualification_evidence'];
const blockedRows = [toCsvRow(blockedHeaders)];
blockedItems.forEach(item => {
  blockedRows.push(toCsvRow([
    item.num,
    item.name,
    item.canonicalRoot,
    item.classification,
    item.httpStatus,
    item.pageTitle,
    item.notes
  ]));
});
const blockedCsv = blockedRows.join('\n');
fs.writeFileSync(path.join(REPORTS_DIR, 'TXC-BATCH-004-BLOCKED.csv'), blockedCsv, 'utf8');
if (fs.existsSync(ARTIFACT_DIR)) fs.writeFileSync(path.join(ARTIFACT_DIR, 'TXC-BATCH-004-BLOCKED.csv'), blockedCsv, 'utf8');

// 4. TXC-BATCH-004-EVIDENCE.csv
const evidenceHeaders = ['candidate_num', 'platform_name', 'canonical_root_domain', 'category', 'final_url', 'http_status', 'latency_ms', 'page_title', 'forms_count', 'has_cloudflare', 'classification', 'audit_notes'];
const evidenceRows = [toCsvRow(evidenceHeaders)];
items.forEach(item => {
  evidenceRows.push(toCsvRow([
    item.num,
    item.name,
    item.canonicalRoot,
    item.category,
    item.finalUrl,
    item.httpStatus,
    item.latencyMs,
    item.pageTitle,
    item.formsCount,
    item.hasCloudflare ? 'YES' : 'NO',
    item.classification,
    item.notes
  ]));
});
const evidenceCsv = evidenceRows.join('\n');
fs.writeFileSync(path.join(REPORTS_DIR, 'TXC-BATCH-004-EVIDENCE.csv'), evidenceCsv, 'utf8');
if (fs.existsSync(ARTIFACT_DIR)) fs.writeFileSync(path.join(ARTIFACT_DIR, 'TXC-BATCH-004-EVIDENCE.csv'), evidenceCsv, 'utf8');

console.log('CSVs written successfully:');
console.log('  - TXC-BATCH-004-DEDUP.csv');
console.log('  - TXC-BATCH-004-READY.csv');
console.log('  - TXC-BATCH-004-BLOCKED.csv');
console.log('  - TXC-BATCH-004-EVIDENCE.csv');
