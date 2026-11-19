const { runSql } = require('./db-audit-helper.cjs');

async function main() {
  const apps = await runSql(`
    SELECT ja.id, ja.job_id, ja.user_id, ja.resume_url, ja.status, j.company_id
    FROM public.job_applications ja
    LEFT JOIN public.jobs j ON ja.job_id = j.id
    WHERE ja.user_id = '0b28a473-bcbb-4c49-b291-f9ea0daf4add';
  `, 'staging');
  console.log('Candidate A applications:', apps);

  const team = await runSql(`
    SELECT * FROM public.company_team_members 
    WHERE user_id = 'd5336939-770b-442b-88d0-a6edd6850657';
  `, 'staging');
  console.log('Recruiter team memberships:', team);
}

main().catch(console.error);
