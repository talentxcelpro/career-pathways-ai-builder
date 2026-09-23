/**
 * TalentXcel Global Jobs Network — Connector Orchestrator
 * Dispatches due sources to dedicated connector adapters,
 * handles incremental state tracking (cursors, content hashes, external IDs),
 * and enforces per-host concurrency limits.
 */

import { GovernmentConnector, ConnectorSyncResult } from '../jobs/connectors/GovernmentConnector';
import { USAJobsConnector } from '../jobs/connectors/usajobs/USAJobsConnector';
import { EmploymentNewsConnector } from '../jobs/connectors/india/EmploymentNewsConnector';
import { CentralGovConnector } from '../jobs/connectors/india/CentralGovConnector';
import { StateGovConnector } from '../jobs/connectors/india/StateGovConnector';
import { PSUConnector } from '../jobs/connectors/india/PSUConnector';
import { QueueManager } from './QueueManager';
import { CircuitBreaker } from './CircuitBreaker';
import { WorkerManager } from './WorkerManager';
import { SourceChangeRate } from './SourceChangeRate';
import { SourceScheduler } from './SourceScheduler';

export interface IncrementalSyncState {
  sourceId: string;
  lastSuccessfulSync?: string;
  lastSeenExternalId?: string;
  lastContentHash?: string;
  cursor?: string;
  totalSyncedAllTime: number;
}

export class ConnectorOrchestrator {
  private static connectors: Map<string, GovernmentConnector> = new Map();
  private static syncStates: Map<string, IncrementalSyncState> = new Map();

  static {
    // Register standard connectors
    this.register('usajobs', new USAJobsConnector());
    this.register('india-employment-news', new EmploymentNewsConnector());
    this.register('india-upsc', new CentralGovConnector());
    this.register('india-up-sewayojan', new StateGovConnector());
    this.register('india-iocl-psu', new PSUConnector());
  }

  public static register(sourceId: string, connector: GovernmentConnector): void {
    this.connectors.set(sourceId, connector);
  }

  public static getConnector(sourceId: string): GovernmentConnector | undefined {
    return this.connectors.get(sourceId);
  }

  /**
   * Dispatch incremental synchronization for a single source
   */
  public static async syncSource(sourceId: string): Promise<ConnectorSyncResult> {
    const connector = this.connectors.get(sourceId);
    if (!connector) {
      return {
        source_id: sourceId,
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        status: 'FAILED',
        jobs_discovered: 0,
        jobs_ingested: 0,
        duplicates_removed: 0,
        errors: [`No connector adapter registered for source ID: ${sourceId}`],
      };
    }

    // Check circuit breaker
    if (CircuitBreaker.isSourceTripped(sourceId)) {
      return {
        source_id: sourceId,
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        status: 'FAILED',
        jobs_discovered: 0,
        jobs_ingested: 0,
        duplicates_removed: 0,
        errors: [`Source ${sourceId} is paused by safety circuit breaker`],
      };
    }

    // Acquire worker slot
    const slotAcquired = WorkerManager.acquireSlot(sourceId);
    if (!slotAcquired) {
      return {
        source_id: sourceId,
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        status: 'FAILED',
        jobs_discovered: 0,
        jobs_ingested: 0,
        duplicates_removed: 0,
        errors: [`Worker rate limit or concurrency ceiling reached for source ${sourceId}`],
      };
    }

    try {
      // Execute connector discovery
      const result = await connector.sync();

      // Check for volume anomaly
      CircuitBreaker.checkVolumeAnomaly(sourceId, result.jobs_discovered, 50);

      // Enqueue discovered vacancies to INGESTION queue
      for (const job of connector.discoveredJobs || []) {
        await QueueManager.enqueue('INGESTION', 'RAW_VACANCY', {
          sourceId,
          rawJob: job,
        }, 'P1');
      }

      // Record velocity
      SourceChangeRate.recordSyncDelta(
        sourceId,
        result.jobs_ingested,
        0,
        0
      );

      // Update sync state
      const state = this.syncStates.get(sourceId) || {
        sourceId,
        totalSyncedAllTime: 0,
      };
      state.lastSuccessfulSync = result.completed_at;
      state.totalSyncedAllTime += result.jobs_ingested;
      this.syncStates.set(sourceId, state);

      // Update scheduler
      SourceScheduler.markSyncComplete(sourceId, new Date(result.completed_at));

      return result;
    } finally {
      WorkerManager.releaseSlot(sourceId);
    }
  }

  public static getSyncState(sourceId: string): IncrementalSyncState | undefined {
    return this.syncStates.get(sourceId);
  }

  public static resetAll(): void {
    this.syncStates.clear();
  }
}
