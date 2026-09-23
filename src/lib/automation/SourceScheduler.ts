/**
 * TalentXcel Global Jobs Network — Source Scheduler
 * Evaluates sources against dynamic P0–P4 priority, velocity, and the 24-hour freshness SLA.
 * Governs the 5 global geographic operational waves and schedules due connectors.
 */

import { GOVERNMENT_SOURCES, GovernmentJobSource } from '@/config/jobs/governmentSources';
import { SourceChangeRate } from './SourceChangeRate';

export type PriorityTier = 'P0' | 'P1' | 'P2' | 'P3' | 'P4';

export interface ScheduledSource {
  sourceId: string;
  portalName: string;
  countryCode: string;
  priorityTier: PriorityTier;
  frequencyHours: number;
  lastRunAt?: string;
  nextRunAt: string;
  slaOverdue: boolean;
  score: number;
  wave: 'AMERICAS' | 'EUROPE_AFRICA' | 'INDIA_MIDDLE_EAST' | 'APAC' | 'RETRIES';
}

export class SourceScheduler {
  private static sourceState: Map<string, { lastRunAt?: string; nextRunAt: string }> = new Map();

  /**
   * Determine priority tier based on governance parameters
   */
  public static resolvePriorityTier(source: GovernmentJobSource): PriorityTier {
    if (source.source_id === 'usajobs' || source.source_id === 'us-usajobs' || source.source_id === 'in-employment-news' || source.source_id === 'india-employment-news' || source.source_id === 'india-upsc') {
      return 'P0'; // Critical high-volume national portals
    }
    if (source.government_level === 'FEDERAL') {
      return 'P1'; // Federal ministries & commissions
    }
    if (source.government_level === 'STATE' || source.government_level === 'PUBLIC_SECTOR') {
      return 'P2'; // State boards and PSUs
    }
    if (source.government_level === 'MUNICIPAL' || source.government_level === 'REGIONAL') {
      return 'P3';
    }
    return 'P4';
  }

  /**
   * Determine geographic operational wave for a source
   */
  public static resolveWave(countryCode: string): ScheduledSource['wave'] {
    const code = countryCode.toUpperCase();
    if (['US', 'CA', 'MX', 'BR', 'AR', 'CO', 'CL'].includes(code)) return 'AMERICAS';
    if (['GB', 'DE', 'FR', 'NL', 'IE', 'ZA', 'EG', 'NG', 'KE'].includes(code)) return 'EUROPE_AFRICA';
    if (['IN', 'AE', 'SA', 'QA', 'KW', 'OM'].includes(code)) return 'INDIA_MIDDLE_EAST';
    return 'APAC';
  }

  /**
   * Calculate dynamic scheduling score
   */
  public static calculateScore(
    tier: PriorityTier,
    hoursSinceLastRun: number,
    frequencyHours: number,
    turnoverVelocity: number
  ): number {
    const baseWeight = { P0: 100, P1: 80, P2: 60, P3: 40, P4: 20 }[tier];
    const slaUrgency = Math.min((hoursSinceLastRun / frequencyHours) * 50, 100);
    const volumeFactor = Math.min(turnoverVelocity / 100, 30);
    return baseWeight + slaUrgency + volumeFactor;
  }

  /**
   * Evaluate all sources and return prioritized list of sources due for synchronization right now
   */
  public static getDueSources(currentTime = new Date()): ScheduledSource[] {
    const nowMs = currentTime.getTime();
    const scheduled: ScheduledSource[] = [];

    for (const source of GOVERNMENT_SOURCES) {
      if (!source.active) continue;

      const state = this.sourceState.get(source.source_id) || {
        lastRunAt: undefined,
        nextRunAt: new Date(nowMs - 1000).toISOString(), // Initially due immediately
      };

      const tier = this.resolvePriorityTier(source);
      const dynamicFreq = SourceChangeRate.getRecommendedInterval(source.source_id, 24);
      const hoursSinceLastRun = state.lastRunAt
        ? (nowMs - new Date(state.lastRunAt).getTime()) / (1000 * 3600)
        : 999;

      const slaOverdue = hoursSinceLastRun >= 24;
      const nextRunMs = new Date(state.nextRunAt).getTime();
      const isDue = nextRunMs <= nowMs || slaOverdue;

      const velocity = SourceChangeRate.getMetrics(source.source_id)?.totalDailyTurnover || 50;
      const score = this.calculateScore(tier, hoursSinceLastRun, dynamicFreq, velocity);

      if (isDue) {
        scheduled.push({
          sourceId: source.source_id,
          portalName: source.portal_name,
          countryCode: source.country_code,
          priorityTier: tier,
          frequencyHours: dynamicFreq,
          lastRunAt: state.lastRunAt,
          nextRunAt: state.nextRunAt,
          slaOverdue,
          score,
          wave: this.resolveWave(source.country_code),
        });
      }
    }

    // Sort by priority score descending
    return scheduled.sort((a, b) => b.score - a.score);
  }

  /**
   * Record completion of a source sync and set next run timestamp
   */
  public static markSyncComplete(sourceId: string, timestamp = new Date()): void {
    const freqHours = SourceChangeRate.getRecommendedInterval(sourceId, 24);
    const nextRun = new Date(timestamp.getTime() + freqHours * 3600 * 1000).toISOString();
    this.sourceState.set(sourceId, {
      lastRunAt: timestamp.toISOString(),
      nextRunAt: nextRun,
    });
  }

  public static resetAll(): void {
    this.sourceState.clear();
  }
}
