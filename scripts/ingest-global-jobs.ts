/**
 * TalentXcel Global Government Jobs Automation Network — CLI Ingestion Runner
 * Ingests official government and public-sector vacancies across 10+ countries into Supabase.
 */

import { createClient } from '@supabase/supabase-js';
import { APP_CONFIG } from '../src/config/constants';
import { 
  OFFICIAL_GLOBAL_JOB_CATALOG, 
  GlobalJobsIngestionService 
} from '../src/lib/automation/GlobalJobsIngestionService';

const SUPABASE_URL = APP_CONFIG.SUPABASE_URL;
const SUPABASE_KEY = APP_CONFIG.SUPABASE_ANON_KEY;

async function runGlobalJobsIngestion() {
  console.log('================================================================');
  console.log('TalentXcel Global Government Jobs Automation Network');
  console.log('Target: 100+ Countries | 1,000+ Sources | 24-Hour SLA Network');
  console.log('================================================================\n');

  console.log(`Connecting to Supabase at: ${SUPABASE_URL}`);
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  console.log(`Processing ${OFFICIAL_GLOBAL_JOB_CATALOG.length} preconfigured official government jobs...`);

  let insertedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const seed of OFFICIAL_GLOBAL_JOB_CATALOG) {
    try {
      const { dbRecord, isValid } = GlobalJobsIngestionService.transformAndVerify(seed);

      if (!isValid) {
        console.warn(`  [REJECTED] Governor rejected: ${seed.title}`);
        errorCount++;
        continue;
      }

      // Check if job already exists by seo_slug
      const { data: existing, error: selectErr } = await supabase
        .from('jobs')
        .select('id, seo_slug')
        .eq('seo_slug', dbRecord.seo_slug)
        .maybeSingle();

      if (existing) {
        console.log(`  [SKIPPED] Already exists: ${seed.title} (${seed.countryCode})`);
        skippedCount++;
        continue;
      }

      const { data: inserted, error: insertErr } = await supabase
        .from('jobs')
        .insert([dbRecord])
        .select('id, title, company_name');

      if (insertErr) {
        console.error(`  [ERROR] Failed to insert ${seed.title}:`, insertErr.message);
        errorCount++;
      } else {
        console.log(`  [INSERTED] ${seed.countryCode} | ${seed.title} @ ${seed.organization}`);
        insertedCount++;
      }
    } catch (err: any) {
      console.error(`  [EXCEPTION] Error processing ${seed.title}:`, err.message);
      errorCount++;
    }
  }

  console.log('\n================================================================');
  console.log('Ingestion Summary:');
  console.log(`  Total Seed Jobs Processed: ${OFFICIAL_GLOBAL_JOB_CATALOG.length}`);
  console.log(`  Successfully Inserted:    ${insertedCount}`);
  console.log(`  Already Active (Skipped):  ${skippedCount}`);
  console.log(`  Errors / Rejected:        ${errorCount}`);
  console.log('================================================================\n');
}

runGlobalJobsIngestion().catch((err) => {
  console.error('Fatal Ingestion Error:', err);
  process.exit(1);
});
