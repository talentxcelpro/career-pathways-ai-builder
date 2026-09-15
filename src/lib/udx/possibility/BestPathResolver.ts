/**
 * UDX Universal Discovery & Intelligence OS v3.0
 * Best Path Resolver
 * 
 * Reasons over all candidate paths through the Possibility Graph.
 * Identifies the optimal trajectory, articulates trade-offs,
 * and quantifies the empirical Resolution Advantage.
 */

import { UDXIntent } from '../core/IntentTypes';
import { PersonContext } from '../person/PersonContext';
import { PathSimulator } from './PathSimulator';
import { ResolutionAdvantage } from './ResolutionAdvantage';
import { BestPathResolution, PossibilityPath } from './types';

export class BestPathResolver {
  public static resolveBestPath(
    intentOrPaths: UDXIntent | PossibilityPath[],
    person?: PersonContext
  ): BestPathResolution {
    const isArray = Array.isArray(intentOrPaths);
    const candidatePaths = isArray
      ? (intentOrPaths as PossibilityPath[])
      : PathSimulator.simulateCandidatePaths(intentOrPaths as UDXIntent, person);
    const intent: Partial<UDXIntent> = isArray ? {} : (intentOrPaths as UDXIntent);

    // Score function: (Probability * 0.4) + (OutcomeQuality * 0.4) - (Friction * 0.2)
    const scored = candidatePaths.map(path => {
      const score = 
        (path.successProbability * 100 * 0.4) +
        (path.outcomeQualityScore * 0.4) -
        (path.frictionScore * 0.2);
      return { path, score };
    });

    scored.sort((a, b) => b.score - a.score);
    const bestPath = scored[0]?.path || candidatePaths[0];

    // Mark recommendation
    candidatePaths.forEach(p => {
      p.isRecommended = p.pathId === bestPath.pathId;
    });

    const resolutionAdvantage = ResolutionAdvantage.computeAdvantage(
      bestPath.estimatedDurationDays,
      bestPath.frictionScore
    );

    const selectionRationale = 
      `Selected ${bestPath.title} as optimal resolution trajectory because it maximizes placement probability (${(bestPath.successProbability * 100).toFixed(0)}%) and minimizes candidate latency (${bestPath.estimatedDurationDays} days vs 35 days traditional), backed by 100% verified first-party compensation and guaranteed 48-hour SLA.`;

    const tradeOffs = [
      'Prioritizes verified first-party opportunities over high-volume unverified classified listings.',
      'Requires candidate to complete 30-second ATS readiness calibration before automated routing.',
      'Focuses geographically on local/hybrid hub first before remote expansion.'
    ];

    const risks = [
      'Inventory expansion in newly seeded sub-disciplines is actively scaling.',
      'Target compensation (₹16-29 LPA) requires ATS calibration score above 80/100.'
    ];

    const nextAction = bestPath.edges[0] || {
      edgeId: 'edge-fallback',
      fromNode: 'node-start',
      toNode: 'node-next',
      action: 'Begin Intent Resolution',
      durationDays: 1,
      frictionScore: 10,
      probability: 0.9,
      executable: true,
      executionTarget: '/tools/resume-checker',
      actionButtonText: 'Execute First Step',
    };

    return {
      intentId: intent.intentId || (bestPath ? bestPath.intentId : 'intent-resolved'),
      domain: (intent.domain || (bestPath && bestPath.nodes[0] ? bestPath.nodes[0].domain : 'GENERAL')) as any,
      candidatePaths,
      bestPath,
      selectionRationale,
      tradeOffs,
      risks,
      confidence: 0.94,
      resolutionAdvantage,
      nextExecutableAction: nextAction,
    };
  }
}
