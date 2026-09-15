/**
 * UDX Universal Discovery & Intelligence OS v3.0
 * Historical Model (PAST - OBSERVED)
 * 
 * Manages empirical history: telemetry, past search patterns,
 * prior experiments, and measured outcomes.
 */

import { EvidenceRecord } from '../evidence/EvidenceTypes';

export interface HistoricalRecord {
  recordId: string;
  domain: string;
  metricName: string;
  metricValue: number | string;
  recordedAt: string;
  evidenceId: string;
}

export class HistoricalModel {
  private history: HistoricalRecord[] = [];

  constructor() {
    this.history.push({
      recordId: 'hist-gsc-2311',
      domain: 'CAREER',
      metricName: 'Indexed Demands',
      metricValue: 2311,
      recordedAt: '2026-09-10T22:30:00Z',
      evidenceId: 'EVID-GSC-LIVE-TELEMETRY'
    });
  }

  public getHistory(domain?: string): HistoricalRecord[] {
    return domain 
      ? this.history.filter(h => h.domain === domain)
      : [...this.history];
  }

  public record(item: HistoricalRecord): void {
    this.history.push(item);
  }
}
