const { runSql } = require('./db-audit-helper.cjs');

async function main() {
  console.log('=== POLICIES ON PRODUCTION ===');
  const policies = runSql(`
    SELECT tablename, policyname, permissive, roles, cmd, qual, with_check 
    FROM pg_policies 
    WHERE tablename IN ('posts', 'profiles', 'groups', 'group_memberships', 'group_posts', 'post_likes')
    ORDER BY tablename, cmd, policyname;
  `, 'production');
  console.log(JSON.stringify(policies, null, 2));

  console.log('\n=== REALTIME TABLES ON PRODUCTION ===');
  const realtime = runSql(`
    SELECT schemaname, tablename 
    FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime'
    ORDER BY tablename;
  `, 'production');
  console.log(JSON.stringify(realtime, null, 2));

  console.log('\n=== COLUMNS ON POSTS (PRODUCTION) ===');
  const postCols = runSql(`
    SELECT column_name, data_type, is_nullable, column_default 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'posts'
    ORDER BY ordinal_position;
  `, 'production');
  console.log(JSON.stringify(postCols, null, 2));

  console.log('\n=== GET_NETWORK_FEED_V2 IN PRODUCTION ===');
  const funcDef = runSql(`
    SELECT pg_get_functiondef(oid) as def 
    FROM pg_proc 
    WHERE proname = 'get_network_feed_v2';
  `, 'production');
  if (funcDef && funcDef.length > 0 && funcDef[0].def) {
    console.log('Function length:', funcDef[0].def.length);
    console.log(funcDef[0].def.slice(0, 500));
  } else {
    console.log('get_network_feed_v2 not found on production!');
  }
}

main().catch(console.error);
