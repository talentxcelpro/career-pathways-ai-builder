// src/agents/core/ObjectiveEngine.ts
// Strategic Goal Decomposition & Allocation Engine for Founder Sanobar Jahan

import type { StrategicGoal, DepartmentType } from './types';
import { coreBusinessMemory } from './BusinessMemory';

export class ObjectiveEngine {
  private activeGoals: StrategicGoal[] = [
    {
      id: 'goal-claim1-100',
      title: 'Acquire First 100 Verified Claim #1 Companies (5% Fee Lock Cohort)',
      department: 'claim1',
      targetMetric: 'claim1ClaimedCount',
      currentValue: 1,
      targetValue: 100,
      unit: 'Companies',
      deadlineIso: new Date(Date.now() + 30 * 86400000).toISOString(),
      status: 'ON_TRACK',
    },
    {
      id: 'goal-monthly-rev-10k',
      title: 'Achieve ₹8,00,000 (~$10,000) Monthly Platform Revenue Run-Rate',
      department: 'revenue',
      targetMetric: 'platformRevenueINR',
      currentValue: 0,
      targetValue: 800000,
      unit: 'INR',
      deadlineIso: new Date(Date.now() + 60 * 86400000).toISOString(),
      status: 'BEHIND',
    },
    {
      id: 'goal-employers-100',
      title: 'Onboard 100 Active Hiring Tech & AI Employers',
      department: 'employer',
      targetMetric: 'employersTotal',
      currentValue: 37,
      targetValue: 100,
      unit: 'Employers',
      deadlineIso: new Date(Date.now() + 45 * 86400000).toISOString(),
      status: 'ON_TRACK',
    },
    {
      id: 'goal-candidates-10k',
      title: 'Scale Candidate Base to 10,000 Verified Profiles',
      department: 'candidates',
      targetMetric: 'usersTotal',
      currentValue: 529,
      targetValue: 10000,
      unit: 'Users',
      deadlineIso: new Date(Date.now() + 90 * 86400000).toISOString(),
      status: 'ON_TRACK',
    },
    {
      id: 'goal-colleges-50',
      title: 'Establish 50 Placement Cell Partnerships across Top NIRF Colleges',
      department: 'colleges',
      targetMetric: 'collegesTotal',
      currentValue: 1509,
      targetValue: 50,
      unit: 'Partnerships',
      deadlineIso: new Date(Date.now() + 60 * 86400000).toISOString(),
      status: 'ON_TRACK',
    },
  ];

  async getSynchronizedGoals(): Promise<StrategicGoal[]> {
    const metrics = await coreBusinessMemory.getVerifiedMetrics();

    return this.activeGoals.map((g) => {
      let currentVal = g.currentValue;
      if (g.targetMetric === 'claim1ClaimedCount') currentVal = metrics.claim1ClaimedCount;
      if (g.targetMetric === 'platformRevenueINR') currentVal = metrics.platformRevenueINR;
      if (g.targetMetric === 'employersTotal') currentVal = metrics.employersTotal;
      if (g.targetMetric === 'usersTotal') currentVal = metrics.usersTotal;

      const progress = g.targetValue > 0 ? (currentVal / g.targetValue) * 100 : 0;
      let status: 'ON_TRACK' | 'AT_RISK' | 'BEHIND' | 'COMPLETED' = 'ON_TRACK';
      if (progress >= 100) status = 'COMPLETED';
      else if (progress < 20) status = 'BEHIND';
      else if (progress < 60) status = 'AT_RISK';

      return {
        ...g,
        currentValue: currentVal,
        status,
      };
    });
  }

  getPrimaryObjective(): StrategicGoal {
    return this.activeGoals[0];
  }
}

export const coreObjectiveEngine = new ObjectiveEngine();
