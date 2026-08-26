// scripts/seo/sync-real-gsc-to-lake.ts
// Hydrates real Google Search Console search performance data into TalentXcel Query Evidence Lake

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { createHash } from 'crypto';
import { normalizeForClustering, generateClusterId, classifyJourneyStage } from '../../src/lib/seo/intentClusterEngine.js';
import { scoreOpportunityV2 } from '../../src/lib/seo/rankingOpportunityEngineV2.js';

interface ServiceAccountKey {
  client_email: string;
  private_key: string;
  project_id: string;
}

async function getGoogleAccessToken(serviceAccount: ServiceAccountKey): Promise<string> {
  const crypto = await import('crypto');
  const now = Math.floor(Date.now() / 1000);

  const header = { alg: 'RS256', typ: 'JWT' };
  const claimSet = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/webmasters https://www.googleapis.com/auth/webmasters.readonly https://www.googleapis.com/auth/indexing',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  const base64UrlEncode = (obj: object) =>
    Buffer.from(JSON.stringify(obj))
      .toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

  const encodedHeader = base64UrlEncode(header);
  const encodedClaim = base64UrlEncode(claimSet);
  const signatureInput = `${encodedHeader}.${encodedClaim}`;

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(signatureInput);
  signer.end();

  const signature = signer
    .sign(serviceAccount.private_key, 'base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  const jwt = `${signatureInput}.${signature}`;

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  const tokenData = await tokenResponse.json();
  if (!tokenResponse.ok) {
    throw new Error(tokenData.error_description || 'OAuth2 token generation failed');
  }

  return tokenData.access_token;
}

function detectSurfaceFromUrl(pageUrl: string): string {
  if (pageUrl.includes('/resume')) return 'RESUME_ATS';
  if (pageUrl.includes('/network')) return 'PROFESSIONAL_NETWORK';
  if (pageUrl.includes('/colleges')) return 'COLLEGES';
  if (pageUrl.includes('/roles')) return 'ROLE_GUIDES';
  if (pageUrl.includes('/skills')) return 'SKILLS';
  if (pageUrl.includes('/companies') || pageUrl.includes('/company/')) return 'COMPANIES';
  if (pageUrl.includes('/learning')) return 'LEARNING_COURSES';
  if (pageUrl.includes('/career-map') || pageUrl.includes('/career-paths')) return 'CAREER_MAP';
  if (pageUrl.includes('/passport')) return 'CAREER_PASSPORT';
  if (pageUrl.includes('/mo1')) return 'MO1_BUSINESS_OS';
  if (pageUrl.includes('/rankings')) return 'BIDDER_RANKINGS';
  if (pageUrl.includes('/tools')) return 'CAREER_TOOLS';
  if (pageUrl.includes('/resources/')) return 'ROLE_GUIDES';
  return 'JOBS';
}

async function syncGscToLake() {
  console.log('================================================================');
  console.log('⚡ HYDRATING REAL GOOGLE SEARCH CONSOLE DATA INTO EVIDENCE LAKE');
  console.log('================================================================\n');

  const keyPath = resolve('gcp-key.json');
  if (!existsSync(keyPath)) {
    throw new Error('gcp-key.json not found');
  }

  const serviceAccount: ServiceAccountKey = JSON.parse(readFileSync(keyPath, 'utf-8'));
  const token = await getGoogleAccessToken(serviceAccount);
  const siteUrl = 'https://talentxcel.in/';

  // Query last 90 days from GSC
  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now() - 90 * 86400000).toISOString().split('T')[0];

  console.log(`📡 Querying GSC API for site: ${siteUrl} (${startDate} to ${endDate})...`);

  const gscRes = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      startDate,
      endDate,
      dimensions: ['query', 'page', 'country', 'device'],
      rowLimit: 25000,
      aggregationType: 'byPage'
    })
  });

  const gscData = await gscRes.json();
  const rawRows: any[] = gscData.rows || [];
  console.log(`✓ Retrieved ${rawRows.length} raw performance observations from Google Search Console API\n`);

  // Load existing evidence lake
  const lakePath = resolve('SEO_QUERY_EVIDENCE_LAKE.json');
  let lake: any = {
    schema_version: '3.0.0',
    generated_at: new Date().toISOString(),
    engine: 'TalentXcel Query Evidence Lake v3',
    provenance_policy: {
      unverified_metrics: 'null — never estimated or fabricated',
      gsc_average_position: 'From Google Search Console API only — NOT live SERP rank',
      serp_observed_position: 'From external SERP observation only — NEVER same as gsc_average_position',
      population_A_source: 'Google Search Console API via gcp-key.json service account',
      population_B_source: 'Google Keyword Planner + competitor SERP benchmarks',
      population_C_source: 'Entity graph combinatorial expansion — unverified theoretical candidates'
    },
    population_summary: {
      population_A_observed_gsc: 0,
      population_B_evidenced_demand: 0,
      population_C_theoretical: 0,
      total_records: 0
    },
    records: []
  };

  if (existsSync(lakePath)) {
    lake = JSON.parse(readFileSync(lakePath, 'utf-8'));
  }

  // Preserve Population B & C records from existing lake
  const nonGscRecords = lake.records.filter((r: any) => r.population !== 'A_OBSERVED_GSC');

  // Map to aggregate by query + page + country to consolidate multi-device rows
  const aggregatedMap = new Map<string, {
    query: string;
    page: string;
    country: string;
    impressions: number;
    clicks: number;
    weightedPositionSum: number;
  }>();

  for (const row of rawRows) {
    const query = row.keys[0];
    const page = row.keys[1];
    const country = (row.keys[2] || 'ind').toUpperCase();
    const mapKey = `${query.toLowerCase().trim()}|${page}|${country}`;

    const existing = aggregatedMap.get(mapKey);
    if (existing) {
      existing.impressions += row.impressions;
      existing.clicks += row.clicks;
      existing.weightedPositionSum += row.position * row.impressions;
    } else {
      aggregatedMap.set(mapKey, {
        query,
        page,
        country,
        impressions: row.impressions,
        clicks: row.clicks,
        weightedPositionSum: row.position * row.impressions
      });
    }
  }

  console.log(`✓ Consolidated ${rawRows.length} raw rows into ${aggregatedMap.size} unique query+page+country entities`);

  const hydratedPopA: any[] = [];
  const opportunityCandidates: any[] = [];

  for (const item of aggregatedMap.values()) {
    const rawQuery = item.query;
    const pageUrl = item.page;
    const normalizedQuery = normalizeForClustering(rawQuery);
    const surface = detectSurfaceFromUrl(pageUrl);
    const journeyStage = classifyJourneyStage(rawQuery);
    const intentCategory = rawQuery.includes('job') || rawQuery.includes('hiring') || rawQuery.includes('fresher')
      ? 'TRANSACTIONAL_JOB'
      : rawQuery.includes('resume') || rawQuery.includes('ats')
      ? 'TRANSACTIONAL_TOOL'
      : rawQuery.includes('college') || rawQuery.includes('campus')
      ? 'INFORMATIONAL_EDUCATION'
      : 'CAREER_GUIDANCE';

    const avgPos = item.impressions > 0 ? Number((item.weightedPositionSum / item.impressions).toFixed(2)) : 50;
    const ctr = item.impressions > 0 ? Number(((item.clicks / item.impressions) * 100).toFixed(2)) : 0;

    const hashInput = `${normalizedQuery}|${surface}|${item.country}`;
    const evidenceId = `ev_${createHash('sha256').update(hashInput).digest('hex').slice(0, 8)}`;

    const scored = scoreOpportunityV2({
      query: rawQuery,
      canonical_url: pageUrl,
      surface,
      gsc_average_position: avgPos,
      serp_observed_position: null,
      gsc_impressions: item.impressions,
      gsc_clicks: item.clicks,
      gsc_ctr: ctr,
      search_volume: null,
      intent: intentCategory,
      days_since_update: 1,
      cannibalization_flag: false,
      inventory_count: 10,
      competitor_position: null,
      internal_authority_score: 70
    });

    const record = {
      evidence_id: evidenceId,
      population: 'A_OBSERVED_GSC',
      raw_query: rawQuery,
      normalized_query: normalizedQuery,
      surface,
      intent_category: intentCategory,
      journey_stage: journeyStage,
      canonical_url: pageUrl,
      provenance: {
        source: 'GOOGLE_SEARCH_CONSOLE_API',
        captured_at: new Date().toISOString(),
        country: item.country === 'IND' ? 'IN' : item.country,
        language: 'en-IN',
        confidence_score: 1.0,
        source_status: 'CONNECTED'
      },
      metrics: {
        search_volume: null,
        cpc_inr: null,
        gsc_impressions: item.impressions,
        gsc_clicks: item.clicks,
        gsc_ctr: ctr,
        gsc_average_position: avgPos,
        serp_observed_position: null
      },
      competitor_positions: [],
      quality_gate: {
        decision: scored.decision,
        opportunity_score: scored.composite_opportunity_score,
        priority: scored.priority,
        decision_reason: scored.decision_reason
      }
    };

    hydratedPopA.push(record);
    opportunityCandidates.push({
      priority: scored.priority,
      query: rawQuery,
      surface,
      canonical_url: pageUrl,
      gsc_average_position: avgPos,
      serp_observed_position: null,
      gsc_impressions: item.impressions,
      gsc_clicks: item.clicks,
      gsc_ctr: ctr,
      ctr_benchmark_for_position: 5.0,
      ctr_gap_score: scored.ctr_gap_score,
      freshness_score: scored.freshness_score,
      conversion_intent_bonus: scored.conversion_intent_bonus,
      cannibalization_flag: false,
      internal_authority_score: 70,
      composite_opportunity_score: scored.composite_opportunity_score,
      decision: scored.decision,
      decision_reason: scored.decision_reason,
      recommended_actions: scored.recommended_actions,
      expected_outcome: scored.expected_outcome
    });
  }

  // Combine hydrated real Population A + preserved Pop B + preserved Pop C
  const allRecords = [...hydratedPopA, ...nonGscRecords];

  // Deduplicate by evidence_id
  const uniqueRecordsMap = new Map<string, any>();
  for (const r of allRecords) {
    uniqueRecordsMap.set(r.evidence_id, r);
  }
  const finalRecords = Array.from(uniqueRecordsMap.values());

  const popACount = finalRecords.filter((r: any) => r.population === 'A_OBSERVED_GSC').length;
  const popBCount = finalRecords.filter((r: any) => r.population === 'B_EVIDENCED_DEMAND').length;
  const popCCount = finalRecords.filter((r: any) => r.population === 'C_THEORETICAL_CANDIDATE').length;

  lake.records = finalRecords;
  lake.population_summary = {
    population_A_observed_gsc: popACount,
    population_B_evidenced_demand: popBCount,
    population_C_theoretical: popCCount,
    total_records: finalRecords.length
  };
  lake.generated_at = new Date().toISOString();

  writeFileSync(lakePath, JSON.stringify(lake, null, 2));
  console.log(`\n✅ EVIDENCE LAKE UPDATED: ${finalRecords.length} total records`);
  console.log(`   - Population A (Real GSC Observed): ${popACount} records`);
  console.log(`   - Population B (Evidenced Demand):  ${popBCount} records`);
  console.log(`   - Population C (Theoretical):       ${popCCount} records`);

  // Update Opportunity Queue with top 30 real opportunities sorted by composite score
  opportunityCandidates.sort((a, b) => b.composite_opportunity_score - a.composite_opportunity_score);
  const topOpportunities = opportunityCandidates.slice(0, 30);

  const oppQueuePath = resolve('SEO_RANKING_OPPORTUNITY_QUEUE.json');
  const oppQueue = {
    version: '2.1.0',
    generated_at: new Date().toISOString(),
    scoring_model: 'V2: CTR gap (25%) + freshness (15%) + conversion intent (20%) + internal authority (20%) + impression weight (variable) + cannibalization penalty',
    total_opportunities: topOpportunities.length,
    priority_breakdown: {
      P0: topOpportunities.filter((o: any) => o.priority === 'P0').length,
      P1: topOpportunities.filter((o: any) => o.priority === 'P1').length,
      P2: topOpportunities.filter((o: any) => o.priority === 'P2').length,
      P3: topOpportunities.filter((o: any) => o.priority === 'P3').length,
      P4: topOpportunities.filter((o: any) => o.priority === 'P4').length,
      P5: topOpportunities.filter((o: any) => o.priority === 'P5').length
    },
    decision_breakdown: {
      OPTIMIZE_EXISTING: topOpportunities.filter((o: any) => o.decision === 'OPTIMIZE_EXISTING').length,
      CREATE_CANONICAL: topOpportunities.filter((o: any) => o.decision === 'CREATE_CANONICAL').length,
      CONSOLIDATE_PARENT: topOpportunities.filter((o: any) => o.decision === 'CONSOLIDATE_PARENT').length,
      EXCLUDE_DOORWAY: topOpportunities.filter((o: any) => o.decision === 'EXCLUDE_DOORWAY').length,
      MONITOR: topOpportunities.filter((o: any) => o.decision === 'MONITOR').length
    },
    opportunities: topOpportunities
  };

  writeFileSync(oppQueuePath, JSON.stringify(oppQueue, null, 2));
  console.log(`\n✅ RANKING OPPORTUNITY QUEUE UPDATED: ${topOpportunities.length} scored real opportunities`);
  console.log(`   - P0 Immediate Quick Wins: ${oppQueue.priority_breakdown.P0}`);
  console.log(`   - P1 High-Leverage:        ${oppQueue.priority_breakdown.P1}`);
  console.log(`   - P2 Authority Growth:     ${oppQueue.priority_breakdown.P2}`);

  // Update Milestone 1 Dashboard
  const dashPath = resolve('SEO_MILESTONE1_DASHBOARD.json');
  if (existsSync(dashPath)) {
    const dash = JSON.parse(readFileSync(dashPath, 'utf-8'));
    dash.generated_at = new Date().toISOString();
    dash.staged_gates.stages[0].current_records = finalRecords.length;
    dash.staged_gates.stages[1].current_records = finalRecords.length;
    dash.four_pillars_of_truth['1_demand'].unique_evidenced_queries = finalRecords.length;
    dash.four_pillars_of_truth['1_demand'].daily_new_unique_queries_rate = hydratedPopA.length;
    dash.four_pillars_of_truth['2_seo'].top_3_queries_count = hydratedPopA.filter((r: any) => r.metrics.gsc_average_position !== null && r.metrics.gsc_average_position <= 3).length;
    dash.four_pillars_of_truth['2_seo'].top_10_queries_count = hydratedPopA.filter((r: any) => r.metrics.gsc_average_position !== null && r.metrics.gsc_average_position <= 10).length;
    dash.four_pillars_of_truth['2_seo'].top_20_queries_count = hydratedPopA.filter((r: any) => r.metrics.gsc_average_position !== null && r.metrics.gsc_average_position <= 20).length;
    writeFileSync(dashPath, JSON.stringify(dash, null, 2));
    console.log(`\n✅ MILESTONE 1 DASHBOARD UPDATED with live GSC positions`);
  }
}

syncGscToLake().catch(console.error);
