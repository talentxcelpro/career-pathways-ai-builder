import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Relative imports from deduplication library
import { clusterDuplicateCandidates, buildMergePreview } from '../src/lib/candidate-deduplication/reconciliation';

const envText = fs.readFileSync('.env', 'utf8');
const env: Record<string, string> = {};
for (const line of envText.split('\n')) {
  const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (m) {
    let val = (m[2] || '').trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
    env[m[1]] = val;
  }
}

const url = env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(url, key);

async function main() {
  console.log('Fetching active candidates from unified_candidates...');
  const { data: candidates, error } = await supabase
    .from('unified_candidates')
    .select('*')
    .or('activation_status.is.null,activation_status.neq.merged_archive')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching candidates:', error);
    process.exit(1);
  }

  console.log(`Fetched ${candidates.length} active candidate records.`);

  const { groups, uniqueCandidatesCount, duplicateRecordsCount } = clusterDuplicateCandidates(candidates);

  console.log(`\nDuplicate Analysis:`);
  console.log(`- Total Records: ${candidates.length}`);
  console.log(`- Unique Candidate Identities: ${uniqueCandidatesCount}`);
  console.log(`- Duplicate Groups to Merge: ${groups.length}`);
  console.log(`- Redundant Records to Archive: ${duplicateRecordsCount}`);

  if (groups.length === 0) {
    console.log('\nNo duplicate groups found. Everything is already clean and reconciled!');
    return;
  }

  console.log('\n--- MERGE EXECUTION COMMENCING ---');
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < groups.length; i++) {
    const group = groups[i];
    const preview = buildMergePreview(group.canonicalCandidate, group.duplicateCandidates);

    console.log(`\n[${i + 1}/${groups.length}] Merging group: ${group.groupId}`);
    console.log(`  Canonical: "${preview.canonicalName}" (${preview.targetCanonicalId})`);
    console.log(`  Duplicates (${preview.sourceCandidateIds.length}): ${preview.sourceCandidateIds.join(', ')}`);
    console.log(`  Merged Skills count: ${preview.mergedSkills.length}`);
    console.log(`  Historical CVs preserved: ${preview.historicalResumeUrls.length}`);

    try {
      // 1. Update canonical candidate with consolidated data and audit trail
      const existingAppData = group.canonicalCandidate.application_data || {};
      const { error: updateError } = await supabase
        .from('unified_candidates')
        .update({
          email: preview.mergedEmail,
          phone: preview.mergedPhone,
          skills: preview.mergedSkills,
          resume_url: preview.mergedResumeUrl,
          application_data: {
            ...existingAppData,
            deduplication_audit: preview.auditTrail,
            historical_resumes: preview.historicalResumeUrls
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', preview.targetCanonicalId);

      if (updateError) {
        console.error(`  Error updating canonical record ${preview.targetCanonicalId}:`, updateError);
        errorCount++;
        continue;
      }

      // 2. Mark duplicate records as merged_archive with pointer to canonical ID
      for (const dupId of preview.sourceCandidateIds) {
        const dupRecord = group.duplicateCandidates.find((d: any) => d.id === dupId);
        const dupAppData = dupRecord?.application_data || {};

        const { error: archiveError } = await supabase
          .from('unified_candidates')
          .update({
            activation_status: 'merged_archive',
            application_data: {
              ...dupAppData,
              merged_into: preview.targetCanonicalId,
              merged_at: new Date().toISOString()
            }
          })
          .eq('id', dupId);

        if (archiveError) {
          console.error(`  Error archiving duplicate record ${dupId}:`, archiveError);
        }
      }

      successCount++;
      console.log(`  ✓ Successfully merged group ${group.groupId}`);
    } catch (err) {
      console.error(`  Exception merging group ${group.groupId}:`, err);
      errorCount++;
    }
  }

  console.log(`\n--- MERGE EXECUTION FINISHED ---`);
  console.log(`Successfully merged: ${successCount} groups.`);
  if (errorCount > 0) {
    console.log(`Errors encountered: ${errorCount} groups.`);
  }

  // Verification step: re-cluster remaining active candidates
  console.log('\nRunning verification scan on unified_candidates...');
  const { data: remainingCandidates, error: verifyError } = await supabase
    .from('unified_candidates')
    .select('*')
    .or('activation_status.is.null,activation_status.neq.merged_archive');

  if (verifyError) {
    console.error('Error during verification fetch:', verifyError);
  } else {
    const postMergeCluster = clusterDuplicateCandidates(remainingCandidates);
    console.log(`Post-merge Active Candidates in Database: ${remainingCandidates.length}`);
    console.log(`Remaining Duplicate Groups: ${postMergeCluster.groups.length}`);
    console.log(`Post-merge Unique Candidate Identities: ${postMergeCluster.uniqueCandidatesCount}`);
  }
}

main().catch(console.error);
