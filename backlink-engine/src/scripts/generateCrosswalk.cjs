const fs = require('fs');
const path = require('path');

// 1. Load and parse TXC-BATCH-001-006-FINAL-LEDGER.csv
const ledgerContent = fs.readFileSync('reports/TXC-BATCH-001-006-FINAL-LEDGER.csv', 'utf8').trim().split('\n');

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

const ledgerHeader = parseCSVLine(ledgerContent[0]);
const ledgerRows = [];
for (let i = 1; i < ledgerContent.length; i++) {
  const row = parseCSVLine(ledgerContent[i]);
  const obj = {};
  ledgerHeader.forEach((h, idx) => {
    obj[h] = row[idx];
  });
  ledgerRows.push(obj);
}

console.log(`Loaded ${ledgerRows.length} ledger rows.`);

// Filter the 385 distinct commercial roots
const commercialRootsMap = new Map();
ledgerRows.forEach(r => {
  if (r.Governance_Status !== 'DUPLICATE' && r.Is_Shared_Hosting !== 'YES') {
    if (!commercialRootsMap.has(r.PSL_Registrable_Root)) {
      commercialRootsMap.set(r.PSL_Registrable_Root, r);
    }
  }
});

console.log(`Total commercial roots: ${commercialRootsMap.size}`);

// Define the 8 Pilot Candidates
const pilot8Roots = new Set([
  'aisaasradar.com',
  'zalize.com',
  'thatsmy.ai',
  'deekoyaai.in',
  'aitoolsxplorer.in',
  'aibookmarks.net',
  'getstackdrop.com',
  'aigearbase.com'
]);

// Define the 3 Dispatched Candidates
const dispatched3Roots = new Set([
  'hrstack.tech',
  'softwaresuggest.com',
  'techpluto.com'
]);

// Classify each of the 385 roots
const crosswalkRows = [];
let crosswalkIndex = 1;

let dispatchedCount = 0;
let pilotCount = 0;
let accountGatedCount = 0;
let readyCount = 0;
let blockedCount = 0;
let paidCount = 0;
let otherResearchCount = 0;

commercialRootsMap.forEach((r, root) => {
  const xwalkId = `XWALK_${String(crosswalkIndex++).padStart(3, '0')}`;
  let acqClass = '';
  let pipelineStage = '';

  if (dispatched3Roots.has(root)) {
    acqClass = 'DISPATCHED_PENDING_REVIEW';
    pipelineStage = 'Metric 2: Dispatched Submissions';
    dispatchedCount++;
  } else if (pilot8Roots.has(root)) {
    acqClass = 'QUALITY_GATE_PASSED_AWAITING_HUMAN_APPROVAL';
    pipelineStage = 'Metric 4: Quality-Gate-Passed Pilot (Staged)';
    pilotCount++;
  } else if (r.Governance_Status === 'AUTH_REQUIRED') {
    acqClass = 'ACCOUNT_GATED_RESEARCH';
    pipelineStage = 'Metric 5: Ledger Research Pool';
    accountGatedCount++;
  } else if (r.Governance_Status === 'READY_FOR_HUMAN_APPROVAL') {
    acqClass = 'EVALUATION_POOL_READY';
    pipelineStage = 'Metric 5: Ledger Research Pool';
    readyCount++;
  } else if (r.Governance_Status === 'BLOCKED') {
    acqClass = 'BLOCKED_DEFUNCT_OR_NON_RESPONSIVE';
    pipelineStage = 'Metric 5: Ledger Research Pool (Disqualified)';
    blockedCount++;
  } else if (r.Governance_Status === 'PAID') {
    acqClass = 'PAID_SUBMISSION_REJECTED';
    pipelineStage = 'Metric 5: Ledger Research Pool (Disqualified)';
    paidCount++;
  } else if (r.Governance_Status === 'RECIPROCAL_REQUIRED') {
    acqClass = 'RECIPROCAL_LINK_REJECTED';
    pipelineStage = 'Metric 5: Ledger Research Pool (Disqualified)';
    otherResearchCount++;
  } else if (r.Governance_Status === 'IRRELEVANT') {
    acqClass = 'IRRELEVANT_NICHE_REJECTED';
    pipelineStage = 'Metric 5: Ledger Research Pool (Disqualified)';
    otherResearchCount++;
  } else {
    acqClass = `RESEARCH_EVALUATION_${r.Governance_Status}`;
    pipelineStage = 'Metric 5: Ledger Research Pool';
    otherResearchCount++;
  }

  crosswalkRows.push({
    Crosswalk_ID: xwalkId,
    Global_Candidate_ID: r.Global_ID,
    Originating_Batch: r.Originating_Batch,
    Original_Candidate_Num: r.Original_Candidate_Num,
    Platform_Name: r.Platform_Name,
    Input_Domain: r.Input_Domain,
    PSL_Registrable_Root: r.PSL_Registrable_Root,
    Acquisition_Classification: acqClass,
    Pipeline_Stage: pipelineStage,
    Live_Backlink_Status: 'NO_LIVE_BACKLINK',
    Notes: `Batch: ${r.Originating_Batch}, PSL root: ${r.PSL_Registrable_Root}, Original Status: ${r.Governance_Status}`
  });
});

console.log('Crosswalk stats:');
console.log(`- Dispatched: ${dispatchedCount}`);
console.log(`- Pilot 8: ${pilotCount}`);
console.log(`- Account Gated: ${accountGatedCount}`);
console.log(`- Ready pool: ${readyCount}`);
console.log(`- Blocked: ${blockedCount}`);
console.log(`- Paid: ${paidCount}`);
console.log(`- Other research: ${otherResearchCount}`);
console.log(`Total crosswalk rows: ${crosswalkRows.length}`);

// Write TXC-385-ROOT-POPULATION-CROSSWALK.csv
const crosswalkHeader = [
  'Crosswalk_ID',
  'Global_Candidate_ID',
  'Originating_Batch',
  'Original_Candidate_Num',
  'Platform_Name',
  'Input_Domain',
  'PSL_Registrable_Root',
  'Acquisition_Classification',
  'Pipeline_Stage',
  'Live_Backlink_Status',
  'Notes'
];

const crosswalkCsv = [
  crosswalkHeader.join(','),
  ...crosswalkRows.map(r => crosswalkHeader.map(h => `"${(r[h] || '').replace(/"/g, '""')}"`).join(','))
].join('\n');

fs.writeFileSync('reports/TXC-385-ROOT-POPULATION-CROSSWALK.csv', crosswalkCsv, 'utf8');
console.log('Generated reports/TXC-385-ROOT-POPULATION-CROSSWALK.csv');
