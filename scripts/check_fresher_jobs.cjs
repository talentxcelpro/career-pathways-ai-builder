const { runSql } = require('./db-audit-helper.cjs');
const res = runSql(`
  SELECT id, title, company_name, experience_level, min_experience, max_experience 
  FROM jobs 
  WHERE lower(title) LIKE '%fresher%' 
     OR lower(title) LIKE '%intern%' 
     OR lower(title) LIKE '%trainee%'
     OR lower(title) LIKE '%graduate%'
     OR lower(experience_level) LIKE '%entry%'
     OR lower(experience_level) LIKE '%fresher%'
  LIMIT 10;
`);
console.log('Sample Fresher Jobs in DB:', JSON.stringify(res, null, 2));
