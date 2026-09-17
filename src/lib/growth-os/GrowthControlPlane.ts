/**
 * src/lib/growth-os/GrowthControlPlane.ts
 *
 * Global Growth Control Plane (The Executive Umbrella).
 * Unifies all growth, product, citation, and outcome subsystems into a single
 * daily empirical executive record for the 1M traffic ladder.
 *
 * Architecture:
 *   Growth OS
 *   ├── Market
 *   ├── Acquisition
 *   ├── Intent
 *   ├── Product Magnet
 *   ├── Referral
 *   ├── AI Discovery
 *   ├── Dataset
 *   ├── Citation
 *   ├── Entity
 *   ├── Outcome
 *   └── Growth Ladder
 */

import {
  DailyExecutiveGrowthRecord,
  GrowthScorecard,
  LadderMilestone,
} from './types';
import { ProductMagnetRegistry } from './ProductMagnetRegistry';
import { CitationGraphEngine } from './CitationGraphEngine';
import { PublicDatasetRegistry } from './PublicDatasetRegistry';
import { AIReferralTelemetry } from './AIReferralTelemetry';
import { GrowthLadderTracker } from './GrowthLadderTracker';

export class GrowthControlPlane {
  private static dailyRecords: Map<string, DailyExecutiveGrowthRecord> = new Map();

  /**
   * Records or updates a daily executive growth record.
   * All metrics default to 0 unless empirical telemetry is supplied.
   */
  public static recordDailyTelemetry(
    date: string,
    telemetry: Partial<Omit<DailyExecutiveGrowthRecord, 'date'>>
  ): DailyExecutiveGrowthRecord {
    const existing = this.dailyRecords.get(date) || {
      date,
      uniqueVisitors: 0,
      qualifiedVisitors: 0,
      countries: 0,
      organicVisitors: 0,
      aiVisitors: 0,
      toolCompletions: 0,
      newUsers: 0,
      activatedUsers: 0,
      returningUsers: 0,
      resolvedIntents: 0,
      actionsCompleted: 0,
      verifiedOutcomes: 0,
      newCitations: 0,
      newExternalEntities: 0,
    };

    const updated: DailyExecutiveGrowthRecord = {
      ...existing,
      ...telemetry,
      date,
    };

    this.dailyRecords.set(date, updated);
    return updated;
  }

  /**
   * Retrieves the daily executive record for a given date (defaults to today UTC)
   */
  public static getDailyExecutiveRecord(date?: string): DailyExecutiveGrowthRecord {
    const targetDate = date || new Date().toISOString().slice(0, 10);
    if (!this.dailyRecords.has(targetDate)) {
      // Initialize with zeroed empirical schema
      return this.recordDailyTelemetry(targetDate, {});
    }
    return this.dailyRecords.get(targetDate)!;
  }

  /**
   * Compiles the high-level executive dashboard summary
   */
  public static getExecutiveSummary() {
    const today = new Date().toISOString().slice(0, 10);
    const todayRecord = this.getDailyExecutiveRecord(today);
    const citationMetrics = CitationGraphEngine.computeSummaryMetrics();
    const datasets = PublicDatasetRegistry.getAll();
    const magnets = ProductMagnetRegistry.getAll();

    return {
      date: today,
      todayTelemetry: todayRecord,
      targetUniquesAllocated: AIReferralTelemetry.getTotalMonthlyTarget(),
      activeProductMagnetsCount: magnets.length,
      activePublicDatasetsCount: datasets.length,
      citationIntegrity: {
        totalCitations: citationMetrics.totalCitations,
        independentDomains: citationMetrics.independentDomainsCount,
        institutionalCitations: citationMetrics.institutionalCitations,
        aiGroundings: citationMetrics.aiSearchGroundings,
        corroborationRatePct: `${Math.round(citationMetrics.evidenceCorroborationRate * 100)}%`,
      },
      currentMilestone: GrowthLadderTracker.generateWeeklyScorecard(today, today).currentMilestone,
    };
  }

  /**
   * Returns all recorded historical daily records in chronological order
   */
  public static getHistoricalLedger(): DailyExecutiveGrowthRecord[] {
    return Array.from(this.dailyRecords.values()).sort((a, b) => a.date.localeCompare(b.date));
  }
}
