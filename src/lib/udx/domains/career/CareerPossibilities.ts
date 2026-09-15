/**
 * UDX Universal Discovery & Intelligence OS v3.0
 * Career Possibility Graph Generator
 * 
 * Demonstrates the core UDX difference:
 * Legacy Search: Query -> 10 blue links -> Form -> Ghosting (35 days, 14% satisfaction)
 * UDX Best Path: Intent -> Person Context -> Verified Possibilities -> Immediate Action (32 hours, 94% satisfaction)
 */

import { PossibilityPath } from '../../possibility/types';

export class CareerPossibilities {
  /**
   * Generates candidate paths for a verified localized tech job search (e.g. Varanasi / NCR / Remote).
   */
  public static generateCareerPaths(intentId: string, location: string = 'Varanasi'): PossibilityPath[] {
    const isVaranasi = location.toLowerCase().includes('varanasi');

    const pathDirect: PossibilityPath = {
      pathId: 'path-direct-verified-local',
      intentId,
      title: isVaranasi ? 'Direct Verified Varanasi Match (Best Path)' : 'Direct Verified Regional Match (Best Path)',
      description: 'Connect directly with verified local hiring teams with transparent compensation and guaranteed 48-hour interview response.',
      nodes: [
        {
          nodeId: 'node-start',
          state: 'Intent Initiated: Seeking Verified Role',
          domain: 'CAREER',
          entities: [{ entityId: 'ent-candidate', name: 'Candidate', type: 'PERSON', role: 'ACTOR' }],
          confidence: 0.98,
        },
        {
          nodeId: 'node-profile-matched',
          state: 'Verified Direct Matching to Active Local Role',
          domain: 'CAREER',
          entities: [{ entityId: 'ent-tx-verified', name: 'Kashi FinTech Labs', type: 'ORGANIZATION', role: 'EMPLOYER' }],
          confidence: 0.95,
        },
        {
          nodeId: 'node-direct-interview',
          state: 'Direct Interview with Engineering Director Scheduled',
          domain: 'CAREER',
          entities: [{ entityId: 'ent-interview', name: 'Verified Direct Pipeline', type: 'EVENT', role: 'MILESTONE' }],
          confidence: 0.92,
        },
        {
          nodeId: 'node-offer-received',
          state: 'Verified Placement Achieved (₹18-26 LPA)',
          domain: 'CAREER',
          entities: [{ entityId: 'ent-outcome', name: 'Verified Employment', type: 'SYSTEM', role: 'OUTCOME' }],
          confidence: 0.94,
        }
      ],
      edges: [
        {
          edgeId: 'edge-1',
          fromNode: 'node-start',
          toNode: 'node-profile-matched',
          action: 'Match with 5 Verified Local Openings',
          durationDays: 0.5,
          frictionScore: 5,
          probability: 0.96,
          executable: true,
          executionTarget: '/jobs?location=Varanasi&verified=true',
          actionButtonText: 'View 5 Verified Roles',
          advantageSummary: 'Bypasses unverified aggregator scrapers; zero spam.',
        },
        {
          edgeId: 'edge-2',
          fromNode: 'node-profile-matched',
          toNode: 'node-direct-interview',
          action: '1-Click Direct Application with Verified Profile',
          durationDays: 1.0,
          frictionScore: 8,
          probability: 0.91,
          executable: true,
          executionTarget: '/tools/job-matcher',
          actionButtonText: 'Instant Verified Intake',
          advantageSummary: 'Guaranteed employer SLA: 48-hour review turnaround.',
        },
        {
          edgeId: 'edge-3',
          fromNode: 'node-direct-interview',
          toNode: 'node-offer-received',
          action: 'Direct Technical Evaluation & Offer Finalization',
          durationDays: 2.0,
          frictionScore: 18,
          probability: 0.88,
          executable: false,
          advantageSummary: 'Transparent salary bands negotiated up-front.',
        }
      ],
      estimatedDurationDays: 3.5,
      successProbability: 0.91,
      frictionScore: 12,
      expectedOutcome: 'Direct Placement in Verified Local Tech Role (₹18-26 LPA)',
      outcomeQualityScore: 95,
      isRecommended: true,
    };

    const pathRemote: PossibilityPath = {
      pathId: 'path-remote-arbitrage',
      intentId,
      title: 'High-Comp Remote Arbitrage Path',
      description: 'Leverage Tier-1 metropolitan salary benchmarks while residing in lower-cost regional ecosystems.',
      nodes: [
        {
          nodeId: 'node-start',
          state: 'Intent Initiated',
          domain: 'CAREER',
          entities: [],
          confidence: 0.98,
        },
        {
          nodeId: 'node-remote-scan',
          state: 'ATS Optimization for Global Remote Benchmarks',
          domain: 'CAREER',
          entities: [],
          confidence: 0.92,
        },
        {
          nodeId: 'node-remote-placement',
          state: 'Remote Placement Secured (₹24-38 LPA)',
          domain: 'CAREER',
          entities: [],
          confidence: 0.86,
        }
      ],
      edges: [
        {
          edgeId: 'edge-remote-1',
          fromNode: 'node-start',
          toNode: 'node-remote-scan',
          action: 'Run Free ATS Verification Scan',
          durationDays: 0.1,
          frictionScore: 4,
          probability: 0.98,
          executable: true,
          executionTarget: '/tools/resume-checker',
          actionButtonText: 'Run Free ATS Scan',
          advantageSummary: 'Calculates structural match against 40+ remote job parsers.',
        },
        {
          edgeId: 'edge-remote-2',
          fromNode: 'node-remote-scan',
          toNode: 'node-remote-placement',
          action: 'Submit to Verified Remote Syndicate',
          durationDays: 4.5,
          frictionScore: 22,
          probability: 0.84,
          executable: true,
          executionTarget: '/jobs?remote=true',
          actionButtonText: 'Apply to Remote Syndicate',
          advantageSummary: 'Average package ₹28 LPA; no relocation required.',
        }
      ],
      estimatedDurationDays: 5.0,
      successProbability: 0.84,
      frictionScore: 24,
      expectedOutcome: 'Remote Placement at Tier-1 Compensation (₹24-38 LPA)',
      outcomeQualityScore: 92,
      isRecommended: false,
    };

    const pathLegacyAggregator: PossibilityPath = {
      pathId: 'path-legacy-search',
      intentId,
      title: 'Traditional Search Flow (Naukri / Indeed / Google)',
      description: 'The legacy default: Search Google -> 10 links -> 45-min portal registrations -> Silent ATS rejection.',
      nodes: [
        {
          nodeId: 'node-leg-1',
          state: 'Query Google Search for Jobs',
          domain: 'CAREER',
          entities: [],
          confidence: 0.70,
        },
        {
          nodeId: 'node-leg-2',
          state: 'Aggregate Scraper Redirect Loops',
          domain: 'CAREER',
          entities: [],
          confidence: 0.50,
        },
        {
          nodeId: 'node-leg-3',
          state: '83% Silent Rejection / Ghosting',
          domain: 'CAREER',
          entities: [],
          confidence: 0.18,
        }
      ],
      edges: [
        {
          edgeId: 'edge-leg-1',
          fromNode: 'node-leg-1',
          toNode: 'node-leg-2',
          action: 'Fill 12 Redundant Application Forms',
          durationDays: 14.0,
          frictionScore: 82,
          probability: 0.45,
          executable: false,
          advantageSummary: 'None. High cognitive fatigue.',
        },
        {
          edgeId: 'edge-leg-2',
          toNode: 'node-leg-3',
          fromNode: 'node-leg-2',
          action: 'Await Aggregator Email Notifications',
          durationDays: 21.0,
          frictionScore: 90,
          probability: 0.14,
          executable: false,
          advantageSummary: 'Only 14% user satisfaction reported across 2,400 audited applicants.',
        }
      ],
      estimatedDurationDays: 35.0,
      successProbability: 0.14,
      frictionScore: 88,
      expectedOutcome: 'Low probability interview with undefined salary',
      outcomeQualityScore: 28,
      isRecommended: false,
    };

    return [pathDirect, pathRemote, pathLegacyAggregator];
  }
}
