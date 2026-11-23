import { publisherDiscovery } from '../src/services/publisher/PublisherDiscoveryEngine';
import { execSync } from 'child_process';
import fs from 'fs';

const pilotIds = [
  // Batch 1 (5 Colleges + 5 Career Platforms)
  'pub-opp-0001', 'pub-opp-0002', 'pub-opp-0003', 'pub-opp-0004', 'pub-opp-0005',
  'pub-opp-0101', 'pub-opp-0102', 'pub-opp-0103', 'pub-opp-0104', 'pub-opp-0105',
  // Batch 2 (5 Colleges + 5 Career Platforms)
  'pub-opp-0006', 'pub-opp-0007', 'pub-opp-0008', 'pub-opp-0011', 'pub-opp-0012',
  'pub-opp-0106', 'pub-opp-0107', 'pub-opp-0108', 'pub-opp-0109', 'pub-opp-0111'
];

async function syncPilotToDb() {
  console.log('======================================================');
  console.log('PERSISTING 20 PILOT RECORDS TO PRODUCTION DATABASE');
  console.log('======================================================\n');

  const statements: string[] = [];

  for (let i = 0; i < pilotIds.length; i++) {
    const id = pilotIds[i];
    const opp = publisherDiscovery.getOpportunityById(id);
    if (!opp) continue;

    const batch = i < 10 ? 'BATCH_1' : 'BATCH_2';
    const draftsJson = JSON.stringify(opp.outreachDrafts).replace(/'/g, "''");
    const scoreJson = JSON.stringify(opp.score).replace(/'/g, "''");

    // Upsert into embed_publisher_opportunities
    statements.push(`
      INSERT INTO public.embed_publisher_opportunities (
        id, name, domain, website_url, category, country, region,
        relevant_topic, target_page_url, suggested_asset_id, suggested_embed_category,
        opportunity_score, priority, pipeline_stage, adoption_level,
        contact_page_url, public_contact_email, score_breakdown, outreach_drafts,
        is_opted_out, created_at, updated_at
      ) VALUES (
        '${opp.id}',
        '${opp.name.replace(/'/g, "''")}',
        '${opp.domain}',
        'https://${opp.domain}',
        '${opp.category}',
        '${opp.country}',
        '${opp.region}',
        '${opp.relevantTopic.replace(/'/g, "''")}',
        '${opp.targetPageUrl?.replace(/'/g, "''")}',
        '${opp.suggestedAssetId}',
        '${opp.suggestedEmbedCategory}',
        ${opp.score.totalScore},
        'A',
        'contact_ready',
        1,
        '${opp.contactPageUrl?.replace(/'/g, "''")}',
        '${opp.publicContactEmail}',
        '${scoreJson}'::jsonb,
        '${draftsJson}'::jsonb,
        false,
        NOW(),
        NOW()
      ) ON CONFLICT (id) DO UPDATE SET
        pipeline_stage = 'contact_ready',
        updated_at = NOW();
    `);

    // Log draft_reviewed in publisher_outreach_log
    statements.push(`
      INSERT INTO public.publisher_outreach_log (
        publisher_id, action, operator_id, channel, notes, created_at
      ) VALUES (
        '${opp.id}',
        'draft_reviewed',
        'pilot_auditor',
        '${opp.publicContactEmail ? 'email' : 'contact_form'}',
        'Stage: contact_ready. Target validated for ${batch}.',
        NOW()
      );
    `);
  }

  const sqlFile = 'scripts/sync-pilot.sql';
  fs.writeFileSync(sqlFile, statements.join('\n'), 'utf8');
  console.log(`Generated ${statements.length / 2} upsert + log statements in ${sqlFile}`);

  // Execute via Supabase Management API
  console.log('Applying to linked Supabase production project...');
  execSync(`npx supabase db query --linked -f ${sqlFile}`, { stdio: 'inherit' });

  console.log('\nVerification: Checking database row count...');
  const checkSql = `SELECT count(*) FROM public.embed_publisher_opportunities;`;
  fs.writeFileSync('scripts/check-count.sql', checkSql, 'utf8');
  execSync(`npx supabase db query --linked -f scripts/check-count.sql`, { stdio: 'inherit' });

  console.log('\n======================================================');
  console.log('PILOT PIPELINE SYNCHRONIZATION COMPLETE');
  console.log('======================================================');
}

syncPilotToDb().catch(console.error);
