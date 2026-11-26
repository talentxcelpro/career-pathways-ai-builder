// scripts/search-intelligence/ingest-1m-corpus.ts
// Restartable, streaming, memory-bounded importer for TalentXcel_1M_SEO_Keyword_Universe.csv.
// Classifies, deduplicates, fingerprints, clusters, extracts entities & canonical destinations
// into Tier 1 (node:sqlite WAL), syncs bounded cluster centroids & sources to Supabase, and emits report.

import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { classifyKeyword } from '../../src/lib/seo/demandIntelligence/classifier';
import { StreamingClusterAggregator } from '../../src/lib/seo/demandIntelligence/clusterer';
import { scoreOpportunity } from '../../src/lib/seo/demandIntelligence/opportunityScorer';
import {
  DEFAULT_WAREHOUSE_PATH,
  getCheckpoint,
  openWarehouse,
  saveCheckpoint,
} from './sqliteWarehouse';
import { batchUpsertSupabase, getServerSupabaseClient } from './supabaseSync';

const DEFAULT_CSV_PATH = 'C:\\Users\\Arshid.Wani\\Downloads\\TalentXcel_1M_SEO_Keyword_Universe.csv';
const CHECKPOINT_JOB = 'ingest_1m_csv_universe';
const BATCH_SIZE = 25000;

export function parseCsvLine(line: string): string[] {
  if (!line.includes('"')) {
    return line.split(',');
  }
  const fields: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      fields.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  fields.push(cur);
  return fields;
}

function getArgValue(flag: string): string | undefined {
  const prefix = `${flag}=`;
  const hit = process.argv.find((a) => a.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : undefined;
}

export async function runIngest1mCorpus(options: {
  csvPath?: string;
  dbPath?: string;
  resume?: boolean;
  skipSupabase?: boolean;
  maxRows?: number;
} = {}) {
  const startTime = Date.now();
  const csvPath = options.csvPath || getArgValue('--csv') || DEFAULT_CSV_PATH;
  const dbPath = options.dbPath || getArgValue('--db') || DEFAULT_WAREHOUSE_PATH;
  const resume = options.resume ?? process.argv.includes('--resume');
  const skipSupabase = options.skipSupabase ?? process.argv.includes('--skip-supabase');
  const maxRowsArg = getArgValue('--limit');
  const maxRows = options.maxRows ?? (maxRowsArg ? Number(maxRowsArg) : Infinity);

  if (!fs.existsSync(csvPath)) {
    throw new Error(`CSV file not found at ${csvPath}`);
  }

  const db = openWarehouse(dbPath);
  const priorCheckpoint = resume ? getCheckpoint(db, CHECKPOINT_JOB) : null;
  const startLineOffset = priorCheckpoint?.cursorOffset ?? 0;

  if (!resume) {
    db.exec(`
      DROP INDEX IF EXISTS idx_kw_cluster;
      DROP INDEX IF EXISTS idx_kw_dedup;
      DROP INDEX IF EXISTS idx_kw_opp_score;
      DROP INDEX IF EXISTS idx_kw_dest;
      DELETE FROM keywords;
      DELETE FROM clusters;
      VACUUM;
    `);
    saveCheckpoint(db, CHECKPOINT_JOB, 0, 0, { csvPath, startedAt: new Date().toISOString() });
  }

  const insertKwStmt = db.prepare(`
    INSERT INTO keywords (
      keyword_hash, raw_keyword, normalized_keyword, dedup_key,
      source, source_type, country_code, city_slug, language,
      industry_slug, job_role_slug, skill_slug, seniority, employment_type, work_mode,
      search_intent, opportunity_type, cluster_key, recommended_destination, recommended_canonical_url,
      is_classified, classification_confidence, entities_json, relations_json,
      csv_intent, csv_cluster, csv_generation_source, csv_suggested_page,
      search_volume_status, opportunity_score, demand_confidence, score_breakdown_json,
      status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(keyword_hash) DO UPDATE SET
      updated_at = excluded.updated_at,
      cluster_key = excluded.cluster_key,
      recommended_destination = excluded.recommended_destination
  `);

  const insertSourceStmt = db.prepare(`
    INSERT INTO sources (source_name, source_type, collection_method, source_confidence, is_verified_demand, source_metadata, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(source_name) DO UPDATE SET updated_at = excluded.updated_at, source_metadata = excluded.source_metadata
  `);

  const clusterAgg = new StreamingClusterAggregator();
  const seenDedupKeys = new Set<string>();
  const seenExactHashes = new Set<string>();
  const countryCoverage = new Map<string, number>();
  const cityCoverage = new Map<string, number>();
  const industryCoverage = new Map<string, number>();
  const roleCoverage = new Map<string, number>();
  const skillCoverage = new Map<string, number>();
  const intentCoverage = new Map<string, number>();
  const opportunityTypeCoverage = new Map<string, number>();
  const destinationCoverage = new Map<string, number>();
  const failedRecords: Array<{ row: number; raw: string; reason: string }> = [];

  let totalRowsProcessed = 0;
  let uniqueKeywords = 0;
  let duplicateKeywords = 0;
  let nearDuplicateVariants = 0;
  let invalidKeywords = 0;
  let classifiedKeywords = 0;
  let unclassifiedKeywords = 0;

  type PendingRow = {
    classified: NonNullable<ReturnType<typeof classifyKeyword>>;
    csvIntent: string;
    csvCluster: string;
    csvGenSource: string;
    csvSuggestedPage: string;
    volumeStatus: 'verified' | 'unknown';
    score: number;
    confidence: number;
    scoreBreakdownJson: string;
  };
  let batch: PendingRow[] = [];

  const flushBatch = (cursorLine: number) => {
    if (batch.length === 0) return;
    const nowIso = new Date().toISOString();
    db.exec('BEGIN');
    try {
      for (const item of batch) {
        const c = item.classified;
        insertKwStmt.run(
          c.keywordHash,
          c.rawKeyword,
          c.normalizedKeyword,
          c.dedupKey,
          c.source,
          c.sourceType,
          c.countryCode,
          c.citySlug,
          c.language,
          c.industrySlug,
          c.jobRoleSlug,
          c.skillSlug,
          c.seniority,
          c.employmentType,
          c.workMode,
          c.searchIntent,
          c.opportunityType,
          c.clusterKey,
          c.recommendedDestination,
          c.recommendedCanonicalUrl,
          c.isClassified ? 1 : 0,
          c.classificationConfidence,
          JSON.stringify(c.entities),
          JSON.stringify(c.semanticRelations),
          item.csvIntent,
          item.csvCluster,
          item.csvGenSource,
          item.csvSuggestedPage,
          item.volumeStatus,
          item.score,
          item.confidence,
          item.scoreBreakdownJson,
          'CLUSTERED',
          nowIso,
          nowIso
        );
      }
      saveCheckpoint(db, CHECKPOINT_JOB, cursorLine, totalRowsProcessed, { csvPath });
      db.exec('COMMIT');
    } catch (err) {
      db.exec('ROLLBACK');
      throw err;
    }
    batch = [];
  };

  const stream = fs.createReadStream(csvPath, { encoding: 'utf8', highWaterMark: 256 * 1024 });
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

  let lineNumber = 0;
  for await (const line of rl) {
    lineNumber += 1;
    if (lineNumber === 1) continue; // Header row
    if (resume && lineNumber <= startLineOffset) continue;
    if (!line.trim()) continue;
    if (totalRowsProcessed >= maxRows) break;

    totalRowsProcessed += 1;
    try {
      const cols = parseCsvLine(line);
      const rawKeyword = (cols[0] || '').trim();
      const csvCluster = (cols[1] || '').trim();
      const csvIntent = (cols[2] || '').trim();
      const csvGenSource = (cols[3] || '').trim();
      const csvSuggestedPage = (cols[4] || '').trim();
      const csvVolumeStatus = (cols[5] || '').trim();

      const classified = classifyKeyword(rawKeyword, {
        source: csvGenSource || 'csv_1m_universe',
        sourceType: 'DISCOVERY_CORPUS_CSV',
      });

      if (!classified) {
        invalidKeywords += 1;
        if (failedRecords.length < 50) {
          failedRecords.push({ row: lineNumber, raw: rawKeyword.slice(0, 100), reason: 'INVALID_NORMALIZATION' });
        }
        continue;
      }

      if (seenExactHashes.has(classified.keywordHash)) {
        duplicateKeywords += 1;
        continue;
      }
      seenExactHashes.add(classified.keywordHash);

      if (seenDedupKeys.has(classified.dedupKey)) {
        nearDuplicateVariants += 1;
      } else {
        seenDedupKeys.add(classified.dedupKey);
      }
      uniqueKeywords += 1;

      if (classified.isClassified) classifiedKeywords += 1;
      else unclassifiedKeywords += 1;

      const volumeStatus: 'verified' | 'unknown' =
        /verified/i.test(csvVolumeStatus) && !/not verified/i.test(csvVolumeStatus) ? 'verified' : 'unknown';

      const scored = scoreOpportunity({
        classified,
        searchVolumeStatus: volumeStatus,
        verifiedMonthlyVolume: null,
        gscImpressions: null,
        liveInventoryCount: null,
      });

      clusterAgg.add(classified, scored.compositeScore);

      countryCoverage.set(classified.countryCode, (countryCoverage.get(classified.countryCode) || 0) + 1);
      if (classified.citySlug) cityCoverage.set(classified.citySlug, (cityCoverage.get(classified.citySlug) || 0) + 1);
      if (classified.industrySlug) industryCoverage.set(classified.industrySlug, (industryCoverage.get(classified.industrySlug) || 0) + 1);
      if (classified.jobRoleSlug) roleCoverage.set(classified.jobRoleSlug, (roleCoverage.get(classified.jobRoleSlug) || 0) + 1);
      if (classified.skillSlug) skillCoverage.set(classified.skillSlug, (skillCoverage.get(classified.skillSlug) || 0) + 1);
      intentCoverage.set(classified.searchIntent, (intentCoverage.get(classified.searchIntent) || 0) + 1);
      opportunityTypeCoverage.set(classified.opportunityType, (opportunityTypeCoverage.get(classified.opportunityType) || 0) + 1);
      destinationCoverage.set(classified.recommendedDestination, (destinationCoverage.get(classified.recommendedDestination) || 0) + 1);

      batch.push({
        classified,
        csvIntent,
        csvCluster,
        csvGenSource,
        csvSuggestedPage,
        volumeStatus,
        score: scored.compositeScore,
        confidence: scored.dataConfidence,
        scoreBreakdownJson: JSON.stringify({
          c: scored.compositeScore,
          d: scored.demandEvidenceScore,
          r: scored.talentxcelRelevanceScore,
          s: scored.demandStatus,
        }),
      });

      if (batch.length >= BATCH_SIZE) {
        flushBatch(lineNumber);
        if (totalRowsProcessed % 100000 === 0) {
          console.log(`[1M Ingest] Processed ${totalRowsProcessed.toLocaleString()} rows (${clusterAgg.size()} clusters)...`);
        }
      }
    } catch (err: unknown) {
      invalidKeywords += 1;
      if (failedRecords.length < 50) {
        failedRecords.push({ row: lineNumber, raw: line.slice(0, 100), reason: (err as Error).message });
      }
    }
  }

  flushBatch(lineNumber);

  // Rebuild SQLite secondary indexes cleanly and reclaim space once bulk load finishes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_kw_cluster ON keywords(cluster_key);
    CREATE INDEX IF NOT EXISTS idx_kw_dedup ON keywords(dedup_key);
    CREATE INDEX IF NOT EXISTS idx_kw_opp_score ON keywords(opportunity_score DESC);
    CREATE INDEX IF NOT EXISTS idx_kw_dest ON keywords(recommended_destination);
  `);

  // Persist cluster aggregates and source record in SQLite
  const allClusters = clusterAgg.getAllClusters();
  const upsertClusterStmt = db.prepare(`
    INSERT INTO clusters (
      cluster_key, cluster_name, cluster_type, parent_cluster_key, primary_keyword,
      country_code, language, intent, recommended_hub_url, member_count, cluster_quality,
      opportunity_score, sample_keywords_json, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(cluster_key) DO UPDATE SET
      member_count = excluded.member_count,
      cluster_quality = excluded.cluster_quality,
      opportunity_score = excluded.opportunity_score,
      sample_keywords_json = excluded.sample_keywords_json,
      updated_at = excluded.updated_at
  `);

  const nowIso = new Date().toISOString();
  db.exec('BEGIN');
  try {
    insertSourceStmt.run(
      'TalentXcel_1M_SEO_Keyword_Universe.csv',
      'DISCOVERY_CORPUS_CSV',
      'STREAMING_CSV_IMPORT',
      0.25,
      0,
      JSON.stringify({ csvPath, rowsProcessed: totalRowsProcessed, note: 'Generated candidate corpus; volume not verified' }),
      nowIso
    );
    for (const c of allClusters) {
      const avgOpp = Math.round((c.weightedScoreSum / Math.max(1, c.memberCount)) * 100) / 100;
      upsertClusterStmt.run(
        c.clusterKey,
        c.clusterName,
        c.clusterType,
        c.parentClusterKey,
        c.primaryKeyword,
        c.countryCode,
        c.language,
        c.intent,
        c.recommendedHubUrl,
        c.memberCount,
        c.clusterQuality,
        avgOpp,
        JSON.stringify(c.sampleKeywords),
        nowIso
      );
    }
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }

  // Optional bounded Supabase sync: sources + top 500 clusters + centroid keywords (protects cloud storage quota)
  let supabaseSyncSummary: Record<string, unknown> = { skipped: skipSupabase };
  if (!skipSupabase) {
    const sb = getServerSupabaseClient();
    if (!resume) {
      await sb.from('keyword_clusters').delete().neq('cluster_key', '__never__');
    }
    const srcRes = await batchUpsertSupabase(
      sb,
      'keyword_sources',
      [
        {
          source_name: 'TalentXcel_1M_SEO_Keyword_Universe.csv',
          source_type: 'DISCOVERY_CORPUS_CSV',
          collection_method: 'STREAMING_CSV_IMPORT',
          source_confidence: 0.25,
          is_verified_demand: false,
          source_metadata: { rows_processed: totalRowsProcessed, volume_status: 'UNVERIFIED_CANDIDATES' },
        },
      ],
      'source_name'
    );

    const topClustersPayload = allClusters.slice(0, 500).map((c) => ({
      cluster_key: c.clusterKey,
      cluster_name: c.clusterName.slice(0, 200),
      cluster_type: c.clusterType,
      primary_keyword: c.primaryKeyword,
      country: c.countryCode,
      language: c.language,
      intent: c.intent,
      recommended_hub_url: c.recommendedHubUrl,
      member_count: c.memberCount,
      cluster_quality: c.clusterQuality,
      opportunity_score: Math.round((c.weightedScoreSum / Math.max(1, c.memberCount)) * 100) / 100,
      metadata: { sample_keywords: c.sampleKeywords.slice(0, 5) },
    }));
    const clusterRes = await batchUpsertSupabase(sb, 'keyword_clusters', topClustersPayload, 'cluster_key');

    await sb.from('seo_intelligence_runs').insert({
      run_type: '1M_CORPUS_IMPORT',
      status: 'COMPLETED',
      completed_at: new Date().toISOString(),
      duration_ms: Date.now() - startTime,
      records_processed: totalRowsProcessed,
      records_inserted: uniqueKeywords,
      records_failed: invalidKeywords,
      checkpoint: { cursorOffset: lineNumber },
      summary_metrics: {
        uniqueKeywords,
        duplicateKeywords,
        nearDuplicateVariants,
        clusterCount: allClusters.length,
        classifiedKeywords,
        unclassifiedKeywords,
      },
    });

    supabaseSyncSummary = {
      sourcesSynced: srcRes.succeeded,
      clustersSynced: clusterRes.succeeded,
      errors: [...srcRes.errors, ...clusterRes.errors],
    };
  }

  const durationMs = Date.now() - startTime;
  const sortMap = (m: Map<string, number>) =>
    Array.from(m.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([key, count]) => ({ key, count }));

  const reportData = {
    generatedAt: new Date().toISOString(),
    csvPath,
    warehouseDbPath: dbPath,
    totalRowsProcessed,
    uniqueKeywords,
    duplicateKeywords,
    nearDuplicateSemanticVariants: nearDuplicateVariants,
    invalidKeywords,
    classifiedKeywords,
    unclassifiedKeywords,
    clusterCount: allClusters.length,
    countryCoverageCount: countryCoverage.size,
    cityCoverageCount: cityCoverage.size,
    industryCoverageCount: industryCoverage.size,
    roleCoverageCount: roleCoverage.size,
    skillCoverageCount: skillCoverage.size,
    processingDurationMs: durationMs,
    volumeTruthDeclaration: 'All 1M CSV rows are generated discovery candidates (demand_status = UNKNOWN; 0 fabricated volumes).',
    topCountries: sortMap(countryCoverage).slice(0, 20),
    topCities: sortMap(cityCoverage).slice(0, 25),
    topIndustries: sortMap(industryCoverage).slice(0, 30),
    topRoles: sortMap(roleCoverage).slice(0, 30),
    topSkills: sortMap(skillCoverage).slice(0, 25),
    intentDistribution: sortMap(intentCoverage),
    opportunityTypeDistribution: sortMap(opportunityTypeCoverage),
    topDestinations: sortMap(destinationCoverage).slice(0, 25),
    topClusters: allClusters.slice(0, 25).map((c) => ({
      clusterKey: c.clusterKey,
      primaryKeyword: c.primaryKeyword,
      memberCount: c.memberCount,
      clusterQuality: c.clusterQuality,
      recommendedHubUrl: c.recommendedHubUrl,
    })),
    failedRecordsSample: failedRecords,
    supabaseSyncSummary,
  };

  const reportsDir = path.resolve(process.cwd(), 'reports');
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });
  fs.writeFileSync(path.join(reportsDir, '1M_KEYWORD_CORPUS_IMPORT_REPORT.json'), JSON.stringify(reportData, null, 2));

  const md = [
    '# 1M Keyword Corpus Streaming Import Report',
    '',
    `**Executed At:** ${reportData.generatedAt}  `,
    `**Source CSV:** \`${csvPath}\`  `,
    `**Tier 1 Warehouse:** \`${dbPath}\`  `,
    `**Processing Duration:** ${(durationMs / 1000).toFixed(2)}s  `,
    '',
    '> **Truth-in-Measurement Policy:** Every row in `TalentXcel_1M_SEO_Keyword_Universe.csv` carries `Search volume status = Generated candidate; volume not verified`. Zero volumes were invented or treated as verified demand.',
    '',
    '## Core Import Metrics',
    '| Metric | Value |',
    '|---|---|',
    `| Total rows processed | ${totalRowsProcessed.toLocaleString()} |`,
    `| Unique keywords (exact normalized hash) | ${uniqueKeywords.toLocaleString()} |`,
    `| Duplicate keywords skipped | ${duplicateKeywords.toLocaleString()} |`,
    `| Near-duplicate semantic variants flagged | ${nearDuplicateVariants.toLocaleString()} |`,
    `| Invalid / rejected keywords | ${invalidKeywords.toLocaleString()} |`,
    `| Classified keywords | ${classifiedKeywords.toLocaleString()} |`,
    `| Unclassified keywords | ${unclassifiedKeywords.toLocaleString()} |`,
    `| Semantic clusters created | ${allClusters.length.toLocaleString()} |`,
    `| Country coverage count | ${countryCoverage.size} |`,
    `| City coverage count | ${cityCoverage.size} |`,
    `| Industry coverage count | ${industryCoverage.size} |`,
    `| Role coverage count | ${roleCoverage.size} |`,
    `| Skill coverage count | ${skillCoverage.size} |`,
    '',
    '## Re-Mapped Canonical Search Intent Distribution',
    ...reportData.intentDistribution.map((x) => `- \`${x.key}\`: ${x.count.toLocaleString()}`),
    '',
    '## Top Canonical TalentXcel Destinations (Fixing Legacy `/career/` Mappings)',
    ...reportData.topDestinations.slice(0, 15).map((x) => `- \`${x.key}\`: ${x.count.toLocaleString()} keywords`),
    '',
    '## Top 15 Semantic Keyword Clusters',
    '| Cluster Key | Primary Keyword | Members | Hub Route |',
    '|---|---|---|---|',
    ...reportData.topClusters.slice(0, 15).map((c) => `| \`${c.clusterKey}\` | ${c.primaryKeyword} | ${c.memberCount.toLocaleString()} | \`${c.recommendedHubUrl}\` |`),
  ].join('\n');

  fs.writeFileSync(path.join(reportsDir, '1M_KEYWORD_CORPUS_IMPORT_REPORT.md'), md);
  db.close();
  return reportData;
}

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}` || process.argv[1]?.endsWith('ingest-1m-corpus.ts')) {
  runIngest1mCorpus()
    .then((r) => {
      console.log(`Done in ${(r.processingDurationMs / 1000).toFixed(2)}s: ${r.uniqueKeywords} unique, ${r.clusterCount} clusters.`);
    })
    .catch((err) => {
      console.error('Ingest failed:', err);
      process.exit(1);
    });
}
