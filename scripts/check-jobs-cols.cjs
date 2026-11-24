const { runSql } = require('./db-audit-helper.cjs');

async function checkCols() {
  const jobCols = await runSql("SELECT column_name FROM information_schema.columns WHERE table_name = 'jobs';");
  console.log('Jobs columns:', jobCols.map(c => c.column_name).sort());
}

checkCols();
