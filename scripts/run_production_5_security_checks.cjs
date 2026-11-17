const { runSql } = require('./db-audit-helper.cjs');

async function runAudit() {
  console.log('========================================================================');
  console.log('RUNNING THE 5 USER-REQUESTED READ-ONLY PRODUCTION SECURITY AUDIT QUERIES');
  console.log('Target: Production (dthlgsnakhoftinssokm)');
  console.log('========================================================================\n');

  // 1. Tables with RLS off
  console.log('--- 1. TABLES WITH RLS OFF ---');
  const q1 = `
    SELECT c.relname 
    FROM pg_class c 
    JOIN pg_namespace n ON n.oid=c.relnamespace 
    WHERE n.nspname='public' AND c.relkind='r' AND NOT c.relrowsecurity
    ORDER BY c.relname;
  `;
  const res1 = runSql(q1, 'production');
  console.log(`Count of tables with RLS OFF: ${res1.length}`);
  console.log(JSON.stringify(res1.slice(0, 50), null, 2));

  // 2. Anon-readable policies with no real condition (qual='true' or qual IS NULL)
  console.log('\n--- 2. ANON-READABLE POLICIES WITH NO CONDITION (qual=true) ---');
  const q2 = `
    SELECT tablename, policyname, cmd, qual 
    FROM pg_policies 
    WHERE schemaname='public' 
      AND cmd IN ('SELECT','ALL') 
      AND roles && array['public','anon']::name[] 
      AND (qual='true' OR qual IS NULL)
    ORDER BY tablename, policyname;
  `;
  const res2 = runSql(q2, 'production');
  console.log(`Count of open anon/public policies: ${res2.length}`);
  console.log(JSON.stringify(res2, null, 2));

  // 3. Columns that look like personal data
  console.log('\n--- 3. PII-LIKE COLUMNS IN PUBLIC SCHEMA ---');
  const q3 = `
    SELECT table_name, column_name 
    FROM information_schema.columns 
    WHERE table_schema='public' 
      AND column_name ~* '(email|phone|mobile|resume|salary|dob|aadhaar|pan|address|token|secret)'
    ORDER BY table_name, column_name;
  `;
  const res3 = runSql(q3, 'production');
  console.log(`Count of PII-like columns: ${res3.length}`);
  console.log(JSON.stringify(res3, null, 2));

  // 4. SECURITY DEFINER functions callable by anon
  console.log('\n--- 4. SECURITY DEFINER FUNCTIONS CALLABLE BY ANON ---');
  const q4 = `
    SELECT p.proname, p.proacl 
    FROM pg_proc p 
    JOIN pg_namespace n ON n.oid=p.pronamespace 
    WHERE n.nspname='public' 
      AND p.prosecdef 
      AND (p.proacl IS NULL OR p.proacl::text ~ 'anon|=X')
    ORDER BY p.proname;
  `;
  const res4 = runSql(q4, 'production');
  console.log(`Count of SECURITY DEFINER functions callable by anon: ${res4.length}`);
  console.log(JSON.stringify(res4, null, 2));

  // 5. Views that may bypass RLS
  console.log('\n--- 5. VIEWS IN PUBLIC SCHEMA ---');
  const q5 = `
    SELECT viewname 
    FROM pg_views 
    WHERE schemaname='public'
    ORDER BY viewname;
  `;
  const res5 = runSql(q5, 'production');
  console.log(`Count of views in public schema: ${res5.length}`);
  console.log(JSON.stringify(res5, null, 2));
}

runAudit().catch(console.error);
