const { runSql } = require('./db-audit-helper.cjs');

const res = runSql(`
  SET statement_timeout = '10s';
  SELECT count(*) as cnt 
  FROM information_schema.views 
  WHERE table_schema = 'public' AND table_name = 'public_profiles';
`, 'production');

console.log('Production public_profiles view count:', res[0]?.cnt);
