/**
 * Evidence Source Adapter Interface & Registry
 * Modular architecture for connecting GSC, Keyword Planner, and Competitor SERP Harvesters.
 */

import { CompetitorSource, EvidenceSourceStatus, ProvenanceLog } from './types';

export interface RawDemandObservation {
  query: string;
  source: CompetitorSource;
  sourceStatus: EvidenceSourceStatus;
  country: string; // ISO 3166-1 alpha-2 (e.g. "IN", "US")
  language: string; // ISO 639-1 (e.g. "en", "hi")
  capturedAt: string;
  confidenceScore: number;
  
  // Search Demand
  searchVolume?: number | 'UNKNOWN';
  cpcUsd?: number | 'UNKNOWN';
  cpcInr?: number | 'UNKNOWN';
  demandTrend?: 'GROWING' | 'STABLE' | 'SEASONAL' | 'DECLINING' | 'UNKNOWN';

  // Live SERP Position (External Competitors)
  serpObservedPosition?: number | 'NOT_RANKING';
  competitorDomain?: string;

  // GSC Metrics (Internal Google Performance)
  gscAveragePosition?: number | 'NO_IMPRESSIONS';
  gscImpressions?: number;
  gscClicks?: number;
  gscCtr?: number;
}

export interface IEvidenceSourceAdapter {
  sourceId: CompetitorSource;
  displayName: string;
  status: EvidenceSourceStatus;
  fetchEvidenceForQuery(query: string, country?: string): Promise<RawDemandObservation>;
  batchFetchEvidence(queries: string[], country?: string): Promise<RawDemandObservation[]>;
}

export class EvidenceAdapterRegistry {
  private static adapters = new Map<CompetitorSource, IEvidenceSourceAdapter>();

  public static registerAdapter(adapter: IEvidenceSourceAdapter): void {
    this.adapters.set(adapter.sourceId, adapter);
  }

  public static getAdapter(sourceId: CompetitorSource): IEvidenceSourceAdapter | undefined {
    return this.adapters.get(sourceId);
  }

  public static getAllAdapters(): IEvidenceSourceAdapter[] {
    return Array.from(this.adapters.values());
  }

  public static getActiveAdapters(): IEvidenceSourceAdapter[] {
    return Array.from(this.adapters.values()).filter(a => a.status === 'CONNECTED');
  }
}
