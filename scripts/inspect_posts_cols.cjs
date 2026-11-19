const { runSql } = require('./db-audit-helper.cjs');

async function testCols() {
  const cols = await runSql(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'posts'
    ORDER BY ordinal_position;
  `, 'staging');
  console.log(JSON.stringify(cols, null, 2));

  const viewDef = await runSql(`
    SELECT pg_get_viewdef('public.feed_author_snippets'::regclass, true);
  `, 'staging');
  console.log(viewDef[0]?.pg_get_viewdef);
}

testCols();
