const { runSql } = require('./db-audit-helper.cjs');

const users = runSql(`
  SELECT p.id, p.full_name, p.is_profile_public, p.email, u.email as auth_email
  FROM public.profiles p
  LEFT JOIN auth.users u ON u.id = p.id;
`, 'staging');

console.log('Existing staging profiles:');
console.log(JSON.stringify(users, null, 2));
