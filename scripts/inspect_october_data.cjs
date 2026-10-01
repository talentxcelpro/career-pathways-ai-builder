const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://dthlgsnakhoftinssokm.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
  const octStart = '2026-09-30T18:30:00.000Z'; // 2026-10-01 00:00:00 IST
  
  console.log("=== OCTOBER 2026 VS HISTORICAL PRODUCTION AUDIT ===");
  console.log("Cohort Baseline Start:", octStart, "(2026-10-01 00:00:00 IST)\n");

  // 1. user_behavior_events
  const { data: ubeAll, error: ubeErr } = await supabase.from('user_behavior_events').select('*');
  console.log('1. user_behavior_events:');
  if (ubeErr) {
    console.log('   Error:', ubeErr.message);
  } else {
    console.log('   Total Rows:', ubeAll.length);
    const octEvents = ubeAll.filter(e => new Date(e.created_at) >= new Date(octStart));
    const histEvents = ubeAll.filter(e => new Date(e.created_at) < new Date(octStart));
    console.log('   Historical Events (< Oct 1):', histEvents.length);
    console.log('   October 2026 Events (>= Oct 1):', octEvents.length);
    const eventTypes = [...new Set(ubeAll.map(e => e.event_type))];
    console.log('   Event Types in DB:', eventTypes);
    console.log('   Sample October Event:', octEvents[0] || 'None');
  }

  // 2. profiles
  const { data: profs, error: profsErr } = await supabase.from('profiles').select('id, created_at, user_role, onboarding_completed, profile_completed, login_count');
  console.log('\n2. profiles:');
  if (profsErr) {
    console.log('   Error:', profsErr.message);
  } else {
    const octProfs = profs.filter(p => new Date(p.created_at) >= new Date(octStart));
    const histProfs = profs.filter(p => new Date(p.created_at) < new Date(octStart));
    console.log('   Total Profiles:', profs.length);
    console.log('   Historical Profiles (< Oct 1):', histProfs.length);
    console.log('   October 2026 Profiles (>= Oct 1):', octProfs.length);
    console.log('   October Roles:', octProfs.map(p => p.user_role || 'unset'));
  }

  // 3. resumes
  const { data: resumes, error: resErr } = await supabase.from('resumes').select('id, user_id, created_at, ats_score');
  console.log('\n3. resumes:');
  if (resErr) {
    console.log('   Error:', resErr.message);
  } else {
    const octRes = resumes.filter(r => new Date(r.created_at) >= new Date(octStart));
    const histRes = resumes.filter(r => new Date(r.created_at) < new Date(octStart));
    console.log('   Total Resumes:', resumes.length);
    console.log('   Historical Resumes (< Oct 1):', histRes.length);
    console.log('   October 2026 Resumes (>= Oct 1):', octRes.length);
  }

  // 4. career_passports
  const { data: passports, error: cpErr } = await supabase.from('career_passports').select('id, user_id, created_at, talent_score');
  console.log('\n4. career_passports:');
  if (cpErr) {
    console.log('   Error:', cpErr.message);
  } else {
    console.log('   Total Passports:', passports.length);
  }

  // 5. job_applications
  const { data: apps, error: appErr } = await supabase.from('job_applications').select('id, user_id, job_id, created_at, applied_at, status');
  console.log('\n5. job_applications:');
  if (appErr) {
    console.log('   Error:', appErr.message);
  } else {
    const octApps = apps.filter(a => new Date(a.created_at || a.applied_at) >= new Date(octStart));
    const histApps = apps.filter(a => new Date(a.created_at || a.applied_at) < new Date(octStart));
    console.log('   Total Applications:', apps.length);
    console.log('   Historical Applications (< Oct 1):', histApps.length);
    console.log('   October 2026 Applications (>= Oct 1):', octApps.length);
  }

  // 6. requirements
  const { data: reqs, error: reqErr } = await supabase.from('requirements').select('id, employer_id, created_at, status');
  console.log('\n6. requirements:');
  if (reqErr) {
    console.log('   Error:', reqErr.message);
  } else {
    console.log('   Total Requirements:', reqs.length);
  }

  // 7. shortlists
  const { data: sls, error: slErr } = await supabase.from('shortlists').select('id, employer_id, candidate_id, created_at, status');
  console.log('\n7. shortlists:');
  if (slErr) {
    console.log('   Error:', slErr.message);
  } else {
    console.log('   Total Shortlists:', sls.length);
  }

  // 8. Revenue tables
  console.log('\n8. Revenue / Monitization Tables Check:');
  const revenueTables = [
    'payments', 'subscriptions', 'transactions', 'orders', 
    'employer_subscriptions', 'invoices', 'payment_history', 'checkout_sessions'
  ];
  for (const t of revenueTables) {
    const { count, error } = await supabase.from(t).select('*', { count: 'exact', head: true });
    if (error) {
      console.log(`   Table '${t}': Not Found / Error (${error.message})`);
    } else {
      console.log(`   Table '${t}': Found, row count = ${count}`);
    }
  }

  // 9. Network & Learning tables
  console.log('\n9. Network, Community & Learning Tables Check:');
  const engagementTables = [
    'posts', 'connections', 'feed_posts', 'communities', 
    'community_members', 'courses', 'learning_paths', 'reels', 'colleges'
  ];
  for (const t of engagementTables) {
    const { count, error } = await supabase.from(t).select('*', { count: 'exact', head: true });
    if (error) {
      console.log(`   Table '${t}': Not Found / Error (${error.message})`);
    } else {
      console.log(`   Table '${t}': Found, row count = ${count}`);
    }
  }
}

inspect().catch(console.error);
