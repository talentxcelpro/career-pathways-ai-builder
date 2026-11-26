// scripts/search-intelligence/run-intelligence-cycle.ts
// Orchestrates inventory matching, destination scoring, 11-state Page Qualification Governor evaluation,
// internal link recommendations, content briefs (25 types), bounded Supabase sync, and daily/weekly reports.

import fs from 'node:fs';
import path from 'node:path';
import { classifyKeyword } from '../../src/lib/seo/demandIntelligence/classifier';
import { generateContentBrief } from '../../src/lib/seo/demandIntelligence/contentBriefGenerator';
import { generateInternalLinkRecommendations, type LinkGraphNodeInput } from '../../src/lib/seo/demandIntelligence/internalLinkRecommender';
import { scoreOpportunity } from '../../src/lib/seo/demandIntelligence/opportunityScorer';
import { evaluatePageQualification } from '../../src/lib/seo/demandIntelligence/pageQualifier';
import type { ContentBrief, PageQualificationResult, SeoOpportunityType } from '../../src/lib/seo/demandIntelligence/types';
import { collectAndPersistLiveInventory } from './inventoryMatcher';
import { DEFAULT_WAREHOUSE_PATH, openWarehouse } from './sqliteWarehouse';
import { batchUpsertSupabase, getServerSupabaseClient } from './supabaseSync';

export async function runIntelligenceCycle(options: { dbPath?: string; skipSupabase?: boolean } = {}) {
  const startTime = Date.now();
  const db = openWarehouse(options.dbPath || DEFAULT_WAREHOUSE_PATH);
  const skipSupabase = options.skipSupabase ?? process.argv.includes('--skip-supabase');

  // 1. Live Inventory Matching (jobs, public_profiles aggregate, companies, courses, groups, static catalogs)
  const inventory = await collectAndPersistLiveInventory(db);

  // 2. Gather top candidate clusters & GSC observations from Tier 1 warehouse
  const topClusters = db
    .prepare(`
      SELECT cluster_key, cluster_name, cluster_type, primary_keyword, country_code, language, intent, recommended_hub_url, member_count, opportunity_score
      FROM clusters
      ORDER BY member_count DESC, opportunity_score DESC
      LIMIT 400
    `)
    .all() as Array<{
      cluster_key: string;
      cluster_name: string;
      cluster_type: string;
      primary_keyword: string;
      country_code: string;
      language: string;
      intent: string;
      recommended_hub_url: string;
      member_count: number;
      opportunity_score: number;
    }>;

  const gscTopQueries = db
    .prepare(`
      SELECT normalized_query, MAX(query) AS query, page_url, country, SUM(impressions) AS impressions, SUM(clicks) AS clicks,
             AVG(position) AS avg_pos, SUM(ga4_conversions) AS conversions
      FROM gsc_telemetry
      GROUP BY normalized_query, page_url, country
      ORDER BY impressions DESC
      LIMIT 600
    `)
    .all() as Array<{
      normalized_query: string;
      query: string;
      page_url: string;
      country: string;
      impressions: number;
      clicks: number;
      avg_pos: number;
      conversions: number;
    }>;

  const gscByDest = new Map<string, { impressions: number; clicks: number; avgPos: number; conversions: number; topQuery: string }>();
  for (const row of gscTopQueries) {
    const cl = classifyKeyword(row.query, { source: 'gsc_api', sourceType: 'VERIFIED_GSC' });
    const dest = cl?.recommendedDestination || '/jobs';
    const prev = gscByDest.get(dest);
    if (!prev) {
      gscByDest.set(dest, {
        impressions: row.impressions,
        clicks: row.clicks,
        avgPos: row.avg_pos,
        conversions: row.conversions,
        topQuery: row.normalized_query,
      });
    } else {
      prev.impressions += row.impressions;
      prev.clicks += row.clicks;
      prev.conversions += row.conversions;
      prev.avgPos = Math.round(((prev.avgPos + row.avg_pos) / 2) * 100) / 100;
    }
  }

  // Ensure core ecosystem utility hubs are always included in qualification evaluations
  const candidateDestinations = new Map<
    string,
    {
      pageUrl: string;
      primaryKeyword: string;
      clusterKey: string;
      pageType: SeoOpportunityType;
      roleSlug: string | null;
      citySlug: string | null;
      skillSlug: string | null;
      industrySlug: string | null;
      impressions: number;
      clicks: number;
      avgPos: number | null;
      conversions: number;
    }
  >();

  const coreSeedQueries = [
    'free ats resume checker',
    'talent score employability test',
    'career passport verified credentials',
    'salary benchmark india',
    'software engineer jobs in bangalore',
    'data analyst jobs in india',
    'remote software engineer jobs',
    'fresher jobs in india',
    'internship jobs in india',
    'government jobs india',
    'hire software engineers india',
    'colleges placement india',
  ];

  for (const seed of coreSeedQueries) {
    const cl = classifyKeyword(seed, { source: 'core_ecosystem', sourceType: 'VERIFIED_FIRST_PARTY_DB' });
    if (!cl) continue;
    const gsc = gscByDest.get(cl.recommendedDestination);
    candidateDestinations.set(cl.recommendedDestination, {
      pageUrl: cl.recommendedDestination,
      primaryKeyword: cl.normalizedKeyword,
      clusterKey: cl.clusterKey,
      pageType: cl.opportunityType,
      roleSlug: cl.jobRoleSlug,
      citySlug: cl.citySlug,
      skillSlug: cl.skillSlug,
      industrySlug: cl.industrySlug,
      impressions: gsc?.impressions ?? 0,
      clicks: gsc?.clicks ?? 0,
      avgPos: gsc?.avgPos ?? null,
      conversions: gsc?.conversions ?? 0,
    });
  }

  for (const c of topClusters) {
    if (candidateDestinations.has(c.recommended_hub_url)) continue;
    const cl = classifyKeyword(c.primary_keyword);
    if (!cl) continue;
    const gsc = gscByDest.get(c.recommended_hub_url);
    candidateDestinations.set(c.recommended_hub_url, {
      pageUrl: c.recommended_hub_url,
      primaryKeyword: c.primary_keyword,
      clusterKey: c.cluster_key,
      pageType: cl.opportunityType,
      roleSlug: cl.jobRoleSlug,
      citySlug: cl.citySlug,
      skillSlug: cl.skillSlug,
      industrySlug: cl.industrySlug,
      impressions: gsc?.impressions ?? 0,
      clicks: gsc?.clicks ?? 0,
      avgPos: gsc?.avgPos ?? null,
      conversions: gsc?.conversions ?? 0,
    });
  }

  // 3. Score + Qualify each candidate page via unified governor + live inventory
  const qualifications = new Map<string, PageQualificationResult>();
  const linkGraphNodes: LinkGraphNodeInput[] = [];
  const briefs: ContentBrief[] = [];
  const scoredOpportunities: Array<{
    pageUrl: string;
    primaryKeyword: string;
    opportunityType: SeoOpportunityType;
    score: number;
    confidence: number;
    demandStatus: 'VERIFIED' | 'UNKNOWN';
    inventoryCount: number;
    status: string;
    impressions: number;
    clicks: number;
  }> = [];

  const upsertQualStmt = db.prepare(`
    INSERT INTO page_qualifications (
      page_url, page_type, primary_keyword, cluster_key, real_inventory_count,
      unique_content_score, relevance_score, indexation_score, cannibalization_target,
      qualification_status, qualification_reason, sitemap_eligible, robots_meta, last_checked_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(page_url) DO UPDATE SET
      real_inventory_count = excluded.real_inventory_count,
      indexation_score = excluded.indexation_score,
      qualification_status = excluded.qualification_status,
      qualification_reason = excluded.qualification_reason,
      sitemap_eligible = excluded.sitemap_eligible,
      robots_meta = excluded.robots_meta,
      last_checked_at = excluded.last_checked_at
  `);

  const nowIso = new Date().toISOString();
  db.exec('BEGIN');
  try {
    for (const item of candidateDestinations.values()) {
      let realInv = 0;
      if (item.pageUrl === '/jobs/remote') realInv = inventory.remoteJobsCount;
      else if (item.pageUrl.startsWith('/jobs/fresher')) realInv = inventory.fresherJobsCount;
      else if (item.pageUrl.startsWith('/jobs/internship')) realInv = inventory.internshipJobsCount;
      else if (item.pageUrl.startsWith('/government-jobs')) realInv = inventory.govtJobsCount;
      else if (item.roleSlug && item.citySlug) {
        realInv = inventory.jobsByRoleCity.get(`${item.roleSlug}|${item.citySlug}`) ?? 0;
      } else if (item.roleSlug) {
        realInv = inventory.jobsByRoleSlug.get(item.roleSlug) ?? 0;
      } else if (item.citySlug) {
        realInv = inventory.jobsByCitySlug.get(item.citySlug) ?? 0;
      } else if (item.skillSlug) {
        realInv = inventory.jobsBySkillSlug.get(item.skillSlug) ?? 0;
      } else if (item.industrySlug) {
        realInv = inventory.jobsByIndustrySlug.get(item.industrySlug) ?? 0;
      } else if (item.pageUrl === '/jobs' || item.pageUrl === '/jobs/location/india') {
        realInv = inventory.totalActiveJobs;
      } else if (item.pageUrl === '/companies' || item.pageUrl === '/employer') {
        realInv = inventory.companiesCount;
      } else if (item.pageUrl.startsWith('/learning')) {
        realInv = inventory.coursesCount;
      } else if (item.pageUrl.startsWith('/colleges')) {
        realInv = inventory.institutionsCatalogCount;
      } else if (item.pageUrl.startsWith('/network')) {
        realInv = inventory.publicProfilesCount;
      }

      const cl = classifyKeyword(item.primaryKeyword)!;
      const breakdown = scoreOpportunity({
        classified: cl,
        searchVolumeStatus: item.impressions > 0 ? 'verified' : 'unknown',
        gscImpressions: item.impressions || null,
        gscClicks: item.clicks || null,
        gscCtr: item.impressions > 0 ? item.clicks / item.impressions : null,
        gscPosition: item.avgPos,
        ga4Conversions: item.conversions || null,
        liveInventoryCount: realInv,
      });

      const isUtility = [
        'ats-check',
        'resume-template',
        'talentscore-assessment',
        'career-passport',
        'recruiter-os',
        'employer-brand',
        'salary-benchmark',
      ].includes(item.pageType);

      const qual = evaluatePageQualification({
        pageUrl: item.pageUrl,
        pageType: item.pageType,
        primaryKeyword: item.primaryKeyword,
        clusterKey: item.clusterKey,
        realInventoryCount: realInv,
        profileAggregateCount: inventory.publicProfilesCount,
        courseCount: inventory.coursesCount,
        uniqueContentScore: isUtility || realInv >= 3 ? 84 : 45,
        relevanceScore: breakdown.talentxcelRelevanceScore,
        opportunityScore: breakdown.compositeScore,
        hasUtilityExperience: isUtility,
      });

      qualifications.set(item.pageUrl, qual);
      upsertQualStmt.run(
        qual.pageUrl,
        qual.pageType,
        qual.primaryKeyword,
        item.clusterKey,
        realInv,
        isUtility || realInv >= 3 ? 84 : 45,
        breakdown.talentxcelRelevanceScore,
        qual.indexationScore,
        qual.cannibalizationTarget,
        qual.qualificationStatus,
        qual.reason,
        qual.sitemapEligible ? 1 : 0,
        qual.robotsMeta,
        nowIso
      );

      scoredOpportunities.push({
        pageUrl: item.pageUrl,
        primaryKeyword: item.primaryKeyword,
        opportunityType: item.pageType,
        score: breakdown.compositeScore,
        confidence: breakdown.dataConfidence,
        demandStatus: breakdown.demandStatus,
        inventoryCount: realInv,
        status: qual.qualificationStatus,
        impressions: item.impressions,
        clicks: item.clicks,
      });

      if (qual.qualificationStatus === 'QUALIFIED_FOR_INDEX' || qual.qualificationStatus === 'RECOMMENDED') {
        linkGraphNodes.push({
          pageUrl: item.pageUrl,
          pageType: item.pageType,
          primaryKeyword: item.primaryKeyword,
          clusterKey: item.clusterKey,
          existingInboundLinks: item.pageUrl === '/jobs' || item.pageUrl === '/resume/ats-check' ? 5 : 1,
          opportunityScore: breakdown.compositeScore,
        });
      }
    }
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }

  // 4. Internal Linking Intelligence
  const linkRecs = generateInternalLinkRecommendations(linkGraphNodes, qualifications);
  const upsertLinkStmt = db.prepare(`
    INSERT INTO internal_links (recommendation_key, source_page_url, target_page_url, anchor_text, link_type, priority_score, reason, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(recommendation_key) DO UPDATE SET priority_score = excluded.priority_score, updated_at = excluded.updated_at
  `);
  db.exec('BEGIN');
  try {
    for (const l of linkRecs) {
      upsertLinkStmt.run(
        l.recommendationKey,
        l.sourcePageUrl,
        l.targetPageUrl,
        l.anchorText,
        l.linkType,
        l.priorityScore,
        l.reason,
        nowIso
      );
    }
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }

  // 5. Evidence-grounded Content Gap Briefs (top 50 opportunities across archetypes)
  const topForBriefs = [...scoredOpportunities].sort((a, b) => b.score - a.score).slice(0, 50);
  const upsertBriefStmt = db.prepare(`
    INSERT INTO content_briefs (
      brief_key, target_url, opportunity_type, primary_keyword, supporting_keywords_json,
      target_intent, recommended_title, meta_description, outline_json, faq_json,
      internal_links_json, evidence_json, estimated_impact_score, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(brief_key) DO UPDATE SET estimated_impact_score = excluded.estimated_impact_score, updated_at = excluded.updated_at
  `);

  db.exec('BEGIN');
  try {
    for (const opp of topForBriefs) {
      const cl = classifyKeyword(opp.primaryKeyword);
      if (!cl) continue;
      const clusterRow = db
        .prepare('SELECT sample_keywords_json FROM clusters WHERE cluster_key = ?')
        .get(cl.clusterKey) as { sample_keywords_json: string } | undefined;
      const supporting = clusterRow ? (JSON.parse(clusterRow.sample_keywords_json) as string[]) : [opp.primaryKeyword];
      const brief = generateContentBrief({
        targetUrl: opp.pageUrl,
        opportunityType: opp.opportunityType,
        primaryKeyword: opp.primaryKeyword,
        supportingKeywords: supporting,
        targetIntent: cl.searchIntent,
        estimatedImpactScore: opp.score,
        verifiedJobsCount: opp.inventoryCount,
        verifiedProfilesCount: inventory.publicProfilesCount,
        verifiedCoursesCount: inventory.coursesCount,
        observedGscImpressions: opp.impressions,
        observedGscClicks: opp.clicks,
      });
      briefs.push(brief);
      upsertBriefStmt.run(
        brief.briefKey,
        brief.targetUrl,
        brief.opportunityType,
        brief.primaryKeyword,
        JSON.stringify(brief.supportingKeywords),
        brief.targetIntent,
        brief.recommendedTitle,
        brief.metaDescription,
        JSON.stringify(brief.outline),
        JSON.stringify(brief.faqQuestions),
        JSON.stringify(brief.internalLinks),
        JSON.stringify(brief.evidenceSummary),
        brief.estimatedImpactScore,
        nowIso
      );
    }
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }

  // 6. Sync bounded Page Qualifications, Internal Link Recs, and Content Briefs to Supabase
  let supabaseSync: Record<string, unknown> = { skipped: skipSupabase };
  if (!skipSupabase) {
    const sb = getServerSupabaseClient();
    const qualPayload = Array.from(qualifications.values())
      .slice(0, 600)
      .map((q) => {
        const opp = scoredOpportunities.find((o) => o.pageUrl === q.pageUrl);
        return {
          page_url: q.pageUrl,
          page_type: q.pageType,
          primary_keyword: q.primaryKeyword,
          real_inventory_count: opp?.inventoryCount ?? 0,
          unique_content_score: 75,
          relevance_score: opp?.score ?? 50,
          indexation_score: q.indexationScore,
          cannibalization_target: q.cannibalizationTarget,
          qualification_status: q.qualificationStatus,
          qualification_reason: q.reason,
        };
      });
    const qualRes = await batchUpsertSupabase(sb, 'seo_page_qualification', qualPayload, 'page_url');

    const linksPayload = linkRecs.slice(0, 500).map((l) => ({
      recommendation_key: l.recommendationKey,
      source_page_url: l.sourcePageUrl,
      target_page_url: l.targetPageUrl,
      anchor_text: l.anchorText,
      link_type: l.linkType,
      priority_score: l.priorityScore,
      reason: l.reason,
      status: 'RECOMMENDED',
    }));
    const linkRes = await batchUpsertSupabase(sb, 'seo_internal_link_recommendations', linksPayload, 'recommendation_key');

    const briefsPayload = briefs.map((b) => ({
      brief_key: b.briefKey,
      target_url: b.targetUrl,
      opportunity_type: b.opportunityType,
      primary_keyword: b.primaryKeyword,
      supporting_keywords: b.supportingKeywords,
      outline: b.outline,
      faq_questions: b.faqQuestions,
      internal_links: b.internalLinks,
      evidence_summary: b.evidenceSummary,
      estimated_impact_score: b.estimatedImpactScore,
      status: 'RECOMMENDED',
    }));
    const briefRes = await batchUpsertSupabase(sb, 'seo_content_opportunities', briefsPayload, 'brief_key');

    await sb.from('seo_intelligence_runs').insert({
      run_type: 'DAILY_INTELLIGENCE_CYCLE',
      status: 'COMPLETED',
      completed_at: new Date().toISOString(),
      duration_ms: Date.now() - startTime,
      records_processed: candidateDestinations.size,
      records_inserted: qualRes.succeeded + linkRes.succeeded + briefRes.succeeded,
      summary_metrics: {
        qualifiedPages: qualPayload.filter((q) => q.qualification_status === 'QUALIFIED_FOR_INDEX').length,
        rejectedThinPages: qualPayload.filter((q) => q.qualification_status === 'REJECTED_THIN').length,
        internalLinksRecommended: linkRes.succeeded,
        contentBriefsGenerated: briefRes.succeeded,
      },
    });

    supabaseSync = {
      qualificationsSynced: qualRes.succeeded,
      internalLinksSynced: linkRes.succeeded,
      contentBriefsSynced: briefRes.succeeded,
      errors: [...qualRes.errors, ...linkRes.errors, ...briefRes.errors],
    };
  }

  // 7. Generate Daily & Weekly Actionable Reports (Phase 13)
  const gscTotalStats = db
    .prepare('SELECT COUNT(*) AS row_cnt, COALESCE(SUM(impressions),0) AS imp, COALESCE(SUM(prior_impressions),0) AS prior_imp, COALESCE(SUM(clicks),0) AS clk, COALESCE(SUM(ga4_conversions),0) AS conv FROM gsc_telemetry')
    .get() as { row_cnt: number; imp: number; prior_imp: number; clk: number; conv: number };
  const oppCodeBreakdown = (
    db
      .prepare("SELECT COALESCE(gsc_opportunity_code, 'OTHER') AS code, COUNT(*) AS cnt FROM opportunities GROUP BY code ORDER BY cnt DESC")
      .all() as Array<{ code: string; cnt: number }>
  ).reduce<Record<string, number>>((acc, row) => {
    acc[row.code] = row.cnt;
    return acc;
  }, {});
  const countryTelemetrySummary = db
    .prepare('SELECT country, COALESCE(SUM(impressions),0) AS imp, COALESCE(SUM(clicks),0) AS clk, ROUND(AVG(position), 2) AS avg_pos FROM gsc_telemetry GROUP BY country ORDER BY imp DESC LIMIT 15')
    .all() as Array<{ country: string; imp: number; clk: number; avg_pos: number }>;
  const totalCorpusRows = (db.prepare('SELECT COUNT(*) AS cnt FROM keywords').get() as { cnt: number }).cnt;
  const gscOppList = db
    .prepare('SELECT gsc_opportunity_code, opportunity_type, recommended_destination, priority, opportunity_score, recommended_action FROM opportunities ORDER BY opportunity_score DESC LIMIT 30')
    .all() as Array<{
      gsc_opportunity_code: string;
      opportunity_type: string;
      recommended_destination: string;
      priority: string;
      opportunity_score: number;
      recommended_action: string;
    }>;

  const qualBreakdown = Array.from(qualifications.values()).reduce<Record<string, number>>((acc, q) => {
    acc[q.qualificationStatus] = (acc[q.qualificationStatus] || 0) + 1;
    return acc;
  }, {});

  const sortedOpps = [...scoredOpportunities].sort((a, b) => b.score - a.score);
  const reportsDir = path.resolve(process.cwd(), 'reports');
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

  const dailyJson = {
    generatedAt: new Date().toISOString(),
    warehouseCorpusKeywords: totalCorpusRows,
    liveInventory: {
      totalActiveJobs: inventory.totalActiveJobs,
      remoteJobsCount: inventory.remoteJobsCount,
      fresherJobsCount: inventory.fresherJobsCount,
      internshipJobsCount: inventory.internshipJobsCount,
      govtJobsCount: inventory.govtJobsCount,
      publicProfilesCount: inventory.publicProfilesCount,
      companiesCount: inventory.companiesCount,
      coursesCount: inventory.coursesCount,
      communityGroupsCount: inventory.communityGroupsCount,
      institutionsCatalogCount: inventory.institutionsCatalogCount,
    },
    gscTelemetrySummary: {
      observedGrainRows: gscTotalStats.row_cnt,
      total28dImpressions: gscTotalStats.imp,
      totalPriorImpressions: gscTotalStats.prior_imp,
      total28dClicks: gscTotalStats.clk,
      totalGa4Conversions: gscTotalStats.conv,
      monitoringAlertCountsByCode: oppCodeBreakdown,
      topCountries: countryTelemetrySummary,
    },
    qualificationBreakdown: qualBreakdown,
    topGscActions: gscOppList.slice(0, 15),
    topScoredDestinations: sortedOpps.slice(0, 20),
    thinOrBlockedCount: (qualBreakdown['REJECTED_THIN'] || 0) + (qualBreakdown['NOINDEX_MONITOR'] || 0),
    internalLinksRecommended: linkRecs.length,
    contentBriefsGenerated: briefs.length,
    supabaseSync,
  };

  fs.writeFileSync(path.join(reportsDir, 'DAILY_SEARCH_INTELLIGENCE_REPORT.json'), JSON.stringify(dailyJson, null, 2));
  fs.writeFileSync(
    path.join(reportsDir, 'DAILY_SEARCH_INTELLIGENCE_REPORT.md'),
    [
      '# TalentXcel Daily Search Intelligence Report',
      '',
      `**Generated At:** ${dailyJson.generatedAt}  `,
      `**Warehouse Keyword Corpus:** ${totalCorpusRows.toLocaleString()} normalized records  `,
      `**GSC Telemetry Rows (28d):** ${gscTotalStats.row_cnt.toLocaleString()} | **Impressions:** ${gscTotalStats.imp.toLocaleString()} | **Clicks:** ${gscTotalStats.clk.toLocaleString()}  `,
      '',
      '## Live First-Party Inventory',
      `- Active Jobs: ${inventory.totalActiveJobs.toLocaleString()} (Remote: ${inventory.remoteJobsCount}, Fresher: ${inventory.fresherJobsCount}, Internship: ${inventory.internshipJobsCount}, Govt: ${inventory.govtJobsCount})`,
      `- Public Consented Profiles (aggregate): ${inventory.publicProfilesCount.toLocaleString()}`,
      `- Companies: ${inventory.companiesCount.toLocaleString()} | Verified Courses: ${inventory.coursesCount.toLocaleString()} | Institutions Catalog: ${inventory.institutionsCatalogCount.toLocaleString()}`,
      '',
      '## Page Qualification Governor Summary',
      ...Object.entries(qualBreakdown).map(([k, v]) => `- \`${k}\`: ${v}`),
      '',
      '## Top Empirical GSC Optimization Actions (Codes A–I)',
      ...(gscOppList.length > 0
        ? gscOppList.slice(0, 10).map((o) => `- **[${o.priority} | Code ${o.gsc_opportunity_code || '-'} | Score ${o.opportunity_score}]** ${o.recommended_action}`)
        : ['- No active GSC opportunities above threshold yet (verify GSC sync telemetry).']),
      '',
      '## Top 15 Qualified & Scored Canonical Destinations',
      '| Destination | Primary Keyword | Inventory | Score | Confidence | Status |',
      '|---|---|---|---|---|---|',
      ...sortedOpps.slice(0, 15).map((o) => `| \`${o.pageUrl}\` | ${o.primaryKeyword} | ${o.inventoryCount} | ${o.score} | ${o.confidence} | \`${o.status}\` |`),
    ].join('\n')
  );

  // Weekly Strategic Summary Report
  const weeklyJson = {
    generatedAt: dailyJson.generatedAt,
    topClusters: topClusters.slice(0, 25),
    gscOpportunitiesByCode: gscOppList.reduce<Record<string, number>>((acc, o) => {
      const k = o.gsc_opportunity_code || 'OTHER';
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {}),
    internalLinkRescueCount: linkRecs.filter((l) => l.linkType === 'ORPHAN_RESCUE').length,
    funnelLinkCount: linkRecs.filter((l) => l.linkType === 'CROSS_SURFACE_FUNNEL').length,
    topContentBriefs: briefs.slice(0, 15).map((b) => ({
      briefKey: b.briefKey,
      targetUrl: b.targetUrl,
      opportunityType: b.opportunityType,
      primaryKeyword: b.primaryKeyword,
      estimatedImpactScore: b.estimatedImpactScore,
    })),
    thinPagePreventionStats: {
      rejectedThin: qualBreakdown['REJECTED_THIN'] || 0,
      noindexMonitor: qualBreakdown['NOINDEX_MONITOR'] || 0,
      qualifiedForIndex: qualBreakdown['QUALIFIED_FOR_INDEX'] || 0,
    },
  };

  fs.writeFileSync(path.join(reportsDir, 'WEEKLY_SEARCH_INTELLIGENCE_REPORT.json'), JSON.stringify(weeklyJson, null, 2));
  fs.writeFileSync(
    path.join(reportsDir, 'WEEKLY_SEARCH_INTELLIGENCE_REPORT.md'),
    [
      '# TalentXcel Weekly Search Strategy & Opportunity Report',
      '',
      `**Generated At:** ${weeklyJson.generatedAt}  `,
      `**Orphan Rescues Queued:** ${weeklyJson.internalLinkRescueCount} | **Ecosystem Funnel Links:** ${weeklyJson.funnelLinkCount}  `,
      `**Indexation Discipline:** \`${weeklyJson.thinPagePreventionStats.qualifiedForIndex}\` QUALIFIED_FOR_INDEX vs \`${weeklyJson.thinPagePreventionStats.rejectedThin}\` REJECTED_THIN (zero-inventory doorways blocked).`,
      '',
      '## Top Semantic Demand Clusters',
      ...topClusters.slice(0, 15).map((c) => `- **${c.primary_keyword}** (\`${c.cluster_key}\`, ${c.member_count.toLocaleString()} keywords) -> \`${c.recommended_hub_url}\``),
      '',
      '## Priority Content Briefs Ready for Authoring',
      ...weeklyJson.topContentBriefs.map((b) => `- \`${b.targetUrl}\` (${b.opportunityType}): "${b.primaryKeyword}" — Impact Score ${b.estimatedImpactScore}`),
    ].join('\n')
  );

  db.close();
  return dailyJson;
}

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}` || process.argv[1]?.endsWith('run-intelligence-cycle.ts')) {
  runIntelligenceCycle()
    .then((r) => console.log('Intelligence cycle completed:', JSON.stringify(r.qualificationBreakdown), 'GSC imp:', r.gscTelemetrySummary.total28dImpressions))
    .catch((e) => {
      console.error('Intelligence cycle failed:', e);
      process.exit(1);
    });
}
