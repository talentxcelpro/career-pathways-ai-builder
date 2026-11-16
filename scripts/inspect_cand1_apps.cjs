const { runSql } = require('./db-audit-helper.cjs');

const apps = runSql(`
  SELECT ja.id, ja.job_id, ja.user_id, ja.resume_url, j.company_id, j.posted_by
  FROM public.job_applications ja
  LEFT JOIN public.jobs j ON ja.job_id = j.id
  WHERE ja.user_id = '0b28a473-bcbb-4c49-b291-f9ea0daf4add';
`, 'staging');
console.log('Candidate 1 applications:', apps);
