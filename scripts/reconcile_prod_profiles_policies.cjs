const { runSql } = require('./db-audit-helper.cjs');

console.log('=== RETRIEVING ALL PRODUCTION POLICIES ON public.profiles ===');

const policies = runSql(`
  SET statement_timeout = '10s';
  SELECT 
    p.polname AS policy_name,
    CASE p.polcmd
      WHEN 'r' THEN 'SELECT'
      WHEN 'a' THEN 'INSERT'
      WHEN 'w' THEN 'UPDATE'
      WHEN 'd' THEN 'DELETE'
      WHEN '*' THEN 'ALL'
    END AS command,
    CASE p.polpermissive
      WHEN true THEN 'PERMISSIVE'
      ELSE 'RESTRICTIVE'
    END AS permissive_status,
    (
      SELECT array_agg(r.rolname::text)
      FROM unnest(p.polroles) AS r(oid)
      JOIN pg_roles r ON r.oid = p.polroles[1]
    ) AS roles_raw,
    pg_get_expr(p.polqual, p.polrelid) AS using_expr,
    pg_get_expr(p.polwithcheck, p.polrelid) AS with_check_expr
  FROM pg_policy p
  WHERE p.polrelid = 'public.profiles'::regclass
  ORDER BY p.polname;
`, 'production');

console.log(`Total production policies found: ${policies.length}`);

// Query role names accurately for each policy
const detailedPolicies = runSql(`
  SET statement_timeout = '10s';
  SELECT 
    pol.polname,
    CASE pol.polcmd
      WHEN 'r' THEN 'SELECT'
      WHEN 'a' THEN 'INSERT'
      WHEN 'w' THEN 'UPDATE'
      WHEN 'd' THEN 'DELETE'
      WHEN '*' THEN 'ALL'
    END AS cmd,
    pol.polpermissive,
    COALESCE(
      (SELECT string_agg(r.rolname, ', ') 
       FROM pg_roles r 
       WHERE r.oid = ANY(pol.polroles)),
      'PUBLIC'
    ) AS target_roles,
    pg_get_expr(pol.polqual, pol.polrelid) AS qual,
    pg_get_expr(pol.polwithcheck, pol.polrelid) AS with_check
  FROM pg_policy pol
  WHERE pol.polrelid = 'public.profiles'::regclass
  ORDER BY pol.polname;
`, 'production');

console.log(JSON.stringify(detailedPolicies, null, 2));
