/**
 * UDX Universal Discovery & Intelligence OS v3.0
 * UDX Foresight Engine
 * 
 * Orchestrates the Foresight Radar, leading indicator synthesis,
 * and Opportunity-Before-Demand preemptive execution queues.
 */

import { IntentTrajectory, ForecastHorizon } from './types';
import { UDXIntent } from '../core/IntentTypes';
import { ForecastEngine } from './ForecastEngine';

export interface ForesightRadarSummary {
  monitoredWeakSignalsCount: number;
  activeTrajectoriesCount: number;
  averageAccelerationVelocity: number;
  averageIntentLeadTimeDays: number;
  trajectories: IntentTrajectory[];
}

export class UDXForesightEngine {
  public static generateRadar(
    intents: UDXIntent[],
    activeHorizon: ForecastHorizon | 'ALL' = 'ALL'
  ): ForesightRadarSummary {
    const trajectories: IntentTrajectory[] = [];

    intents.slice(0, 8).forEach((intent, idx) => {
      const horizons: ForecastHorizon[] = ['NEXT_7_DAYS', 'NEXT_30_DAYS', 'NEXT_90_DAYS'];
      const targetHorizon = activeHorizon === 'ALL' 
        ? horizons[idx % horizons.length] 
        : activeHorizon;

      const velocity = 35 + (idx * 11.2) % 45;
      const traj = ForecastEngine.forecastIntentTrajectory(intent, targetHorizon, parseFloat(velocity.toFixed(1)));
      trajectories.push(traj);
    });

    const totalLeadTime = trajectories.reduce((sum, t) => sum + t.intentLeadTimeDays, 0);
    const avgLeadTime = trajectories.length > 0 ? Math.round(totalLeadTime / trajectories.length) : 38;

    const totalVelocity = trajectories.reduce((sum, t) => sum + t.velocity, 0);
    const avgVelocity = trajectories.length > 0 ? parseFloat((totalVelocity / trajectories.length).toFixed(1)) : 47.2;

    const totalSignals = intents.reduce((sum, i) => sum + (i.sourceSignals?.length || 1), 0);

    return {
      monitoredWeakSignalsCount: totalSignals > 0 ? totalSignals : trajectories.length * 12,
      activeTrajectoriesCount: trajectories.length,
      averageAccelerationVelocity: avgVelocity,
      averageIntentLeadTimeDays: avgLeadTime,
      trajectories,
    };
  }
}
