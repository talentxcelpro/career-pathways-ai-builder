// src/lib/autonomous-os/learningEngine.ts
import { AutonomousDecision } from './types';

export const SAMPLE_DECISION_LOG: AutonomousDecision[] = [
  {
    decisionId: 'TX-000182',
    timestampIso: new Date(Date.now() - 3600000).toISOString(),
    triggerEvent: 'ATS Resume Scan traffic spike (+140% WoW)',
    opportunityName: 'Amplify ATS Resume Roast & Shareable Scorecard Loop',
    evidenceSummary: '2,842 organic visitors converted at 23.8% signup rate with 0.33 viral K-factor.',
    activationRateObserved: 72.4,
    measuredKFactor: 0.33,
    decisionTaken: 'INCREASE_DISTRIBUTION_PRIORITY_TO_P0',
    reasoning: 'Highest activation + referral combination across all 14 product surfaces.',
    actionGenerated: 'Attach 1-Click WhatsApp Scorecard Share Trigger and 3-invite HR unlock queue.',
    expectedImpact: '+15,000 monthly registered users',
    confidenceScore: 0.96,
    policyStatus: 'PASSED_SAFE'
  },
  {
    decisionId: 'TX-000183',
    timestampIso: new Date(Date.now() - 7200000).toISOString(),
    triggerEvent: 'Live GSC position 1.33 for "safety officer fresher jobs"',
    opportunityName: 'Optimize Page 1 Live Winner: Safety Officer Fresher Jobs',
    evidenceSummary: 'Observed 112 clicks with 0.95 confidence score on verified GSC data.',
    activationRateObserved: 64.2,
    measuredKFactor: 0.18,
    decisionTaken: 'TRIGGER_AUTONOMOUS_SCHEMA_INJECTION',
    reasoning: 'Protect and expand #1 Google search ranking with zero doorway risk.',
    actionGenerated: 'Inject JobPosting schema and refresh salary benchmark data.',
    expectedImpact: '+4,500 monthly search clicks',
    confidenceScore: 0.94,
    policyStatus: 'PASSED_SAFE'
  },
  {
    decisionId: 'TX-000184',
    timestampIso: new Date(Date.now() - 10800000).toISOString(),
    triggerEvent: 'College TPO Placement Outreach Pitch Prepared',
    opportunityName: 'National College Placement Readiness Index',
    evidenceSummary: 'Aggregator multiplier opportunity across 200 Indian engineering colleges.',
    activationRateObserved: 82.0,
    measuredKFactor: 0.45,
    decisionTaken: 'HOLD_FOR_ADMIN_REVIEW_SAFE_MODE',
    reasoning: 'External institutional communications require manual review and authorization under anti-spam invariants.',
    actionGenerated: 'Drafted 300 TPO outreach kits into admin review queue.',
    expectedImpact: '+500,000 students onboarded',
    confidenceScore: 0.88,
    policyStatus: 'REQUIRES_APPROVAL'
  }
];
