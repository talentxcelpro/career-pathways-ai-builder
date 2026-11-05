const fs = require('fs');
const path = require('path');

const list = JSON.parse(fs.readFileSync(path.join(__dirname, 'batch6_classified_final.json'), 'utf8'));
const submitAudits = JSON.parse(fs.readFileSync(path.join(__dirname, 'batch6_submit_endpoints_audit.json'), 'utf8'));
const auditMap = new Map();
submitAudits.forEach(s => auditMap.set(s.num, s));

const ready = list.filter(x => x.status === 'READY_FOR_HUMAN_APPROVAL');

console.log('--- Checking 55 READY Candidates for Submit Endpoint Status ---');
const reallyReady = [];
const not200 = [];

ready.forEach(r => {
  const audit = auditMap.get(r.num);
  if (audit && audit.statusCode === 200 && audit.hasForm && audit.hasInputs) {
    reallyReady.push({ ...r, audit });
  } else {
    not200.push({ ...r, audit });
  }
});

console.log(`Verified Open 200 Form: ${reallyReady.length}`);
console.log(`Non-200 or No Inputs Form: ${not200.length}`);

console.log('\nCandidates needing reclassification:');
not200.forEach(n => {
  console.log(`[#${n.num}] ${n.name} (${n.domain}) -> Status: ${n.audit ? n.audit.statusCode : 'none'} | HasForm: ${n.audit ? n.audit.hasForm : false} | HasInputs: ${n.audit ? n.audit.hasInputs : false}`);
});
