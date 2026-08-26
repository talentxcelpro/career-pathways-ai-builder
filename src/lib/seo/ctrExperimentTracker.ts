// src/lib/seo/ctrExperimentTracker.ts
// CTR Experiment Tracker: Controlled SEO experiment schema for title, meta, content tests
// No UI modifications — this defines the data contract for experiment measurement only

import { createHash } from 'crypto';

export interface SeoExperiment {
  experiment_id: string;
  canonical_url: string;
  query_cluster: string[];
  change_type: 'TITLE' | 'META_DESCRIPTION' | 'H1' | 'INTERNAL_LINKS' | 'SCHEMA' | 'CONTENT_SECTION' | 'FRESHNESS';
  baseline_title: string | null;
  proposed_title: string | null;
  baseline_description: string | null;
  proposed_description: string | null;
  created_at: string;
  observation_window_days: number;
  baseline_impressions: number;
  baseline_clicks: number;
  baseline_ctr: number;
  baseline_position: number;
  post_impressions: number | null;
  post_clicks: number | null;
  post_ctr: number | null;
  post_position: number | null;
  status: 'PLANNED' | 'ACTIVE' | 'MEASURING' | 'CONCLUDED';
  conclusion: string | null;
  causal_confidence: 'CONFIRMED' | 'PROBABLE' | 'INCONCLUSIVE' | 'AWAITING_DATA';
}

export function createExperiment(
  data: Omit<SeoExperiment, 'experiment_id' | 'created_at' | 'status' | 'conclusion' | 'post_impressions' | 'post_clicks' | 'post_ctr' | 'post_position' | 'causal_confidence'>
): SeoExperiment {
  const created_at = new Date().toISOString();
  const hash = createHash('sha256')
    .update(`${data.canonical_url}|${data.change_type}|${created_at}`)
    .digest('hex')
    .slice(0, 8);
  return {
    ...data,
    experiment_id: `exp_${hash}`,
    created_at,
    status: 'PLANNED',
    conclusion: null,
    post_impressions: null,
    post_clicks: null,
    post_ctr: null,
    post_position: null,
    causal_confidence: 'AWAITING_DATA',
  };
}

export function evaluateExperiment(exp: SeoExperiment): SeoExperiment {
  if (exp.post_ctr === null || exp.post_impressions === null) {
    return { ...exp, status: 'MEASURING', causal_confidence: 'AWAITING_DATA', conclusion: null };
  }

  const windowMet = exp.observation_window_days >= 14;
  const improvement = ((exp.post_ctr - exp.baseline_ctr) / exp.baseline_ctr) * 100;

  let causal_confidence: SeoExperiment['causal_confidence'];
  let conclusion: string;

  if (windowMet && improvement >= 10) {
    causal_confidence = 'CONFIRMED';
    conclusion = `CTR improved by ${improvement.toFixed(1)}% over ${exp.observation_window_days}-day window. Causal confidence: CONFIRMED.`;
  } else if (improvement >= 5) {
    causal_confidence = 'PROBABLE';
    conclusion = `CTR improved by ${improvement.toFixed(1)}% but observation window < 14 days. Confidence: PROBABLE; extend measurement.`;
  } else if (improvement < -2) {
    causal_confidence = 'INCONCLUSIVE';
    conclusion = `CTR decreased by ${Math.abs(improvement).toFixed(1)}%. Revert change and investigate.`;
  } else {
    causal_confidence = 'INCONCLUSIVE';
    conclusion = `CTR change ${improvement.toFixed(1)}% below significance threshold (10%). No conclusive improvement.`;
  }

  return { ...exp, status: 'CONCLUDED', causal_confidence, conclusion };
}

export const SAMPLE_EXPERIMENTS: SeoExperiment[] = [
  evaluateExperiment({
    experiment_id: 'exp_manual_01',
    canonical_url: 'https://talentxcel.in/jobs/content-writer-chatr-charchat-talentxcel-services-noida-uttar-pradesh-india-1',
    query_cluster: ['content writer jobs noida', 'content writer vacancy noida'],
    change_type: 'TITLE',
    baseline_title: 'Content Writer Jobs at TalentXcel - Noida',
    proposed_title: '[Hiring 2026] Content Writer Jobs Noida | Apply Now | TalentXcel',
    baseline_description: null,
    proposed_description: null,
    created_at: '2026-07-28T00:00:00Z',
    observation_window_days: 21,
    baseline_impressions: 160,
    baseline_clicks: 11,
    baseline_ctr: 6.9,
    baseline_position: 6.8,
    post_impressions: 198,
    post_clicks: 16,
    post_ctr: 8.1,
    post_position: 6.4,
    status: 'CONCLUDED',
    conclusion: null,
    causal_confidence: 'AWAITING_DATA',
  }),
  evaluateExperiment({
    experiment_id: 'exp_manual_02',
    canonical_url: 'https://talentxcel.in/resume',
    query_cluster: ['free ats resume scanner india', 'ats resume checker free'],
    change_type: 'META_DESCRIPTION',
    baseline_title: null,
    proposed_title: null,
    baseline_description: 'Build your resume with TalentXcel ATS scanner.',
    proposed_description: 'Free ATS resume scanner & builder for Indian job seekers. Check ATS score instantly. 50,000+ resumes scanned. Try free.',
    created_at: '2026-08-10T00:00:00Z',
    observation_window_days: 12,
    baseline_impressions: 112,
    baseline_clicks: 5,
    baseline_ctr: 4.5,
    baseline_position: 11.6,
    post_impressions: 125,
    post_clicks: 7,
    post_ctr: 5.6,
    post_position: 11.2,
    status: 'MEASURING',
    conclusion: null,
    causal_confidence: 'AWAITING_DATA',
  }),
  {
    ...createExperiment({
      canonical_url: 'https://talentxcel.in/mo1',
      query_cluster: ['ai recruitment platform india', 'ai hiring software india'],
      change_type: 'SCHEMA',
      baseline_title: null,
      proposed_title: null,
      baseline_description: null,
      proposed_description: null,
      observation_window_days: 30,
      baseline_impressions: 130,
      baseline_clicks: 10,
      baseline_ctr: 7.7,
      baseline_position: 9.2,
    }),
    status: 'ACTIVE' as const,
    causal_confidence: 'AWAITING_DATA' as const,
  },
  evaluateExperiment({
    experiment_id: 'exp_manual_03',
    canonical_url: 'https://talentxcel.in/colleges',
    query_cluster: ['top engineering colleges india placement', 'best engineering colleges india'],
    change_type: 'TITLE',
    baseline_title: 'Top Colleges in India - TalentXcel',
    proposed_title: 'Top Engineering Colleges India 2026 | Placements, Fees, Rankings | TalentXcel',
    baseline_description: null,
    proposed_description: null,
    created_at: '2026-07-01T00:00:00Z',
    observation_window_days: 30,
    baseline_impressions: 80,
    baseline_clicks: 3,
    baseline_ctr: 3.75,
    baseline_position: 15.2,
    post_impressions: 98,
    post_clicks: 4,
    post_ctr: 4.1,
    post_position: 14.5,
    status: 'CONCLUDED',
    conclusion: null,
    causal_confidence: 'AWAITING_DATA',
  }),
  {
    ...createExperiment({
      canonical_url: 'https://talentxcel.in/jobs/software-engineer/bangalore',
      query_cluster: ['software engineer jobs bangalore', 'software developer jobs bangalore'],
      change_type: 'INTERNAL_LINKS',
      baseline_title: null,
      proposed_title: null,
      baseline_description: null,
      proposed_description: null,
      observation_window_days: 21,
      baseline_impressions: 100,
      baseline_clicks: 6,
      baseline_ctr: 6.0,
      baseline_position: 47.0,
    }),
    status: 'PLANNED' as const,
    causal_confidence: 'AWAITING_DATA' as const,
  },
];
