const { runSql } = require('./db-audit-helper.cjs');
const res = runSql("SELECT count(*) FROM get_distribution_eligible_jobs('fresher_entry'::text, 10, '{}'::uuid[]);");
console.log('Fresher count:', JSON.stringify(res, null, 2));
