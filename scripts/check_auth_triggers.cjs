const { runSql } = require('./db-audit-helper.cjs');

const sql = `
  SELECT 
    t.tgname,
    p.proname,
    n.nspname
  FROM pg_trigger t
  JOIN pg_proc p ON p.oid = t.tgfoid
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE t.tgrelid = 'auth.users'::regclass;
`;

const res = runSql(sql, 'staging');
console.log('Triggers on auth.users:', JSON.stringify(res, null, 2));
