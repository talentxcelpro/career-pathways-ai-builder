const { runSql } = require('./db-audit-helper.cjs');

async function main() {
  const roles = await runSql(`SELECT * FROM public.user_roles;`, 'staging');
  console.log('user_roles in staging:', roles);

  const isAdmin = await runSql(`SELECT public.is_app_admin('d5336939-770b-442b-88d0-a6edd6850657') as rec_is_admin;`, 'staging');
  console.log('rec_is_admin:', isAdmin);
}

main().catch(console.error);
