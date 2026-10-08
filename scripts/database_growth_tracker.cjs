// scripts/database_growth_tracker.cjs
// Phase 5: Database Growth Tracker & Velocity Sentinel

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://dthlgsnakhoftinssokm.supabase.co';
const SERVICE_KEY = process.env.TALENTXCEL_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY);

const TRACKED_TABLES = [
  'profiles',
  'jobs',
  'posts',
  'job_applications',
  'messages',
  'notifications',
  'resumes',
  'subscribers',
];

// Historical baseline reference counts
const BASELINE_COUNTS = {
  profiles: 580,
  jobs: 325,
  posts: 120,
  job_applications: 45,
  messages: 15,
  notifications: 30,
  resumes: 55,
  subscribers: 1,
};

async function trackDatabaseGrowth() {
  console.log('================================================================');
  console.log('📊 PHASE 5: DATABASE GROWTH & VELOCITY SENTINEL');
  console.log('================================================================\n');

  const timestamp = new Date().toISOString();
  const metrics = {};
  let abnormalSpikeDetected = false;

  for (const table of TRACKED_TABLES) {
    const { count, error } = await supabaseAdmin
      .from(table)
      .select('id', { count: 'exact', head: true });

    if (error) {
      console.error(`  Error counting ${table}:`, error.message);
      metrics[table] = { count: 0, status: 'ERROR', error: error.message };
      continue;
    }

    const baseline = BASELINE_COUNTS[table] || 0;
    const delta = count - baseline;
    // An abnormal spike is defined as > 300% growth in a single interval without known batch ingestion
    const isAbnormal = baseline > 10 && delta > baseline * 3;

    if (isAbnormal) abnormalSpikeDetected = true;

    metrics[table] = {
      count,
      baseline,
      delta,
      status: isAbnormal ? 'SPIKE_WARNING' : 'HEALTHY',
    };

    console.log(`  • ${table.padEnd(20)}: ${String(count).padStart(6)} rows (Baseline: ${String(baseline).padStart(6)}, Delta: ${delta >= 0 ? '+' : ''}${delta}) [${isAbnormal ? '⚠️ SPIKE' : '✓ HEALTHY'}]`);
  }

  const result = {
    timestamp,
    abnormalSpikeDetected,
    metrics,
    governanceRule: 'DO NOT delete records automatically. Growth must be preserved.',
  };

  const outputPath = path.join(__dirname, 'database_growth_metrics.json');
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));

  console.log('\n================================================================');
  console.log(`✅ DATABASE METRICS RECORDED: ${outputPath}`);
  console.log(`Status: ${abnormalSpikeDetected ? '⚠️ ABNORMAL SPIKE DETECTED' : '🟢 NORMAL PRODUCTION VELOCITY'}`);
  console.log('================================================================\n');

  return result;
}

trackDatabaseGrowth().catch(err => {
  console.error('Fatal database growth tracking error:', err);
  process.exit(1);
});
