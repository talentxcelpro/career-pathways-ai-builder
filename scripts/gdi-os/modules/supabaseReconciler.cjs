const { runSql } = require('../../db-audit-helper.cjs');

async function reconcileSupabaseRegistrations() {
  console.log('[Step 9] Reconciling Registrations with Supabase Production Database...');

  // 1. Total and confirmed users
  const userStats = runSql(`
    SELECT 
      COUNT(*) AS total_users,
      COUNT(email_confirmed_at) AS confirmed_users,
      COUNT(CASE WHEN last_sign_in_at IS NOT NULL AND last_sign_in_at != created_at THEN 1 END) AS multi_session_users,
      COUNT(CASE WHEN last_sign_in_at IS NULL OR last_sign_in_at = created_at THEN 1 END) AS single_session_users
    FROM auth.users;
  `);

  // 2. Daily registrations for last 7 days
  const dailyReg = runSql(`
    SELECT 
      DATE(created_at) AS signup_date,
      COUNT(*) AS count
    FROM auth.users
    WHERE created_at >= NOW() - INTERVAL '7 days'
    GROUP BY 1
    ORDER BY signup_date DESC;
  `);

  // 3. Artifact counts
  const artifacts = runSql(`
    SELECT 
      (SELECT COUNT(*) FROM public.job_applications) AS total_job_applications,
      (SELECT COUNT(*) FROM public.resumes) AS total_resumes,
      (SELECT COUNT(*) FROM public.career_passports) AS total_career_passports,
      (SELECT COUNT(*) FROM public.user_referrals) AS total_referrals;
  `);

  console.log(`   ✓ Reconciled: ${userStats[0]?.total_users || 0} total users, ${userStats[0]?.confirmed_users || 0} confirmed.`);
  return {
    userStats: userStats[0] || {},
    dailyRegistrations: dailyReg || [],
    artifacts: artifacts[0] || {}
  };
}

module.exports = { reconcileSupabaseRegistrations };
