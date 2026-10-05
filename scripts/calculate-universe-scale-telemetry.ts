// scripts/calculate-universe-scale-telemetry.ts
/**
 * TalentXcel Search Universe Scale & Telemetry Calculator
 *
 * Computes the real-time progress of the search ecosystem against the architectural target:
 * Discovered Search Intents -> Qualified Intents -> Buildable Destinations -> Currently Indexable Corpus
 */

import { readFileSync, existsSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';
import { SearchUniverseTargetRegistry } from '../src/lib/seo/searchUniverse/searchUniverseTargetRegistry';

// Resolve Supabase Credentials
let supabaseUrl = 'https://dthlgsnakhoftinssokm.supabase.co';
let supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc';

const envPath = resolve('.env.local');
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, 'utf-8');
  const urlMatch = envContent.match(/VITE_SUPABASE_URL="([^"]+)"/);
  const keyMatch = envContent.match(/TALENTXCEL_SERVICE_ROLE_KEY="([^"]+)"/);
  if (urlMatch && urlMatch[1]) supabaseUrl = urlMatch[1];
  if (keyMatch && keyMatch[1]) supabaseKey = keyMatch[1];
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function calculateUniverseTelemetry() {
  console.log('================================================================');
  console.log('🌌 TALENTXCEL GLOBAL SEARCH UNIVERSE SCALE & TELEMETRY DASHBOARD');
  console.log('================================================================\n');

  const targets = SearchUniverseTargetRegistry.getAllTargets();
  const aggregateMetrics = SearchUniverseTargetRegistry.getGlobalAggregateMetrics();

  // Fetch current database counts
  let dbEntitiesCount = 0;
  let dbIntentsCount = 0;
  let dbDestinationsCount = 0;
  let dbLocationsCount = 0;

  try {
    const { count: entCount } = await supabase.from('seo_entities').select('*', { count: 'exact', head: true });
    if (entCount) dbEntitiesCount = entCount;

    const { count: intCount } = await supabase.from('seo_intents').select('*', { count: 'exact', head: true });
    if (intCount) dbIntentsCount = intCount;

    const { count: destCount } = await supabase.from('seo_destinations').select('*', { count: 'exact', head: true });
    if (destCount) dbDestinationsCount = destCount;

    const { count: locCount } = await supabase.from('location_entities').select('*', { count: 'exact', head: true });
    if (locCount) dbLocationsCount = locCount;
  } catch (err: any) {
    console.warn('⚠️ Telemetry note: Supabase live table query notice:', err.message);
  }

  console.log('--- ARCHITECTURAL UNIVERSE TARGET SUMMARY ---');
  console.log(`  • Registered Universes       : ${aggregateMetrics.universeCount} distinct product categories`);
  console.log(`  • Theoretical Search Intents : ${aggregateMetrics.potentialSearchIntentsRange} (Architectural Capacity)`);
  console.log(`  • Total Keyword Target       : ${aggregateMetrics.totalKeywordTarget} candidate queries`);
  console.log(`  • Qualified Intent Target    : ${aggregateMetrics.totalQualifiedIntentTarget} evidence-backed intents`);
  console.log(`  • Potential Destinations     : ${aggregateMetrics.potentialDestinationsRange} buildable landing surfaces`);
  console.log(`  • Destination Target         : ${aggregateMetrics.totalDestinationTarget} total quality destinations`);
  console.log(`  • Indexable Cohort Target    : ${aggregateMetrics.totalIndexableTarget} approved by quality governor`);

  console.log('\n--- LIVE DATABASE TELEMETRY ---');
  console.log(`  • Current Location Entities  : ${dbLocationsCount.toLocaleString()}`);
  console.log(`  • Current SEO Entities       : ${dbEntitiesCount.toLocaleString()} (Roles, Skills, Colleges, Companies)`);
  console.log(`  • Current Verified Intents   : ${dbIntentsCount.toLocaleString()} evaluated opportunities`);
  console.log(`  • Current Destinations       : ${dbDestinationsCount.toLocaleString()} realized quality destinations`);

  console.log('\n--- CATEGORY-BY-CATEGORY TARGET BREAKDOWN ---');
  console.log('| Category | Keyword Target | Qualified Intents | Destination Target | Indexable Target | Priority |');
  console.log('| :--- | :--- | :--- | :--- | :--- | :--- |');

  targets.forEach(t => {
    const pIcon = t.priority === 'CRITICAL_MASSIVE' ? '🔴 Massive' : '🟠 High';
    console.log(
      `| ${t.name.padEnd(30)} | ${(t.keywordTarget / 1000000).toFixed(1)}M`.padEnd(16) +
      `| ${(t.qualifiedIntentTarget / 1000000).toFixed(1)}M`.padEnd(19) +
      `| ${(t.destinationTarget / 1000000).toFixed(2)}M`.padEnd(20) +
      `| ${(t.indexableTarget / 1000000).toFixed(2)}M`.padEnd(18) +
      `| ${pIcon} |`
    );
  });

  const snapshot = {
    timestamp: new Date().toISOString(),
    metrics: aggregateMetrics,
    liveDatabase: {
      locationEntities: dbLocationsCount,
      seoEntities: dbEntitiesCount,
      seoIntents: dbIntentsCount,
      seoDestinations: dbDestinationsCount,
    },
    targets: targets.map(t => ({
      universeId: t.universeId,
      name: t.name,
      keywordTarget: t.keywordTarget,
      qualifiedIntentTarget: t.qualifiedIntentTarget,
      destinationTarget: t.destinationTarget,
      indexableTarget: t.indexableTarget,
      priority: t.priority,
    })),
  };

  writeFileSync(resolve('universe_scale_telemetry.json'), JSON.stringify(snapshot, null, 2));
  console.log('\n✓ Saved snapshot to universe_scale_telemetry.json');
  console.log('================================================================\n');
}

calculateUniverseTelemetry().catch(err => {
  console.error('Calculation failed:', err);
  process.exit(1);
});
