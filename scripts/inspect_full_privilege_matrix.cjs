const { runSql } = require('./db-audit-helper.cjs');

async function inspectFullPrivilegeMatrix() {
  console.log('========================================================================');
  console.log('AUTHORITATIVE DATABASE TABLE & VIEW PRIVILEGE MATRIX');
  console.log('Target: Staging (pvwwtquuexhyydwihjbi)');
  console.log('========================================================================\n');

  const matrixSql = `
    WITH objects AS (
      SELECT unnest(ARRAY[
        'candidate_privacy_consents',
        'candidate_consent_events',
        'public_profiles',
        'profiles'
      ]) AS object_name
    ),
    roles AS (
      SELECT unnest(ARRAY[
        'anon',
        'authenticated',
        'service_role',
        'postgres'
      ]) AS role_name
    )
    SELECT 
      o.object_name,
      r.role_name,
      has_table_privilege(r.role_name, 'public.' || o.object_name, 'SELECT') AS select_priv,
      has_table_privilege(r.role_name, 'public.' || o.object_name, 'INSERT') AS insert_priv,
      has_table_privilege(r.role_name, 'public.' || o.object_name, 'UPDATE') AS update_priv,
      has_table_privilege(r.role_name, 'public.' || o.object_name, 'DELETE') AS delete_priv,
      has_table_privilege(r.role_name, 'public.' || o.object_name, 'TRUNCATE') AS truncate_priv
    FROM objects o
    CROSS JOIN roles r
    ORDER BY o.object_name, r.role_name;
  `;

  const matrix = runSql(matrixSql, 'staging');
  console.log(JSON.stringify(matrix, null, 2));

  // Also check RLS status on each object
  const rlsSql = `
    SELECT 
      c.relname as table_name,
      c.relrowsecurity as rls_enabled,
      c.relforcerowsecurity as rls_forced
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' 
      AND c.relname IN ('candidate_privacy_consents', 'candidate_consent_events', 'profiles', 'public_profiles');
  `;
  const rls = runSql(rlsSql, 'staging');
  console.log('\nRLS Configuration:', JSON.stringify(rls, null, 2));
}

inspectFullPrivilegeMatrix().catch(console.error);
