// scripts/audit-12-products-tables.cjs
const fs = require('fs');

const t = fs.readFileSync('src/integrations/supabase/types.ts', 'utf8');
const tables = [...t.matchAll(/(\w+):\s*{\s*Row:/g)].map(m => m[1]);

const keywords = {
  resume: ['resume', 'ats'],
  jobs: ['job', 'application', 'vacancy'],
  salary: ['salary', 'compensation', 'pay'],
  campus: ['college', 'campus', 'placement', 'student', 'cohort'],
  passport: ['passport', 'credential', 'proof', 'badge'],
  sarkari: ['govt', 'government', 'sarkari', 'exam'],
  career: ['career', 'roadmap', 'pathway', 'pathfinder'],
  learning: ['course', 'assessment', 'skill', 'pod', 'learning'],
  recruiter: ['recruiter', 'employer', 'hiring', 'applicant', 'candidate'],
  ca: ['ca_', 'tax', 'accounting', 'audit', 'gst', 'finance'],
  legal: ['legal', 'case', 'contract', 'law', 'matter'],
  services: ['service', 'booking', 'consultation', 'client', 'provider']
};

console.log(`TOTAL DETECTED TABLES IN SUPABASE: ${tables.length}`);
for (const [k, words] of Object.entries(keywords)) {
  const matches = tables.filter(tbl => words.some(w => tbl.toLowerCase().includes(w)));
  console.log(`\n=== ${k.toUpperCase()} (${matches.length} tables) ===`);
  console.log(matches.slice(0, 15).join(', '));
}
