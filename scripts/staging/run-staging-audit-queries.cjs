const { execSync } = require('child_process');
const fs = require('fs');

function runQuery(sql) {
  try {
    const tmpFile = 'scripts/staging/.tmp-query.sql';
    fs.writeFileSync(tmpFile, sql);
    const output = execSync(`npx supabase db query --linked -f ${tmpFile}`, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] });
    fs.unlinkSync(tmpFile);
    // Parse json between { and }
    const startIdx = output.indexOf('{');
    const endIdx = output.lastIndexOf('}');
    if (startIdx !== -1 && endIdx !== -1) {
      const jsonStr = output.slice(startIdx, endIdx + 1);
      const parsed = JSON.parse(jsonStr);
      return parsed.rows || [];
    }
    return output;
  } catch (err) {
    return { error: err.message };
  }
}

console.log('--- 1. TABLE RLS STATUS ---');
const rlsStatus = runQuery(`
  SELECT schemaname, tablename, rowsecurity 
  FROM pg_tables 
  WHERE schemaname = 'public' 
    AND tablename IN ('user_roles', 'resume_downloads', 'edge_rate_limits', 'profiles', 'resumes', 'job_applications', 'companies')
  ORDER BY tablename;
`);
console.log(JSON.stringify(rlsStatus, null, 2));

console.log('\n--- 2. RLS POLICIES ---');
const policies = runQuery(`
  SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
  FROM pg_policies 
  WHERE schemaname IN ('public', 'storage')
    AND tablename IN ('user_roles', 'resume_downloads', 'edge_rate_limits', 'objects', 'job_applications')
  ORDER BY schemaname, tablename, policyname;
`);
console.log(JSON.stringify(policies, null, 2));

console.log('\n--- 3. SECURITY DEFINER FUNCTIONS & SEARCH_PATH ---');
const functions = runQuery(`
  SELECT 
    p.proname AS function_name,
    n.nspname AS schema_name,
    p.prosecdef AS is_security_definer,
    p.provolatile AS volatility,
    proconfig AS runtime_config
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
    AND p.proname IN ('check_rate_limit', 'record_resume_download_atomic', 'is_app_admin', 'is_company_admin_or_owner')
  ORDER BY p.proname;
`);
console.log(JSON.stringify(functions, null, 2));

console.log('\n--- 4. FUNCTION EXECUTION PRIVILEGES (ROUTINE PRIVILEGES) ---');
const routinePrivs = runQuery(`
  SELECT routine_name, grantee, privilege_type 
  FROM information_schema.routine_privileges 
  WHERE routine_schema = 'public' 
    AND routine_name IN ('check_rate_limit', 'record_resume_download_atomic', 'is_app_admin', 'is_company_admin_or_owner')
  ORDER BY routine_name, grantee;
`);
console.log(JSON.stringify(routinePrivs, null, 2));

console.log('\n--- 5. TABLE PRIVILEGES ---');
const tablePrivs = runQuery(`
  SELECT table_name, grantee, privilege_type 
  FROM information_schema.table_privileges 
  WHERE table_schema = 'public' 
    AND table_name IN ('edge_rate_limits', 'user_roles', 'resume_downloads')
  ORDER BY table_name, grantee, privilege_type;
`);
console.log(JSON.stringify(tablePrivs, null, 2));

console.log('\n--- 6. STORAGE BUCKETS ---');
const buckets = runQuery(`
  SELECT id, name, public, file_size_limit, allowed_mime_types 
  FROM storage.buckets 
  ORDER BY id;
`);
console.log(JSON.stringify(buckets, null, 2));
