const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.TX_SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://dthlgsnakhoftinssokm.supabase.co';
// Requires TALENTXCEL_SERVICE_ROLE_KEY in .env.local (never commit the key)
const serviceRoleKey = process.env.TALENTXCEL_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.error('ERROR: TALENTXCEL_SERVICE_ROLE_KEY env var is not set.');
  console.error('Run: set TALENTXCEL_SERVICE_ROLE_KEY=<key> && node scripts/full_growth_os_cohort_audit.cjs');
  process.exit(1);
}

const adminClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false }
});

const OCT_START = new Date('2026-09-30T18:30:00.000Z'); // 2026-10-01 00:00:00 IST

async function runCohortAudit() {
  console.log("=================================================================");
  console.log("TALENTXCEL GROWTH OS: PHASE 4 LIVE COHORT AUDIT (OCTOBER 2026)");
  console.log("=================================================================\n");

  // 1. ALL TABLES INVENTORY
  const tables = [
    'profiles', 'resumes', 'career_passports', 'jobs', 'job_applications',
    'requirements', 'shortlists', 'companies', 'user_behavior_events',
    'posts', 'connections', 'courses', 'colleges', 'reels',
    'subscriptions', 'payments', 'transactions', 'orders'
  ];

  console.log("--- 1. DATABASE ENTITY TOTALS & OCTOBER BREAKDOWN ---");
  const tableData = {};
  for (const t of tables) {
    const { data, count, error } = await adminClient.from(t).select('*', { count: 'exact' });
    if (error) {
      tableData[t] = { exists: false, error: error.message };
      console.log(`[TABLE] ${t.padEnd(22)}: ERROR / NOT FOUND (${error.message})`);
    } else {
      const rows = data || [];
      const octRows = rows.filter(r => {
        const d = r.created_at || r.applied_at || r.inserted_at;
        return d && new Date(d) >= OCT_START;
      });
      const histRows = rows.filter(r => {
        const d = r.created_at || r.applied_at || r.inserted_at;
        return !d || new Date(d) < OCT_START;
      });
      tableData[t] = { exists: true, total: count || rows.length, oct: octRows.length, hist: histRows.length, sample: rows.slice(0, 3) };
      console.log(`[TABLE] ${t.padEnd(22)}: Total = ${(count || rows.length).toString().padEnd(6)} | Historical = ${histRows.length.toString().padEnd(6)} | October 2026 = ${octRows.length}`);
    }
  }

  // 2. USER BEHAVIOR EVENTS DEEP DIVE
  console.log("\n--- 2. CANONICAL ANALYTICS: user_behavior_events DEEP DIVE ---");
  const { data: events } = await adminClient.from('user_behavior_events').select('*').order('created_at', { ascending: true });
  console.log(`Total Events Recorded in user_behavior_events: ${events?.length || 0}`);
  
  const eventTypes = {};
  const octEventTypes = {};
  const histEventTypes = {};
  
  (events || []).forEach(e => {
    const isOct = new Date(e.created_at) >= OCT_START;
    eventTypes[e.event_type] = (eventTypes[e.event_type] || 0) + 1;
    if (isOct) {
      octEventTypes[e.event_type] = (octEventTypes[e.event_type] || 0) + 1;
    } else {
      histEventTypes[e.event_type] = (histEventTypes[e.event_type] || 0) + 1;
    }
  });

  console.log("All Event Types Breakdown:", eventTypes);
  console.log("October 2026 Event Types:", octEventTypes);
  console.log("Historical Event Types (< Oct 1):", histEventTypes);

  // 3. CANDIDATE COHORTS & ACTIVATION
  console.log("\n--- 3. CANDIDATE & PROFILE AUDIT ---");
  const { data: allProfiles } = await adminClient.from('profiles').select('*');
  const octProfiles = (allProfiles || []).filter(p => new Date(p.created_at) >= OCT_START);
  const histProfiles = (allProfiles || []).filter(p => new Date(p.created_at) < OCT_START);

  console.log(`Total Profiles: ${allProfiles?.length}`);
  console.log(`Historical Profiles (June 25, 2025 - Sep 30, 2026): ${histProfiles.length}`);
  console.log(`October 2026 Profiles (Oct 1, 2026 onward): ${octProfiles.length}`);

  const octRoles = {};
  octProfiles.forEach(p => {
    const role = p.user_role || 'unassigned';
    octRoles[role] = (octRoles[role] || 0) + 1;
  });
  console.log("October 2026 Profiles by Role:", octRoles);

  // Check Activation
  // Candidate activation: Authenticated user + persistent professional context (resumes or passport) + meaningful SI job match viewed
  const { data: allResumes } = await adminClient.from('resumes').select('*');
  const { data: allPassports } = await adminClient.from('career_passports').select('*');
  const { data: allApps } = await adminClient.from('job_applications').select('*');

  const usersWithResumes = new Set((allResumes || []).map(r => r.user_id));
  const usersWithPassports = new Set((allPassports || []).map(p => p.user_id));
  const usersWithApps = new Set((allApps || []).map(a => a.user_id));

  const octCandidatesWithContext = octProfiles.filter(p => usersWithResumes.has(p.id) || usersWithPassports.has(p.id));
  const octCandidatesWithApps = octProfiles.filter(p => usersWithApps.has(p.id));

  console.log(`October Profiles with Saved Resume/Context: ${octCandidatesWithContext.length}`);
  console.log(`October Profiles with Submitted Application: ${octCandidatesWithApps.length}`);

  // 4. EMPLOYER AUDIT
  console.log("\n--- 4. EMPLOYER REQUIREMENTS & SHORTLISTS AUDIT ---");
  const { data: allReqs } = await adminClient.from('requirements').select('*');
  const { data: allShortlists } = await adminClient.from('shortlists').select('*');
  console.log(`Total Requirements: ${allReqs?.length || 0}`);
  console.log(`Total Shortlists: ${allShortlists?.length || 0}`);

  // 5. DATA QUALITY FINDINGS
  console.log("\n--- 5. DATA QUALITY & INTEGRITY AUDIT ---");
  // Check for orphan events
  const userIds = new Set((allProfiles || []).map(p => p.id));
  const eventsWithMissingUser = (events || []).filter(e => !e.user_id || !userIds.has(e.user_id));
  console.log(`Events with unlinked user_id: ${eventsWithMissingUser.length}`);

  // Check duplicate applications (same user_id and job_id)
  const appMap = new Map();
  let duplicateApps = 0;
  (allApps || []).forEach(a => {
    const key = `${a.user_id}_${a.job_id}`;
    if (appMap.has(key)) duplicateApps++;
    appMap.set(key, true);
  });
  console.log(`Duplicate Job Applications (same user & job): ${duplicateApps}`);

  // Check duplicate shortlists (same employer, requirement, candidate)
  const slMap = new Map();
  let duplicateShortlists = 0;
  (allShortlists || []).forEach(s => {
    const key = `${s.employer_id}_${s.requirement_id}_${s.candidate_id}`;
    if (slMap.has(key)) duplicateShortlists++;
    slMap.set(key, true);
  });
  console.log(`Duplicate Shortlists: ${duplicateShortlists}`);

  // Check revenue tables status
  console.log("\n--- 6. REVENUE / MONETIZATION AUDIT ---");
  const { data: subData } = await adminClient.from('subscriptions').select('*');
  console.log(`Subscriptions rows: ${subData?.length || 0}`);

  console.log("\nAUDIT COMPLETE.");
}

runCohortAudit().catch(console.error);
