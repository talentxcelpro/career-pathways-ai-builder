/**
 * UDX Universal Discovery & Intelligence OS v3.0
 * Learning Engine
 * 
 * Closes the feedback loop: uses measured outcomes to dynamically adjust
 * future path probability weights and refine foresight accuracy.
 * 
 * CONTRACT:
 * Outcome must be OUTCOME_OBSERVED or OUTCOME_VERIFIED before learning can occur.
 * Pending outcomes defer learning adjustments.
 */

import { IntentMemory } from './IntentMemory';
import { OutcomeRecord } from '../outcomes/OutcomeTypes';

export interface LearningDelta {
  pathId: string;
  probabilityAdjustment: number;
  newConfidenceScore: number;
  lessonLearned: string;
}

export class LearningEngine {
  public static assimilateOutcome(outcome: OutcomeRecord): LearningDelta {
    // Invariant: If outcome is still pending, learning is deferred
    if (outcome.maturityLevel === 'OUTCOME_PENDING') {
      return {
        pathId: outcome.pathId,
        probabilityAdjustment: 0,
        newConfidenceScore: 0.88,
        lessonLearned: `Path ${outcome.pathId} action completed; awaiting downstream observation. Learning deferred until observation.`,
      };
    }

    const isSuccess = outcome.status === 'SUCCESS';
    const isFailed = outcome.status === 'FAILED' || outcome.status === 'ABANDONED';

    // Dynamic empirical calibration:
    // Success: +0.02 to +0.08 based on speed/quality
    // Failure / Friction: -0.12 to -0.18 downward probability decay
    let adjustment = 0;
    let newConfidence = 0.85;

    if (isSuccess) {
      adjustment = outcome.actualLift ? Math.min(0.08, Math.max(0.02, outcome.actualLift * 0.1)) : +0.04;
      newConfidence = Math.min(0.98, 0.88 + adjustment);
    } else {
      adjustment = isFailed ? -0.14 : -0.06;
      newConfidence = Math.max(0.50, 0.88 + adjustment); // Decays down to 0.74 or lower
    }

    const lesson = isSuccess
      ? `Path ${outcome.pathId} validated with ${outcome.timeToOutcomeHours}h resolution.`
      : `Path ${outcome.pathId} failed verification or experienced friction; recommendation probability decayed by ${(Math.abs(adjustment) * 100).toFixed(0)}%.`;

    IntentMemory.append({
      memoryId: `mem-${Date.now()}`,
      intentId: outcome.intentId,
      domain: (outcome.metadata?.domain as string) || 'GENERAL',
      canonicalIntent: (outcome.metadata?.canonicalIntent as string) || 'RESOLVED_INTENT',
      chosenPathId: outcome.pathId,
      outcomeStatus: outcome.status,
      timeToOutcomeHours: outcome.timeToOutcomeHours,
      learningLesson: lesson,
      recordedAt: new Date().toISOString(),
    });

    return {
      pathId: outcome.pathId,
      probabilityAdjustment: parseFloat(adjustment.toFixed(3)),
      newConfidenceScore: parseFloat(newConfidence.toFixed(2)),
      lessonLearned: lesson,
    };
  }
}
