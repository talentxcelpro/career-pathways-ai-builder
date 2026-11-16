const { runSql } = require('./db-audit-helper.cjs');

async function main() {
  const constraints = await runSql(`
    SELECT conname, contype, pg_get_constraintdef(oid) 
    FROM pg_constraint 
    WHERE conrelid = 'public.job_applications'::regclass;
  `, 'staging');
  console.log('job_applications constraints:');
  console.log(constraints);

  const app = await runSql(`
    SELECT id, job_id, company_id, resume_url, status
    FROM public.job_applications ja
    JOIN public.jobs j ON ja.job_id = j.id
    WHERE ja.id = 'a0000000-0000-0000-0000-000000000001';
  `, 'staging');
  console.log('application a0000000-0000-0000-0000-000000000001:');
  console.log(app);
}

main().catch(console.error);
