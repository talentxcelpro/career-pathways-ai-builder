import { AcquisitionGovernanceRecord, GovernanceDecision, GovernanceWorkflowState } from './types';

/**
 * Traffic Governor
 * =========================================================================
 * Connects UDX intelligence to acquisition surface generation.
 * Enforces the hard rule: BUILD_PROPOSAL ≠ AUTO_PUBLISH.
 * Prohibits automatic generation of thin doorway pages.
 */
export class TrafficGovernor {
  private static proposals: AcquisitionGovernanceRecord[] = [
    {
      proposalId: 'gov-prop-001',
      canonicalQuery: 'ats resume checker free',
      targetProduct: 'ATS Resume Scanner',
      targetLandingPath: '/tools/resume-checker',
      country: 'global',
      searchDemand: 4200,
      evidenceConfidence: 0.94,
      workflowState: 'PUBLISHED',
      decision: 'BUILD',
      decisionRationale: 'High global intent backed by verified client-side parsing utility. Instant diagnostic deliverable confirmed.',
      createdAt: '2026-09-17T14:00:00Z',
      approvedAt: '2026-09-17T15:30:00Z'
    },
    {
      proposalId: 'gov-prop-002',
      canonicalQuery: 'python developer salary usa',
      targetProduct: 'Salary Analyzer (US Matrix)',
      targetLandingPath: '/tools/salary-analyzer?country=usa&currency=USD',
      country: 'usa',
      searchDemand: 3100,
      evidenceConfidence: 0.92,
      workflowState: 'PUBLISHED',
      decision: 'BUILD',
      decisionRationale: 'Verified US BLS 2026 Tech Wage benchmark data available via official adapter. Compensation model approved.',
      createdAt: '2026-09-17T16:00:00Z',
      approvedAt: '2026-09-17T17:15:00Z'
    },
    {
      proposalId: 'gov-prop-003',
      canonicalQuery: 'best ai certifications 2026',
      targetProduct: 'Global AI Upskilling Hub',
      targetLandingPath: '/learning/ai-certifications',
      country: 'global',
      searchDemand: 1850,
      evidenceConfidence: 0.40,
      workflowState: 'GOVERNANCE_CHECK',
      decision: 'WAIT_FOR_EVIDENCE',
      decisionRationale: 'High demand detected across 14 countries, but zero verified institutional course agreements active. Programmatic page build refused until supply contracts exist.',
      createdAt: '2026-09-18T10:00:00Z'
    },
    {
      proposalId: 'gov-prop-004',
      canonicalQuery: 'jobs in varanasi for freshers',
      targetProduct: 'Varanasi Fresher Job Board',
      targetLandingPath: '/jobs/varanasi/fresher',
      country: 'ind',
      searchDemand: 850,
      evidenceConfidence: 0.35,
      workflowState: 'REJECTED',
      decision: 'DO_NOT_BUILD',
      decisionRationale: 'Thin content guard: Zero first-party fresher openings in database for Varanasi. Rejecting programmatic doorway page to prevent SERP penalty.',
      createdAt: '2026-09-18T11:30:00Z'
    },
    {
      proposalId: 'gov-prop-005',
      canonicalQuery: 'free resume checker online ats score',
      targetProduct: 'ATS Resume Scanner',
      targetLandingPath: '/tools/resume-checker',
      country: 'global',
      searchDemand: 1200,
      evidenceConfidence: 0.95,
      workflowState: 'PUBLISHED',
      decision: 'MERGE',
      decisionRationale: 'Duplicate intent cluster of gov-prop-001. Canonical URL consolidated to /tools/resume-checker to prevent keyword cannibalization.',
      createdAt: '2026-09-18T12:45:00Z',
      approvedAt: '2026-09-18T13:00:00Z'
    }
  ];

  public static getProposals(): AcquisitionGovernanceRecord[] {
    return this.proposals;
  }

  /**
   * Evaluates a new candidate demand signal for acquisition surface generation.
   */
  public static evaluateCandidate(params: {
    canonicalQuery: string;
    targetProduct: string;
    country: string;
    searchDemand: number;
    hasVerifiedUtility: boolean;
    hasVerifiedData: boolean;
    isDuplicate: boolean;
  }): AcquisitionGovernanceRecord {
    let decision: GovernanceDecision = 'DO_NOT_BUILD';
    let workflowState: GovernanceWorkflowState = 'GOVERNANCE_CHECK';
    let rationale = '';

    if (params.isDuplicate) {
      decision = 'MERGE';
      workflowState = 'PUBLISHED';
      rationale = 'Duplicate intent identified. Canonical destination merged to primary tool node.';
    } else if (!params.hasVerifiedUtility) {
      decision = 'DO_NOT_BUILD';
      workflowState = 'REJECTED';
      rationale = 'Thin content violation: No interactive utility or computation available for this query.';
    } else if (!params.hasVerifiedData) {
      decision = 'WAIT_FOR_EVIDENCE';
      workflowState = 'GOVERNANCE_CHECK';
      rationale = 'Evidence gating: Real demand exists, but verified empirical dataset is absent. Awaiting sensor ingest.';
    } else {
      decision = 'BUILD';
      workflowState = 'REVIEW_REQUIRED';
      rationale = 'Qualified candidate: Demand + unique utility + verified empirical evidence confirmed. Ready for governance review.';
    }

    const record: AcquisitionGovernanceRecord = {
      proposalId: `gov-prop-${Date.now().toString(36)}`,
      canonicalQuery: params.canonicalQuery,
      targetProduct: params.targetProduct,
      targetLandingPath: `/tools/${params.targetProduct.toLowerCase().replace(/\s+/g, '-')}`,
      country: params.country.toLowerCase(),
      searchDemand: params.searchDemand,
      evidenceConfidence: params.hasVerifiedData ? 0.90 : 0.40,
      workflowState,
      decision,
      decisionRationale: rationale,
      createdAt: new Date().toISOString()
    };

    this.proposals.unshift(record);
    return record;
  }
}
