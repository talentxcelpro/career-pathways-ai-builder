// src/lib/autonomous-os/experimentEngine.ts
import { GrowthExperiment } from './types';

export const SAMPLE_EXPERIMENTS: GrowthExperiment[] = [
  {
    experimentId: 'exp_ats_instant_preview',
    title: 'ATS Resume Instant Scorecard Preview vs Gated Upload',
    hypothesis: 'Showing instant 0-100 score + 3 keyword warnings before asking for account creation increases activation by >= 25%.',
    targetSurfaceOrTool: 'RESUME_ATS',
    controlDescription: 'Standard sign-up wall before viewing full resume scan analysis',
    variantDescription: 'Instant public score + missing skills preview with 1-click save',
    sampleSize: 4200,
    baselineConversionRatePct: 14.2,
    variantConversionRatePct: 23.8,
    relativeLiftPct: 67.6,
    statisticalConfidence: 0.99,
    status: 'WINNING',
    startedAtIso: '2026-08-20T00:00:00Z'
  },
  {
    experimentId: 'exp_salary_tax_switch',
    title: 'Salary Tool: In-Hand Take-Home Breakdown vs CTC Only',
    hypothesis: 'Displaying monthly net in-hand pay under new tax regime drives 40%+ more shares into corporate WhatsApp groups.',
    targetSurfaceOrTool: 'SALARY_INTELLIGENCE',
    controlDescription: 'Annual CTC range only',
    variantDescription: 'Detailed monthly in-hand breakdown with PF, Tax, and bonus splits',
    sampleSize: 2800,
    baselineConversionRatePct: 8.5,
    variantConversionRatePct: 15.1,
    relativeLiftPct: 77.6,
    statisticalConfidence: 0.97,
    status: 'WINNING',
    startedAtIso: '2026-08-22T00:00:00Z'
  }
];
