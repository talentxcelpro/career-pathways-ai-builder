// src/lib/seo/demandIntelligence/internalLinkRecommender.ts
// Graph-based internal linking recommendation engine: rescues orphan/weakly linked qualified pages,
// pairs hub-to-spoke clusters with natural varied anchor texts, and enforces strict outbound limits.

import { computeKeywordFingerprint } from './normalizer';
import type { InternalLinkRecommendation, PageQualificationResult } from './types';

export interface LinkGraphNodeInput {
  pageUrl: string;
  pageType: string;
  primaryKeyword: string;
  clusterKey: string;
  existingInboundLinks?: number;
  existingOutboundLinks?: number;
  opportunityScore: number;
}

const ANCHOR_VARIANTS: Array<(kw: string, pageUrl: string) => string> = [
  (kw) => kw,
  (kw) => `explore ${kw}`,
  (kw, url) => `${kw} (${url.split('/').filter(Boolean).slice(-1)[0]?.replace(/-/g, ' ') || 'hub'})`,
  (kw) => `browse verified ${kw}`,
  (kw) => `latest ${kw} insights`,
];

const MAX_NEW_OUTBOUND_PER_SOURCE = 8;

function resolveParentHubUrl(node: LinkGraphNodeInput): string {
  const parts = node.pageUrl.split('/').filter(Boolean);
  if (parts[0] === 'jobs' && parts.length >= 2) return '/jobs';
  if (parts[0] === 'salary' && parts.length >= 2) return '/salary';
  if (parts[0] === 'network' && parts.length >= 2) return '/network';
  if (parts[0] === 'learning' && parts.length >= 2) return '/learning';
  if (parts[0] === 'career-map' && parts.length >= 2) return '/career-insights';
  if (parts[0] === 'colleges' && parts.length >= 2) return '/colleges';
  return '/jobs';
}

function resolveFunnelConversionTarget(pageType: string): string {
  if (pageType.includes('salary') || pageType.includes('career') || pageType.includes('interview')) {
    return '/resume/ats-check';
  }
  if (pageType.includes('skill') || pageType.includes('college') || pageType.includes('learning')) {
    return '/talent-score';
  }
  if (pageType.includes('job') || pageType.includes('fresher') || pageType.includes('internship')) {
    return '/passport';
  }
  return '/resume/ats-check';
}

/**
 * Generates deduplicated, natural-anchor internal link recommendations respecting anchor variety
 * and per-source outbound link budgets.
 */
export function generateInternalLinkRecommendations(
  nodes: LinkGraphNodeInput[],
  qualifications: Map<string, PageQualificationResult>
): InternalLinkRecommendation[] {
  const recs: InternalLinkRecommendation[] = [];
  const seenPairs = new Set<string>();
  const sourceBudgetUsed = new Map<string, number>();

  const qualifiedNodes = nodes.filter((n) => {
    const q = qualifications.get(n.pageUrl);
    return !q || q.qualificationStatus === 'QUALIFIED_FOR_INDEX' || q.qualificationStatus === 'PUBLISHED';
  });

  const sortedByOpp = [...qualifiedNodes].sort((a, b) => b.opportunityScore - a.opportunityScore);

  const tryPush = (
    sourceUrl: string,
    targetUrl: string,
    anchorText: string,
    linkType: InternalLinkRecommendation['linkType'],
    priorityScore: number,
    reason: string
  ) => {
    if (!sourceUrl || !targetUrl || sourceUrl === targetUrl) return;
    const pairKey = `${sourceUrl}->${targetUrl}`;
    if (seenPairs.has(pairKey)) return;

    const currentOutbound = sourceBudgetUsed.get(sourceUrl) ?? 0;
    if (currentOutbound >= MAX_NEW_OUTBOUND_PER_SOURCE) return;

    seenPairs.add(pairKey);
    sourceBudgetUsed.set(sourceUrl, currentOutbound + 1);

    const hash = computeKeywordFingerprint(pairKey).slice(0, 14);
    recs.push({
      recommendationKey: `lnk-${hash}`,
      sourcePageUrl: sourceUrl,
      targetPageUrl: targetUrl,
      anchorText,
      linkType,
      priorityScore: Math.round(priorityScore * 100) / 100,
      reason,
    });
  };

  sortedByOpp.forEach((node, idx) => {
    const parentHub = resolveParentHubUrl(node);
    const variantFn = ANCHOR_VARIANTS[idx % ANCHOR_VARIANTS.length];
    const variedAnchor = variantFn(node.primaryKeyword, node.pageUrl);

    // 1. Orphan or weakly connected page rescue (< 3 inbound links)
    if ((node.existingInboundLinks ?? 0) < 3) {
      tryPush(
        parentHub,
        node.pageUrl,
        variedAnchor,
        'ORPHAN_RESCUE',
        Math.min(99, node.opportunityScore + 10),
        `Target page has low inbound links (${node.existingInboundLinks ?? 0} < 3); connect from parent hub ${parentHub}.`
      );
    }

    // 2. Hub <-> Spoke reinforcement
    if (parentHub !== node.pageUrl) {
      tryPush(
        node.pageUrl,
        parentHub,
        `all ${parentHub.replace('/', '').replace(/-/g, ' ') || 'career'} opportunities`,
        'SPOKE_TO_HUB',
        node.opportunityScore * 0.85,
        `Consolidates topical cluster authority back to canonical parent hub ${parentHub}.`
      );
    }

    // 3. Cross-surface ecosystem funnel (Jobs/Guides -> ATS Check, TalentScore, Career Passport)
    const funnelTarget = resolveFunnelConversionTarget(node.pageType);
    if (funnelTarget !== node.pageUrl) {
      const funnelAnchor =
        funnelTarget === '/resume/ats-check'
          ? 'check your resume ATS compatibility score'
          : funnelTarget === '/talent-score'
            ? 'measure your verified TalentScore'
            : 'build a verified Career Passport';
      tryPush(
        node.pageUrl,
        funnelTarget,
        funnelAnchor,
        'CROSS_SURFACE_FUNNEL',
        Math.min(95, node.opportunityScore + 5),
        `Drives organic traffic from ${node.pageUrl} into high-converting TalentXcel product surface ${funnelTarget}.`
      );
    }
  });

  return recs.sort((a, b) => b.priorityScore - a.priorityScore);
}
