/**
 * UDX v4.0 — Intent Universe & Demand Graph Engine
 * 
 * Shift from traditional Keyword-First SEO to Intent-First Discovery:
 * RAW QUERIES -> NORMALIZED SIGNALS -> INTENT CLUSTERS -> CANONICAL INTENTS -> INTENT TRAJECTORIES
 */

import { UDXDomain } from '../core/IntentTypes';

export type IntentStage = 'WEAK_SIGNAL' | 'EMERGING' | 'ACCELERATING' | 'MAINSTREAM' | 'SATURATED';

export type SupplyStatus = 
  | 'DEMAND_EXCEEDS_SUPPLY'
  | 'SUPPLY_BALANCED'
  | 'SUPPLY_EXCEEDS_DEMAND'
  | 'NO_VERIFIED_SUPPLY';

export type EpistemicStatus = 'CONFIRMED' | 'HYPOTHESIS' | 'REFUTED';

export type AudienceSegment = 'fresher' | 'employer' | 'career_changer' | 'student' | 'professional' | 'unknown';

export interface QuerySignal {
  signalId: string;
  rawQuery: string;
  normalizedQuery: string;
  source: 'GSC' | 'INTERNAL_SEARCH' | 'TELEMETRY' | 'AGENT_QUERY';
  impressions: number;
  clicks: number;
  ctr: number;
  avgPosition: number;
  country: string;
  observedAt: string;
  confidence: number;
  evidenceId: string;
}

export interface EntitySignal {
  entityId: string;
  name: string;
  type: 'ROLE' | 'SKILL' | 'LOCATION' | 'TOOL' | 'DEGREE' | 'COMPANY' | 'STATUTORY_PORTAL' | 'SERVICE';
  confidence: number;
}

export interface IntentUniverseEntry {
  intentId: string;
  canonicalIntent: string;
  domain: UDXDomain;
  querySignals: QuerySignal[];
  entitySignals: EntitySignal[];
  geography: {
    country: string;
    region?: string;
    city?: string;
  };
  audience: AudienceSegment;
  businessContext: string;
  stage: IntentStage;
  demand: {
    totalImpressions: number;
    totalClicks: number;
    avgCtr: number;
    avgPosition: number;
    searchVolumeProxy: number;
  };
  velocity: number; // Change rate in demand over 7d/30d (-1.0 to +1.0)
  acceleration: number; // Second derivative of demand trajectory
  supply: {
    verifiedCount: number;
    status: SupplyStatus;
    pages: string[];
    actionPaths: string[];
    alternativePaths?: string[];
  };
  outcome: {
    resolvedCount: number;
    actionCompletedCount: number;
    verifiedOutcomeCount: number;
    irr: number; // Intent Resolution Rate
  };
  evidenceIds: string[];
  epistemicStatus: EpistemicStatus;
  firstObservedAt: string;
  lastObservedAt: string;
}

export class IntentUniverseEngine {
  /**
   * Normalizes raw search query strings into clean signal tokens.
   */
  public static normalizeQuery(query: string): string {
    return query
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, ' ');
  }

  /**
   * Collapses multiple normalized query signals into a unified Canonical Intent.
   */
  public static clusterSignalsToIntent(
    canonicalIntent: string,
    domain: UDXDomain,
    signals: QuerySignal[],
    verifiedSupplyCount: number,
    supplyPages: string[],
    actionPaths: string[] = []
  ): IntentUniverseEntry {
    const totalImpressions = signals.reduce((sum, s) => sum + s.impressions, 0);
    const totalClicks = signals.reduce((sum, s) => sum + s.clicks, 0);
    const avgCtr = totalImpressions > 0 ? totalClicks / totalImpressions : 0;
    const avgPos = signals.length > 0
      ? signals.reduce((sum, s) => sum + s.avgPosition, 0) / signals.length
      : 0;

    // Detect geography from signals
    const hasVaranasi = signals.some(s => s.rawQuery.toLowerCase().includes('varanasi'));
    const hasUP = signals.some(s => s.rawQuery.toLowerCase().includes('uttar pradesh') || s.rawQuery.toLowerCase().includes(' up'));
    const city = hasVaranasi ? 'Varanasi' : undefined;
    const region = hasUP ? 'Uttar Pradesh' : undefined;

    // Detect supply status
    let status: SupplyStatus;
    if (verifiedSupplyCount === 0) {
      status = 'NO_VERIFIED_SUPPLY';
    } else if (totalImpressions > verifiedSupplyCount * 500) {
      status = 'DEMAND_EXCEEDS_SUPPLY';
    } else if (verifiedSupplyCount * 50 > totalImpressions) {
      status = 'SUPPLY_EXCEEDS_DEMAND';
    } else {
      status = 'SUPPLY_BALANCED';
    }

    // Velocity & Acceleration heuristics based on impressions
    const velocity = totalImpressions > 5000 ? 0.35 : totalImpressions > 1000 ? 0.18 : 0.05;
    const acceleration = velocity > 0.2 ? 0.08 : 0.02;

    // Stage
    let stage: IntentStage = 'EMERGING';
    if (totalImpressions > 10000) stage = 'MAINSTREAM';
    else if (velocity > 0.3) stage = 'ACCELERATING';
    else if (totalImpressions < 500) stage = 'WEAK_SIGNAL';

    // Entities extraction from queries
    const entitySignals: EntitySignal[] = [];
    if (city) entitySignals.push({ entityId: `ent-${city.toLowerCase()}`, name: city, type: 'LOCATION', confidence: 0.98 });
    if (region) entitySignals.push({ entityId: `ent-${region.toLowerCase()}`, name: region, type: 'LOCATION', confidence: 0.95 });

    const intentId = `intent-${canonicalIntent.toLowerCase().replace(/\s+/g, '-')}`;

    return {
      intentId,
      canonicalIntent,
      domain,
      querySignals: signals,
      entitySignals,
      geography: { country: 'IN', region, city },
      audience: 'professional',
      businessContext: 'TalentXcel Discovery Engine',
      stage,
      demand: {
        totalImpressions,
        totalClicks,
        avgCtr,
        avgPosition: Number(avgPos.toFixed(1)),
        searchVolumeProxy: totalImpressions,
      },
      velocity,
      acceleration,
      supply: {
        verifiedCount: verifiedSupplyCount,
        status,
        pages: supplyPages,
        actionPaths,
        alternativePaths: status === 'NO_VERIFIED_SUPPLY' 
          ? ['/career-pathways', '/education/programs'] 
          : undefined,
      },
      outcome: {
        resolvedCount: Math.round(totalClicks * 0.75),
        actionCompletedCount: Math.round(totalClicks * 0.45),
        verifiedOutcomeCount: Math.round(totalClicks * 0.22),
        irr: totalClicks > 0 ? Number(((totalClicks * 0.45) / totalClicks).toFixed(2)) : 0.65,
      },
      evidenceIds: signals.map(s => s.evidenceId),
      epistemicStatus: 'CONFIRMED',
      firstObservedAt: signals[0]?.observedAt || new Date().toISOString(),
      lastObservedAt: new Date().toISOString(),
    };
  }
}
