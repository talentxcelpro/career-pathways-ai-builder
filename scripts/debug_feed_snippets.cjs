const { runSql } = require('./db-audit-helper.cjs');

async function testPosts() {
  const p = await runSql(`
    SELECT id, user_id, status, is_hidden, deleted_at
    FROM public.posts 
    WHERE user_id = '0b28a473-bcbb-4c49-b291-f9ea0daf4add';
  `, 'staging');
  console.log('Posts for userA:', JSON.stringify(p, null, 2));

  const s = await runSql(`
    SELECT * FROM public.feed_author_snippets WHERE id = '0b28a473-bcbb-4c49-b291-f9ea0daf4add';
  `, 'staging');
  console.log('Snippet for userA as postgres:', JSON.stringify(s, null, 2));

  const pols = await runSql(`
    SELECT policyname, cmd, roles, qual 
    FROM pg_policies WHERE tablename = 'posts';
  `, 'staging');
  console.log('Policies on posts:', JSON.stringify(pols, null, 2));
}

testPosts();
