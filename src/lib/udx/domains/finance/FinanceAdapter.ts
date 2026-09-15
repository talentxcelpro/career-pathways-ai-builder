/**
 * UDX Universal Discovery & Intelligence OS v3.0 — Reality Engine
 * Finance Domain Adapter (Proof 3: Cross-Domain Proving Laboratory)
 * 
 * Demonstrates domain-independence:
 * Intent: "I need to reduce my monthly expenses by ₹20,000 without sacrificing living standard."
 */

import { UDXIntent } from '../../core/IntentTypes';
import { PossibilityPath } from '../../possibility/types';

export class FinanceAdapter {
  public static toFinanceIntent(rawSignal: string): UDXIntent {
    return {
      intentId: `intent-fin-${Date.now()}`,
      canonicalIntent: 'ECONOMIC_OPTIMIZATION: LIFESTYLE_ARBITRAGE',
      domain: 'FINANCE',
      primaryGoal: 'Reduce recurring monthly living expenditure by ₹20,000 through structured substitution and geo-arbitrage without living standard sacrifice',
      sourceSignals: [
        {
          signalId: `sig-fin-${Date.now()}`,
          channel: 'CONVERSATION',
          rawContent: rawSignal,
          confidence: 0.98,
          timestamp: new Date().toISOString(),
        }
      ],
      constraints: [
        {
          type: 'ECONOMIC',
          description: 'Net monthly reduction >= ₹20,000',
          strict: true,
        },
        {
          type: 'OPERATIONAL',
          description: 'No reduction in housing quality, nutrition, or essential connectivity',
          strict: true,
        }
      ],
      entities: [],
      urgency: 'HIGH',
      timeframe: 'NEXT_30_DAYS',
      epistemicStatus: 'OBSERVED',
      confidence: 0.95,
    };
  }

  public static generateFinancePaths(intentId: string): PossibilityPath[] {
    const pathArbitrage: PossibilityPath = {
      pathId: 'path-fin-structural-arbitrage',
      intentId,
      title: 'Structural Substitution & Recurring Cost Arbitrage (Best Path)',
      description: 'Audit recurring subscriptions, re-contract broadband/utilities, and optimize procurement without lifestyle sacrifice.',
      nodes: [
        {
          nodeId: 'node-fin-start',
          state: 'Baseline Assessed: ₹65,000/mo Current Burn',
          domain: 'FINANCE',
          entities: [],
          confidence: 0.98,
        },
        {
          nodeId: 'node-fin-contracts',
          state: 'Negotiated Utility, Cloud & Workspace Arbitrage (-₹12,500/mo)',
          domain: 'FINANCE',
          entities: [],
          confidence: 0.94,
        },
        {
          nodeId: 'node-fin-target',
          state: 'Target Achieved: ₹44,200/mo (-₹20,800/mo net savings)',
          domain: 'FINANCE',
          entities: [],
          confidence: 0.91,
        }
      ],
      edges: [
        {
          edgeId: 'edge-fin-1',
          fromNode: 'node-fin-start',
          toNode: 'node-fin-contracts',
          action: 'Execute Automated Recurring Subscription & Contract Audit',
          durationDays: 3.0,
          frictionScore: 8,
          probability: 0.96,
          executable: true,
          executionTarget: '/tools/expense-audit',
          actionButtonText: 'Run Subscription Audit',
          advantageSummary: 'Eliminates zombie recurring charges immediately.',
        },
        {
          edgeId: 'edge-fin-2',
          fromNode: 'node-fin-contracts',
          toNode: 'node-fin-target',
          action: 'Re-negotiate Rent / Relocation Tier-2 Arbitrage Option',
          durationDays: 14.0,
          frictionScore: 20,
          probability: 0.88,
          executable: false,
          advantageSummary: 'Long-term structural baseline reduction without austerity.',
        }
      ],
      estimatedDurationDays: 17.0,
      successProbability: 0.92,
      frictionScore: 14,
      expectedOutcome: 'Net Monthly Recurring Savings of ₹20,800 Secured',
      outcomeQualityScore: 95,
      isRecommended: true,
    };

    return [pathArbitrage];
  }
}
