// src/lib/seo/demandIntelligence/gscOpportunityDetector.ts
// Detects Google Search Console & GA4 monitoring classes (A through M) from empirical telemetry.

import { classifyKeyword } from './classifier';
import { computeKeywordFingerprint, normalizeKeyword } from './normalizer';
import type { GscDetectedOpportunity, GscMonitoringSummary, GscTelemetryRow, Phase12RegressionAlert } from './types';

function expectedCtrForPosition(pos: number): number {
  if (pos <= 1.5) return 0.28;
  if (pos <= 3) return 0.14;
  if (pos <= 5) return 0.075;
  if (pos <= 10) return 0.032;
  if (pos <= 20) return 0.01;
  return 0.004;
}

function normalizePath(urlOrPath: string): string {
  try {
    if (urlOrPath.startsWith('http')) {
      return new URL(urlOrPath).pathname.replace(/\/+$/, '') || '/';
    }
  } catch {
    // Fallback below
  }
  return (urlOrPath.split('?')[0] || '/').replace(/\/+$/, '') || '/';
}

/**
 * Analyzes real GSC + GA4 observations and identifies Opportunities A–M without inventing numbers.
 * Resilient to partial/incomplete rows (missing prior windows, missing country/device, or NaN fields).
 */
export function detectGscOpportunities(
  rows: GscTelemetryRow[],
  qualifiedPagePaths: Set<string> = new Set()
): GscDetectedOpportunity[] {
  const opportunities: GscDetectedOpportunity[] = [];
  const queryToPages = new Map<string, Set<string>>();
  const queryAgg = new Map<
    string,
    {
      query: string;
      impressions: number;
      priorImpressions: number;
      hasPriorImp: boolean;
      clicks: number;
      weightedPos: number;
      priorWeightedPos: number;
      priorPosImpWeight: number;
      hasPriorPos: boolean;
      ga4Conversions: number;
      country: string;
      topPage: string;
      topPageImp: number;
      mobileImp: number;
      mobileClicks: number;
      mobileWeightedPos: number;
      desktopImp: number;
    }
  >();
  const pageAgg = new Map<
    string,
    {
      impressions: number;
      priorImpressions: number;
      hasPrior: boolean;
      clicks: number;
      weightedPos: number;
      ga4Conversions: number;
      topQuery: string;
      topQueryImp: number;
      country: string;
    }
  >();
  const clusterAgg = new Map<string, { impressions: number; clicks: number; queries: number; topQuery: string; topDest: string }>();

  for (const row of rows || []) {
    if (!row || typeof row.query !== 'string') continue;
    const norm = normalizeKeyword(row.query);
    if (!norm.isValid) continue;
    const key = norm.normalizedKeyword;
    const pagePath = normalizePath(row.pageUrl || '/');
    const imp = Number.isFinite(row.impressions) && row.impressions >= 0 ? row.impressions : 0;
    const clk = Number.isFinite(row.clicks) && row.clicks >= 0 ? row.clicks : 0;
    const pos = Number.isFinite(row.position) && row.position > 0 ? row.position : 50;
    const hasPriorImp = row.priorImpressions !== null && row.priorImpressions !== undefined && Number.isFinite(row.priorImpressions) && row.priorImpressions >= 0;
    const priorImp = hasPriorImp ? Number(row.priorImpressions) : 0;
    const hasPriorPos = row.priorPosition !== null && row.priorPosition !== undefined && Number.isFinite(row.priorPosition) && row.priorPosition > 0;
    const priorPos = hasPriorPos ? Number(row.priorPosition) : 0;
    const gaConv = Number.isFinite(row.ga4Conversions) && Number(row.ga4Conversions) >= 0 ? Number(row.ga4Conversions) : 0;
    const country = (row.country || 'GLB').toUpperCase();
    const device = (row.device || '').toUpperCase();

    if (!queryToPages.has(key)) queryToPages.set(key, new Set());
    queryToPages.get(key)!.add(pagePath);

    const existing = queryAgg.get(key);
    if (!existing) {
      queryAgg.set(key, {
        query: row.query,
        impressions: imp,
        priorImpressions: priorImp,
        hasPriorImp,
        clicks: clk,
        weightedPos: pos * Math.max(1, imp),
        priorWeightedPos: hasPriorPos ? priorPos * Math.max(1, priorImp || imp) : 0,
        priorPosImpWeight: hasPriorPos ? Math.max(1, priorImp || imp) : 0,
        hasPriorPos,
        ga4Conversions: gaConv,
        country,
        topPage: pagePath,
        topPageImp: imp,
        mobileImp: device === 'MOBILE' ? imp : 0,
        mobileClicks: device === 'MOBILE' ? clk : 0,
        mobileWeightedPos: device === 'MOBILE' ? pos * Math.max(1, imp) : 0,
        desktopImp: device === 'DESKTOP' ? imp : 0,
      });
    } else {
      existing.impressions += imp;
      if (hasPriorImp) {
        existing.priorImpressions += priorImp;
        existing.hasPriorImp = true;
      }
      existing.clicks += clk;
      existing.weightedPos += pos * Math.max(1, imp);
      if (hasPriorPos) {
        const pw = Math.max(1, priorImp || imp);
        existing.priorWeightedPos += priorPos * pw;
        existing.priorPosImpWeight += pw;
        existing.hasPriorPos = true;
      }
      existing.ga4Conversions += gaConv;
      if (device === 'MOBILE') {
        existing.mobileImp += imp;
        existing.mobileClicks += clk;
        existing.mobileWeightedPos += pos * Math.max(1, imp);
      } else if (device === 'DESKTOP') {
        existing.desktopImp += imp;
      }
      if (imp > existing.topPageImp) {
        existing.topPage = pagePath;
        existing.topPageImp = imp;
        existing.country = country || existing.country;
      }
    }

    const pCur = pageAgg.get(pagePath);
    if (!pCur) {
      pageAgg.set(pagePath, {
        impressions: imp,
        priorImpressions: priorImp,
        hasPrior: hasPriorImp,
        clicks: clk,
        weightedPos: pos * Math.max(1, imp),
        ga4Conversions: gaConv,
        topQuery: norm.normalizedKeyword,
        topQueryImp: imp,
        country,
      });
    } else {
      pCur.impressions += imp;
      if (hasPriorImp) {
        pCur.priorImpressions += priorImp;
        pCur.hasPrior = true;
      }
      pCur.clicks += clk;
      pCur.weightedPos += pos * Math.max(1, imp);
      pCur.ga4Conversions += gaConv;
      if (imp > pCur.topQueryImp) {
        pCur.topQuery = norm.normalizedKeyword;
        pCur.topQueryImp = imp;
        pCur.country = country || pCur.country;
      }
    }
  }

  for (const [normQuery, agg] of queryAgg.entries()) {
    const avgPos = agg.weightedPos / Math.max(1, agg.impressions);
    const ctr = agg.impressions > 0 ? agg.clicks / agg.impressions : 0;
    const classified = classifyKeyword(normQuery, { source: 'gsc_api', sourceType: 'VERIFIED_GSC' });
    const recommendedDest = classified?.recommendedDestination || '/jobs';
    const clusterKey = classified?.clusterKey || `unclustered|${normQuery}`;
    const hashPrefix = computeKeywordFingerprint(normQuery).slice(0, 12);

    // Aggregate for Cluster G check
    const cAgg = clusterAgg.get(clusterKey) || { impressions: 0, clicks: 0, queries: 0, topQuery: normQuery, topDest: recommendedDest };
    cAgg.impressions += agg.impressions;
    cAgg.clicks += agg.clicks;
    cAgg.queries += 1;
    clusterAgg.set(clusterKey, cAgg);

    // A: High impressions, low CTR
    const benchmarkCtr = expectedCtrForPosition(avgPos);
    if (agg.impressions >= 40 && avgPos <= 12 && ctr < benchmarkCtr * 0.5) {
      opportunities.push({
        opportunityKey: `gsc-A-${hashPrefix}`,
        code: 'A',
        codeLabel: 'HIGH_IMPRESSIONS_LOW_CTR',
        query: agg.query,
        normalizedQuery: normQuery,
        pageUrl: agg.topPage,
        recommendedDestination: recommendedDest,
        country: agg.country,
        impressions: agg.impressions,
        clicks: agg.clicks,
        ctr,
        position: Math.round(avgPos * 100) / 100,
        ga4Conversions: agg.ga4Conversions,
        priority: agg.impressions >= 200 ? 'P0' : 'P1',
        severityScore: Math.min(98, Math.round(65 + Math.log10(agg.impressions) * 12)),
        recommendedAction: `Rewrite <title> and meta description on ${agg.topPage} targeting "${normQuery}" (pos ${avgPos.toFixed(1)}, CTR ${(ctr * 100).toFixed(2)}% vs expected ${(benchmarkCtr * 100).toFixed(1)}%).`,
        evidence: { avgPos, ctr, benchmarkCtr, impressions: agg.impressions, clicks: agg.clicks },
      });
    }

    // B: Strike-zone positions 4–20
    if (agg.impressions >= 15 && avgPos >= 4 && avgPos <= 20) {
      opportunities.push({
        opportunityKey: `gsc-B-${hashPrefix}`,
        code: 'B',
        codeLabel: 'STRIKE_ZONE_POSITION_4_TO_20',
        query: agg.query,
        normalizedQuery: normQuery,
        pageUrl: agg.topPage,
        recommendedDestination: recommendedDest,
        country: agg.country,
        impressions: agg.impressions,
        clicks: agg.clicks,
        ctr,
        position: Math.round(avgPos * 100) / 100,
        ga4Conversions: agg.ga4Conversions,
        priority: avgPos <= 10 ? 'P0' : 'P1',
        severityScore: Math.min(95, Math.round(60 + (20 - avgPos) * 1.5 + Math.log10(agg.impressions + 1) * 5)),
        recommendedAction: `Boost internal links, add FAQ & structured data, and deepen entity copy on ${agg.topPage} to move "${normQuery}" from pos ${avgPos.toFixed(1)} to top 3.`,
        evidence: { avgPos, impressions: agg.impressions, clicks: agg.clicks },
      });
    }

    // C: Suboptimal / mismatched landing page
    if (
      agg.impressions >= 20 &&
      recommendedDest !== '/jobs' &&
      agg.topPage !== recommendedDest &&
      !agg.topPage.startsWith(recommendedDest)
    ) {
      opportunities.push({
        opportunityKey: `gsc-C-${hashPrefix}`,
        code: 'C',
        codeLabel: 'MISMATCHED_LANDING_PAGE',
        query: agg.query,
        normalizedQuery: normQuery,
        pageUrl: agg.topPage,
        recommendedDestination: recommendedDest,
        country: agg.country,
        impressions: agg.impressions,
        clicks: agg.clicks,
        ctr,
        position: Math.round(avgPos * 100) / 100,
        ga4Conversions: agg.ga4Conversions,
        priority: 'P1',
        severityScore: Math.min(90, Math.round(58 + Math.log10(agg.impressions) * 11)),
        recommendedAction: `Align internal links and canonical focus toward ${recommendedDest} instead of ranking mismatch ${agg.topPage}.`,
        evidence: { actualPage: agg.topPage, expectedCanonical: recommendedDest, impressions: agg.impressions },
      });
    }

    // D: Emerging / Rising or New query surge (requires known prior window so incomplete null priors never false-trigger)
    if (
      agg.hasPriorImp &&
      ((agg.priorImpressions > 0 && agg.impressions >= agg.priorImpressions * 1.5 && agg.impressions - agg.priorImpressions >= 25) ||
        (agg.priorImpressions === 0 && agg.impressions >= 20))
    ) {
      const isNew = agg.priorImpressions === 0;
      opportunities.push({
        opportunityKey: `gsc-D-${hashPrefix}`,
        code: 'D',
        codeLabel: isNew ? 'NEW_EMERGING_QUERY' : 'EMERGING_RISING_QUERY',
        query: agg.query,
        normalizedQuery: normQuery,
        pageUrl: agg.topPage,
        recommendedDestination: recommendedDest,
        country: agg.country,
        impressions: agg.impressions,
        clicks: agg.clicks,
        ctr,
        position: Math.round(avgPos * 100) / 100,
        ga4Conversions: agg.ga4Conversions,
        priority: 'P0',
        severityScore: isNew ? 88 : 86,
        recommendedAction: isNew
          ? `New emerging query "${normQuery}" appeared with ${agg.impressions} impressions (pos ${avgPos.toFixed(1)}); validate snippet alignment on ${agg.topPage}.`
          : `Accelerate content freshness and internal linking for rising query "${normQuery}" (+${agg.impressions - agg.priorImpressions} impressions).`,
        evidence: { currentImpressions: agg.impressions, priorImpressions: agg.priorImpressions, isNewQuery: isNew },
      });
    }

    // J: Declining query alert (>=30% impression drop vs prior known window)
    if (
      agg.hasPriorImp &&
      agg.priorImpressions >= 20 &&
      agg.impressions <= agg.priorImpressions * 0.7 &&
      agg.priorImpressions - agg.impressions >= 15
    ) {
      const dropPct = Math.round(((agg.priorImpressions - agg.impressions) / agg.priorImpressions) * 100);
      opportunities.push({
        opportunityKey: `gsc-J-${hashPrefix}`,
        code: 'J',
        codeLabel: 'DECLINING_QUERY_ALERT',
        query: agg.query,
        normalizedQuery: normQuery,
        pageUrl: agg.topPage,
        recommendedDestination: recommendedDest,
        country: agg.country,
        impressions: agg.impressions,
        clicks: agg.clicks,
        ctr,
        position: Math.round(avgPos * 100) / 100,
        ga4Conversions: agg.ga4Conversions,
        priority: agg.priorImpressions >= 100 ? 'P0' : 'P1',
        severityScore: Math.min(94, Math.round(68 + dropPct * 0.25)),
        recommendedAction: `Investigate impression drop for "${normQuery}" (${agg.priorImpressions} -> ${agg.impressions}, -${dropPct}%) and inspect robots/canonical/indexation on ${agg.topPage}.`,
        evidence: { currentImpressions: agg.impressions, priorImpressions: agg.priorImpressions, dropPct },
      });
    }

    // K: Significant position movement alert (drop >=3 pos or climb >=4 pos into top 15)
    if (agg.hasPriorPos && agg.impressions >= 20 && agg.priorPosImpWeight > 0) {
      const priorAvgPos = agg.priorWeightedPos / agg.priorPosImpWeight;
      const posDelta = avgPos - priorAvgPos; // + = dropped in rank, - = improved in rank
      if (posDelta >= 3 || (posDelta <= -4 && avgPos <= 15)) {
        const direction = posDelta >= 3 ? 'DROPPED' : 'IMPROVED';
        opportunities.push({
          opportunityKey: `gsc-K-${hashPrefix}`,
          code: 'K',
          codeLabel: 'POSITION_MOVEMENT_ALERT',
          query: agg.query,
          normalizedQuery: normQuery,
          pageUrl: agg.topPage,
          recommendedDestination: recommendedDest,
          country: agg.country,
          impressions: agg.impressions,
          clicks: agg.clicks,
          ctr,
          position: Math.round(avgPos * 100) / 100,
          ga4Conversions: agg.ga4Conversions,
          priority: direction === 'DROPPED' ? 'P0' : 'P1',
          severityScore: Math.min(93, Math.round(64 + Math.min(25, Math.abs(posDelta) * 2.5))),
          recommendedAction:
            direction === 'DROPPED'
              ? `Ranking slipped for "${normQuery}" (${priorAvgPos.toFixed(1)} -> ${avgPos.toFixed(1)}); audit SERP competitors, internal links, and page freshness on ${agg.topPage}.`
              : `Breakout ranking gain for "${normQuery}" (${priorAvgPos.toFixed(1)} -> ${avgPos.toFixed(1)}); sharpen mobile/SERP snippet on ${agg.topPage} to capture clicks.`,
          evidence: { priorAvgPos: Number(priorAvgPos.toFixed(2)), avgPos: Number(avgPos.toFixed(2)), posDelta: Number(posDelta.toFixed(2)), direction },
        });
      }
    }

    // L: Mobile search opportunity
    if (agg.mobileImp >= 20) {
      const mobilePos = agg.mobileWeightedPos / agg.mobileImp;
      const mobileCtr = agg.mobileClicks / agg.mobileImp;
      const mobileExp = expectedCtrForPosition(mobilePos);
      if (mobilePos <= 15 && (mobileCtr < mobileExp * 0.65 || agg.mobileImp >= agg.desktopImp * 1.5)) {
        opportunities.push({
          opportunityKey: `gsc-L-${hashPrefix}`,
          code: 'L',
          codeLabel: 'MOBILE_OPPORTUNITY',
          query: agg.query,
          normalizedQuery: normQuery,
          pageUrl: agg.topPage,
          recommendedDestination: recommendedDest,
          country: agg.country,
          impressions: agg.mobileImp,
          clicks: agg.mobileClicks,
          ctr: mobileCtr,
          position: Math.round(mobilePos * 100) / 100,
          ga4Conversions: agg.ga4Conversions,
          priority: mobilePos <= 8 && mobileCtr < mobileExp * 0.5 ? 'P0' : 'P1',
          severityScore: Math.min(91, Math.round(62 + Math.log10(agg.mobileImp + 1) * 10)),
          recommendedAction: `Mobile-first query "${normQuery}" (${agg.mobileImp} mobile imp, pos ${mobilePos.toFixed(1)}, CTR ${(mobileCtr * 100).toFixed(2)}%): tighten <=58-char title and employer/location clarity on ${agg.topPage}.`,
          evidence: { mobileImp: agg.mobileImp, desktopImp: agg.desktopImp, mobilePos: Number(mobilePos.toFixed(2)), mobileCtr: Number(mobileCtr.toFixed(4)) },
        });
      }
    }

    // E: International / non-IN geographic demand signal
    if (agg.country && agg.country !== 'IND' && agg.country !== 'IN' && agg.country !== 'GLB' && agg.impressions >= 25) {
      opportunities.push({
        opportunityKey: `gsc-E-${hashPrefix}-${agg.country}`,
        code: 'E',
        codeLabel: 'GEOGRAPHIC_DEMAND_SURGE',
        query: agg.query,
        normalizedQuery: normQuery,
        pageUrl: agg.topPage,
        recommendedDestination: recommendedDest,
        country: agg.country,
        impressions: agg.impressions,
        clicks: agg.clicks,
        ctr,
        position: Math.round(avgPos * 100) / 100,
        ga4Conversions: agg.ga4Conversions,
        priority: 'P1',
        severityScore: Math.min(88, Math.round(55 + Math.log10(agg.impressions) * 10)),
        recommendedAction: `Ensure localized currency, salary context, and job inventory for ${agg.country} demand on "${normQuery}".`,
        evidence: { country: agg.country, impressions: agg.impressions },
      });
    }

    // F: Keyword Cannibalization across multiple URLs
    const competingUrls = Array.from(queryToPages.get(normQuery) || []);
    if (competingUrls.length > 1 && agg.impressions >= 20) {
      opportunities.push({
        opportunityKey: `gsc-F-${hashPrefix}`,
        code: 'F',
        codeLabel: 'KEYWORD_CANNIBALIZATION',
        query: agg.query,
        normalizedQuery: normQuery,
        pageUrl: agg.topPage,
        recommendedDestination: recommendedDest,
        country: agg.country,
        impressions: agg.impressions,
        clicks: agg.clicks,
        ctr,
        position: Math.round(avgPos * 100) / 100,
        ga4Conversions: agg.ga4Conversions,
        priority: 'P1',
        severityScore: Math.min(92, 62 + competingUrls.length * 6),
        recommendedAction: `Consolidate ${competingUrls.length} competing URLs (${competingUrls.slice(0, 3).join(', ')}) onto canonical ${recommendedDest}.`,
        evidence: { competingUrls, impressions: agg.impressions },
      });
    }

    // H: Missing qualified destination page
    if (
      agg.impressions >= 20 &&
      qualifiedPagePaths.size > 0 &&
      !qualifiedPagePaths.has(recommendedDest)
    ) {
      opportunities.push({
        opportunityKey: `gsc-H-${hashPrefix}`,
        code: 'H',
        codeLabel: 'MISSING_PAGE_OPPORTUNITY',
        query: agg.query,
        normalizedQuery: normQuery,
        pageUrl: agg.topPage,
        recommendedDestination: recommendedDest,
        country: agg.country,
        impressions: agg.impressions,
        clicks: agg.clicks,
        ctr,
        position: Math.round(avgPos * 100) / 100,
        ga4Conversions: agg.ga4Conversions,
        priority: 'P1',
        severityScore: Math.min(89, Math.round(58 + Math.log10(agg.impressions) * 10)),
        recommendedAction: `Evaluate inventory and qualify dedicated canonical landing page ${recommendedDest} for observed demand "${normQuery}".`,
        evidence: { recommendedDestination: recommendedDest, impressions: agg.impressions },
      });
    }

    // I: High-converting query (GA4 linked)
    if (agg.ga4Conversions >= 1) {
      opportunities.push({
        opportunityKey: `gsc-I-${hashPrefix}`,
        code: 'I',
        codeLabel: 'HIGH_CONVERTING_QUERY',
        query: agg.query,
        normalizedQuery: normQuery,
        pageUrl: agg.topPage,
        recommendedDestination: recommendedDest,
        country: agg.country,
        impressions: agg.impressions,
        clicks: agg.clicks,
        ctr,
        position: Math.round(avgPos * 100) / 100,
        ga4Conversions: agg.ga4Conversions,
        priority: 'P0',
        severityScore: Math.min(99, 75 + agg.ga4Conversions * 3),
        recommendedAction: `Scale cluster and protect rankings for proven converting query "${normQuery}" (${agg.ga4Conversions} GA4 conversions).`,
        evidence: { ga4Conversions: agg.ga4Conversions, clicks: agg.clicks, avgPos },
      });
    }
  }

  // G: Underperforming keyword clusters (high cluster impressions, < 1.5% aggregate CTR)
  for (const [clusterKey, cAgg] of clusterAgg.entries()) {
    const clusterCtr = cAgg.impressions > 0 ? cAgg.clicks / cAgg.impressions : 0;
    if (cAgg.impressions >= 150 && clusterCtr < 0.015) {
      const hashPrefix = computeKeywordFingerprint(clusterKey).slice(0, 12);
      opportunities.push({
        opportunityKey: `gsc-G-${hashPrefix}`,
        code: 'G',
        codeLabel: 'UNDERPERFORMING_CLUSTER',
        query: cAgg.topQuery,
        normalizedQuery: cAgg.topQuery,
        pageUrl: cAgg.topDest,
        recommendedDestination: cAgg.topDest,
        country: 'GLB',
        impressions: cAgg.impressions,
        clicks: cAgg.clicks,
        ctr: clusterCtr,
        position: 0,
        ga4Conversions: 0,
        priority: 'P1',
        severityScore: 84,
        recommendedAction: `Audit cluster hub ${cAgg.topDest} across ${cAgg.queries} observed queries (${cAgg.impressions} impressions, ${(clusterCtr * 100).toFixed(2)}% CTR).`,
        evidence: { clusterKey, queries: cAgg.queries, impressions: cAgg.impressions, clicks: cAgg.clicks },
      });
    }
  }

  // M: Pages gaining significant impressions across their query footprint
  for (const [pagePath, pAgg] of pageAgg.entries()) {
    if (
      pAgg.hasPrior &&
      pAgg.priorImpressions > 0 &&
      pAgg.impressions >= 30 &&
      pAgg.impressions >= pAgg.priorImpressions * 1.35 &&
      pAgg.impressions - pAgg.priorImpressions >= 20
    ) {
      const hashPrefix = computeKeywordFingerprint(pagePath).slice(0, 12);
      const pAvgPos = pAgg.weightedPos / Math.max(1, pAgg.impressions);
      const pCtr = pAgg.impressions > 0 ? pAgg.clicks / pAgg.impressions : 0;
      const growthPct = Math.round(((pAgg.impressions - pAgg.priorImpressions) / pAgg.priorImpressions) * 100);
      opportunities.push({
        opportunityKey: `gsc-M-${hashPrefix}`,
        code: 'M',
        codeLabel: 'PAGE_GAINING_IMPRESSIONS',
        query: pAgg.topQuery,
        normalizedQuery: pAgg.topQuery,
        pageUrl: pagePath,
        recommendedDestination: pagePath,
        country: pAgg.country,
        impressions: pAgg.impressions,
        clicks: pAgg.clicks,
        ctr: pCtr,
        position: Math.round(pAvgPos * 100) / 100,
        ga4Conversions: pAgg.ga4Conversions,
        priority: pAgg.impressions >= 150 ? 'P0' : 'P1',
        severityScore: Math.min(92, Math.round(66 + Math.min(24, growthPct * 0.15))),
        recommendedAction: `Page ${pagePath} is gaining visibility (+${growthPct}% impressions: ${pAgg.priorImpressions} -> ${pAgg.impressions}, top query "${pAgg.topQuery}"); add contextual internal links and expand FAQs.`,
        evidence: { pagePath, currentImpressions: pAgg.impressions, priorImpressions: pAgg.priorImpressions, growthPct },
      });
    }
  }

  return opportunities.sort((a, b) => b.severityScore - a.severityScore);
}

/**
 * Generates a bounded summary snapshot from GSC rows and detected opportunities for scheduled monitoring.
 */
export function summarizeGscMonitoring(
  rows: GscTelemetryRow[],
  opportunities: GscDetectedOpportunity[]
): GscMonitoringSummary {
  let incompleteRowsHandled = 0;
  for (const r of rows || []) {
    if (
      !r ||
      r.priorImpressions === null ||
      r.priorImpressions === undefined ||
      !Number.isFinite(r.impressions) ||
      !r.country ||
      !r.device
    ) {
      incompleteRowsHandled += 1;
    }
  }
  const byCode: Record<string, number> = {};
  for (const o of opportunities) {
    byCode[o.code] = (byCode[o.code] || 0) + 1;
  }
  return {
    rowsEvaluated: (rows || []).length,
    incompleteRowsHandled,
    byCode,
    emergingOrNewQueries: byCode['D'] || 0,
    decliningQueries: byCode['J'] || 0,
    ctrOpportunities: byCode['A'] || 0,
    cannibalizationAlerts: byCode['F'] || 0,
    countryOpportunities: byCode['E'] || 0,
    positionMovements: byCode['K'] || 0,
    mobileOpportunities: byCode['L'] || 0,
    pagesGainingImpressions: byCode['M'] || 0,
  };
}

export interface Phase12AuditInput {
  ssrProbes: Array<{
    url: string;
    status: number;
    robots: string;
    canonical: string;
    redirectLocation?: string | null;
    isQualified?: boolean;
    clientNoindex?: boolean;
  }>;
  sitemapProbes: Array<{
    url: string;
    status: number;
    contentType: string;
    bodyHead: string;
    expectedRetired?: boolean;
  }>;
  gscRows?: GscTelemetryRow[];
  ga4OrganicSnapshot?: {
    sessions28d: number;
    signUpCount28d: number;
    applicationSubmittedCount28d: number;
    seoLandingViewsPerUser?: number;
  };
}

/**
 * Bounded Phase 12 regression detector: catches unexpected noindex on qualified hubs,
 * SSR/client parity mismatches, sitemap XML/SPA fallthroughs, redirect loops,
 * high-impression declining-click pages, and GA4 conversion telemetry regressions.
 */
export function detectPhase12Regressions(input: Phase12AuditInput): Phase12RegressionAlert[] {
  const alerts: Phase12RegressionAlert[] = [];

  for (const probe of input.ssrProbes || []) {
    if (probe.status === 404 || probe.status >= 500) {
      alerts.push({
        alertKey: `missing-${probe.url}`,
        category: 'MISSING_DESTINATION_PAGE',
        severity: 'CRITICAL',
        target: probe.url,
        detail: `Expected live destination returned HTTP ${probe.status}.`,
      });
      continue;
    }
    if (probe.redirectLocation && probe.redirectLocation === probe.url) {
      alerts.push({
        alertKey: `loop-${probe.url}`,
        category: 'REDIRECT_LOOP_OR_CHAIN',
        severity: 'CRITICAL',
        target: probe.url,
        detail: `Self-redirect loop detected -> ${probe.redirectLocation}.`,
      });
    }
    if (probe.isQualified && probe.status === 200 && probe.robots.includes('noindex')) {
      alerts.push({
        alertKey: `noindex-qual-${probe.url}`,
        category: 'UNEXPECTED_NOINDEX_ON_QUALIFIED',
        severity: 'CRITICAL',
        target: probe.url,
        detail: `Qualified page emitted "${probe.robots}" instead of "index, follow".`,
      });
    }
    if (typeof probe.clientNoindex === 'boolean' && probe.status === 200) {
      const ssrNoindex = probe.robots.includes('noindex');
      if (ssrNoindex !== probe.clientNoindex) {
        alerts.push({
          alertKey: `parity-${probe.url}`,
          category: 'SSR_CLIENT_PARITY_MISMATCH',
          severity: 'HIGH',
          target: probe.url,
          detail: `SSR robots (${probe.robots}) disagrees with client noindex=${probe.clientNoindex}.`,
        });
      }
    }
    if (probe.status === 200 && probe.canonical && !probe.canonical.startsWith('https://')) {
      alerts.push({
        alertKey: `canon-${probe.url}`,
        category: 'CANONICAL_CONFLICT',
        severity: 'HIGH',
        target: probe.url,
        detail: `Non-HTTPS or malformed canonical "${probe.canonical}".`,
      });
    }
  }

  for (const sm of input.sitemapProbes || []) {
    const trimmed = (sm.bodyHead || '').trim();
    if (sm.expectedRetired) {
      if (sm.status === 200 && /<!doctype html/i.test(trimmed)) {
        alerts.push({
          alertKey: `spa-fallthrough-${sm.url}`,
          category: 'INVALID_SPA_FALLTHROUGH',
          severity: 'CRITICAL',
          target: sm.url,
          detail: `Retired sitemap ${sm.url} fell through to SPA HTML instead of HTTP 410/404.`,
        });
      }
      continue;
    }
    if (sm.status !== 200) {
      alerts.push({
        alertKey: `sm-http-${sm.url}`,
        category: 'SITEMAP_HTTP_OR_XML_FAILURE',
        severity: 'CRITICAL',
        target: sm.url,
        detail: `Sitemap returned HTTP ${sm.status}.`,
      });
    } else if (/<!doctype html/i.test(trimmed) || !/<(urlset|sitemapindex)\b/i.test(trimmed)) {
      alerts.push({
        alertKey: `sm-xml-${sm.url}`,
        category: 'SITEMAP_HTTP_OR_XML_FAILURE',
        severity: 'CRITICAL',
        target: sm.url,
        detail: `Sitemap returned non-XML or SPA HTML payload (contentType=${sm.contentType}).`,
      });
    }
  }

  // High-impression pages with declining impressions/clicks
  for (const r of input.gscRows || []) {
    const priorImp = r.priorImpressions ?? null;
    const priorClk = r.priorClicks ?? null;
    if (
      priorImp !== null &&
      r.impressions >= 100 &&
      ((priorClk !== null && priorClk >= 5 && r.clicks <= priorClk * 0.5) ||
        (priorImp >= 100 && r.impressions <= priorImp * 0.6))
    ) {
      alerts.push({
        alertKey: `decline-${r.pageUrl}-${r.query}`,
        category: 'HIGH_IMP_DECLINING_CLICKS',
        severity: 'HIGH',
        target: r.pageUrl,
        detail: `Query "${r.query}" slipped (imp ${priorImp}->${r.impressions}, clicks ${priorClk ?? '?'}->${r.clicks}).`,
      });
    }
  }

  if (input.ga4OrganicSnapshot) {
    const { sessions28d, signUpCount28d, applicationSubmittedCount28d, seoLandingViewsPerUser } = input.ga4OrganicSnapshot;
    if (sessions28d >= 200 && (signUpCount28d === 0 || applicationSubmittedCount28d === 0)) {
      alerts.push({
        alertKey: 'ga4-conv-drop',
        category: 'CONVERSION_TELEMETRY_REGRESSION',
        severity: 'CRITICAL',
        target: 'GA4 properties/499367883',
        detail: `Organic sessions=${sessions28d}, but sign_up=${signUpCount28d}, application_submitted=${applicationSubmittedCount28d}.`,
      });
    }
    if (seoLandingViewsPerUser && seoLandingViewsPerUser > 25) {
      alerts.push({
        alertKey: 'ga4-dup-seo-view',
        category: 'CONVERSION_TELEMETRY_REGRESSION',
        severity: 'MEDIUM',
        target: 'SEOHead.tsx seo_landing_view',
        detail: `Duplicate event inflation detected (${seoLandingViewsPerUser.toFixed(1)} seo_landing_view/user).`,
      });
    }
  }

  return alerts;
}
