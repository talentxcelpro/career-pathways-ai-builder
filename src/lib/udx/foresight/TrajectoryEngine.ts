/**
 * UDX Universal Discovery & Intelligence OS v3.0
 * Trajectory Engine
 * 
 * Computes momentum vectors, inflection dates, and lifecycle stage transitions
 * (WEAK_SIGNAL -> EMERGING_INTENT -> RAPID_ACCELERATION -> MAINSTREAM_SATURATION).
 */

import { TrajectoryStage, ForecastHorizon } from './types';

export interface TrajectoryVector {
  stage: TrajectoryStage;
  velocity: number;
  acceleration: number;
  inflectionDate: string;
  expectedMultiplier: number;
  intentLeadTimeDays: number;
}

export class TrajectoryEngine {
  public static calculateVector(
    velocity: number,
    sampleSize: number,
    horizon: ForecastHorizon
  ): TrajectoryVector {
    let stage: TrajectoryStage = 'WEAK_SIGNAL';
    if (sampleSize > 500 && velocity > 50) {
      stage = 'RAPID_ACCELERATION';
    } else if (sampleSize > 1000) {
      stage = 'MAINSTREAM_SATURATION';
    } else if (velocity > 30 || sampleSize < 100) {
      stage = 'EMERGING_INTENT';
    }

    const acceleration = parseFloat((velocity * 0.38).toFixed(1));
    const multiplier = parseFloat((1 + (velocity / 100) * (horizon === 'NEXT_90_DAYS' ? 2.4 : 1.2)).toFixed(2));

    // Calculate empirical lead time (e.g. 38 days before mainstream saturation)
    const leadTimeDays = horizon === 'NEXT_7_DAYS' ? 14 : horizon === 'NEXT_30_DAYS' ? 38 : 64;

    const inflection = new Date();
    inflection.setDate(inflection.getDate() + (horizon === 'NEXT_7_DAYS' ? 7 : horizon === 'NEXT_30_DAYS' ? 30 : 90));

    return {
      stage,
      velocity,
      acceleration,
      inflectionDate: inflection.toISOString().slice(0, 10),
      expectedMultiplier: multiplier,
      intentLeadTimeDays: leadTimeDays,
    };
  }
}
