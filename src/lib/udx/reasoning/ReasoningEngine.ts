/**
 * UDX Universal Discovery & Intelligence OS v3.0
 * Reasoning Engine
 * 
 * Conducts multi-path evaluation, risk-reward modeling,
 * and trade-off synthesis across possibility pathways.
 */

import { PossibilityPath } from '../possibility/types';
import { OutcomeModel, OutcomeDistribution } from './OutcomeModel';
import { DecisionEngine, DecisionEvaluation } from './DecisionEngine';

export interface PathReasoningSummary {
  pathId: string;
  expectedDistribution: OutcomeDistribution;
  decisionGovernance: DecisionEvaluation;
  tradeOffSummary: string;
  recommendedForExecution: boolean;
}

export class ReasoningEngine {
  public static reasonOverPath(path: PossibilityPath): PathReasoningSummary {
    const distribution = OutcomeModel.modelDistribution(
      path.successProbability,
      path.estimatedDurationDays
    );

    const governance = DecisionEngine.evaluate(path.edges[0]?.action || path.title);

    const tradeOffSummary = `Balances ${(path.successProbability * 100).toFixed(0)}% placement success against ${path.frictionScore}/100 friction score over a ${path.estimatedDurationDays}-day timeline.`;

    return {
      pathId: path.pathId,
      expectedDistribution: distribution,
      decisionGovernance: governance,
      tradeOffSummary,
      recommendedForExecution: path.isRecommended,
    };
  }
}
