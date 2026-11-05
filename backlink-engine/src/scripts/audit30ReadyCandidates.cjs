// backlink-engine/src/scripts/audit30ReadyCandidates.cjs
const fs = require('fs');
const path = require('path');

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
      result.push(current.trim().replace(/^"|"$/g, ''));
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim().replace(/^"|"$/g, ''));
  return result;
}

const readyLines = fs.readFileSync('reports/TXC-BATCH-006-CORRECTED-READY.csv', 'utf8').trim().split('\n');
const readyList = readyLines.slice(1).map(l => {
  const c = parseCSVLine(l);
  return {
    num: parseInt(c[0], 10),
    name: c[1],
    inputDomain: c[2],
    rootDomain: c[3],
    score: parseInt(c[4], 10),
    submissionUrl: c[5],
    authRequired: c[6],
    pricingTier: c[7],
    badgeRequired: c[8],
    targetAngle: c[9],
    technicalEvidence: c[10]
  };
});

console.log('Total ready candidates to audit:', readyList.length);

const probedData = JSON.parse(fs.readFileSync('backlink-engine/src/scripts/revalidate_52_results.json', 'utf8'));

// Cross-reference with probedData
const detailed30 = readyList.map(item => {
  const probe = probedData.find(p => p.num === item.num) || {};
  const analysis = probe.analysis || {};
  const fields = analysis.fields || {};
  const pricing = analysis.pricing || {};

  return {
    ...item,
    fetchStatus: probe.fetchStatus,
    inputs: fields.inputs || [],
    textareas: fields.textareas || [],
    selects: fields.selects || [],
    hasUrlField: fields.hasUrlField,
    hasNameField: fields.hasNameField,
    hasEmailField: fields.hasEmailField,
    hasDescField: fields.hasDescField,
    hasSubmitButton: fields.hasSubmitButton,
    hasFreeMention: pricing.hasFreeMention,
    hasPaidOnly: pricing.hasPaidOnly,
    hasReciprocalMention: analysis.hasReciprocalMention,
    mentionsCareerOrProductivity: analysis.mentionsCareerOrProductivity
  };
});

console.log('Sample detailed candidate #3:');
console.log(detailed30[0]);

fs.writeFileSync('backlink-engine/src/scripts/detailed_30_ready.json', JSON.stringify(detailed30, null, 2));
console.log('Saved detailed_30_ready.json');
