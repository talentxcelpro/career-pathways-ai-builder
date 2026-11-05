const fs = require('fs');
const path = require('path');

const submitAudits = JSON.parse(fs.readFileSync(path.join(__dirname, 'batch6_submit_endpoints_audit.json'), 'utf8'));
const auditMap = new Map();
submitAudits.forEach(s => auditMap.set(s.num, s));

const list = JSON.parse(fs.readFileSync(path.join(__dirname, 'batch6_classified_final.json'), 'utf8'));
const candidates = list.filter(x => x.status === 'READY_FOR_HUMAN_APPROVAL');

candidates.forEach(c => {
  const a = auditMap.get(c.num);
  if (a) {
    console.log(`[#${c.num}] ${c.name} (${c.domain}) -> Prices: [${a.prices.join(', ')}] | Free: [${a.freeMatches.join(', ')}] | Reciprocal: ${a.hasReciprocal}`);
  }
});
