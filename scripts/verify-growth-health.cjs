const { runSql } = require('./db-audit-helper.cjs');

async function main() {
  console.log('================================================================');
  console.log('TALENTXCEL LIVE PRODUCTION GROWTH HEALTH MONITOR');
  console.log('Target Project: dthlgsnakhoftinssokm (Talentxcel.in)');
  console.log('Timestamp:', new Date().toISOString());
  console.log('================================================================\n');

  // 1. Total auth users & confirmed
  const userStats = runSql(`
    SELECT 
      COUNT(*) AS total_users,
      COUNT(email_confirmed_at) AS confirmed_users,
      COUNT(CASE WHEN last_sign_in_at IS NOT NULL AND last_sign_in_at != created_at THEN 1 END) AS multi_session_users,
      COUNT(CASE WHEN last_sign_in_at IS NULL OR last_sign_in_at = created_at THEN 1 END) AS single_session_users
    FROM auth.users;
  `);
  console.log('--- 1. Auth Users Telemetry ---');
  console.log(userStats);

  // 2. Signups by Provider
  const providerStats = runSql(`
    SELECT 
      COALESCE(raw_app_meta_data->>'provider', 'unknown') AS provider,
      COUNT(*) AS count
    FROM auth.users
    GROUP BY 1
    ORDER BY count DESC;
  `);
  console.log('--- 2. Auth Provider Split ---');
  console.log(providerStats);

  // 3. Applications and Resumes Count
  const appStats = runSql(`
    SELECT 
      (SELECT COUNT(*) FROM public.job_applications) AS total_job_applications,
      (SELECT COUNT(*) FROM public.resumes) AS total_resumes,
      (SELECT COUNT(*) FROM public.career_passports) AS total_career_passports,
      (SELECT COUNT(*) FROM public.user_referrals) AS total_referral_records;
  `);
  console.log('--- 3. Core Conversion Artifacts ---');
  console.log(appStats);

  // 4. Recent Daily Signups (Last 7 Days)
  const recentDays = runSql(`
    SELECT 
      DATE(created_at) AS signup_date,
      COUNT(*) AS count
    FROM auth.users
    WHERE created_at >= NOW() - INTERVAL '7 days'
    GROUP BY 1
    ORDER BY signup_date DESC;
  `);
  console.log('--- 4. Daily Registrations (Last 7 Days) ---');
  console.log(recentDays);
  console.log('================================================================');
}

main().catch(console.error);
