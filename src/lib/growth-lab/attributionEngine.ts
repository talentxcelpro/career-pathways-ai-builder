// src/lib/growth-lab/attributionEngine.ts
// TalentXcel Query-to-Conversion Attribution & Yield Ranking Engine
// Master KPI: Qualified Registrations per 1,000 Organic Clicks

import {
  QueryAttributionRecord,
  Top20YieldReport,
  YieldRankingItem,
  ExperimentUniverse,
} from './types';

export class AttributionEngine {
  private records: QueryAttributionRecord[] = [];

  constructor(initialRecords: QueryAttributionRecord[] = []) {
    this.records = initialRecords;
  }

  public addRecords(newRecords: QueryAttributionRecord[]): void {
    this.records.push(...newRecords);
  }

  public clear(): void {
    this.records = [];
  }

  public getRecords(): QueryAttributionRecord[] {
    return this.records;
  }

  // Calculate Master KPI for any record or slice
  public static calculateYield(clicks: number, registrations: number, applications: number, matches: number) {
    const safeClicks = Math.max(1, clicks);
    return {
      registrationsPer1kClicks: Math.round((registrations / safeClicks) * 1000),
      applicationsPer1kClicks: Math.round((applications / safeClicks) * 1000),
      matchesPer1kClicks: Math.round((matches / safeClicks) * 1000),
    };
  }

  // Aggregate and rank by a specific dimension
  private aggregateAndRank(
    getKey: (r: QueryAttributionRecord) => string,
    getLabel: (r: QueryAttributionRecord) => string,
    sortMetric: 'REGISTRATIONS' | 'APPLICATIONS' | 'MATCHES' = 'REGISTRATIONS',
    minClicks: number = 3
  ): YieldRankingItem[] {
    const grouped = new Map<string, { label: string; clicks: number; registrations: number; applications: number; matches: number }>();

    for (const r of this.records) {
      const key = getKey(r);
      if (!key) continue;
      const current = grouped.get(key) || { label: getLabel(r), clicks: 0, registrations: 0, applications: 0, matches: 0 };
      current.clicks += r.clicks;
      current.registrations += r.registrations;
      current.applications += r.applications;
      current.matches += r.matches;
      grouped.set(key, current);
    }

    const items: YieldRankingItem[] = [];
    for (const [key, data] of grouped.entries()) {
      if (data.clicks < minClicks) continue; // Sample boundary filter
      const yields = AttributionEngine.calculateYield(data.clicks, data.registrations, data.applications, data.matches);
      items.push({
        key,
        label: data.label,
        clicks: data.clicks,
        registrations: data.registrations,
        applications: data.applications,
        matches: data.matches,
        ...yields,
      });
    }

    // Sort according to requested yield metric
    return items.sort((a, b) => {
      if (sortMetric === 'APPLICATIONS') {
        return b.applicationsPer1kClicks - a.applicationsPer1kClicks || b.applications - a.applications;
      }
      if (sortMetric === 'MATCHES') {
        return b.matchesPer1kClicks - a.matchesPer1kClicks || b.matches - a.matches;
      }
      return b.registrationsPer1kClicks - a.registrationsPer1kClicks || b.registrations - a.registrations;
    }).slice(0, 20);
  }

  // Generate the mandatory Top 20 Yield Report
  public generateTop20YieldReport(): Top20YieldReport {
    return {
      timestamp: new Date().toISOString(),
      topIntentsByRegistrationYield: this.aggregateAndRank(
        r => r.intent,
        r => r.intent,
        'REGISTRATIONS'
      ),
      topIntentsByApplicationYield: this.aggregateAndRank(
        r => r.intent,
        r => r.intent,
        'APPLICATIONS'
      ),
      topIntentsByMatchYield: this.aggregateAndRank(
        r => r.intent,
        r => r.intent,
        'MATCHES'
      ),
      topPagesByRegistrationYield: this.aggregateAndRank(
        r => r.landingPage,
        r => r.landingPage,
        'REGISTRATIONS'
      ),
      topOccupationsByRegistrationYield: this.aggregateAndRank(
        r => r.occupation || 'General',
        r => r.occupation || 'General',
        'REGISTRATIONS'
      ),
      topCitiesByRegistrationYield: this.aggregateAndRank(
        r => r.city || 'Remote / National',
        r => r.city || 'Remote / National',
        'REGISTRATIONS'
      ),
      topCountriesByRegistrationYield: this.aggregateAndRank(
        r => r.country,
        r => r.country,
        'REGISTRATIONS'
      ),
      topArchetypesByRegistrationYield: this.aggregateAndRank(
        r => r.pageType,
        r => `${r.universe} (${r.pageType})`,
        'REGISTRATIONS'
      ),
    };
  }
}
