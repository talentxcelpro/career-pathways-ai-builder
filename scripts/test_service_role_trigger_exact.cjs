const { runSql } = require('./db-audit-helper.cjs');

async function testServiceRoleTrigger() {
  console.log('Testing trigger behavior under service_role with distinct values...');
  
  // Ensure the trigger is installed as SECURITY INVOKER with strict check
  runSql(`
    CREATE OR REPLACE FUNCTION public.protect_profile_system_columns()
    RETURNS trigger
    LANGUAGE plpgsql
    SECURITY INVOKER
    SET search_path = ''
    AS $$
    BEGIN
        IF TG_OP = 'UPDATE' THEN
            IF (
                (OLD.verification_status IS DISTINCT FROM NEW.verification_status) OR
                (OLD.user_role::text IS DISTINCT FROM NEW.user_role::text) OR
                (OLD.is_profile_public IS DISTINCT FROM NEW.is_profile_public) OR
                (OLD.profile_visibility IS DISTINCT FROM NEW.profile_visibility)
            ) THEN
                -- Permit execution ONLY for superuser (postgres session AND role) or inside trusted consent RPC
                IF (session_user = 'postgres' AND current_user = 'postgres')
                   OR pg_catalog.current_setting('txc.in_consent_rpc', true) = 'on' THEN
                    RETURN NEW;
                END IF;
                RAISE EXCEPTION 'Direct mutation of system/privacy columns on public.profiles is forbidden. Use authorized RPCs.' USING errcode = '42501';
            END IF;
        ELSIF TG_OP = 'INSERT' THEN
            IF (
                (NEW.verification_status IS NOT NULL AND NEW.verification_status <> 'unverified') OR
                (NEW.user_role::text IS NOT NULL AND NEW.user_role::text NOT IN ('candidate', 'job_seeker')) OR
                (NEW.is_profile_public IS TRUE) OR
                (NEW.profile_visibility IS NOT NULL AND NEW.profile_visibility <> 'private')
            ) THEN
                IF (session_user = 'postgres' AND current_user = 'postgres')
                   OR pg_catalog.current_setting('txc.in_consent_rpc', true) = 'on' THEN
                    RETURN NEW;
                END IF;
                RAISE EXCEPTION 'Setting privileged values for system/privacy columns on profile insert is forbidden.' USING errcode = '42501';
            END IF;
        END IF;
        RETURN NEW;
    END;
    $$;
  `, 'staging');

  // Candidate 1 current values:
  // verification_status = 'verified' -> try 'unverified'
  // user_role = 'job_seeker' -> try 'admin'
  // profile_visibility = 'public' -> try 'private'
  // is_profile_public = true -> try false
  const mutations = [
    { col: 'verification_status', val: "'unverified'" },
    { col: 'user_role', val: "'admin'::public.user_role" },
    { col: 'profile_visibility', val: "'private'" },
    { col: 'is_profile_public', val: "false" }
  ];

  for (const m of mutations) {
    const testSql = `
      DO $$
      BEGIN
        SET LOCAL ROLE service_role;
        UPDATE public.profiles SET ${m.col} = ${m.val} WHERE id = '0b28a473-bcbb-4c49-b291-f9ea0daf4add';
      END $$;
    `;
    const res = runSql(testSql, 'staging');
    const isBlocked = res?.error && (res.stdout?.includes('42501') || res.error?.includes('42501') || res.stderr?.includes('42501'));
    console.log(`Mutation of ${m.col} as service_role:`, isBlocked ? 'BLOCKED WITH 42501 (SUCCESS)' : 'FAILED: ' + JSON.stringify(res));
  }
}

testServiceRoleTrigger();
