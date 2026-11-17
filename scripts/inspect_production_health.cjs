const https = require('https');
const { runSql } = require('./db-audit-helper.cjs');

function measureHttpLatency(url) {
  return new Promise((resolve) => {
    const start = Date.now();
    const parsed = new URL(url);
    const req = https.request({
      hostname: parsed.hostname,
      port: 443,
      path: parsed.pathname + parsed.search,
      method: 'GET',
      headers: {
        'User-Agent': 'TalentXcel Health Monitor/1.0',
        'Accept': '*/*'
      }
    }, (res) => {
      let bytes = 0;
      res.on('data', chunk => bytes += chunk.length);
      res.on('end', () => resolve({
        url,
        status: res.statusCode,
        latency_ms: Date.now() - start,
        bytes,
        error: null
      }));
    });
    req.on('error', (err) => resolve({
      url,
      status: 0,
      latency_ms: Date.now() - start,
      bytes: 0,
      error: err.message
    }));
    req.end();
  });
}

async function runProductionHealthInspection() {
  console.log('========================================================================');
  console.log('TALENTXCEL GATE 5 — PRODUCTION HEALTH & TELEMETRY MONITORING');
  console.log('Target: Production Database (dthlgsnakhoftinssokm) & Origin (talentxcel.in)');
  console.log('========================================================================\n');

  // 1. Database Health & Stability Metrics
  console.log('--- 1. Database Transaction & Connection Health ---');
  const dbStats = await runSql(`
    SELECT 
      datname,
      numbackends as active_connections,
      xact_commit as committed_transactions,
      xact_rollback as rolled_back_transactions,
      blks_read,
      blks_hit,
      round(100.0 * blks_hit / NULLIF(blks_hit + blks_read, 0), 2) as cache_hit_ratio_pct,
      conflicts,
      deadlocks
    FROM pg_stat_database
    WHERE datname = current_database();
  `, 'production');
  console.table(dbStats);

  // 2. Active Locks / Queries Check
  console.log('\n--- 2. Active Query Latency & Lock State ---');
  const activeQueries = await runSql(`
    SELECT 
      count(*) as total_active_processes,
      count(*) FILTER (WHERE state = 'active') as active_running_queries,
      count(*) FILTER (WHERE state = 'idle') as idle_connections,
      count(*) FILTER (WHERE state = 'idle in transaction') as idle_in_transaction,
      count(*) FILTER (WHERE wait_event_type = 'Lock') as queries_waiting_on_locks
    FROM pg_stat_activity
    WHERE datname = current_database();
  `, 'production');
  console.table(activeQueries);

  // 3. Table Activity & Mutation Health (profiles, consents, audit)
  console.log('\n--- 3. Core Security Tables Activity & Indexes ---');
  const tableStats = await runSql(`
    SELECT 
      relname as table_name,
      seq_scan,
      seq_tup_read,
      idx_scan,
      idx_tup_fetch,
      n_tup_ins,
      n_tup_upd,
      n_tup_del,
      n_live_tup
    FROM pg_stat_user_tables
    WHERE relname IN (
      'profiles', 
      'candidate_privacy_consents', 
      'candidate_consent_events', 
      'candidate_document_mappings', 
      'candidate_document_mapping_audit',
      'user_roles'
    )
    ORDER BY relname;
  `, 'production');
  console.table(tableStats);

  // 4. Consent Audit Ledger Activity
  console.log('\n--- 4. Candidate Consent Events Audit Ledger ---');
  const auditEvents = await runSql(`
    SELECT 
      event_type,
      consent_source,
      count(*) as event_count,
      min(created_at) as earliest_event,
      max(created_at) as latest_event
    FROM public.candidate_consent_events
    GROUP BY event_type, consent_source;
  `, 'production');
  console.table(auditEvents);

  // 5. Storage Health Check
  console.log('\n--- 5. Storage Bucket & Objects Integrity ---');
  const storageHealth = await runSql(`
    SELECT 
      bucket_id,
      count(*) as total_objects,
      round(sum((metadata->>'size')::bigint) / (1024.0 * 1024.0), 2) as total_size_mb,
      count(*) FILTER (WHERE owner_id IS NOT NULL) as objects_with_owner_id,
      count(*) FILTER (WHERE owner IS NOT NULL) as objects_with_legacy_owner
    FROM storage.objects
    GROUP BY bucket_id;
  `, 'production');
  console.table(storageHealth);

  // 6. Live HTTP Endpoints Latency & Response Codes
  console.log('\n--- 6. Live HTTP Endpoints Latency & Health ---');
  const urlsToTest = [
    'https://talentxcel.in/',
    'https://talentxcel.in/jobs',
    'https://talentxcel.in/resume',
    'https://talentxcel.in/career-paths',
    'https://dthlgsnakhoftinssokm.supabase.co/rest/v1/',
    'https://dthlgsnakhoftinssokm.supabase.co/functions/v1/register-document-mapping'
  ];

  const results = [];
  for (const u of urlsToTest) {
    const res = await measureHttpLatency(u);
    results.push(res);
  }
  console.table(results);
}

runProductionHealthInspection().catch(err => {
  console.error('Health inspection failed:', err);
  process.exit(1);
});
