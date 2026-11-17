const { runSql } = require('./db-audit-helper.cjs');

async function main() {
  console.log('--- AUDITING VIEW PROPERTIES ON STAGING ---');
  const viewMeta = await runSql(`
    SELECT 
      c.relname AS view_name,
      pg_get_userbyid(c.relowner) AS view_owner,
      c.reloptions AS options
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relkind = 'v'
      AND c.relname IN ('public_profiles', 'connection_profiles', 'applicant_profiles', 'feed_author_snippets')
    ORDER BY c.relname;
  `, 'staging');

  console.log('View metadata:');
  viewMeta.forEach(v => {
    const isBarrier = Array.isArray(v.options) && v.options.includes('security_barrier=true');
    const isInvoker = Array.isArray(v.options) && v.options.includes('security_invoker=true');
    console.log(` - ${v.view_name}: owner=${v.view_owner}, security_barrier=${isBarrier}, security_invoker=${isInvoker}, options=${JSON.stringify(v.options)}`);
  });
}

main().catch(console.error);
