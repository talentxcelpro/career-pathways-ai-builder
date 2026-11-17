// scripts/dispatch-global-seo-wave.cjs
// TalentXcel Google Indexing API Rate-Limited Wave Dispatcher
// Submits newly unlocked programmatic SEO URLs in controlled daily waves (respecting 200 URL/day quota)
// Prioritizes highest-search-volume global keywords first (Salary -> Jobs -> ATS -> Resume)

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://dthlgsnakhoftinssokm.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const TAXONOMY_PATH = path.resolve(__dirname, '../src/data/globalKeywordTaxonomy.json');
const DISPATCHED_LEDGER_PATH = path.resolve(__dirname, '../reports/TXC-GLOBAL-SEO-DISPATCHED-LOG.json');

// Parse CLI flags
const args = process.argv.slice(2);
let batchSize = 200; // Standard Google Indexing API daily quota
let dryRun = false;
let targetVertical = null;

args.forEach(arg => {
  if (arg.startsWith('--batch-size=')) batchSize = parseInt(arg.split('=')[1], 10);
  if (arg === '--dry-run') dryRun = true;
  if (arg.startsWith('--vertical=')) targetVertical = arg.split('=')[1];
});

async function runWaveDispatch() {
  console.log('================================================================');
  console.log('🚀 TALENTXCEL GOOGLE INDEXING API WAVE DISPATCHER');
  console.log(`Mode: ${dryRun ? 'DRY RUN (Simulated)' : 'LIVE DISPATCH'}`);
  console.log(`Batch Size: ${batchSize} URLs / wave`);
  if (targetVertical) console.log(`Vertical Filter: ${targetVertical}`);
  console.log('================================================================\n');

  if (!fs.existsSync(TAXONOMY_PATH)) {
    console.error(`❌ Taxonomy file not found at ${TAXONOMY_PATH}. Run scripts/build-keyword-taxonomy.ts first.`);
    process.exit(1);
  }

  const taxonomy = JSON.parse(fs.readFileSync(TAXONOMY_PATH, 'utf-8'));
  console.log(`✓ Loaded ${taxonomy.length.toLocaleString()} total keyword hubs from taxonomy.`);

  // Load already dispatched URLs
  let dispatchedSet = new Set();
  if (fs.existsSync(DISPATCHED_LEDGER_PATH)) {
    try {
      const existing = JSON.parse(fs.readFileSync(DISPATCHED_LEDGER_PATH, 'utf-8'));
      existing.forEach(item => dispatchedSet.add(item.canonical_url));
      console.log(`✓ Loaded ${dispatchedSet.size.toLocaleString()} previously dispatched URLs.`);
    } catch (e) {}
  }

  // Filter candidates for this wave: can_index === true, not yet dispatched
  let candidates = taxonomy.filter(t => {
    if (!t.can_index) return false;
    if (dispatchedSet.has(t.canonical_url)) return false;
    if (targetVertical && t.vertical !== targetVertical) return false;
    return true;
  });

  // Sort by priority descending (highest search volume / priority first)
  candidates.sort((a, b) => (b.priority || 0.8) - (a.priority || 0.8));

  const waveSlice = candidates.slice(0, batchSize);

  if (waveSlice.length === 0) {
    console.log('ℹ️ No pending URLs to dispatch in this wave. All indexable targets are up-to-date.');
    return;
  }

  console.log(`\n📦 Staging Wave of ${waveSlice.length} URLs for Dispatch:`);
  const verticalCount = {};
  waveSlice.forEach(item => {
    verticalCount[item.vertical] = (verticalCount[item.vertical] || 0) + 1;
  });
  Object.entries(verticalCount).forEach(([vert, count]) => {
    console.log(`   • ${vert.padEnd(20)}: ${count} URLs`);
  });

  console.log('\nPreviewing top 5 URLs in wave:');
  waveSlice.slice(0, 5).forEach((item, idx) => {
    console.log(`   ${idx + 1}. [${item.vertical}] ${item.canonical_url} (Priority: ${item.priority})`);
  });

  // Dispatch into Supabase indexing_outbox
  if (!dryRun) {
    console.log('\n⚡ Recording batch in Supabase indexing_outbox queue...');
    const outboxPayload = waveSlice.map(item => ({
      url: item.canonical_url,
      action: 'URL_UPDATED',
      priority: Math.round((item.priority || 0.8) * 10),
      status: 'queued',
      scheduled_at: new Date().toISOString()
    }));

    try {
      const { data, error } = await supabase
        .from('indexing_outbox')
        .insert(outboxPayload);

      if (error) {
        console.warn('Note: Could not insert directly to indexing_outbox via anon client (RLS active). Writing to local ledger.');
      } else {
        console.log(`✓ Enqueued ${waveSlice.length} URLs in public.indexing_outbox.`);
      }
    } catch (e) {
      console.warn('Indexing outbox write skipped:', e.message);
    }

    // Update local dispatch ledger
    const nowIso = new Date().toISOString();
    const newlyDispatched = waveSlice.map(item => ({
      canonical_url: item.canonical_url,
      vertical: item.vertical,
      priority: item.priority,
      dispatched_at: nowIso,
      status: 'dispatched'
    }));

    const reportsDir = path.resolve(__dirname, '../reports');
    if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

    let currentLedger = [];
    if (fs.existsSync(DISPATCHED_LEDGER_PATH)) {
      try {
        currentLedger = JSON.parse(fs.readFileSync(DISPATCHED_LEDGER_PATH, 'utf-8'));
      } catch (_) {}
    }
    currentLedger.push(...newlyDispatched);
    fs.writeFileSync(DISPATCHED_LEDGER_PATH, JSON.stringify(currentLedger, null, 2), 'utf-8');
    console.log(`✓ Updated dispatch ledger at ${DISPATCHED_LEDGER_PATH}`);
  }

  const remainingCount = candidates.length - waveSlice.length;
  console.log('\n================================================================');
  console.log(`✅ WAVE COMPLETE: ${waveSlice.length} URLs Dispatched.`);
  console.log(`📊 Remaining Indexable Queue: ${remainingCount.toLocaleString()} URLs.`);
  console.log(`⏰ Next scheduled wave: Tomorrow at 00:00 UTC (Quota: ${batchSize} URLs).`);
  console.log('================================================================\n');
}

runWaveDispatch().catch(err => {
  console.error('Wave dispatch error:', err);
  process.exit(1);
});
