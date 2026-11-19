const { runSql } = require('./db-audit-helper.cjs');

async function testJob333() {
  const j = await runSql(`
    SELECT id, company_id, posted_by FROM public.jobs WHERE id = '33333333-3333-3333-3333-333333333333';
  `, 'staging');
  console.log('job 333:', JSON.stringify(j, null, 2));
}

testJob333();
