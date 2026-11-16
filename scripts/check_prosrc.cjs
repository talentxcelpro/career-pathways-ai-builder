const { runSql } = require('./db-audit-helper.cjs');
const res = runSql("SELECT prosrc FROM pg_proc WHERE proname = 'get_distribution_eligible_jobs';");
console.log(res[0] ? res[0].prosrc : 'Not found');
