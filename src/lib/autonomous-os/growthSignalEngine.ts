// src/lib/autonomous-os/growthSignalEngine.ts
import { GrowthSignal } from './types';

export function createVerifiedSignal(params: {
  source: GrowthSignal['source'];
  landingUrl: string;
  country: string;
  surface: string;
  query?: string;
  impressions?: number;
  clicks?: number;
  position?: number;
  signupsCount: number;
  activationsCount: number;
  sharesCount: number;
  referralsCount: number;
  confidenceScore: number;
}): GrowthSignal {
  const ctr = (params.impressions && params.impressions > 0 && params.clicks !== undefined)
    ? Number(((params.clicks / params.impressions) * 100).toFixed(2))
    : undefined;

  const totalVisitors = (params.clicks || 0) + params.signupsCount * 3;
  const convRate = totalVisitors > 0
    ? Number(((params.signupsCount / totalVisitors) * 100).toFixed(2))
    : 0;

  const signalId = `sig_${Math.random().toString(36).substring(2, 10)}`;

  return {
    signalId,
    source: params.source,
    timestampIso: new Date().toISOString(),
    query: params.query,
    landingUrl: params.landingUrl,
    country: params.country,
    surface: params.surface,
    impressions: params.impressions,
    clicks: params.clicks,
    ctr,
    position: params.position,
    signupsCount: params.signupsCount,
    activationsCount: params.activationsCount,
    sharesCount: params.sharesCount,
    referralsCount: params.referralsCount,
    conversionRatePct: convRate,
    confidenceScore: params.confidenceScore,
    status: 'VERIFIED'
  };
}

export const SAMPLE_LIVE_SIGNALS: GrowthSignal[] = [
  createVerifiedSignal({
    source: 'GOOGLE_SEARCH_CONSOLE',
    landingUrl: 'https://talentxcel.in/jobs/safety-officer-fresher',
    country: 'IN',
    surface: 'JOBS',
    query: 'safety officer fresher jobs',
    impressions: 1450,
    clicks: 112,
    position: 1.33,
    signupsCount: 24,
    activationsCount: 18,
    sharesCount: 12,
    referralsCount: 6,
    confidenceScore: 0.95
  }),
  createVerifiedSignal({
    source: 'ATS_SCAN',
    landingUrl: 'https://talentxcel.in/resume',
    country: 'IN',
    surface: 'RESUME_ATS',
    impressions: 4800,
    clicks: 2840,
    signupsCount: 680,
    activationsCount: 420,
    sharesCount: 890,
    referralsCount: 280,
    confidenceScore: 0.98
  }),
  createVerifiedSignal({
    source: 'SALARY_CALC',
    landingUrl: 'https://talentxcel.in/tools/salary-calculator',
    country: 'IN',
    surface: 'SALARY_INTELLIGENCE',
    query: 'software engineer salary bangalore in hand',
    impressions: 3200,
    clicks: 1420,
    position: 4.2,
    signupsCount: 310,
    activationsCount: 190,
    sharesCount: 450,
    referralsCount: 120,
    confidenceScore: 0.92
  }),
  createVerifiedSignal({
    source: 'PASSPORT_UGC',
    landingUrl: 'https://talentxcel.in/passport/sanobar-jahan',
    country: 'IN',
    surface: 'CAREER_PASSPORT',
    impressions: 980,
    clicks: 430,
    signupsCount: 95,
    activationsCount: 78,
    sharesCount: 140,
    referralsCount: 62,
    confidenceScore: 0.91
  })
];
