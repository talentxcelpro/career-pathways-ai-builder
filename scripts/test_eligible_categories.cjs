const { runSql } = require('./db-audit-helper.cjs');

const categories = ['tech_high_growth', 'fresher_entry', 'remote_executive', 'govt_psu'];

for (const cat of categories) {
  const query = `SELECT id, job_title, company_name, location_city, salary_range, match_score FROM get_distribution_eligible_jobs('${cat}'::text, 2, '{}'::uuid[]);`;
  const res = runSql(query, 'production');
  console.log(`\n=== CATEGORY: ${cat} ===`);
  console.log(JSON.stringify(res, null, 2));
}
