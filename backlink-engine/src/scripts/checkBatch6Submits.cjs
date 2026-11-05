const fs = require('fs');
const path = require('path');

const resolved = JSON.parse(fs.readFileSync(path.join(__dirname, 'batch6_probe_resolved.json'), 'utf8'));

console.log('=== Batch 6 Resolved Status Distribution ===');
const statuses = {};
resolved.forEach(r => {
  const s = r.probe ? r.probe.status : 0;
  statuses[s] = (statuses[s] || 0) + 1;
});
console.log(statuses);

const candidatesWithSubmits = resolved.filter(r => {
  if (r.isDuplicate) return false;
  const p = r.probe;
  if (!p || p.status !== 200) return false;
  return p.submitLinksCount > 0 || (p.cleanTextSnippet && /submit|list your|add tool/i.test(p.cleanTextSnippet));
});

console.log(`Unique candidates with potential submit routes: ${candidatesWithSubmits.length}`);
candidatesWithSubmits.slice(0, 30).forEach(c => {
  console.log(`[#${c.num}] ${c.name} (${c.canonicalRoot}) -> FinalUrl: ${c.probe.finalUrl} | Submits: ${c.probe.submitLinksCount} | Sample: ${c.probe.sampleSubmitLink}`);
});
