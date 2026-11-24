const { runSql } = require('./db-audit-helper.cjs');

const jobs = runSql(`
  SELECT id, title, location, employment_type, experience_level, category, is_active 
  FROM public.jobs 
  ORDER BY created_at DESC 
  LIMIT 15;
`);

console.log('Active Live Jobs on TalentXcel:');
console.log(jobs);
