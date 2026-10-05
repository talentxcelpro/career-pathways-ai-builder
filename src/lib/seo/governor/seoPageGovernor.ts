// src/lib/seo/governor/seoPageGovernor.ts
/**
 * TalentXcel SEO 2.0 Page Governor Engine
 *
 * Implements the mathematical formula:
 * Score = (W_demand * S_demand) + (W_inventory * S_inventory) + (W_unique * S_unique) +
 *         (W_intent * S_intent) + (W_links * S_links) + (W_freshness * S_freshness)
 *
 * Weights:
 * - Search demand: 25% (Monthly searches, GSC impressions, query trend signals)
 * - Real inventory/data: 25% (Active vacancies >= 3, verified dataset rows, verified salary points)
 * - Unique content: 20% (Original data, unique curriculum, distinct percentiles; zero boilerplate)
 * - Commercial intent: 15% ("Jobs", "Apply", "Build Resume", "Check ATS", "Courses", "Hire")
 * - Internal link authority: 10% (Graph centrality, PageRank within 10-layer network)
 * - Freshness: 5% (Updates within 15-30 days, live vacancy updates)
 *
 * Governance Decision Tiers:
 * - 80 - 100: INDEX (Pre-render, index, follow, include in sitemap)
 * - 60 - 79:  INDEX_REVIEW (Include after quality/substance validation)
 * - 40 - 59:  NOINDEX_HOLD (Accessible internally, noindex, follow, exclude from sitemap)
 * - < 40:     DO_NOT_GENERATE / HTTP_410 (Never generate; return 410 Gone if obsolete)
 */

export type GovernorDecision = 'INDEX' | 'INDEX_REVIEW' | 'NOINDEX_HOLD' | 'DO_NOT_GENERATE' | 'HTTP_410';

export interface GovernorInputMetrics {
  urlPath: string;
  entityType: 'JOB' | 'ROLE_HUB' | 'RESUME' | 'ATS' | 'CAREER' | 'SKILL' | 'COLLEGE' | 'COLLEGE_FACET' | 'COURSE' | 'CERTIFICATION' | 'SALARY' | 'PASSPORT' | 'KNOWLEDGE';
  searchDemandScore: number;       // 0 - 100: monthly search volume, query impressions
  inventoryCount: number;          // Real active records (jobs, curriculum modules, placement stats)
  minInventoryThreshold?: number;  // Default is 3 for job aggregations, 1 for verified dossiers
  uniqueContentScore: number;      // 0 - 100: proportion of non-templated text and verified tabular data
  commercialIntentScore: number;   // 0 - 100: transactional keywords (apply, hire, build, match, review)
  internalLinkAuthority: number;   // 0 - 100: inbound links from high-authority entities
  lastUpdatedDaysAgo: number;      // Days since last verified data refresh
  isSingleJobPosting?: boolean;    // Single job vacancy entity
  hasVerifiedUniqueDataset?: boolean; // E.g., college placement report with actual audited stats
  isOptInPublicProfile?: boolean;  // For Layer 9 public candidate profiles
}

export interface GovernorEvaluationResult {
  urlPath: string;
  entityType: string;
  seoValueScore: number;
  decision: GovernorDecision;
  robotsMeta: 'index, follow' | 'noindex, follow' | 'noindex, nofollow';
  includeInSitemap: boolean;
  httpStatus: 200 | 404 | 410;
  factorBreakdown: {
    searchDemandContribution: number;
    inventoryContribution: number;
    uniqueContentContribution: number;
    commercialIntentContribution: number;
    linkAuthorityContribution: number;
    freshnessContribution: number;
  };
  reason: string;
}

export const GOVERNOR_WEIGHTS = {
  SEARCH_DEMAND: 0.25,
  INVENTORY_DATA: 0.25,
  UNIQUE_CONTENT: 0.20,
  COMMERCIAL_INTENT: 0.15,
  LINK_AUTHORITY: 0.10,
  FRESHNESS: 0.05,
} as const;

export class SEOPageGovernor {
  /**
   * Evaluates a candidate URL against the 6-factor SEO Value Score and returns
   * the authoritative governance decision.
   */
  public static evaluate(input: GovernorInputMetrics): GovernorEvaluationResult {
    const minThreshold = input.minInventoryThreshold ?? (input.entityType === 'ROLE_HUB' ? 3 : 1);

    // Rule 1: Single Job Vacancies
    if (input.isSingleJobPosting) {
      if (input.inventoryCount > 0 && input.lastUpdatedDaysAgo <= 60) {
        return {
          urlPath: input.urlPath,
          entityType: input.entityType,
          seoValueScore: 95,
          decision: 'INDEX',
          robotsMeta: 'index, follow',
          includeInSitemap: true,
          httpStatus: 200,
          factorBreakdown: {
            searchDemandContribution: 22.5,
            inventoryContribution: 25.0,
            uniqueContentContribution: 19.0,
            commercialIntentContribution: 15.0,
            linkAuthorityContribution: 8.5,
            freshnessContribution: 5.0,
          },
          reason: 'Active verified job vacancy with valid JobPosting structured data.',
        };
      } else {
        return {
          urlPath: input.urlPath,
          entityType: input.entityType,
          seoValueScore: 15,
          decision: 'HTTP_410',
          robotsMeta: 'noindex, nofollow',
          includeInSitemap: false,
          httpStatus: 410,
          factorBreakdown: {
            searchDemandContribution: 0,
            inventoryContribution: 0,
            uniqueContentContribution: 0,
            commercialIntentContribution: 0,
            linkAuthorityContribution: 0,
            freshnessContribution: 0,
          },
          reason: 'Position expired or closed. Strict HTTP 410 Gone extermination applied.',
        };
      }
    }

    // Rule 2: College Facets without Unique Datasets (e.g. /colleges/:slug/fees with identical overview content)
    if (input.entityType === 'COLLEGE_FACET' && !input.hasVerifiedUniqueDataset) {
      return {
        urlPath: input.urlPath,
        entityType: input.entityType,
        seoValueScore: 45,
        decision: 'NOINDEX_HOLD',
        robotsMeta: 'noindex, follow',
        includeInSitemap: false,
        httpStatus: 200,
        factorBreakdown: {
          searchDemandContribution: 10,
          inventoryContribution: 10,
          uniqueContentContribution: 5,
          commercialIntentContribution: 10,
          linkAuthorityContribution: 5,
          freshnessContribution: 5,
        },
        reason: 'College facet lacks verified unique dataset. Canonicalized to primary college dossier.',
      };
    }

    // Rule 3: Public Candidate Profiles (Layer 9) - Strict Opt-In Privacy
    if (input.entityType === 'PASSPORT' && input.isOptInPublicProfile === false) {
      return {
        urlPath: input.urlPath,
        entityType: input.entityType,
        seoValueScore: 20,
        decision: 'DO_NOT_GENERATE',
        robotsMeta: 'noindex, nofollow',
        includeInSitemap: false,
        httpStatus: 404,
        factorBreakdown: {
          searchDemandContribution: 0,
          inventoryContribution: 0,
          uniqueContentContribution: 0,
          commercialIntentContribution: 0,
          linkAuthorityContribution: 0,
          freshnessContribution: 0,
        },
        reason: 'Candidate profile is private. Strictly protected from search engine crawl.',
      };
    }

    // Calculate Normalized Sub-Scores (0 - 100)
    // 1. Demand Score
    const demandScore = Math.min(100, Math.max(0, input.searchDemandScore));

    // 2. Inventory / Evidence Score
    let inventoryScore = 0;
    if (input.inventoryCount >= minThreshold) {
      inventoryScore = Math.min(100, 50 + (input.inventoryCount / minThreshold) * 25);
    } else if (input.inventoryCount > 0) {
      inventoryScore = 30; // Thin inventory penalty
    } else {
      inventoryScore = 0;  // Zero inventory
    }

    // 3. Unique Content Score
    const uniqueScore = Math.min(100, Math.max(0, input.uniqueContentScore));

    // 4. Commercial Intent Score
    const intentScore = Math.min(100, Math.max(0, input.commercialIntentScore));

    // 5. Link Authority Score
    const linkScore = Math.min(100, Math.max(0, input.internalLinkAuthority));

    // 6. Freshness Score (100 if <= 7 days, 50 if <= 30 days, decays to 10 at 90 days)
    let freshnessScore = 10;
    if (input.lastUpdatedDaysAgo <= 7) freshnessScore = 100;
    else if (input.lastUpdatedDaysAgo <= 30) freshnessScore = 80;
    else if (input.lastUpdatedDaysAgo <= 60) freshnessScore = 50;
    else if (input.lastUpdatedDaysAgo <= 90) freshnessScore = 25;

    // Hard Gate: Entity x Intent x Evidence x Demand
    // If inventory is ZERO for an aggregate listing, do not generate
    if (input.inventoryCount === 0 && (input.entityType === 'ROLE_HUB' || input.entityType === 'JOB')) {
      return {
        urlPath: input.urlPath,
        entityType: input.entityType,
        seoValueScore: 10,
        decision: 'DO_NOT_GENERATE',
        robotsMeta: 'noindex, nofollow',
        includeInSitemap: false,
        httpStatus: 404,
        factorBreakdown: {
          searchDemandContribution: demandScore * GOVERNOR_WEIGHTS.SEARCH_DEMAND,
          inventoryContribution: 0,
          uniqueContentContribution: uniqueScore * GOVERNOR_WEIGHTS.UNIQUE_CONTENT,
          commercialIntentContribution: intentScore * GOVERNOR_WEIGHTS.COMMERCIAL_INTENT,
          linkAuthorityContribution: linkScore * GOVERNOR_WEIGHTS.LINK_AUTHORITY,
          freshnessContribution: freshnessScore * GOVERNOR_WEIGHTS.FRESHNESS,
        },
        reason: 'Zero active inventory. Prevented artificial mathematical permutation from polluting index.',
      };
    }

    // Weighted Score Aggregation
    const cDemand = demandScore * GOVERNOR_WEIGHTS.SEARCH_DEMAND;
    const cInventory = inventoryScore * GOVERNOR_WEIGHTS.INVENTORY_DATA;
    const cUnique = uniqueScore * GOVERNOR_WEIGHTS.UNIQUE_CONTENT;
    const cIntent = intentScore * GOVERNOR_WEIGHTS.COMMERCIAL_INTENT;
    const cLinks = linkScore * GOVERNOR_WEIGHTS.LINK_AUTHORITY;
    const cFreshness = freshnessScore * GOVERNOR_WEIGHTS.FRESHNESS;

    const totalScore = Math.round(cDemand + cInventory + cUnique + cIntent + cLinks + cFreshness);

    // Hard Gate: Thin Inventory Gate for Aggregate Role/Location Hubs (must have >= minThreshold active jobs)
    if (input.entityType === 'ROLE_HUB' && input.inventoryCount < minThreshold) {
      return {
        urlPath: input.urlPath,
        entityType: input.entityType,
        seoValueScore: Math.min(55, totalScore),
        decision: 'NOINDEX_HOLD',
        robotsMeta: 'noindex, follow',
        includeInSitemap: false,
        httpStatus: 200,
        factorBreakdown: {
          searchDemandContribution: Math.round(cDemand * 10) / 10,
          inventoryContribution: Math.round(cInventory * 10) / 10,
          uniqueContentContribution: Math.round(cUnique * 10) / 10,
          commercialIntentContribution: Math.round(cIntent * 10) / 10,
          linkAuthorityContribution: Math.round(cLinks * 10) / 10,
          freshnessContribution: Math.round(cFreshness * 10) / 10,
        },
        reason: `Thin inventory (${input.inventoryCount} < ${minThreshold} required). Held at NOINDEX_HOLD until inventory reaches threshold.`,
      };
    }

    // Decision Mapping
    let decision: GovernorDecision = 'DO_NOT_GENERATE';
    let robotsMeta: 'index, follow' | 'noindex, follow' | 'noindex, nofollow' = 'noindex, follow';
    let includeInSitemap = false;
    let httpStatus: 200 | 404 | 410 = 200;
    let reason = '';

    if (totalScore >= 80) {
      decision = 'INDEX';
      robotsMeta = 'index, follow';
      includeInSitemap = true;
      reason = `High-authority search destination (Score: ${totalScore}/100). Verified demand, deep inventory, and rich unique content.`;
    } else if (totalScore >= 60) {
      decision = 'INDEX_REVIEW';
      robotsMeta = 'index, follow';
      includeInSitemap = true;
      reason = `Qualified search destination (Score: ${totalScore}/100). Meets indexation standards upon substantive editorial check.`;
    } else if (totalScore >= 40) {
      decision = 'NOINDEX_HOLD';
      robotsMeta = 'noindex, follow';
      includeInSitemap = false;
      reason = `Emerging or thin destination (Score: ${totalScore}/100). Preserved for internal navigation without spending crawl budget.`;
    } else {
      decision = 'DO_NOT_GENERATE';
      robotsMeta = 'noindex, nofollow';
      includeInSitemap = false;
      httpStatus = 404;
      reason = `Insufficient score (${totalScore}/100). Below minimum viability threshold of 40.`;
    }

    return {
      urlPath: input.urlPath,
      entityType: input.entityType,
      seoValueScore: totalScore,
      decision,
      robotsMeta,
      includeInSitemap,
      httpStatus,
      factorBreakdown: {
        searchDemandContribution: Math.round(cDemand * 10) / 10,
        inventoryContribution: Math.round(cInventory * 10) / 10,
        uniqueContentContribution: Math.round(cUnique * 10) / 10,
        commercialIntentContribution: Math.round(cIntent * 10) / 10,
        linkAuthorityContribution: Math.round(cLinks * 10) / 10,
        freshnessContribution: Math.round(cFreshness * 10) / 10,
      },
      reason,
    };
  }
}
