const fs = require('fs');
const content = fs.readFileSync('src/data/careerPathwaysCatalog.ts', 'utf8');

// evaluate in isolated vm or extract list
const slice = content.substring(content.indexOf('export const CAREER_TRANSITIONS_CATALOG: TransitionPath[] = [') + 60, content.indexOf('];\n\n// ──'));
// Let's count IDs
const matches = slice.match(/id:\s*['"][a-zA-Z0-9_\-]+['"]/g);
console.log('Total catalog entries in array:', matches.length);
