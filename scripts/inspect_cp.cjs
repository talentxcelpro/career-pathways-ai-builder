const { runSql } = require('./db-audit-helper.cjs');

const cp = runSql(`
  SELECT * FROM public.company_profiles WHERE company_id = '11111111-aaaa-aaaa-aaaa-111111111111';
`, 'staging');
console.log('company_profiles:', cp);
