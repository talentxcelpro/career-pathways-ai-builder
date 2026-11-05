// backlink-engine/src/scripts/deepInspect30.cjs
const fs = require('fs');

const cands = JSON.parse(fs.readFileSync('backlink-engine/src/scripts/detailed_30_ready.json', 'utf8'));

cands.forEach(c => {
  const isCompleteForm = c.inputs.length >= 2 && c.hasSubmitButton && (c.hasUrlField || c.inputs.some(i => i.includes('url') || i.includes('web') || i.includes('link')));
  console.log(`\nCandidate #${c.num}: ${c.name} (${c.rootDomain})`);
  console.log(`  URL: ${c.submissionUrl}`);
  console.log(`  Inputs (${c.inputs.length}): ${c.inputs.slice(0, 8).join(', ')}${c.inputs.length > 8 ? '...' : ''}`);
  console.log(`  Textareas: ${c.textareas.join(', ')} | Selects: ${c.selects.join(', ')}`);
  console.log(`  CompleteForm: ${isCompleteForm} | FreeTier: ${c.hasFreeMention}`);
});
