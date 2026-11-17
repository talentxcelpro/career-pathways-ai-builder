const { runSql } = require('./db-audit-helper.cjs');

async function testEachRoleMutation() {
  console.log('Testing each role on candidate_privacy_consents and candidate_consent_events:');

  const tests = [
    // anon
    { role: 'anon', action: 'INSERT', table: 'candidate_privacy_consents', sql: "INSERT INTO public.candidate_privacy_consents (user_id, consent_type, consent_status) VALUES ('00000000-0000-0000-0000-000000000000', 'test', 'granted');" },
    { role: 'anon', action: 'UPDATE', table: 'candidate_privacy_consents', sql: "UPDATE public.candidate_privacy_consents SET consent_status = 'revoked' WHERE user_id = '00000000-0000-0000-0000-000000000000';" },
    { role: 'anon', action: 'DELETE', table: 'candidate_privacy_consents', sql: "DELETE FROM public.candidate_privacy_consents WHERE user_id = '00000000-0000-0000-0000-000000000000';" },
    { role: 'anon', action: 'TRUNCATE', table: 'candidate_privacy_consents', sql: "TRUNCATE public.candidate_privacy_consents;" },

    // authenticated
    { role: 'authenticated', action: 'INSERT', table: 'candidate_privacy_consents', sql: "INSERT INTO public.candidate_privacy_consents (user_id, consent_type, consent_status) VALUES ('00000000-0000-0000-0000-000000000000', 'test', 'granted');" },
    { role: 'authenticated', action: 'UPDATE', table: 'candidate_privacy_consents', sql: "UPDATE public.candidate_privacy_consents SET consent_status = 'revoked' WHERE user_id = '00000000-0000-0000-0000-000000000000';" },
    { role: 'authenticated', action: 'DELETE', table: 'candidate_privacy_consents', sql: "DELETE FROM public.candidate_privacy_consents WHERE user_id = '00000000-0000-0000-0000-000000000000';" },
    { role: 'authenticated', action: 'TRUNCATE', table: 'candidate_privacy_consents', sql: "TRUNCATE public.candidate_privacy_consents;" },

    // service_role
    { role: 'service_role', action: 'INSERT', table: 'candidate_privacy_consents', sql: "INSERT INTO public.candidate_privacy_consents (user_id, consent_type, consent_status) VALUES ('00000000-0000-0000-0000-000000000000', 'test', 'granted');" },
    { role: 'service_role', action: 'UPDATE', table: 'candidate_privacy_consents', sql: "UPDATE public.candidate_privacy_consents SET consent_status = 'revoked' WHERE user_id = '00000000-0000-0000-0000-000000000000';" },
    { role: 'service_role', action: 'DELETE', table: 'candidate_privacy_consents', sql: "DELETE FROM public.candidate_privacy_consents WHERE user_id = '00000000-0000-0000-0000-000000000000';" },
    { role: 'service_role', action: 'TRUNCATE', table: 'candidate_privacy_consents', sql: "TRUNCATE public.candidate_privacy_consents;" },

    // candidate_consent_events
    { role: 'anon', action: 'INSERT', table: 'candidate_consent_events', sql: "INSERT INTO public.candidate_consent_events (user_id, consent_type, event_type, consent_version, consent_source) VALUES ('00000000-0000-0000-0000-000000000000', 'test', 'consent_granted', 'v1.0', 'test');" },
    { role: 'authenticated', action: 'INSERT', table: 'candidate_consent_events', sql: "INSERT INTO public.candidate_consent_events (user_id, consent_type, event_type, consent_version, consent_source) VALUES ('00000000-0000-0000-0000-000000000000', 'test', 'consent_granted', 'v1.0', 'test');" },
    { role: 'service_role', action: 'INSERT', table: 'candidate_consent_events', sql: "INSERT INTO public.candidate_consent_events (user_id, consent_type, event_type, consent_version, consent_source) VALUES ('00000000-0000-0000-0000-000000000000', 'test', 'consent_granted', 'v1.0', 'test');" },
    { role: 'service_role', action: 'TRUNCATE', table: 'candidate_consent_events', sql: "TRUNCATE public.candidate_consent_events;" }
  ];

  for (const t of tests) {
    const wrappedSql = `
      DO $$
      BEGIN
        SET LOCAL ROLE ${t.role};
        ${t.sql}
        RAISE EXCEPTION 'SUCCESS_EXECUTED';
      EXCEPTION
        WHEN insufficient_privilege THEN
          RAISE NOTICE 'DENIED_42501';
      END $$;
    `;
    const res = runSql(wrappedSql, 'staging');
    let outcome = 'UNKNOWN';
    if (res && res.error && res.error.includes('SUCCESS_EXECUTED')) {
      outcome = 'ALLOWED (Executed without error)';
    } else if (res && (res.length === 0 || (res.stderr && res.stderr.includes('DENIED_42501')) || (res.stdout && res.stdout.includes('DENIED_42501')))) {
      outcome = 'DENIED (42501 insufficient_privilege)';
    } else {
      outcome = JSON.stringify(res);
    }
    console.log(`[${t.role.toUpperCase()}] ${t.action} on ${t.table} -> ${outcome}`);
  }
}

testEachRoleMutation().catch(console.error);
