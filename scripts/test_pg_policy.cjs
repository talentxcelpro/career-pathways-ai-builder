const { runSql } = require('./db-audit-helper.cjs');

console.log('Testing direct pg_policy query with statement_timeout...');
const res = runSql(`
  SET statement_timeout = '10s';
  SELECT 
    p.polname AS policyname,
    p.polcmd AS cmd,
    p.polpermissive AS permissive,
    pg_get_expr(p.polqual, p.polrelid) AS qual,
    pg_get_expr(p.polwithcheck, p.polrelid) AS with_check
  FROM pg_policy p
  WHERE p.polrelid = 'public.profiles'::regclass
  ORDER BY p.polname;
`, 'production');

console.log('Result:', JSON.stringify(res, null, 2));
