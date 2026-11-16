const { createClient } = require('@supabase/supabase-js');
const { runSql, STAGING_REF } = require('./db-audit-helper.cjs');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = `https://${STAGING_REF}.supabase.co`;
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2d3d0cXV1ZXhoeXlkd2loamJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM1OTI1NzYsImV4cCI6MjEwOTE2ODU3Nn0.ZBevJqFcBzb2UAwwr_o5zgUcrrI5uf1rFgsn-cMFXnQ";

async function testRollbackAnon() {
  const anonClient = createClient(SUPABASE_URL, ANON_KEY, { auth: { persistSession: false } });

  // Apply Rollback SQL
  const rollbackSqlPath = path.join(__dirname, '..', 'supabase', 'migrations', '20261114190000_txc_migration_b_secure_profiles_access_model_rollback.sql');
  const rollbackSql = fs.readFileSync(rollbackSqlPath, 'utf8');
  runSql(rollbackSql, 'staging');

  const privs = await runSql(`
    SELECT grantee, privilege_type FROM information_schema.table_privileges WHERE table_name = 'profiles';
  `, 'staging');
  console.log('Privs on profiles during rollback:', privs);

  const pols = await runSql(`
    SELECT policyname, roles, qual FROM pg_policies WHERE tablename = 'profiles';
  `, 'staging');
  console.log('Pols on profiles during rollback:', pols);

  const res = await anonClient.from('profiles').select('*');
  console.log('Anon query result during rollback:', res);

  // Restore Forward Migration B
  const forwardSqlPath = path.join(__dirname, '..', 'supabase', 'migrations', '20261114190000_txc_migration_b_secure_profiles_access_model.sql');
  const forwardSql = fs.readFileSync(forwardSqlPath, 'utf8');
  runSql(forwardSql, 'staging');
}

testRollbackAnon();
