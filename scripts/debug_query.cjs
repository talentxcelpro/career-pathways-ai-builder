const { runSql } = require('./db-audit-helper.cjs');
const res = runSql("SELECT id, job_title, company_name, match_score FROM get_distribution_eligible_jobs('tech_high_growth'::text, 4, '{}'::uuid[]);");
console.log('Result:', JSON.stringify(res, null, 2));
