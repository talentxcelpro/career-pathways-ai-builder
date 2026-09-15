/**
 * UDX Universal Discovery & Intelligence OS v3.0
 * Outcome Engine
 * 
 * Ingests terminal verification events and calculates
 * the master Intent Resolution Rate (IRR).
 * 
 * ZERO SEED DATA — STRICT EMPIRICAL OUTCOME ENGINE.
 */

import { OutcomeRecord, IntentResolutionMetrics, OutcomeMaturityLevel } from './OutcomeTypes';

export class OutcomeEngine {
  private static recordedOutcomes: OutcomeRecord[] = [];

  public static recordOutcome(outcome: OutcomeRecord): void {
    if (outcome.actionStatus && outcome.actionStatus !== 'ACTION_COMPLETED') {
      throw new Error(
        `[OutcomeEngine] Invariant Violation: Cannot record outcome for action [${outcome.actionId}] with status ${outcome.actionStatus}. Only ACTION_COMPLETED actions can feed the outcome loop.`
      );
    }
    this.recordedOutcomes.push(outcome);
  }

  public static updateMaturity(
    outcomeId: string,
    newMaturity: OutcomeMaturityLevel,
    updates?: Partial<OutcomeRecord>
  ): OutcomeRecord | undefined {
    const outcome = this.recordedOutcomes.find(o => o.outcomeId === outcomeId);
    if (!outcome) return undefined;
    outcome.maturityLevel = newMaturity;
    if (updates) {
      Object.assign(outcome, updates);
    }
    return outcome;
  }

  public static getMetrics(): IntentResolutionMetrics {
    const total = this.recordedOutcomes.length;
    if (total === 0) {
      return {
        totalIntentsInitiated: 0,
        totalResolvedSuccessfully: 0,
        intentResolutionRatePercent: 0,
        averageTimeToResolutionHours: 0,
        averageOutcomeQualityScore: 0,
      };
    }

    const successes = this.recordedOutcomes.filter(o => o.status === 'SUCCESS').length;
    const totalHours = this.recordedOutcomes.reduce((acc, o) => acc + o.timeToOutcomeHours, 0);
    const totalQuality = this.recordedOutcomes.reduce((acc, o) => acc + o.qualityScore, 0);

    const irr = Math.round((successes / total) * 100);
    const avgHours = Math.round(totalHours / total);
    const avgQuality = Math.round(totalQuality / total);

    return {
      totalIntentsInitiated: total,
      totalResolvedSuccessfully: successes,
      intentResolutionRatePercent: irr,
      averageTimeToResolutionHours: avgHours,
      averageOutcomeQualityScore: avgQuality,
    };
  }

  public static getAll(): OutcomeRecord[] {
    return [...this.recordedOutcomes];
  }

  public static clear(): void {
    this.recordedOutcomes = [];
  }
}
