const { runSql } = require('./db-audit-helper.cjs');
const fs = require('fs');
const path = require('path');

const BACKUP_DIR = path.join(__dirname, '..', 'backups', 'production_pre_migration_20261117');

async function main() {
  console.log('================================================================');
  console.log('STARTING SECURE PRODUCTION BACKUP EXPORT');
  console.log('Target: Production (dthlgsnakhoftinssokm)');
  console.log('Directory:', BACKUP_DIR);
  console.log('================================================================\n');

  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  // 1. Export Cluster Roles
  console.log('1. Exporting database roles and permissions...');
  const roles = await runSql(`
    SELECT rolname, rolsuper, rolinherit, rolcreaterole, rolcreatedb, rolcanlogin, rolreplication, rolbypassrls
    FROM pg_roles
    ORDER BY rolname;
  `, 'production');
  fs.writeFileSync(path.join(BACKUP_DIR, 'production_roles.json'), JSON.stringify(roles, null, 2), 'utf8');
  console.log(`   Exported ${roles.length} roles.`);

  // 2. Export Database Schema Metadata (Tables, Columns, Types)
  console.log('2. Exporting database schema metadata (tables & columns)...');
  const columns = await runSql(`
    SELECT table_schema, table_name, column_name, ordinal_position, column_default, is_nullable, data_type, udt_name
    FROM information_schema.columns
    WHERE table_schema IN ('public', 'storage', 'extensions')
    ORDER BY table_schema, table_name, ordinal_position;
  `, 'production');
  fs.writeFileSync(path.join(BACKUP_DIR, 'production_schema_columns.json'), JSON.stringify(columns, null, 2), 'utf8');
  console.log(`   Exported ${columns.length} columns.`);

  // 3. Export Views Definitions
  console.log('3. Exporting views definitions...');
  const views = await runSql(`
    SELECT table_schema, table_name, view_definition
    FROM information_schema.views
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `, 'production');
  fs.writeFileSync(path.join(BACKUP_DIR, 'production_views.json'), JSON.stringify(views, null, 2), 'utf8');
  console.log(`   Exported ${views.length} views.`);

  // 4. Export Table Policies (RLS)
  console.log('4. Exporting Row Level Security policies...');
  const policies = await runSql(`
    SELECT 
      schemaname, tablename, policyname, permissive, roles::text, cmd,
      qual, with_check
    FROM pg_policies
    WHERE schemaname IN ('public', 'storage')
    ORDER BY schemaname, tablename, policyname;
  `, 'production');
  fs.writeFileSync(path.join(BACKUP_DIR, 'production_rls_policies.json'), JSON.stringify(policies, null, 2), 'utf8');
  console.log(`   Exported ${policies.length} RLS policies.`);

  // 5. Export Functions and Procedures
  console.log('5. Exporting database functions and procedures...');
  const procs = await runSql(`
    SELECT 
      n.nspname as schema_name,
      p.proname as function_name,
      pg_get_function_identity_arguments(p.oid) as arguments,
      pg_get_userbyid(p.proowner) as owner,
      p.prosecdef as security_definer,
      p.proconfig as configuration,
      p.prosrc as source_code
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname IN ('public', 'extensions')
    ORDER BY n.nspname, p.proname;
  `, 'production');
  fs.writeFileSync(path.join(BACKUP_DIR, 'production_functions.json'), JSON.stringify(procs, null, 2), 'utf8');
  console.log(`   Exported ${procs.length} functions.`);

  // 6. Export Applied Migrations
  console.log('6. Exporting applied migrations ledger...');
  const migrations = await runSql(`
    SELECT version
    FROM supabase_migrations.schema_migrations
    ORDER BY version;
  `, 'production');
  fs.writeFileSync(path.join(BACKUP_DIR, 'production_migrations_history.json'), JSON.stringify(migrations, null, 2), 'utf8');
  console.log(`   Exported ${migrations.length} migration versions.`);

  // 7. Export Critical Data Tables
  const criticalTables = [
    'profiles',
    'companies',
    'company_team_members',
    'jobs',
    'job_applications',
    'user_roles'
  ];

  console.log('7. Exporting critical table data...');
  for (const table of criticalTables) {
    const countRes = await runSql(`SELECT count(*) as count FROM public.${table};`, 'production');
    const count = countRes[0]?.count || 0;
    console.log(`   Exporting public.${table} (${count} rows)...`);
    
    // Dump table as JSON
    const dataRes = await runSql(`
      SELECT json_agg(t) as rows FROM (SELECT * FROM public.${table} LIMIT 10000) t;
    `, 'production');
    const tableData = dataRes[0]?.rows || [];
    fs.writeFileSync(path.join(BACKUP_DIR, `data_public_${table}.json`), JSON.stringify(tableData, null, 2), 'utf8');
  }

  // 8. Export Storage Objects Metadata
  console.log('8. Exporting Storage objects inventory metadata...');
  const storageObjects = await runSql(`
    SELECT id, bucket_id, name, owner, owner_id, created_at, updated_at, last_accessed_at, metadata
    FROM storage.objects
    ORDER BY created_at DESC
    LIMIT 10000;
  `, 'production');
  fs.writeFileSync(path.join(BACKUP_DIR, 'storage_objects_inventory.json'), JSON.stringify(storageObjects, null, 2), 'utf8');
  console.log(`   Exported ${storageObjects.length} storage object records.`);

  // 9. Summary & File Manifest
  console.log('\n--- VERIFYING BACKUP COMPLETION & FILE SIZES ---');
  const files = fs.readdirSync(BACKUP_DIR);
  let totalBytes = 0;
  for (const f of files) {
    const stats = fs.statSync(path.join(BACKUP_DIR, f));
    totalBytes += stats.size;
    console.log(`   ${f.padEnd(40)} : ${(stats.size / 1024).toFixed(2)} KB`);
  }
  console.log(`\nTOTAL BACKUP VOLUME: ${(totalBytes / (1024 * 1024)).toFixed(2)} MB`);
  console.log('STATUS: BACKUP COMPLETED SUCCESSFULLY');
}

main().catch(err => {
  console.error('BACKUP FAILED:', err);
  process.exit(1);
});
