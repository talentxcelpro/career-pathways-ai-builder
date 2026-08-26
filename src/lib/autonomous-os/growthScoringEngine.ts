// src/lib/autonomous-os/growthScoringEngine.ts
import { OneMillionUserTrajectoryModel } from './types';

export function evaluateTrajectoryHealth(model: {
  targetUsers: number;
  currentUsers: number;
  daysElapsed: number;
  totalDays: number;
}): OneMillionUserTrajectoryModel {
  const dailyRunRate = model.daysElapsed > 0 ? Math.round(model.currentUsers / model.daysElapsed) : 0;
  const remainingUsers = Math.max(0, model.targetUsers - model.currentUsers);
  const remainingDays = Math.max(1, model.totalDays - model.daysElapsed);
  const requiredDaily = Math.round(remainingUsers / remainingDays);

  let status: OneMillionUserTrajectoryModel['status'] = 'ON_TRACK';
  if (dailyRunRate < requiredDaily * 0.4) {
    status = 'OFF_TRACK';
  } else if (dailyRunRate < requiredDaily * 0.8) {
    status = 'AT_RISK';
  }

  return {
    targetUsers: model.targetUsers,
    timelineDays: model.totalDays,
    daysElapsed: model.daysElapsed,
    currentRegisteredUsers: model.currentUsers,
    currentActivatedUsers: Math.round(model.currentUsers * 0.68),
    currentRetainedUsers: Math.round(model.currentUsers * 0.42),
    requiredDailyNewUsers: requiredDaily,
    currentDailyAcquisitionRunRate: dailyRunRate,
    organicGrowthContributionPct: 18,
    referralViralContributionPct: 35,
    productUtilityContributionPct: 32,
    aiGeoContributionPct: 15,
    status,
    recommendedMixAdjustments: [
      'Scale B2B2C College TPO Placement batch screenings to inject high-volume institutional cohorts',
      'Optimize instant ATS scorecard preview to lift signup-to-activation rate from 68% to 75%+',
      'Expand Wise-model salary calculator with city-specific tech company comparison tables'
    ]
  };
}
