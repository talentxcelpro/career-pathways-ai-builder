/**
 * api/growth/scoreboard.ts
 * GET /api/growth/scoreboard
 *
 * TalentXcel Global Acquisition Engine Scoreboard API
 * Runtime: Node.js
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GrowthMetricsEngine } from '../../src/lib/growth/GrowthMetricsEngine';
import { InfrastructureScaleGate } from '../../src/lib/growth/InfrastructureScaleGate';
import { TrafficGovernor } from '../../src/lib/growth/TrafficGovernor';
import { ProductMagnetEngine } from '../../src/lib/growth/ProductMagnetEngine';
import { GlobalIntentRouter } from '../../src/lib/growth/GlobalIntentRouter';

export const config = { runtime: 'nodejs' };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const horizon = (req.query?.timeHorizon as 'TODAY' | '7D' | '14D' | '30D') || 'TODAY';

  try {
    const scoreboard = GrowthMetricsEngine.getScoreboard(horizon);
    const scaleGate = InfrastructureScaleGate.evaluateHealth();
    const proposals = TrafficGovernor.getProposals();
    const magnets = ProductMagnetEngine.getAllMagnets();
    const currencies = GlobalIntentRouter.CURRENCIES;

    return res.status(200).json({
      success: true,
      timeHorizon: horizon,
      scoreboard,
      scaleGate,
      proposals,
      magnets,
      currencies,
      invariantsEnforced: [
        'TARGET != ACTUAL',
        'REQUEST != VISITOR',
        'BOT != HUMAN',
        'AI CRAWLER != AI REFERRAL',
        'SIGNUP != VERIFIED OUTCOME',
        'SHARE != REFERRAL VISITOR',
        'BUILD_PROPOSAL != AUTO_PUBLISH',
        'SEARCH SIGNAL != HUMAN INTENT',
        'BENCHMARK != VERIFIED SUPPLY',
        'GLOBAL REGISTRY != GLOBAL OBSERVED COVERAGE'
      ]
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}
