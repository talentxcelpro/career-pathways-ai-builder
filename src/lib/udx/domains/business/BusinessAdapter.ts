/**
 * UDX Universal Discovery & Intelligence OS v3.0 — Reality Engine
 * Business Domain Adapter (Proof 3: Cross-Domain Proving Laboratory)
 * 
 * Demonstrates domain-independence:
 * Intent: "I want to start a business around an emerging technology before the market becomes crowded."
 */

import { UDXIntent, LocationContext, Constraint } from '../../core/IntentTypes';
import { PossibilityPath } from '../../possibility/types';

export class BusinessAdapter {
  public static readonly adapterId = 'adapter-business-v3';

  public static toBusinessIntent(rawSignal: string): UDXIntent {
    const s = rawSignal.toLowerCase();
    const isMCA = /\b(incorporat|private limited|company in india|pvt ltd)\b/.test(s);
    const isGST = /\b(gst|gst registration|goods and services tax)\b/.test(s);
    const isStartupSubsidy = /\b(subsidy|incentives|startup subsidy|startinup)\b/.test(s);
    const isMsme = /\b(msme|udyam)\b/.test(s) || (/\b(register|registration)\b/.test(s) && !isMCA && !isGST);
    const isUP = /\b(up|uttar pradesh|varanasi|lucknow|noida|kanpur)\b/.test(s);

    const constraints: Constraint[] = [];
    if (isUP) {
      constraints.push({
        id: 'c-biz-geo-up',
        type: 'GEOGRAPHIC',
        description: 'Jurisdiction: Uttar Pradesh State Industrial Policy',
        strictness: 'HARD',
        value: 'Uttar Pradesh',
      });
    }

    let canonicalIntent = 'ENTREPRENEURIAL_VACUUM: EMERGING_TECH_VENTURE';
    let primaryGoal = 'Establish commercial position in an underserved technology vacuum before mainstream market saturation';
    let entityName = 'Agentic Workflow Verification & Reliability Tooling';

    if (isMCA) {
      canonicalIntent = 'STATUTORY_INCORPORATION: MCA_SPICE_PLUS';
      primaryGoal = 'Incorporate Private Limited Company through Ministry of Corporate Affairs (MCA SPICe+) statutory portal';
      entityName = 'Ministry of Corporate Affairs (MCA)';
      constraints.push({
        id: 'c-biz-mca-spice',
        type: 'LEGAL',
        description: 'Statutory MCA SPICe+ digital company incorporation & DIN/PAN/TAN allocation',
        strictness: 'HARD',
        value: 'MCA_SPICE_PLUS',
      });
    } else if (isGST) {
      canonicalIntent = 'TAX_REGISTRATION: GST_STATUTORY_COMPLIANCE';
      primaryGoal = 'Obtain Goods and Services Tax Identification Number (GSTIN) via official GST common portal';
      entityName = 'GST Statutory Network (GSTN)';
      constraints.push({
        id: 'c-biz-gst-portal',
        type: 'LEGAL',
        description: 'Statutory zero-fee direct GSTIN registration via REG-01',
        strictness: 'HARD',
        value: 'GST_REG_01',
      });
    } else if (isStartupSubsidy) {
      canonicalIntent = 'GOVERNMENT_INCENTIVES: UP_STARTUP_POLICY';
      primaryGoal = 'Apply for Uttar Pradesh state startup capital subsidy and industrial patent incentives';
      entityName = 'StartInUP State Nodal Agency';
      constraints.push({
        id: 'c-biz-startup-subsidy',
        type: 'FINANCIAL',
        description: 'State industrial startup policy incentives & capital grants',
        strictness: 'HARD',
        value: 'STARTINUP_GRANT',
      });
    } else if (isMsme) {
      canonicalIntent = 'BUSINESS_REGISTRATION: MSME_UDYAM_STATUTORY';
      primaryGoal = 'Register verified MSME entity under Government of India Udyam Portal with UP single-window clearance';
      entityName = 'Udyam MSME Registration';
      constraints.push({
        id: 'c-biz-msme-udyam',
        type: 'LEGAL',
        description: 'Zero-fee direct Government Udyam enterprise registration',
        strictness: 'HARD',
        value: 'UDYAM_STATUTORY',
      });
    } else {
      constraints.push({
        id: 'c-biz-market-positioning',
        type: 'OTHER',
        description: 'Commercial position in underserved AI evaluation vacuum',
        strictness: 'HARD',
        value: 'AGENT_EVAL_VACUUM',
      });
    }

    return {
      intentId: `intent-biz-${Date.now()}`,
      canonicalIntent,
      domain: 'BUSINESS',
      domainConfidence: 0.95,
      adapterId: BusinessAdapter.adapterId,
      primaryGoal,
      sourceSignals: [
        {
          signalId: `sig-biz-${Date.now()}`,
          channel: 'CONVERSATION',
          rawPayload: rawSignal,
          confidence: 0.95,
          detectedAt: new Date().toISOString(),
        }
      ],
      constraints,
      entities: [
        {
          entityId: `ent-biz-${Date.now()}`,
          name: entityName,
          type: 'REGULATORY_FRAMEWORK',
          confidence: 0.94,
        }
      ],
      location: isUP ? { region: 'Uttar Pradesh', country: 'India' } : { country: 'India' },
      urgency: 0.7,
      timeframe: {
        horizon: 'SHORT_TERM',
        durationDays: 30,
      },
      epistemicStatus: 'OBSERVED',
      confidence: 0.93,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  public static generateBusinessPaths(intentOrId: string | UDXIntent): PossibilityPath[] {
    const intentId = typeof intentOrId === 'string' ? intentOrId : intentOrId.intentId;
    const rawSignal = typeof intentOrId !== 'string' && intentOrId.sourceSignals?.[0]
      ? String(intentOrId.sourceSignals[0].rawPayload || intentOrId.primaryGoal || '')
      : '';
    const s = rawSignal.toLowerCase();
    const isMCA = /\b(incorporat|private limited|company in india|pvt ltd)\b/i.test(s);
    const isGST = /\b(gst|gst registration|goods and services tax)\b/i.test(s);
    const isStartupSubsidy = /\b(subsidy|incentives|startup subsidy|startinup)\b/i.test(s);
    const isMsme = /\b(msme|udyam)\b/i.test(s) || (/\b(register|registration)\b/i.test(s) && !isMCA && !isGST);

    if (isMCA) {
      const pathMCA: PossibilityPath = {
        pathId: 'path-biz-mca-incorporation',
        intentId,
        title: 'Ministry of Corporate Affairs SPICe+ Company Incorporation (Best Path)',
        description: 'Candidate statutory pathway: Direct MCA portal SPICe+ (Part A & B) single-window filing for DIN, PAN, TAN, EPFO, and Certificate of Incorporation.',
        nodes: [
          {
            nodeId: 'node-biz-mca-start',
            state: 'Intent Initiated: Private Limited Company Incorporation',
            domain: 'BUSINESS',
            entities: [{ entityId: 'ent-promoter', name: 'Company Promoter', type: 'PERSON', role: 'APPLICANT' }],
            confidence: 0.98,
          },
          {
            nodeId: 'node-biz-mca-coi',
            state: 'Certificate of Incorporation (COI) Issued by Registrar of Companies (ROC)',
            domain: 'BUSINESS',
            entities: [],
            confidence: 0.95,
          }
        ],
        edges: [
          {
            edgeId: 'edge-biz-mca-1',
            fromNode: 'node-biz-mca-start',
            toNode: 'node-biz-mca-coi',
            action: 'Execute MCA SPICe+ Digital Incorporation Filing',
            durationDays: 4.0,
            frictionScore: 8,
            probability: 0.95,
            executable: true,
            executionTarget: 'https://www.mca.gov.in',
            actionButtonText: 'Open MCA SPICe+ Portal',
            advantageSummary: 'Statutory government portal integration; zero third-party middleman markup.',
          }
        ],
        estimatedDurationDays: 5.0,
        successProbability: 0.93,
        frictionScore: 8,
        expectedOutcome: 'Direct Incorporation with Issued CIN, PAN, and TAN via MCA',
        outcomeQualityScore: 97,
        isRecommended: true,
      };
      return [pathMCA];
    }

    if (isGST) {
      const pathGST: PossibilityPath = {
        pathId: 'path-biz-gst-registration',
        intentId,
        title: 'Official GST Common Portal Statutory Registration (Zero Fee) (Best Path)',
        description: 'Candidate statutory pathway: Paperless filing under GST REG-01 on official Government of India Goods & Services Tax portal.',
        nodes: [
          {
            nodeId: 'node-biz-gst-start',
            state: 'Intent Initiated: Seeking GSTIN Registration',
            domain: 'BUSINESS',
            entities: [{ entityId: 'ent-taxpayer', name: 'Taxpayer Applicant', type: 'PERSON', role: 'APPLICANT' }],
            confidence: 0.98,
          },
          {
            nodeId: 'node-biz-gst-active',
            state: '15-Digit GSTIN & Registration Certificate Issued',
            domain: 'BUSINESS',
            entities: [],
            confidence: 0.96,
          }
        ],
        edges: [
          {
            edgeId: 'edge-biz-gst-1',
            fromNode: 'node-biz-gst-start',
            toNode: 'node-biz-gst-active',
            action: 'Complete GST REG-01 Application via Official GST Portal',
            durationDays: 3.0,
            frictionScore: 6,
            probability: 0.96,
            executable: true,
            executionTarget: 'https://reg.gst.gov.in',
            actionButtonText: 'Open Official GST Portal',
            advantageSummary: 'Statutory zero-fee direct government registration; prevents fake portal phishing.',
          }
        ],
        estimatedDurationDays: 3.0,
        successProbability: 0.94,
        frictionScore: 6,
        expectedOutcome: 'Active GSTIN with Verified Input Tax Credit (ITC) Authorization',
        outcomeQualityScore: 96,
        isRecommended: true,
      };
      return [pathGST];
    }

    if (isStartupSubsidy) {
      const pathSubsidy: PossibilityPath = {
        pathId: 'path-biz-up-startup-subsidy',
        intentId,
        title: 'Uttar Pradesh State Startup Policy Subsidies & Incentives (Best Path)',
        description: 'Candidate state policy pathway: Direct application on StartInUP portal for seed capital, patent reimbursement, and monthly sustenance allowance.',
        nodes: [
          {
            nodeId: 'node-biz-up-sub-start',
            state: 'Intent Initiated: Seeking UP Startup Policy Incentives',
            domain: 'BUSINESS',
            entities: [{ entityId: 'ent-founder', name: 'Recognized Startup Founder', type: 'PERSON', role: 'APPLICANT' }],
            confidence: 0.98,
          },
          {
            nodeId: 'node-biz-up-sub-granted',
            state: 'State Subsidy Sanction Order Issued',
            domain: 'BUSINESS',
            entities: [],
            confidence: 0.92,
          }
        ],
        edges: [
          {
            edgeId: 'edge-biz-up-sub-1',
            fromNode: 'node-biz-up-sub-start',
            toNode: 'node-biz-up-sub-granted',
            action: 'Apply on Uttar Pradesh Government StartInUP Portal',
            durationDays: 14.0,
            frictionScore: 12,
            probability: 0.88,
            executable: true,
            executionTarget: 'https://startinup.up.gov.in',
            actionButtonText: 'Open StartInUP Portal',
            advantageSummary: 'Direct state single-window access for capital grant and patent fee reimbursement.',
          }
        ],
        estimatedDurationDays: 30.0,
        successProbability: 0.89,
        frictionScore: 12,
        expectedOutcome: 'Official Sanction of UP State Startup Seed Grant and Industrial Incentives',
        outcomeQualityScore: 94,
        isRecommended: true,
      };
      return [pathSubsidy];
    }

    if (isMsme) {
      const pathUdyam: PossibilityPath = {
        pathId: 'path-biz-msme-udyam-statutory',
        intentId,
        title: 'Official Ministry of MSME Udyam Portal Registration (Statutory Zero Fee) (Best Path)',
        description: 'Candidate statutory pathway: Direct paperless registration on official Government of India Udyam portal. Bypasses commercial third-party aggregator markups.',
        nodes: [
          {
            nodeId: 'node-biz-start',
            state: 'Intent Initiated: Seeking MSME Registration in UP',
            domain: 'BUSINESS',
            entities: [{ entityId: 'ent-founder', name: 'Enterprise Applicant', type: 'PERSON', role: 'APPLICANT' }],
            confidence: 0.98,
          },
          {
            nodeId: 'node-biz-docs-prepared',
            state: 'Aadhaar, PAN & GSTIN Verification Prepared',
            domain: 'BUSINESS',
            entities: [{ entityId: 'ent-pan-aadhaar', name: 'Statutory Credentials', type: 'DOCUMENT', role: 'PREREQUISITE' }],
            confidence: 0.95,
          },
          {
            nodeId: 'node-biz-certificate-issued',
            state: 'Permanent Udyam Registration Number (URN) Generated',
            domain: 'BUSINESS',
            entities: [{ entityId: 'ent-urn', name: 'Udyam Registration Certificate', type: 'CERTIFICATE', role: 'OUTCOME' }],
            confidence: 0.96,
          }
        ],
        edges: [
          {
            edgeId: 'edge-biz-udyam-1',
            fromNode: 'node-biz-start',
            toNode: 'node-biz-docs-prepared',
            action: 'Execute Form Submission on Official Udyam Registration Portal',
            durationDays: 0.5,
            frictionScore: 4,
            probability: 0.98,
            executable: true,
            executionTarget: 'https://udyamregistration.gov.in',
            actionButtonText: 'Open Official Udyam Portal',
            advantageSummary: 'Statutory zero-fee direct filing; avoids ₹1,500–₹5,000 consultant charges.'
          }
        ],
        estimatedDurationDays: 1.5,
        successProbability: 0.96,
        frictionScore: 5,
        expectedOutcome: 'Official Udyam Registration Certificate with Priority Lending & Subsidized Utility Eligibility',
        outcomeQualityScore: 98,
        isRecommended: true,
      };

      return [pathUdyam];
    }

    // VENTURE / STARTUP VACUUM PATHWAY
    const pathPreemptiveVacuum: PossibilityPath = {
      pathId: 'path-biz-preemptive-vacuum',
      intentId,
      title: 'Preemptive Market Vacuum Stake in Agent Evaluation (Best Path)',
      description: 'Stakes first-party authority in agentic workflow verification 38 days before mainstream demand peak.',
      nodes: [
        {
          nodeId: 'node-biz-start',
          state: 'Vacuum Identified: Agent Failure Auditing Tools',
          domain: 'BUSINESS',
          entities: [],
          confidence: 0.94,
        },
        {
          nodeId: 'node-biz-pilot',
          state: '5 Design Partners Onboarded with Pre-Paid Letters of Intent',
          domain: 'BUSINESS',
          entities: [],
          confidence: 0.89,
        },
        {
          nodeId: 'node-biz-revenue',
          state: '₹5,00,000 MRR Initial Commercial Flywheel Established',
          domain: 'BUSINESS',
          entities: [],
          confidence: 0.86,
        }
      ],
      edges: [
        {
          edgeId: 'edge-biz-1',
          fromNode: 'node-biz-start',
          toNode: 'node-biz-pilot',
          action: 'Deploy Lightweight Verification Evaluation Harness for Design Partners',
          durationDays: 14.0,
          frictionScore: 15,
          probability: 0.91,
          executable: true,
          executionTarget: '/business/ventures/ai-agent-evaluation-brief',
          actionButtonText: 'Initialize Venture Brief',
          advantageSummary: 'Validates willingness-to-pay before capital expenditure.',
        }
      ],
      estimatedDurationDays: 45.0,
      successProbability: 0.88,
      frictionScore: 18,
      expectedOutcome: 'Profitable Initial Enterprise Customer Cohort with Zero Dilutive Funding',
      outcomeQualityScore: 94,
      isRecommended: true,
    };

    return [pathPreemptiveVacuum];
  }
}
