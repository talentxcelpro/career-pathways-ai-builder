const { runSql } = require('./db-audit-helper.cjs');

async function main() {
  const grantRes = await runSql(`
    GRANT INSERT (
      id, full_name, username, title, headline, about, location, email, phone, website,
      profile_picture_url, profile_photo_url, cover_image_url, skills, experience_years,
      industry, current_company, linkedin_url, github_url, portfolio_url, resume_url,
      looking_for_job, open_to_remote, preferred_salary_min, preferred_salary_max, preferred_locations
    ) ON TABLE public.profiles TO authenticated;
  `, 'staging');
  console.log('Grant result:', grantRes);

  const privSummary = await runSql(`
    SELECT grantee, privilege_type, count(*)::int
    FROM information_schema.column_privileges
    WHERE table_name = 'profiles' AND grantee = 'authenticated'
    GROUP BY grantee, privilege_type;
  `, 'staging');
  console.log('Privileges summary:', privSummary);
}

main().catch(console.error);
