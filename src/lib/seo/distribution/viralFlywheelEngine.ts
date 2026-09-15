// src/lib/seo/distribution/viralFlywheelEngine.ts
// The 4 Closed Distribution Loops & Cross-Loop Compounding Engine

export interface DistributionLoopSpec {
  loopId: 'LOOP_A_ATS_SCANNER' | 'LOOP_B_CAREER_PASSPORT' | 'LOOP_C_SALARY_INTEL' | 'LOOP_D_JOBS_APPLY';
  name: string;
  entrySurface: string;
  firstValueMoment: string;
  signupTrigger: string;
  activationMilestone: string;
  distributionHook: string;
  viralKFactor: number;
  cycleTimeDays: number;
}

export const FOUR_DISTRIBUTION_LOOPS: DistributionLoopSpec[] = [
  {
    loopId: 'LOOP_A_ATS_SCANNER',
    name: 'Instant ATS Scanner Utility Loop',
    entrySurface: 'RESUME_ATS (/resume)',
    firstValueMoment: 'Instant ATS Score diagnostic (78/100) + missing keyword audit (Zero login)',
    signupTrigger: '1-Click Save Full Audit & Download Optimized Resume Template',
    activationMilestone: 'ats_resume_scan_completed',
    distributionHook: 'Shareable ATS Scorecard with peer comparison link',
    viralKFactor: 0.42,
    cycleTimeDays: 3
  },
  {
    loopId: 'LOOP_B_CAREER_PASSPORT',
    name: 'Living Career Passport Viral Loop',
    entrySurface: 'CAREER_PASSPORT (/passport/:slug)',
    firstValueMoment: 'Crawlable, verifiable professional credential card with skill badges',
    signupTrigger: 'Claim Your Own Verified Career Passport & ATS Profile',
    activationMilestone: 'career_passport_created',
    distributionHook: 'LinkedIn badge share + WhatsApp 1-click credential verification link',
    viralKFactor: 0.38,
    cycleTimeDays: 7
  },
  {
    loopId: 'LOOP_C_SALARY_INTEL',
    name: 'Wise-Model Salary Intelligence Loop',
    entrySurface: 'CAREER_TOOLS (/tools/salary-calculator)',
    firstValueMoment: 'Real-time percentile compensation curves + Indian New Tax Regime take-home calculation',
    signupTrigger: 'Save In-Hand Calculation & Track Compensation Ladder for Target Role',
    activationMilestone: 'salary_calculation_saved',
    distributionHook: 'Share personalized salary benchmark result with peers/colleagues',
    viralKFactor: 0.28,
    cycleTimeDays: 5
  },
  {
    loopId: 'LOOP_D_JOBS_APPLY',
    name: 'Job Inventory & Candidate Referral Loop',
    entrySurface: 'JOBS (/jobs/...)',
    firstValueMoment: '1-Click direct job application with pre-filled ATS resume match',
    signupTrigger: 'Create Candidate Profile & Enable 1-Click Employer Matching',
    activationMilestone: 'job_application_submitted',
    distributionHook: 'Refer peer for 100 TXC tokens upon candidate interview shortlisting',
    viralKFactor: 0.35,
    cycleTimeDays: 14
  }
];

export function calculateCombinedFlywheelKFactor(loops: DistributionLoopSpec[]): number {
  // Aggregate effective K-factor weighted across loops
  const sum = loops.reduce((acc, l) => acc + l.viralKFactor, 0);
  return Number((sum / loops.length).toFixed(4));
}

export function simulateCrossLoopCompounding(params: {
  monthlyOrganicAcquisitions: number;
  effectiveKFactor: number;
  months: number;
}): Array<{ month: number; directSignups: number; viralSignups: number; totalNewUsers: number; cumulativeUsers: number }> {
  const results = [];
  let cumulative = 0;

  for (let m = 1; m <= params.months; m++) {
    const direct = params.monthlyOrganicAcquisitions * Math.pow(1.15, m - 1);
    const viral = cumulative * params.effectiveKFactor * 0.25; // 25% of cumulative user base actively shares monthly
    const totalNew = Math.round(direct + viral);
    cumulative += totalNew;

    results.push({
      month: m,
      directSignups: Math.round(direct),
      viralSignups: Math.round(viral),
      totalNewUsers: totalNew,
      cumulativeUsers: cumulative
    });
  }

  return results;
}
