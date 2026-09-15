/**
 * UDX Universal Discovery & Intelligence OS v3.0
 * Demand Graph
 * 
 * Ingests raw telemetry and organizes domain-neutral demand signals
 * into volume, position, CTR, and velocity vectors.
 */

export interface DemandSignalNode {
  nodeId: string;
  domain: string;
  queryOrSignal: string;
  normalizedSignal: string;
  totalImpressions: number;
  totalEngagements: number;
  avgPositionOrRank: number;
  country: string;
  firstObservedAt: string;
  lastObservedAt: string;
  velocityPercent?: number;
}

export class DemandGraph {
  private signals: Map<string, DemandSignalNode> = new Map();

  public registerSignal(signal: DemandSignalNode): void {
    const key = `${signal.domain}:${signal.normalizedSignal}:${signal.country}`.toLowerCase();
    const existing = this.signals.get(key);
    if (existing) {
      existing.totalImpressions += signal.totalImpressions;
      existing.totalEngagements += signal.totalEngagements;
      existing.lastObservedAt = signal.lastObservedAt;
    } else {
      this.signals.set(key, { ...signal });
    }
  }

  public getAllSignals(): DemandSignalNode[] {
    return Array.from(this.signals.values());
  }

  public getByDomain(domain: string): DemandSignalNode[] {
    return Array.from(this.signals.values()).filter(s => s.domain === domain);
  }

  public getTopByVolume(limit: number = 50): DemandSignalNode[] {
    return Array.from(this.signals.values())
      .sort((a, b) => b.totalImpressions - a.totalImpressions)
      .slice(0, limit);
  }
}
