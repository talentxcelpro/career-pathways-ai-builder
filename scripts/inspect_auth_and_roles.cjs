const { runSql } = require('./db-audit-helper.cjs');

async function main() {
  const enums = await runSql(`
    SELECT t.typname, e.enumlabel 
    FROM pg_type t 
    JOIN pg_enum e ON t.oid = e.enumtypid 
    WHERE t.typname IN ('app_role', 'user_role')
    ORDER BY e.enumsortorder;
  `, 'staging');
  console.log('ENUMS:', JSON.stringify(enums, null, 2));

  const funcs = await runSql(`
    SELECT proname, prosrc, prosecdef
    FROM pg_proc 
    WHERE proname IN ('is_app_admin', 'is_recruiter', 'is_employer', 'is_company_admin_or_owner') 
      AND pronamespace = 'public'::regnamespace;
  `, 'staging');
  console.log('FUNCTIONS:', JSON.stringify(funcs, null, 2));
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
