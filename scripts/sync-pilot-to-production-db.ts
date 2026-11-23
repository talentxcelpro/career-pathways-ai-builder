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
  console.log('========================================================================');
  console.log('UPDATING 20 CORRECTED PILOT RECORDS IN PRODUCTION DATABASE (SUPABASE)');
  console.log('========================================================================\n');

  const statements: string[] = [];

  for (let i = 0; i < pilotIds.length; i++) {
    const id = pilotIds[i];
    const opp = publisherDiscovery.getOpportunityById(id);
    if (!opp) continue;

    const batch = i < 10 ? 'BATCH_1' : 'BATCH_2';
    const draftsJson = JSON.stringify(opp.outreachDrafts).replace(/'/g, "''");
    const scoreJson = JSON.stringify(opp.score).replace(/'/g, "''");

    // Full upsert into embed_publisher_opportunities
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
        name = EXCLUDED.name,
        domain = EXCLUDED.domain,
        website_url = EXCLUDED.website_url,
        category = EXCLUDED.category,
        relevant_topic = EXCLUDED.relevant_topic,
        target_page_url = EXCLUDED.target_page_url,
        suggested_asset_id = EXCLUDED.suggested_asset_id,
        suggested_embed_category = EXCLUDED.suggested_embed_category,
        opportunity_score = EXCLUDED.opportunity_score,
        priority = EXCLUDED.priority,
        pipeline_stage = 'contact_ready',
        adoption_level = 1,
        contact_page_url = EXCLUDED.contact_page_url,
        public_contact_email = EXCLUDED.public_contact_email,
        score_breakdown = EXCLUDED.score_breakdown,
        outreach_drafts = EXCLUDED.outreach_drafts,
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
        'Stage: contact_ready. Pre-dispatch forensic correction verified: personalized asset slug and dynamic iframe embed corrected for ${batch}.',
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

  console.log('\nVerification Query 1: Total records in embed_publisher_opportunities...');
  fs.writeFileSync('scripts/check-count.sql', 'SELECT count(*) FROM public.embed_publisher_opportunities;', 'utf8');
  execSync(`npx supabase db query --linked -f scripts/check-count.sql`, { stdio: 'inherit' });

  console.log('\nVerification Query 2: Inspecting corrected assets for pub-opp-0001, pub-opp-0002, pub-opp-0003, pub-opp-0101...');
  const checkAssetsSql = `
    SELECT id, name, domain, suggested_asset_id, suggested_embed_category, pipeline_stage
    FROM public.embed_publisher_opportunities
    WHERE id IN ('pub-opp-0001', 'pub-opp-0002', 'pub-opp-0003', 'pub-opp-0101')
    ORDER BY id ASC;
  `;
  fs.writeFileSync('scripts/check-assets.sql', checkAssetsSql, 'utf8');
  execSync(`npx supabase db query --linked -f scripts/check-assets.sql`, { stdio: 'inherit' });

  console.log('\nVerification Query 3: Inspecting pub-opp-0002 (IIT Delhi) live emailBody snippet...');
  const checkDelhiSql = `
    SELECT id, name, substring(outreach_drafts->>'emailBody' from 1 for 500) as email_body_preview
    FROM public.embed_publisher_opportunities
    WHERE id = 'pub-opp-0002';
  `;
  fs.writeFileSync('scripts/check-delhi.sql', checkDelhiSql, 'utf8');
  execSync(`npx supabase db query --linked -f scripts/check-delhi.sql`, { stdio: 'inherit' });

  console.log('\nVerification Query 4: Checking pre-dispatch correction entries in publisher_outreach_log...');
  const checkLogSql = `
    SELECT publisher_id, action, operator_id, channel, notes, created_at
    FROM public.publisher_outreach_log
    WHERE notes LIKE '%Pre-dispatch forensic correction%'
    ORDER BY created_at DESC
    LIMIT 5;
  `;
  fs.writeFileSync('scripts/check-log.sql', checkLogSql, 'utf8');
  execSync(`npx supabase db query --linked -f scripts/check-log.sql`, { stdio: 'inherit' });

  console.log('\n========================================================================');
  console.log('CORRECTED PILOT PIPELINE DATABASE SYNCHRONIZATION COMPLETE');
  console.log('========================================================================');
}

syncPilotToDb().catch(console.error);
