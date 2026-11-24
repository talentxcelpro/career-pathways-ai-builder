const { runSql } = require('./db-audit-helper.cjs');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('=== STARTING FORENSIC GROWTH ANALYSIS (TALENTXCEL.IN) ===\n');

  // 1. Total auth users & confirmation breakdown
  console.log('1. User totals & confirmation:');
  const userTotals = runSql(`
    SELECT 
      COUNT(*) AS total_users,
      COUNT(CASE WHEN email_confirmed_at IS NOT NULL THEN 1 END) AS email_confirmed_users,
      COUNT(CASE WHEN email_confirmed_at IS NULL THEN 1 END) AS unconfirmed_users,
      COUNT(CASE WHEN last_sign_in_at IS NOT NULL THEN 1 END) AS users_with_login,
      COUNT(CASE WHEN last_sign_in_at IS NULL THEN 1 END) AS users_never_logged_in
    FROM auth.users;
  `, 'production');
  console.log(JSON.stringify(userTotals, null, 2));

  // 2. Registrations by week for the last 8 weeks
  console.log('\n2. Registrations by calendar week (Monday-Sunday):');
  const weeklyRegistrations = runSql(`
    SELECT 
      date_trunc('week', created_at)::date AS week_start,
      (date_trunc('week', created_at)::date + interval '6 days')::date AS week_end,
      COUNT(*) AS registration_count,
      COUNT(CASE WHEN email_confirmed_at IS NOT NULL THEN 1 END) AS confirmed_count,
      ROUND(COUNT(*)::numeric / 7.0, 1) AS avg_per_day
    FROM auth.users
    WHERE created_at >= '2026-09-28'::timestamptz
    GROUP BY 1, 2
    ORDER BY 1 ASC;
  `, 'production');
  console.log(JSON.stringify(weeklyRegistrations, null, 2));

  // 3. Registrations by day for the last 30 days
  console.log('\n3. Daily registrations for the last 30 days (up to 2026-11-24):');
  const dailyRegistrations = runSql(`
    SELECT 
      created_at::date AS registration_date,
      to_char(created_at, 'Dy') AS day_of_week,
      COUNT(*) AS total_registrations,
      COUNT(CASE WHEN email_confirmed_at IS NOT NULL THEN 1 END) AS confirmed,
      COUNT(CASE WHEN raw_app_meta_data->>'provider' = 'google' THEN 1 END) AS google_oauth,
      COUNT(CASE WHEN raw_app_meta_data->>'provider' = 'email' OR raw_app_meta_data->>'provider' IS NULL THEN 1 END) AS email_signup
    FROM auth.users
    WHERE created_at >= '2026-10-25'::timestamptz
    GROUP BY 1, 2
    ORDER BY 1 ASC;
  `, 'production');
  console.log(JSON.stringify(dailyRegistrations, null, 2));

  // 4. Hourly distribution of registrations (past 14 days)
  console.log('\n4. Hourly distribution of registrations (UTC and approximate IST):');
  const hourlyRegistrations = runSql(`
    SELECT 
      EXTRACT(HOUR FROM (created_at AT TIME ZONE 'Asia/Kolkata')) AS ist_hour,
      COUNT(*) AS total_signups
    FROM auth.users
    WHERE created_at >= '2026-11-10'::timestamptz
    GROUP BY 1
    ORDER BY 1 ASC;
  `, 'production');
  console.log(JSON.stringify(hourlyRegistrations, null, 2));

  // 5. Registration sources / providers
  console.log('\n5. Auth providers & signup metadata:');
  const authProviders = runSql(`
    SELECT 
      COALESCE(raw_app_meta_data->>'provider', 'unknown') AS auth_provider,
      COUNT(*) AS count
    FROM auth.users
    GROUP BY 1
    ORDER BY 2 DESC;
  `, 'production');
  console.log(JSON.stringify(authProviders, null, 2));

  // 6. Profiles sync check (orphans, profile completion, onboarding)
  console.log('\n6. Profiles sync, onboarding, and activation:');
  const profileStats = runSql(`
    SELECT 
      COUNT(*) AS total_profiles,
      COUNT(CASE WHEN onboarding_completed = true THEN 1 END) AS onboarding_completed_count,
      COUNT(CASE WHEN profile_completed = true THEN 1 END) AS profile_completed_count,
      COUNT(CASE WHEN is_profile_public = true THEN 1 END) AS public_profiles_count,
      COUNT(CASE WHEN first_login = false THEN 1 END) AS returning_logins_count,
      COUNT(CASE WHEN headline IS NOT NULL AND headline != '' THEN 1 END) AS with_headline,
      COUNT(CASE WHEN resume_url IS NOT NULL AND resume_url != '' THEN 1 END) AS with_resume_url
    FROM public.profiles;
  `, 'production');
  console.log(JSON.stringify(profileStats, null, 2));

  // 7. Check for orphans between auth.users and public.profiles
  console.log('\n7. Orphan users check:');
  const orphanStats = runSql(`
    SELECT 
      (SELECT COUNT(*) FROM auth.users u WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id)) AS auth_without_profile,
      (SELECT COUNT(*) FROM public.profiles p WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = p.id)) AS profile_without_auth;
  `, 'production');
  console.log(JSON.stringify(orphanStats, null, 2));

  // 8. Core feature activation counts in database
  console.log('\n8. Core platform activation events across tables:');
  const activationCounts = runSql(`
    SELECT 
      (SELECT COUNT(*) FROM public.career_passports) AS total_career_passports,
      (SELECT COUNT(DISTINCT user_id) FROM public.career_passports) AS users_with_passport,
      (SELECT COUNT(*) FROM public.job_applications) AS total_job_applications,
      (SELECT COUNT(DISTINCT applicant_id) FROM public.job_applications) AS users_applied_to_jobs,
      (SELECT COUNT(*) FROM public.connections WHERE status = 'accepted') AS accepted_connections,
      (SELECT COUNT(*) FROM public.connections WHERE status = 'pending') AS pending_connections,
      (SELECT COUNT(*) FROM public.ats_public_scans) AS ats_scans_count,
      (SELECT COUNT(*) FROM public.user_referrals) AS user_referrals_count,
      (SELECT COUNT(DISTINCT user_id) FROM public.user_presence WHERE last_seen >= NOW() - INTERVAL '7 days') AS active_last_7_days;
  `, 'production');
  console.log(JSON.stringify(activationCounts, null, 2));

  // 9. Recent signups sample (last 10 signups - anonymized IDs, metadata, created_at)
  console.log('\n9. Last 10 registrations audit:');
  const recentSignups = runSql(`
    SELECT 
      id,
      substr(email, 1, 3) || '***@' || split_part(email, '@', 2) AS anonymized_email,
      created_at,
      email_confirmed_at IS NOT NULL AS confirmed,
      last_sign_in_at,
      raw_app_meta_data->>'provider' AS provider,
      raw_user_meta_data->>'full_name' AS has_name
    FROM auth.users
    ORDER BY created_at DESC
    LIMIT 10;
  `, 'production');
  console.log(JSON.stringify(recentSignups, null, 2));

  const resultPayload = {
    userTotals,
    weeklyRegistrations,
    dailyRegistrations,
    hourlyRegistrations,
    authProviders,
    profileStats,
    orphanStats,
    activationCounts,
    recentSignups
  };

  fs.writeFileSync(path.join(__dirname, '..', 'scratch', 'forensic_growth_data.json'), JSON.stringify(resultPayload, null, 2));
  console.log('\nForensic audit data saved to scratch/forensic_growth_data.json');
}

main().catch(console.error);
