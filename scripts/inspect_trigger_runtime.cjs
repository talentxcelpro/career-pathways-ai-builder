const { runSql } = require('./db-audit-helper.cjs');

async function testTriggerRuntime() {
  console.log('--- 1. TRIGGER FUNCTION OWNER & DEFINITION ---');
  const trg = await runSql(`
    SELECT p.proname, r.rolname as owner, p.prosecdef, p.proconfig
    FROM pg_proc p
    JOIN pg_roles r ON r.oid = p.proowner
    WHERE p.proname = 'protect_profile_system_columns';
  `, 'staging');
  console.log(JSON.stringify(trg, null, 2));

  console.log('\n--- 2. SERVICE_ROLE PRIVILEGES ON public.profiles ---');
  const srvTbl = await runSql(`
    SELECT grantee, privilege_type
    FROM information_schema.table_privileges
    WHERE table_name = 'profiles' AND grantee = 'service_role';
  `, 'staging');
  console.log('Table privs:', JSON.stringify(srvTbl, null, 2));

  const srvCols = await runSql(`
    SELECT column_name, privilege_type
    FROM information_schema.column_privileges
    WHERE table_name = 'profiles' AND grantee = 'service_role'
    ORDER BY column_name;
  `, 'staging');
  console.log('Column privs count:', srvCols.length);

  console.log('\n--- 3. TEST SERVICE_ROLE RUNTIME IDENTITY INSIDE TRIGGER ---');
  const runtimeCheck = await runSql(`
    DO $$
    DECLARE
      v_curr text;
      v_sess text;
    BEGIN
      PERFORM set_config('role', 'service_role', true);
      SELECT current_user, session_user INTO v_curr, v_sess;
      RAISE NOTICE 'Before trigger: current_user=%, session_user=%', v_curr, v_sess;
    END $$;
  `, 'staging');
  console.log('Runtime check:', runtimeCheck);
}

testTriggerRuntime();
