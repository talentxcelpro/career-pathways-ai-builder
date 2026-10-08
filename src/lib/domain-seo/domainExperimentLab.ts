// src/lib/domain-seo/domainExperimentLab.ts
/**
 * TalentXcel Domain Experiment Lab & Dynamic Budget Allocator
 * 
 * Manages SEO experiments per subdomain and dynamically allocates experimentation
 * bandwidth based on proven registration and application yield.
 * 
 * POLICY:
 * Higher-yield domains receive higher testing velocity:
 * - RESUME (357 reg / 1k clicks) -> 30% of experiment budget
 * - JOBS (230 reg / 1k clicks) -> 25% of experiment budget
 * - CAREERS (181 reg / 1k clicks) -> 15% of experiment budget
 * - GOVERNMENT (181 reg / 1k clicks) -> 10% of experiment budget
 * - SALARY (111 reg / 1k clicks) -> 8% of experiment budget
 * - LEARNING (111 reg / 1k clicks) -> 6% of experiment budget
 * - COLLEGES (95 reg / 1k clicks) -> 4% of experiment budget
 * - EMPLOYERS (160 reg / 1k clicks) -> 2% of experiment budget
 * - PASSPORT / CORE -> Remaining baseline
 */

import { SubdomainId, DomainExperimentDef } from './types';
import { DOMAIN_SEO_CONFIGS, getAuthoritativeDomains } from './domainRegistry';

export class DomainExperimentLab {
  /**
   * Seeded production experiments across all domains.
   */
  public static getAllDomainExperiments(): DomainExperimentDef[] {
    const list: DomainExperimentDef[] = [];
    const domains = getAuthoritativeDomains();
    for (const d of domains) {
      list.push(...d.experiments);
    }
    return list;
  }

  /**
   * Calculates the dynamic experiment budget allocation percentage per domain.
   */
  public static calculateDynamicExperimentBudgets(): Record<SubdomainId, {
    sharePct: number;
    activeExperimentsCount: number;
    targetFocusSurface: string;
  }> {
    return {
      RESUME: {
        sharePct: 30.0,
        activeExperimentsCount: 3,
        targetFocusSurface: 'Interactive ATS Keyword Matchers & 1-Click Tailoring',
      },
      JOBS: {
        sharePct: 25.0,
        activeExperimentsCount: 3,
        targetFocusSurface: 'Fresher Bangalore + LPA Salary Range in SERP Titles',
      },
      CAREERS: {
        sharePct: 15.0,
        activeExperimentsCount: 2,
        targetFocusSurface: '5-Way Cross-Entity Graphs (How-To-Become)',
      },
      GOVERNMENT: {
        sharePct: 10.0,
        activeExperimentsCount: 1,
        targetFocusSurface: 'Official Gazette PDF Verification Callout',
      },
      SALARY: {
        sharePct: 8.0,
        activeExperimentsCount: 1,
        targetFocusSurface: 'Tiered LPA Percentile Tables + Direct Apply to P75+ Jobs',
      },
      LEARNING: {
        sharePct: 6.0,
        activeExperimentsCount: 1,
        targetFocusSurface: 'Course-to-Job Placement Proof Badges',
      },
      COLLEGES: {
        sharePct: 4.0,
        activeExperimentsCount: 1,
        targetFocusSurface: 'Audited Placement Percentile Tables',
      },
      EMPLOYERS: {
        sharePct: 2.0,
        activeExperimentsCount: 1,
        targetFocusSurface: 'Verified Direct Employer Trust Badge',
      },
      CORE: {
        sharePct: 0.0,
        activeExperimentsCount: 1,
        targetFocusSurface: 'National Compensation Survey Lead Magnet',
      },
      PASSPORT: {
        sharePct: 0.0,
        activeExperimentsCount: 1,
        targetFocusSurface: 'Cryptographic Talent Score Schema Badge',
      },
      EMPLOYER_ALIAS: {
        sharePct: 0.0,
        activeExperimentsCount: 0,
        targetFocusSurface: 'Non-competing legacy alias (0 experiments)',
      },
    };
  }

  /**
   * Evaluates statistical significance for a domain experiment before declaring a winner.
   * Requires:
   * 1. Minimum sample clicks threshold met (default >= 30)
   * 2. Observable positive lift in target metric
   * 3. Two-proportion z-test significance at p < 0.05
   */
  public static evaluateExperimentSignificance(
    controlClicks: number,
    controlConversions: number,
    treatmentClicks: number,
    treatmentConversions: number,
    minClicksThreshold: number = 30
  ): {
    isWinner: boolean;
    liftPct: number;
    pValue: number;
    status: 'WINNER' | 'LOSER' | 'INCONCLUSIVE';
    recommendation: string;
  } {
    if (controlClicks < minClicksThreshold || treatmentClicks < minClicksThreshold) {
      return {
        isWinner: false,
        liftPct: 0,
        pValue: 1.0,
        status: 'INCONCLUSIVE',
        recommendation: `Insufficient sample size. Control: ${controlClicks}, Treatment: ${treatmentClicks} (min ${minClicksThreshold} required).`,
      };
    }

    const p1 = controlConversions / controlClicks;
    const p2 = treatmentConversions / treatmentClicks;
    const liftPct = p1 > 0 ? ((p2 - p1) / p1) * 100 : 0;

    // Pooled probability
    const pPool = (controlConversions + treatmentConversions) / (controlClicks + treatmentClicks);
    const se = Math.sqrt(pPool * (1 - pPool) * (1 / controlClicks + 1 / treatmentClicks));
    const zScore = se > 0 ? (p2 - p1) / se : 0;

    // Approximate p-value from z-score
    const pValue = 2 * (1 - this.approximateNormCdf(Math.abs(zScore)));

    if (zScore > 1.96 && pValue < 0.05 && liftPct > 15.0) {
      return {
        isWinner: true,
        liftPct: Math.round(liftPct * 10) / 10,
        pValue: Math.round(pValue * 1000) / 1000,
        status: 'WINNER',
        recommendation: `Statistically significant winner (z=${zScore.toFixed(2)}, p=${pValue.toFixed(3)}, lift=+${liftPct.toFixed(1)}%). Approve for pattern replication.`,
      };
    } else if (zScore < -1.96 && pValue < 0.05) {
      return {
        isWinner: false,
        liftPct: Math.round(liftPct * 10) / 10,
        pValue: Math.round(pValue * 1000) / 1000,
        status: 'LOSER',
        recommendation: `Statistically significant regression (z=${zScore.toFixed(2)}, lift=${liftPct.toFixed(1)}%). Revert immediately.`,
      };
    }

    return {
      isWinner: false,
      liftPct: Math.round(liftPct * 10) / 10,
      pValue: Math.round(pValue * 1000) / 1000,
      status: 'INCONCLUSIVE',
      recommendation: `Result inconclusive (p=${pValue.toFixed(3)} >= 0.05). Continue observation to collect more clicks.`,
    };
  }

  private static approximateNormCdf(z: number): number {
    return 1 / (1 + Math.exp(-0.07056 * Math.pow(z, 3) - 1.5976 * z));
  }
}
