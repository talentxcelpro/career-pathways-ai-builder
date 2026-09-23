/**
 * TalentXcel Global Jobs Network — Event-Driven Automation Runtime
 * Core execution engine coordinating worker dispatch, queue leasing,
 * distributed locks, circuit breaker gating, and telemetry emission.
 */

import { AutomationLock } from './AutomationLock';
import { QueueManager, QueueName, QueueJob } from './QueueManager';
import { WorkerManager } from './WorkerManager';
import { CircuitBreaker } from './CircuitBreaker';
import { AutomationKillSwitch } from './AutomationKillSwitch';

export type RuntimeLifecycleState = 'BOOTING' | 'RUNNING' | 'PAUSED' | 'DRAINING' | 'STOPPED';

export interface RuntimeStats {
  state: RuntimeLifecycleState;
  activeWorkers: number;
  uptimeSeconds: number;
  jobsProcessedTotal: number;
  jobsFailedTotal: number;
  startedAt: string;
}

export class AutomationRuntime {
  private static state: RuntimeLifecycleState = 'STOPPED';
  private static startedAt = '';
  private static processedCount = 0;
  private static failedCount = 0;
  private static isLoopRunning = false;

  /**
   * Start the event-driven automation runtime
   */
  public static async start(): Promise<void> {
    if (this.state === 'RUNNING') return;

    this.state = 'BOOTING';
    this.startedAt = new Date().toISOString();
    this.state = 'RUNNING';
    this.isLoopRunning = true;

    // Start background queue leasing tick (non-blocking)
    this.runWorkerLoop().catch((err) => {
      console.error('[AutomationRuntime] Worker loop uncaught exception:', err);
    });
  }

  /**
   * Pause the runtime
   */
  public static pause(): void {
    this.state = 'PAUSED';
    AutomationKillSwitch.setGlobalPause(true, 'runtime-pause');
  }

  /**
   * Resume the runtime
   */
  public static resume(): void {
    this.state = 'RUNNING';
    AutomationKillSwitch.setGlobalPause(false, 'runtime-resume');
  }

  /**
   * Stop runtime and drain workers
   */
  public static stop(): void {
    this.state = 'STOPPED';
    this.isLoopRunning = false;
  }

  /**
   * Execute a single tick of the queue processing loop
   */
  public static async tick(): Promise<{ leasedCount: number; ackedCount: number }> {
    if (this.state !== 'RUNNING' || AutomationKillSwitch.getStatus().globalPause) {
      return { leasedCount: 0, ackedCount: 0 };
    }

    let leasedCount = 0;
    let ackedCount = 0;

    const stages: QueueName[] = [
      'INGESTION',
      'NORMALIZATION',
      'DEDUPLICATION',
      'QUALITY',
      'PUBLISHING',
      'EXPIRY',
    ];

    for (const stage of stages) {
      // Lease up to 10 jobs per stage
      const batch = await QueueManager.dequeueBatch(stage, 10, 'runtime-worker-1');
      leasedCount += batch.length;

      for (const job of batch) {
        try {
          const success = await this.dispatchJob(job);
          if (success) {
            await QueueManager.ack(job.id);
            ackedCount += 1;
            this.processedCount += 1;
          } else {
            await QueueManager.nack(job.id, 'Dispatch failed or rejected', 'source-runtime');
            this.failedCount += 1;
          }
        } catch (err: any) {
          await QueueManager.nack(job.id, err?.message || 'Unknown processing error', 'source-runtime');
          this.failedCount += 1;
        }
      }
    }

    return { leasedCount, ackedCount };
  }

  private static async dispatchJob(job: QueueJob): Promise<boolean> {
    // Check circuit breaker and kill switch
    if (job.payload?.sourceId) {
      if (CircuitBreaker.isSourceTripped(job.payload.sourceId)) {
        return false;
      }
      if (!AutomationKillSwitch.isIngestionAllowed(job.payload.sourceId)) {
        return false;
      }
    }

    // Acquire lock if entity-specific
    const lockKey = job.payload?.entityId ? `lock-${job.payload.entityId}` : `lock-${job.id}`;
    const acquired = await AutomationLock.acquire(lockKey, { ttlSeconds: 60 });
    if (!acquired) {
      return false; // Will be retried on next tick
    }

    try {
      // In production, job processors execute specific stage transforms here
      return true;
    } finally {
      await AutomationLock.release(lockKey);
    }
  }

  private static async runWorkerLoop(): Promise<void> {
    while (this.isLoopRunning) {
      try {
        if (this.state === 'RUNNING') {
          await this.tick();
        }
      } catch (err) {
        console.error('[AutomationRuntime] Tick error:', err);
      }
      // Non-blocking tick cadence (500ms)
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  public static getStats(): RuntimeStats {
    const now = Date.now();
    const start = this.startedAt ? new Date(this.startedAt).getTime() : now;
    return {
      state: this.state,
      activeWorkers: this.state === 'RUNNING' ? 1 : 0,
      uptimeSeconds: Math.floor((now - start) / 1000),
      jobsProcessedTotal: this.processedCount,
      jobsFailedTotal: this.failedCount,
    };
  }

  public static resetAll(): void {
    this.stop();
    this.processedCount = 0;
    this.failedCount = 0;
    this.startedAt = '';
  }
}
