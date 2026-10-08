// src/lib/growth-lab/staircaseGrowthTracker.ts
// TalentXcel 12-Step Measurable Growth Staircase Gap Tracker
// Bridges current reality to the 40k–50k North Star target via observed, empirical steps.

import { StaircaseMilestone, GrowthStaircaseStatus, ExperimentUniverse } from './types';

export const STAIRCASE_MILESTONES: StaircaseMilestone[] = [
  { stageNumber: 1, targetDailyRegistrations: 10, gateDescription: 'First 10 daily signups from top 5 long-tail positions #1–#3', requiredDailyClicks: 100, requiredDailyImpressions: 4000, status: 'CURRENT_FOCUS' },
  { stageNumber: 2, targetDailyRegistrations: 25, gateDescription: 'Google Jobs schema broadcast + Fresher city landing hubs', requiredDailyClicks: 250, requiredDailyImpressions: 10000, status: 'QUEUED' },
  { stageNumber: 3, targetDailyRegistrations: 50, gateDescription: 'ATS resume keyword matcher + WhatsApp alert distribution loops', requiredDailyClicks: 400, requiredDailyImpressions: 18000, status: 'QUEUED' },
  { stageNumber: 4, targetDailyRegistrations: 100, gateDescription: '100 registrations/day across top 20 cities (Bangalore, Pune, Noida)', requiredDailyClicks: 800, requiredDailyImpressions: 35000, status: 'QUEUED' },
  { stageNumber: 5, targetDailyRegistrations: 250, gateDescription: 'Salary benchmarks + Career roadmaps cross-entity linking', requiredDailyClicks: 1800, requiredDailyImpressions: 80000, status: 'QUEUED' },
  { stageNumber: 6, targetDailyRegistrations: 500, gateDescription: 'College placement & degree-specific career transition hubs', requiredDailyClicks: 3500, requiredDailyImpressions: 150000, status: 'QUEUED' },
  { stageNumber: 7, targetDailyRegistrations: 1000, gateDescription: 'Proven multi-surface acquisition flywheel operating in India', requiredDailyClicks: 7000, requiredDailyImpressions: 300000, status: 'QUEUED' },
  { stageNumber: 8, targetDailyRegistrations: 2500, gateDescription: 'National occupation coverage + Gulf/Middle East launch (UAE, Saudi)', requiredDailyClicks: 16000, requiredDailyImpressions: 700000, status: 'QUEUED' },
  { stageNumber: 9, targetDailyRegistrations: 5000, gateDescription: 'Multimodal search & AI Overviews citation volume expansion', requiredDailyClicks: 32000, requiredDailyImpressions: 1400000, status: 'QUEUED' },
  { stageNumber: 10, targetDailyRegistrations: 10000, gateDescription: 'Direct employer posting network + High DR authoritative citations', requiredDailyClicks: 65000, requiredDailyImpressions: 2800000, status: 'QUEUED' },
  { stageNumber: 11, targetDailyRegistrations: 25000, gateDescription: 'Multi-country acquisition compounding across 8 global markets', requiredDailyClicks: 160000, requiredDailyImpressions: 7000000, status: 'QUEUED' },
  { stageNumber: 12, targetDailyRegistrations: 50000, gateDescription: 'Enterprise-scale autonomous hiring acquisition ecosystem', requiredDailyClicks: 350000, requiredDailyImpressions: 15000000, status: 'QUEUED' },
];

export class StaircaseGrowthTracker {
  public static calculateStatus(currentDailyRegistrations: number = 2): GrowthStaircaseStatus {
    const longTermNorthStarTarget = 50000;
    const dailyRegistrationGap = Math.max(0, longTermNorthStarTarget - currentDailyRegistrations);

    // Find current observed step and next step
    let currentStepIndex = 0;
    for (let i = 0; i < STAIRCASE_MILESTONES.length; i++) {
      if (currentDailyRegistrations >= STAIRCASE_MILESTONES[i].targetDailyRegistrations) {
        currentStepIndex = i;
      }
    }

    const currentObservedStep = STAIRCASE_MILESTONES[currentStepIndex];
    const nextStep = STAIRCASE_MILESTONES[Math.min(currentStepIndex + 1, STAIRCASE_MILESTONES.length - 1)];

    // Rank top observed surfaces based on registered empirical yield
    const topSurfaces: { surface: ExperimentUniverse; observedYieldPer1kClicks: number; estimatedClicksNeededForNextStep: number }[] = [
      { surface: 'RESUME', observedYieldPer1kClicks: 444, estimatedClicksNeededForNextStep: Math.ceil(((nextStep.targetDailyRegistrations - currentDailyRegistrations) / 444) * 1000) },
      { surface: 'JOBS', observedYieldPer1kClicks: 277, estimatedClicksNeededForNextStep: Math.ceil(((nextStep.targetDailyRegistrations - currentDailyRegistrations) / 277) * 1000) },
      { surface: 'CAREERS', observedYieldPer1kClicks: 285, estimatedClicksNeededForNextStep: Math.ceil(((nextStep.targetDailyRegistrations - currentDailyRegistrations) / 285) * 1000) },
      { surface: 'SALARY', observedYieldPer1kClicks: 167, estimatedClicksNeededForNextStep: Math.ceil(((nextStep.targetDailyRegistrations - currentDailyRegistrations) / 167) * 1000) },
      { surface: 'LEARNING', observedYieldPer1kClicks: 166, estimatedClicksNeededForNextStep: Math.ceil(((nextStep.targetDailyRegistrations - currentDailyRegistrations) / 166) * 1000) },
    ];

    return {
      currentDailyRegistrations,
      currentObservedStep,
      nextStep,
      longTermNorthStarTarget,
      dailyRegistrationGap,
      topGrowthSurfacesToCloseGap: topSurfaces,
    };
  }
}
