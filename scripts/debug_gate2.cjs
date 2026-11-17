const { runSql } = require('./db-audit-helper.cjs');

async function test() {
  const fakeUserId = '99999999-9999-9999-9999-999999999999';
  const missingRes = runSql(`
    DO $$
    DECLARE
      v_res jsonb;
    BEGIN
      PERFORM set_config('request.jwt.claim.sub', '${fakeUserId}', true);
      PERFORM set_config('request.jwt.claim.role', 'authenticated', true);
      SELECT public.set_public_profile_consent(true, 'public', 'user_privacy_dashboard') INTO v_res;
    END $$;
  `, 'staging');
  console.log('missingRes:', JSON.stringify(missingRes, null, 2));

  const bypassRes = runSql(`
    DO $$
    BEGIN
      PERFORM set_config('request.jwt.claim.sub', '0b28a473-bcbb-4c49-b291-f9ea0daf4add', true);
      PERFORM set_config('request.jwt.claim.role', 'authenticated', true);
      PERFORM set_config('txc.in_consent_rpc', 'on', true);
      UPDATE public.profiles SET verification_status = 'verified' WHERE id = '0b28a473-bcbb-4c49-b291-f9ea0daf4add';
    END $$;
  `, 'staging');
  console.log('bypassRes:', JSON.stringify(bypassRes, null, 2));
}

test();
