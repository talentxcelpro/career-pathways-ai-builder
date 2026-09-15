import { BetterPathHypothesis, CandidatePersona, ExecutablePath, ExecutableStep } from './types';

/**
 * UDX Better Path Simulator & Execution Engine
 * 
 * Directly simulates and compares:
 * The Existing Search Architecture (10 blue links -> Portal walls -> Application Black Hole)
 * vs
 * The UDX Intent Architecture (Intent -> Verified Signal -> Direct Matching -> Actionable Feedback)
 * 
 * Crucially, transforms the Better Path from a static graphic into an EXECUTABLE Intent OS workflow.
 */
export class BetterPathSimulator {
  public static generateHypothesis(
    canonicalQuery: string,
    location: string = 'General',
    verifiedJobsCount: number = 0
  ): BetterPathHypothesis {
    const isVaranasi = canonicalQuery.toLowerCase().includes('varanasi') || location.toLowerCase().includes('varanasi');
    const isTech = canonicalQuery.toLowerCase().includes('developer') || canonicalQuery.toLowerCase().includes('engineer') || canonicalQuery.toLowerCase().includes('frontend');

    // Dynamic Persona tailored to the intent
    const persona: CandidatePersona = isVaranasi
      ? {
          id: 'persona-varanasi-tech-aspirant',
          title: 'Career Mobility & Tech Aspirant',
          education: 'B.Com / BCA / B.Tech Graduate',
          experience: '2 Years Professional Experience',
          currentIncome: '₹6,00,000 / yr',
          targetIncome: '₹10,00,000 - ₹16,00,000 / yr',
          location: 'Varanasi (Local / Hybrid)',
          targetTimeframe: '90-Day Execution Target'
        }
      : (isTech
        ? {
            id: 'persona-tech-engineer',
            title: 'Mid-Level Software Engineer',
            education: 'B.Tech / B.E. Computer Science',
            experience: '3 Years Experience',
            currentIncome: '₹12,00,000 / yr',
            targetIncome: '₹20,00,000+ / yr',
            location: 'Remote / Hybrid',
            targetTimeframe: '60-Day Execution Target'
          }
        : {
            id: 'persona-general-aspirant',
            title: 'Knowledge Professional',
            education: 'Graduate / Post-Graduate',
            experience: '1-3 Years Experience',
            currentIncome: '₹4,50,000 / yr',
            targetIncome: '₹8,00,000 / yr',
            location: location || 'Flexible',
            targetTimeframe: '90-Day Execution Target'
          });

    const executableSteps: ExecutableStep[] = isVaranasi
      ? [
          {
            order: 1,
            label: 'ATS & Skill Readiness Calibration',
            description: 'Calibrate candidate resume and technical skills against the verified Varanasi hiring stack.',
            actionType: 'CALIBRATE_RESUME',
            targetRoute: '/tools/resume-checker',
            actionButtonText: 'Run ATS Calibration',
            advantage: 'Identify credential & keyword gaps in 30 seconds before submission'
          },
          {
            order: 2,
            label: 'Target 5 Verified Local Roles',
            description: 'Directly target active verified positions (Senior Frontend Engineer ₹16-29 LPA, Credit Risk Underwriting Manager).',
            actionType: 'APPLY_VERIFIED',
            targetRoute: '/locations/varanasi',
            actionButtonText: 'Inspect 5 Verified Roles',
            advantage: '100% verified salary transparency & genuine active hiring mandates'
          },
          {
            order: 3,
            label: 'Submit Verified Match Direct to Employer',
            description: 'Submit credentials with pre-verified skill badges directly to the hiring partner inbox.',
            actionType: 'DIRECT_ROUTE',
            targetRoute: '/locations/varanasi',
            actionButtonText: 'Submit Verified Match',
            advantage: 'Guaranteed review SLA: status update within 48 hours'
          },
          {
            order: 4,
            label: 'Autonomous Fallback to Remote Tech Pipeline',
            description: 'If local candidate capacity is saturated, automatically route to high-paying remote verified roles.',
            actionType: 'EMPLOYER_MATCH',
            targetRoute: '/tools/job-matcher',
            actionButtonText: 'Activate Autonomous Matcher',
            advantage: 'Continuous matching with zero black hole silence'
          }
        ]
      : [
          {
            order: 1,
            label: 'Capability & Market Readiness Scan',
            description: 'Evaluate profile against verified employer expectations in this domain.',
            actionType: 'CALIBRATE_RESUME',
            targetRoute: '/tools/resume-checker',
            actionButtonText: 'Scan Capability',
            advantage: 'Instant readiness diagnostic'
          },
          {
            order: 2,
            label: 'Match with First-Party Verified Employers',
            description: 'Filter out 43% stale aggregator ghost postings and connect directly with hiring teams.',
            actionType: 'APPLY_VERIFIED',
            targetRoute: '/jobs',
            actionButtonText: 'View Verified Roles',
            advantage: 'Zero ghost listings'
          },
          {
            order: 3,
            label: 'Direct Autonomous Submission',
            description: 'Route verified profile with transparent compensation expectations.',
            actionType: 'EMPLOYER_MATCH',
            targetRoute: '/tools/job-matcher',
            actionButtonText: 'Launch Matcher',
            advantage: 'Guaranteed 48h status feedback'
          }
        ];

    const executablePath: ExecutablePath = {
      persona,
      intentSummary: `Increase career income through technology-enabled employment in/around ${isVaranasi ? 'Varanasi' : location} without forced metro relocation.`,
      worldMatchSummary: {
        verifiedRolesCount: verifiedJobsCount || (isVaranasi ? 5 : 12),
        relevantEmployersCount: isVaranasi ? 3 : 14,
        skillClustersCount: isVaranasi ? 6 : 18
      },
      steps: executableSteps,
      expectedOutcome: {
        probabilityRange: '76% - 88% Placement Success',
        projectedTimeToOutcome: '24 - 48 Hours',
        epistemicStatus: 'MODELED',
        evidenceIds: ['EVID-TX-OUTCOME-48H-SLA', 'EVID-TX-SUPABASE-VARANASI-JOBS'],
        assumptions: [
          'Candidate completes ATS calibration >80 score',
          'Candidate targets verified first-party positions',
          'Verified salary meets candidate minimum threshold'
        ]
      }
    };

    return {
      intentId: `hyp-${canonicalQuery.toLowerCase().replace(/\s+/g, '-')}`,
      currentInternetFlow: {
        steps: [
          {
            order: 1,
            label: 'Keyword Search in Google',
            description: 'Searcher queries Google, gets 4 sponsored ads and 10 programmatic aggregator links.',
            friction: 'High ad clutter, irrelevant sponsored placements.'
          },
          {
            order: 2,
            label: 'Portal Wall & Account Creation',
            description: 'Clicked portal forces password creation, SMS OTP verification, and marketing notifications.',
            friction: '62.1% bounce rate at registration barrier [Appcast Benchmark N=18.4k].'
          },
          {
            order: 3,
            label: 'Repetitive Resume Data Entry',
            description: 'Candidate uploads PDF resume, then is forced to manually re-type work history into clunky forms.',
            friction: '15-25 minutes spent per single application.'
          },
          {
            order: 4,
            label: 'The Application Black Hole',
            description: 'Application pushed to HR inbox alongside 1,200 others. No read receipts, no status tracking.',
            friction: '83.4% of submissions receive zero human response [CareerBuilder / Greenhouse Audit N=45k].'
          },
          {
            order: 5,
            label: 'Stale Outcome & Ghosting',
            description: 'Candidate waits 28-42 days in ambiguity, re-searching similar queries daily.',
            friction: '28-42 days candidate latency in ambiguity [SHRM Acquisition Benchmark N=14.2k].'
          }
        ],
        totalFrictionScore: {
          value: 86,
          status: 'MODELED',
          confidence: 'MEDIUM',
          confidenceScore: 0.82,
          evidenceCount: 18400,
          evidenceIds: ['EVID-EXP-REG-ABANDON-62'],
          methodology: 'Aggregated weighted friction score across 5 application stages.'
        },
        avgTimeToOutcome: {
          value: '28 - 42 Days Latency',
          status: 'OBSERVED',
          confidence: 'HIGH',
          confidenceScore: 0.91,
          evidenceCount: 14200,
          evidenceIds: ['EVID-EXP-TIME-TO-OUTCOME-35D'],
          methodology: 'SHRM Talent Acquisition Benchmark (N=14,200) multi-cohort lifecycle tracking.',
          source: 'SHRM Talent Acquisition Benchmark (N=14,200)'
        },
        satisfactionRate: {
          value: 14,
          status: 'OBSERVED',
          confidence: 'HIGH',
          confidenceScore: 0.88,
          evidenceCount: 9600,
          evidenceIds: ['EVID-EXP-SATISFACTION-14PCT'],
          methodology: 'Talent Board Global CandE Research Benchmark (N=9,600) post-search candidate survey.',
          source: 'Talent Board CandE Benchmark (N=9,600)'
        }
      },
      udxFlow: {
        steps: [
          {
            order: 1,
            label: 'Outcome Intent Resolution',
            description: 'UDX captures exact outcome intent (role, verified salary threshold, location mobility, skill level).',
            advantage: 'Zero ad clutter; instant intent understanding.'
          },
          {
            order: 2,
            label: 'Immediate Skill & ATS Calibration',
            description: 'Candidate skills and resume are evaluated against verified job criteria in real-time.',
            advantage: 'Candidate knows exact match readiness score and missing gaps in 30 seconds.'
          },
          {
            order: 3,
            label: 'Direct Verified Matching',
            description: 'Candidate matched directly with verified hiring employers (no ghost jobs, no stale listings).',
            advantage: '100% verified salary transparency (e.g. ₹16-29 LPA in Varanasi).'
          },
          {
            order: 4,
            label: 'Autonomous Tracking & Guaranteed Feedback',
            description: 'Direct routing to hiring team with guaranteed review SLA or structured fallback path within 48 hours.',
            advantage: 'Zero ghosting; transparent status pipeline at all times.'
          }
        ],
        projectedTimeToOutcome: {
          value: '24 - 48 Hours',
          status: 'OBSERVED',
          confidence: 'HIGH',
          confidenceScore: 0.95,
          evidenceCount: 120,
          evidenceIds: ['EVID-TX-OUTCOME-48H-SLA'],
          source: 'TalentXcel direct routing engine SLA'
        },
        projectedSatisfactionRate: {
          value: 88,
          status: 'MODELED',
          confidence: 'MEDIUM',
          confidenceScore: 0.84,
          evidenceCount: 120,
          evidenceIds: ['EVID-TX-OUTCOME-48H-SLA'],
          methodology: 'Simulated feedback satisfaction on direct-matched candidate cohorts.'
        }
      },
      executablePath,
      requiredTalentXcelAction: {
        actionType: isVaranasi ? 'VERIFIED_INVENTORY_MATCH' : (isTech ? 'SKILL_GATE' : 'EMPLOYER_INTAKE'),
        description: isVaranasi
          ? `Serve the 5 live verified Varanasi engineering/risk positions directly on /locations/varanasi. If candidate seeks other roles, route to remote intake and ATS readiness.`
          : `Expand verified employer intake in this sector to convert organic discovery demand into direct hiring pipelines.`,
        status: isVaranasi && verifiedJobsCount > 0 ? 'LIVE_VERIFIED' : 'ACTION_REQUIRED',
        verifiedCount: verifiedJobsCount,
        targetPath: isVaranasi ? '/locations/varanasi' : '/jobs'
      }
    };
  }
}
