const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { URL } = require('url');

const probeResults = JSON.parse(fs.readFileSync(path.join(__dirname, 'batch5_probe_results.json'), 'utf8'));

// Find all candidates where cleanTextSnippet mentions submit / add / post
const potential = probeResults.filter(p => {
  if (p.isDuplicate) return false;
  if (!p.probe || p.probe.status !== 200) return false;
  const snip = (p.probe.cleanTextSnippet || '').toLowerCase();
  const title = (p.probe.title || '').toLowerCase();
  return snip.includes('submit') || snip.includes('add tool') || snip.includes('list your') || title.includes('submit') || title.includes('add tool');
});

console.log('Candidates with submit references in snippet/title:', potential.length);
potential.forEach(p => {
  console.log(`#${p.num} ${p.name} (${p.canonicalRoot}) | Submits detected: ${p.probe.submitLinksCount} | Sample: ${p.probe.sampleSubmitLink}`);
});
