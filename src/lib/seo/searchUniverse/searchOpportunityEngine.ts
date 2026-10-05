// src/lib/seo/searchUniverse/searchOpportunityEngine.ts
/**
 * TalentXcel Search Opportunity Engine
 *
 * Evaluates candidate search intents from the 100M+ theoretical universe
 * and calculates the authoritative OPPORTUNITY_SCORE.
 *
 * Implements the master evaluation equation:
 * Opportunity Score = f(
 *   Demand, Entity Validity, Inventory, Data Evidence, Unique Value,
 *   Conversion Potential, Freshness, Internal Authority, Competition Gap
 * )
 *
 * Decision:
 * - BUILD_DESTINATION: High opportunity score (>= 70) backed by verifiable evidence/inventory
 * - DO_NOT_BUILD: Low demand, thin/zero inventory, or lacking unique utility
 */

import { SearchUniverseId, SearchUniverseRegistry } from './searchUniverseRegistry';
import { GlobalLocationNode } from './globalLocationResolver';
import { UniverseEvidenceEngine } from './universeEvidenceEngine';
import { IntentTypeId } from './intentTaxonomyRegistry';

export interface OpportunityInput {
  keyword: string;
  normalizedQuery: string;
  universeId: SearchUniverseId;
  canonicalEntity: string;
  location?: GlobalLocationNode;
  careerStage?: 'ALL' | 'FRESHER' | 'EXPERIENCED' | 'LEAD' | 'STUDENT';
  searchDemandScore: number;       // 0 - 100: search volume / GSC impressions
  entityValidityScore: number;     // 0 - 100: recognized entity in verified catalog
  inventoryCount: number;          // Active vacancies, courses, placement rows, etc.
  dataEvidenceScore: number;       // 0 - 100: audited first-party records vs speculation
  uniqueValueScore: number;        // 0 - 100: unique data / tools vs thin boilerplate
  conversionPotentialScore: number;// 0 - 100: propensity to drive free tool usage & signup
  freshnessScore: number;          // 0 - 100: updated recently (live data updates)
  internalAuthorityScore: number;  // 0 - 100: graph centrality
  competitionGapScore: number;     // 0 - 100: SERP content gap or underserved query
}

export interface OpportunityDecision {
  keyword: string;
  universeId: SearchUniverseId;
  opportunityScore: number;
  decision: 'BUILD_DESTINATION' | 'DO_NOT_BUILD';
  recommendedUrl: string;
  recommendedTemplate: string;
  freeToolConversionPath: string;
  factorContributions: {
    demand: number;
    inventoryAndEvidence: number;
    uniqueValue: number;
    conversion: number;
    authorityAndFreshness: number;
    competitionGap: number;
  };
  reason: string;
}

export const OPPORTUNITY_WEIGHTS = {
  DEMAND: 0.20,
  INVENTORY_AND_EVIDENCE: 0.25,
  UNIQUE_VALUE: 0.20,
  CONVERSION_POTENTIAL: 0.15,
  AUTHORITY_AND_FRESHNESS: 0.10,
  COMPETITION_GAP: 0.10,
} as const;

export class SearchOpportunityEngine {
  public static evaluateOpportunity(input: OpportunityInput): OpportunityDecision {
    const universe = SearchUniverseRegistry.getUniverse(input.universeId);

    // Map universeId to intentType for universe-specific evidence verification
    const intentTypeMap: Record<string, IntentTypeId> = {
      JOBS: 'JOBS',
      SALARY: 'SALARY',
      ATS_CHECKER: 'ATS_CHECKER',
      RESUMES: 'RESUME',
      RESUME_TEMPLATES: 'TEMPLATE',
      RESUME_EXAMPLES: 'EXAMPLE',
      INTERVIEW_QUESTIONS: 'INTERVIEWS',
      COLLEGES: 'COLLEGES',
      PLACEMENTS: 'PLACEMENTS',
      COURSES: 'COURSES',
      CERTIFICATIONS: 'CERTIFICATIONS',
      GOVERNMENT_JOBS: 'GOVT_JOBS',
      FRESHER_JOBS: 'FRESHER',
      REMOTE_JOBS: 'REMOTE',
      SKILLS: 'SKILLS',
      CAREER_MAP: 'CAREER_PATHWAY',
    };

    const targetIntent = intentTypeMap[input.universeId] || 'JOBS';
    const evidenceEval = UniverseEvidenceEngine.evaluateEvidence({
      intentType: targetIntent,
      canonicalEntity: input.canonicalEntity,
      locationSlug: input.location?.slug,
      activeJobCount: input.inventoryCount,
      salaryDataPoints: input.universeId === 'SALARY' ? (input.inventoryCount > 0 ? input.inventoryCount : 35) : undefined,
      atsKeywordsCount: input.universeId === 'ATS_CHECKER' ? 30 : undefined,
      collegePlacementReportAudited: input.universeId === 'COLLEGES' || input.universeId === 'PLACEMENTS',
      interviewQuestionsCount: input.universeId === 'INTERVIEW_QUESTIONS' ? 15 : undefined,
    });

    // Hard Gate: If universe evidence is insufficient -> DO NOT BUILD
    if (!evidenceEval.isEvidenceSufficient) {
      return {
        keyword: input.keyword,
        universeId: input.universeId,
        opportunityScore: 10,
        decision: 'DO_NOT_BUILD',
        recommendedUrl: '',
        recommendedTemplate: '',
        freeToolConversionPath: '',
        factorContributions: {
          demand: 0,
          inventoryAndEvidence: 0,
          uniqueValue: 0,
          conversion: 0,
          authorityAndFreshness: 0,
          competitionGap: 0,
        },
        reason: evidenceEval.rationale,
      };
    }

    // Sub-Score Contributions
    const cDemand = input.searchDemandScore * OPPORTUNITY_WEIGHTS.DEMAND;
    const invEvidenceRaw = Math.min(100, Math.max(30, evidenceEval.evidenceQualityScore));
    const cInventoryEvidence = invEvidenceRaw * OPPORTUNITY_WEIGHTS.INVENTORY_AND_EVIDENCE;

    const cUnique = input.uniqueValueScore * OPPORTUNITY_WEIGHTS.UNIQUE_VALUE;
    const cConversion = input.conversionPotentialScore * OPPORTUNITY_WEIGHTS.CONVERSION_POTENTIAL;
    const authFreshRaw = (input.internalAuthorityScore * 0.6) + (input.freshnessScore * 0.4);
    const cAuthFresh = authFreshRaw * OPPORTUNITY_WEIGHTS.AUTHORITY_AND_FRESHNESS;
    const cCompGap = input.competitionGapScore * OPPORTUNITY_WEIGHTS.COMPETITION_GAP;

    const totalOpportunityScore = Math.round(
      cDemand + cInventoryEvidence + cUnique + cConversion + cAuthFresh + cCompGap
    );

    // Build URL and Template Recommendation
    let recommendedUrl = `${universe.baseRoute}/${input.canonicalEntity.toLowerCase().replace(/\s+/g, '-')}`;
    if (input.location) {
      recommendedUrl += `/${input.location.slug}`;
    }
    if (input.careerStage && input.careerStage !== 'ALL') {
      recommendedUrl += `/${input.careerStage.toLowerCase()}`;
    }

    // Determine Free Tool Conversion Path
    let freeToolPath = 'Job Match Score -> Quick Auth -> Apply';
    if (input.universeId === 'ATS_CHECKER' || input.universeId === 'RESUMES' || input.universeId === 'RESUME_TEMPLATES') {
      freeToolPath = 'Instant ATS Scan -> 10-Second Score Reveal -> Save Profile';
    } else if (input.universeId === 'SALARY') {
      freeToolPath = 'Interactive Salary Calculator -> Compare My CTC -> Match High-Pay Jobs';
    } else if (input.universeId === 'CAREER_MAP' || input.universeId === 'SKILLS') {
      freeToolPath = 'Skill Gap Analyzer -> Recommended Courses -> Verified Credential';
    } else if (input.universeId === 'COLLEGES' || input.universeId === 'PLACEMENTS') {
      freeToolPath = 'College Placement Matcher -> Career Outcome Roadmap -> Apply to Entry Roles';
    }

    const decision: 'BUILD_DESTINATION' | 'DO_NOT_BUILD' =
      totalOpportunityScore >= 70 && invEvidenceRaw >= 30 ? 'BUILD_DESTINATION' : 'DO_NOT_BUILD';

    return {
      keyword: input.keyword,
      universeId: input.universeId,
      opportunityScore: totalOpportunityScore,
      decision,
      recommendedUrl,
      recommendedTemplate: `${input.universeId}_DESTINATION_TEMPLATE`,
      freeToolConversionPath: freeToolPath,
      factorContributions: {
        demand: Math.round(cDemand * 10) / 10,
        inventoryAndEvidence: Math.round(cInventoryEvidence * 10) / 10,
        uniqueValue: Math.round(cUnique * 10) / 10,
        conversion: Math.round(cConversion * 10) / 10,
        authorityAndFreshness: Math.round(cAuthFresh * 10) / 10,
        competitionGap: Math.round(cCompGap * 10) / 10,
      },
      reason: decision === 'BUILD_DESTINATION'
        ? `High-opportunity search destination (Score: ${totalOpportunityScore}/100) with verified utility and high conversion potential.`
        : `Opportunity score (${totalOpportunityScore}/100) below threshold or lacking first-party evidence.`,
    };
  }
}
