// src/lib/autonomous-os/attributionEngine.ts
import { AttributionFunnelEvent } from './types';

export const SAMPLE_ATTRIBUTION_FUNNEL: AttributionFunnelEvent[] = [
  {
    discoveryTouchpoint: 'Google Search Console (Organic)',
    landingUrl: 'https://talentxcel.in/jobs',
    channel: 'SEARCH_ORGANIC',
    visitors: 32400,
    engagements: 18200,
    signups: 2950,
    activations: 1840,
    retained7Day: 890,
    referralsInitiated: 410,
    signupConversionRatePct: 9.1,
    activationRatePct: 62.37
  },
  {
    discoveryTouchpoint: 'ATS Resume Scorecard Shares',
    landingUrl: 'https://talentxcel.in/resume',
    channel: 'PRODUCT_LED_UTILITY',
    visitors: 24800,
    engagements: 21500,
    signups: 5800,
    activations: 4200,
    retained7Day: 2450,
    referralsInitiated: 1890,
    signupConversionRatePct: 23.38,
    activationRatePct: 72.41
  },
  {
    discoveryTouchpoint: 'Career Passport Public Flex Cards',
    landingUrl: 'https://talentxcel.in/passport/:slug',
    channel: 'PUBLIC_UGC_OBJECTS',
    visitors: 14200,
    engagements: 10800,
    signups: 2600,
    activations: 1950,
    retained7Day: 1120,
    referralsInitiated: 780,
    signupConversionRatePct: 18.31,
    activationRatePct: 75.0
  },
  {
    discoveryTouchpoint: 'AI Discovery & Citations (ChatGPT / Perplexity)',
    landingUrl: 'https://talentxcel.in/tools/salary-calculator',
    channel: 'AI_DISCOVERY_GEO',
    visitors: 9800,
    engagements: 7900,
    signups: 1450,
    activations: 920,
    retained7Day: 480,
    referralsInitiated: 210,
    signupConversionRatePct: 14.8,
    activationRatePct: 63.45
  }
];
