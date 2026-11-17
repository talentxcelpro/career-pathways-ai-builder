const { runSql } = require('./db-audit-helper.cjs');

async function inspectGate1() {
  console.log('--- 1. TABLE PRIVILEGES ON public.profiles ---');
  const tblPrivs = await runSql(`
    SELECT grantee, privilege_type, is_grantable
    FROM information_schema.table_privileges
    WHERE table_schema = 'public' AND table_name = 'profiles'
    ORDER BY grantee, privilege_type;
  `, 'staging');
  console.log(JSON.stringify(tblPrivs, null, 2));

  console.log('\n--- 2. COLUMN PRIVILEGES ON public.profiles ---');
  const colPrivs = await runSql(`
    SELECT grantee, column_name, privilege_type
    FROM information_schema.column_privileges
    WHERE table_schema = 'public' AND table_name = 'profiles'
    ORDER BY grantee, column_name, privilege_type;
  `, 'staging');
  console.log(JSON.stringify(colPrivs, null, 2));

  console.log('\n--- 3. pg_class.relacl ---');
  const relacl = await runSql(`
    SELECT relname, relacl
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND relname = 'profiles';
  `, 'staging');
  console.log(JSON.stringify(relacl, null, 2));

  console.log('\n--- 4. pg_attribute.attacl ---');
  const attacl = await runSql(`
    SELECT a.attname, a.attacl
    FROM pg_attribute a
    JOIN pg_class c ON a.attrelid = c.oid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'profiles' AND a.attnum > 0 AND a.attacl IS NOT NULL
    ORDER BY a.attname;
  `, 'staging');
  console.log(JSON.stringify(attacl, null, 2));

  console.log('\n--- 5. DEFAULT PRIVILEGES ---');
  const defPrivs = await runSql(`
    SELECT defaclrole::regrole, defaclnamespace::regnamespace, defaclobjtype, defaclacl
    FROM pg_default_acl;
  `, 'staging');
  console.log(JSON.stringify(defPrivs, null, 2));
}

inspectGate1().catch(e => console.error(e));
