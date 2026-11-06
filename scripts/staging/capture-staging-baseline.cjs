const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function runSql(sql) {
  const tmpFile = path.join(__dirname, '.tmp-baseline-query.sql');
  fs.writeFileSync(tmpFile, sql);
  try {
    const output = execSync(`npx supabase db query --linked -f "${tmpFile}"`, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    const startIdx = output.indexOf('{');
    const endIdx = output.lastIndexOf('}');
    if (startIdx !== -1 && endIdx !== -1) {
      const jsonStr = output.slice(startIdx, endIdx + 1);
      return JSON.parse(jsonStr).rows || [];
    }
    return { raw: output };
  } catch (err) {
    return { error: err.message, stdout: err.stdout ? err.stdout.toString() : null };
  } finally {
    if (fs.existsSync(tmpFile)) {
      fs.unlinkSync(tmpFile);
    }
  }
}

console.log('Capturing staging baseline snapshot from linked project...');

const baseline = {
  timestamp: new Date().toISOString(),
  target_project: 'pvwwtquuexhyydwihjbi',
  target_environment: 'TalentXcel Staging',
  branch: 'main',
  commit: '0a46bd32953e1a383133d88e301ca9b9c206d1c0',
  tables_rls: runSql(`
    SELECT schemaname, tablename, rowsecurity 
    FROM pg_tables 
    WHERE schemaname = 'public' 
    ORDER BY tablename;
  `),
  policies: runSql(`
    SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
    FROM pg_policies 
    WHERE schemaname IN ('public', 'storage')
    ORDER BY schemaname, tablename, policyname;
  `),
  functions: runSql(`
    SELECT 
      p.proname AS function_name,
      n.nspname AS schema_name,
      pg_get_userbyid(p.proowner) AS owner,
      p.prosecdef AS is_security_definer,
      p.provolatile AS volatility,
      proconfig AS runtime_config,
      pg_get_function_arguments(p.oid) AS arguments
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
      AND p.proname IN ('check_rate_limit', 'record_resume_download_atomic', 'is_app_admin', 'is_company_admin_or_owner')
    ORDER BY p.proname;
  `),
  routine_privileges: runSql(`
    SELECT routine_schema, routine_name, grantee, privilege_type 
    FROM information_schema.routine_privileges 
    WHERE routine_schema = 'public' 
      AND routine_name IN ('check_rate_limit', 'record_resume_download_atomic', 'is_app_admin', 'is_company_admin_or_owner')
    ORDER BY routine_name, grantee;
  `),
  table_privileges: runSql(`
    SELECT table_schema, table_name, grantee, privilege_type 
    FROM information_schema.table_privileges 
    WHERE table_schema = 'public' 
      AND table_name IN ('edge_rate_limits', 'user_roles', 'resume_downloads')
    ORDER BY table_name, grantee, privilege_type;
  `),
  storage_buckets: runSql(`
    SELECT id, name, public, file_size_limit, allowed_mime_types 
    FROM storage.buckets 
    ORDER BY id;
  `),
  users: runSql(`
    SELECT id, email, created_at, role 
    FROM auth.users 
    ORDER BY email;
  `),
  profiles: runSql(`
    SELECT id, email, full_name, user_role 
    FROM public.profiles 
    ORDER BY email;
  `)
};

const outPath = path.join(__dirname, '..', '..', 'reports', 'staging_baseline_pre_rehearsal.json');
fs.writeFileSync(outPath, JSON.stringify(baseline, null, 2), 'utf8');
console.log('Successfully captured staging baseline snapshot to:', outPath);
console.log('Table RLS Count:', baseline.tables_rls.length);
console.log('Policies Count:', baseline.policies.length);
console.log('Functions Count:', baseline.functions.length);
console.log('Users Count:', baseline.users.length);
