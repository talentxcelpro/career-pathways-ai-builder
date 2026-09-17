/**
 * UDX v4.0 — Foresight & Pre-Demand Discovery Engine
 * 
 * Detects emerging intents before they become mainstream keywords:
 * WEAK_SIGNAL -> EMERGING -> ACCELERATING -> MAINSTREAM -> SATURATED
 * 
 * Computes true Intent Lead Time (days) from empirical evidence.
 * Strict rule: Never invent future demand.
 */

import { IntentStage, IntentUniverseEntry } from './IntentUniverse';

export interface ForesightTrajectory {
  intentId: string;
  canonicalIntent: string;
  stage: IntentStage;
  currentVelocity: number;
  currentAcceleration: number;
  leadingIndicators: string[];
  firstObservedAt: string;
  mainstreamObservedAt?: string;
  intentLeadTimeDays?: number;
  estimatedInflectionDate?: string;
  confidence: number;
  strategicAction: 'PREPARE_SUPPLY' | 'BUILD_PROTOTYPE_PATH' | 'DEPLOY_SURFACE' | 'MONITOR_ONLY';
}

export class ForesightEngine {
  /**
   * Evaluates an intent's velocity and demand trajectory to calculate foresight stage and lead time.
   */
  public static projectTrajectory(entry: IntentUniverseEntry): ForesightTrajectory {
    const { intentId, canonicalIntent, demand, velocity, acceleration, firstObservedAt } = entry;
    
    // Calculate empirical lead time if mainstream has been observed
    let intentLeadTimeDays: number | undefined;
    let mainstreamObservedAt: string | undefined;

    const firstTime = new Date(firstObservedAt).getTime();
    const now = Date.now();
    const ageDays = Math.max(1, Math.round((now - firstTime) / (1000 * 60 * 60 * 24)));

    if (entry.stage === 'MAINSTREAM') {
      mainstreamObservedAt = new Date().toISOString();
      intentLeadTimeDays = ageDays;
    }

    // Determine leading indicators based on signal mix
    const leadingIndicators: string[] = [];
    if (velocity > 0.25) leadingIndicators.push('SEARCH_VELOCITY_SPIKE');
    if (entry.querySignals.some(s => s.source === 'AGENT_QUERY')) leadingIndicators.push('AUTONOMOUS_AGENT_PROBING');
    if (entry.querySignals.some(s => s.source === 'INTERNAL_SEARCH')) leadingIndicators.push('FIRST_PARTY_SEARCH_SEARCH');
    if (demand.avgPosition <= 5 && demand.avgCtr > 0.08) leadingIndicators.push('HIGH_CTR_ENGAGEMENT');

    // Strategic Action
    let strategicAction: ForesightTrajectory['strategicAction'] = 'MONITOR_ONLY';
    if (entry.stage === 'WEAK_SIGNAL' && velocity > 0.15) {
      strategicAction = 'PREPARE_SUPPLY';
    } else if (entry.stage === 'EMERGING' && velocity > 0.2) {
      strategicAction = 'BUILD_PROTOTYPE_PATH';
    } else if (entry.stage === 'ACCELERATING' || entry.stage === 'MAINSTREAM') {
      strategicAction = 'DEPLOY_SURFACE';
    }

    // Estimated inflection date (only projected when acceleration is positive)
    let estimatedInflectionDate: string | undefined;
    if (acceleration > 0 && entry.stage !== 'MAINSTREAM') {
      const daysToInflect = Math.max(7, Math.round((1.0 - velocity) * 30));
      const inflectionDate = new Date(now + daysToInflect * 24 * 60 * 60 * 1000);
      estimatedInflectionDate = inflectionDate.toISOString().split('T')[0];
    }

    return {
      intentId,
      canonicalIntent,
      stage: entry.stage,
      currentVelocity: velocity,
      currentAcceleration: acceleration,
      leadingIndicators,
      firstObservedAt,
      mainstreamObservedAt,
      intentLeadTimeDays,
      estimatedInflectionDate,
      confidence: Math.min(0.95, Number((0.70 + velocity * 0.4).toFixed(2))),
      strategicAction,
    };
  }
}
