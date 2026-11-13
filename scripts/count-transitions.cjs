const fs = require('fs');
const content = fs.readFileSync('src/data/careerPathwaysCatalog.ts', 'utf8');
const matches = content.match(/id:\s*['"][a-zA-Z0-9_\-]+['"]/g);
console.log('Total transition IDs found:', matches ? matches.length : 0);

// Also check CAREER_TRANSITIONS_CATALOG.length by importing if possible, or evaluating array
const idxStart = content.indexOf('export const CAREER_TRANSITIONS_CATALOG');
const idxEnd = content.indexOf('export function getTransitionById');
const arraySection = content.substring(idxStart, idxEnd);
const itemMatches = arraySection.match(/id:\s*['"][a-zA-Z0-9_\-]+['"]/g);
console.log('In CAREER_TRANSITIONS_CATALOG array:', itemMatches ? itemMatches.length : 0);
