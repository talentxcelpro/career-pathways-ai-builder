const fs = require('fs');
const { runSql } = require('../db-audit-helper.cjs');

async function forensicAudit() {
  console.log('=== PHASE 10 FORENSIC AUDIT OF ACTUAL PRODUCTION IMPLEMENTATION ===');

  // 1. Auth Users Time Series (daily registrations for last 30 days)
  const regTimeSeries = await runSql(`
    SELECT 
      DATE(created_at) as reg_date,
      COUNT(*) as total_signups,
      COUNT(CASE WHEN raw_app_meta_data->>'provider' = 'google' THEN 1 END) as google_signups,
      COUNT(CASE WHEN raw_app_meta_data->>'provider' = 'email' THEN 1 END) as email_signups
    FROM auth.users
    WHERE created_at >= NOW() - INTERVAL '30 days'
    GROUP BY DATE(created_at)
    ORDER BY reg_date DESC;
  `);

  // Total auth users
  const totalAuth = await runSql(`
    SELECT 
      COUNT(*) as total_users,
      COUNT(CASE WHEN email_confirmed_at IS NOT NULL THEN 1 END) as confirmed_users,
      COUNT(CASE WHEN last_sign_in_at IS NOT NULL THEN 1 END) as signed_in_users,
      COUNT(CASE WHEN last_sign_in_at >= NOW() - INTERVAL '7 days' THEN 1 END) as active_7d
    FROM auth.users;
  `);

  // 2. Profile Quality & Activation Depth
  const profileActivation = await runSql(`
    SELECT 
      COUNT(*) as total_profiles,
      COUNT(CASE WHEN full_name IS NOT NULL AND length(trim(full_name)) > 0 THEN 1 END) as has_name,
      COUNT(CASE WHEN headline IS NOT NULL AND length(trim(headline)) > 0 THEN 1 END) as has_headline,
      COUNT(CASE WHEN location IS NOT NULL AND length(trim(location)) > 0 THEN 1 END) as has_location,
      COUNT(CASE WHEN skills IS NOT NULL AND array_length(skills, 1) > 0 THEN 1 END) as has_skills,
      COUNT(CASE WHEN about IS NOT NULL AND length(trim(about)) > 30 THEN 1 END) as has_about,
      COUNT(CASE WHEN current_company IS NOT NULL AND length(trim(current_company)) > 0 THEN 1 END) as has_company,
      COUNT(CASE WHEN is_profile_public = true THEN 1 END) as is_public,
      COUNT(CASE WHEN (headline IS NOT NULL AND array_length(skills, 1) > 0 AND location IS NOT NULL) THEN 1 END) as fully_activated
    FROM public.profiles;
  `);

  // 3. Network Connections & Real Network Effects
  const connectionsMetrics = await runSql(`
    SELECT 
      COUNT(*) as total_connections,
      COUNT(CASE WHEN status = 'accepted' THEN 1 END) as accepted_connections,
      COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_connections,
      COUNT(DISTINCT requester_id) as unique_requesters,
      COUNT(DISTINCT recipient_id) as unique_recipients
    FROM public.connections;
  `);

  // Top connected users
  const topConnected = await runSql(`
    SELECT user_id, COUNT(*) as connection_count FROM (
      SELECT requester_id as user_id FROM public.connections WHERE status = 'accepted'
      UNION ALL
      SELECT recipient_id as user_id FROM public.connections WHERE status = 'accepted'
    ) sub
    GROUP BY user_id
    ORDER BY connection_count DESC
    LIMIT 10;
  `);

  // 4. Actual Distribution Ledger & Publications
  const distributionLedger = await runSql(`
    SELECT 
      channel,
      content_type,
      status,
      COUNT(*) as count,
      SUM(clicks_count) as total_clicks,
      SUM(conversions_count) as total_conversions
    FROM public.growth_distribution_ledger
    GROUP BY channel, content_type, status;
  `);

  // 5. Actual Referral Attributions
  const referralAttributions = await runSql(`
    SELECT 
      channel,
      status,
      COUNT(*) as count
    FROM public.growth_referral_attributions
    GROUP BY channel, status;
  `);

  // 6. Growth Geography & Inventory Gates Status
  const geoGates = await runSql(`
    SELECT 
      indexation_gate,
      COUNT(*) as city_count,
      SUM(active_jobs_count) as total_jobs,
      SUM(consented_professionals_count) as total_pros
    FROM public.growth_geo_cities
    GROUP BY indexation_gate;
  `);

  const inventoryTiers = await runSql(`
    SELECT 
      entity_type,
      readiness_tier,
      COUNT(*) as cluster_count,
      SUM(active_jobs_count) as total_jobs,
      SUM(consented_professionals_count) as total_pros
    FROM public.growth_inventory_readiness
    GROUP BY entity_type, readiness_tier;
  `);

  // 7. GSC Search Performance Baseline (from local GSC dump if available)
  let gscSummary = null;
  if (fs.existsSync('gsc-full-dump.json')) {
    try {
      const gscData = JSON.parse(fs.readFileSync('gsc-full-dump.json', 'utf8'));
      const rows = gscData.rows || gscData || [];
      if (Array.isArray(rows)) {
        let totalClicks = 0;
        let totalImpressions = 0;
        rows.forEach(r => {
          totalClicks += (r.clicks || 0);
          totalImpressions += (r.impressions || 0);
        });
        gscSummary = {
          totalRows: rows.length,
          totalClicks,
          totalImpressions,
          overallCtr: totalImpressions > 0 ? `${((totalClicks / totalImpressions) * 100).toFixed(2)}%` : '0%'
        };
      }
    } catch (e) {
      gscSummary = { error: e.message };
    }
  }

  const report = {
    auditTimestamp: new Date().toISOString(),
    authTotals: totalAuth[0],
    registrationTimeSeries: regTimeSeries,
    profileActivation: profileActivation[0],
    connectionsMetrics: connectionsMetrics[0],
    topConnectedUsers: topConnected,
    distributionLedger,
    referralAttributions,
    geoGates,
    inventoryTiers,
    gscSummary
  };

  fs.writeFileSync('reports/phase10_forensic_validation.json', JSON.stringify(report, null, 2), 'utf8');
  console.log('✅ Phase 10 forensic validation saved to reports/phase10_forensic_validation.json');
}

forensicAudit().catch(console.error);
