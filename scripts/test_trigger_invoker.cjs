const { runSql } = require('./db-audit-helper.cjs');

async function testTriggerBehavior() {
  console.log('Testing trigger behavior as service_role...');
  
  // Test current behavior with service_role attempting to mutate verification_status
  const test1 = await runSql(`
    DO $$
    BEGIN
      PERFORM set_config('role', 'service_role', true);
      UPDATE public.profiles SET verification_status = 'verified' WHERE id = '0b28a473-bcbb-4c49-b291-f9ea0daf4add';
    END $$;
  `, 'staging');
  console.log('Current service_role update result:', test1);

  // Check what current_user and session_user are when executing as service_role
  const testUsers = await runSql(`
    CREATE OR REPLACE FUNCTION public.test_whoami()
    RETURNS TABLE(c_user text, s_user text)
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      RETURN QUERY SELECT current_user::text, session_user::text;
    END $$;

    CREATE OR REPLACE FUNCTION public.test_whoami_invoker()
    RETURNS TABLE(c_user text, s_user text)
    LANGUAGE plpgsql
    AS $$
    BEGIN
      RETURN QUERY SELECT current_user::text, session_user::text;
    END $$;

    DO $$
    DECLARE
      r1 RECORD;
      r2 RECORD;
    BEGIN
      PERFORM set_config('role', 'service_role', true);
      SELECT * INTO r1 FROM public.test_whoami();
      SELECT * INTO r2 FROM public.test_whoami_invoker();
      RAISE NOTICE 'SECURITY DEFINER: current_user=%, session_user=%', r1.c_user, r1.s_user;
      RAISE NOTICE 'SECURITY INVOKER: current_user=%, session_user=%', r2.c_user, r2.s_user;
    END $$;

    DROP FUNCTION public.test_whoami();
    DROP FUNCTION public.test_whoami_invoker();
  `, 'staging');
  console.log('User identity check:', testUsers);
}

testTriggerBehavior();
