/**
 * TalentXcel Global Jobs Network — Persistent Queue Manager
 * Coordinates transactional priority enqueueing, worker leasing, retry escalation,
 * and dead-letter queue routing across ingestion, normalization, quality, and publishing stages.
 */

export type QueueName =
  | 'INGESTION'
  | 'NORMALIZATION'
  | 'DEDUPLICATION'
  | 'QUALITY'
  | 'PUBLISHING'
  | 'EXPIRY'
  | 'RETRY'
  | 'DEAD_LETTER';

export type JobPriority = 'P0' | 'P1' | 'P2' | 'P3' | 'P4';

export interface QueueJob<T = any> {
  id: string;
  queueName: QueueName;
  jobType: string;
  payload: T;
  priority: JobPriority;
  status: 'PENDING' | 'LOCKED' | 'COMPLETED' | 'FAILED' | 'DEAD_LETTER';
  attempts: number;
  maxAttempts: number;
  availableAt: string;
  lockedAt?: string;
  lockedBy?: string;
  completedAt?: string;
  error?: string;
  createdAt: string;
}

export interface DeadLetterEvent {
  id: string;
  sourceId: string;
  eventType: string;
  payload: any;
  error: string;
  attemptCount: number;
  createdAt: string;
  resolvedAt?: string;
}

export class QueueManager {
  private static queues: Map<QueueName, QueueJob[]> = new Map();
  private static deadLetterEvents: DeadLetterEvent[] = [];

  private static priorityWeight: Record<JobPriority, number> = {
    P0: 100, // Emergency / national breakings
    P1: 80,  // Federal / Core
    P2: 60,  // State / PSU
    P3: 40,  // Municipal
    P4: 20,  // Low velocity
  };

  /**
   * Enqueue a job into the specified priority queue
   */
  public static async enqueue<T>(
    queueName: QueueName,
    jobType: string,
    payload: T,
    priority: JobPriority = 'P2',
    maxAttempts = 3,
    delaySeconds = 0
  ): Promise<QueueJob<T>> {
    const job: QueueJob<T> = {
      id: `job-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      queueName,
      jobType,
      payload,
      priority,
      status: 'PENDING',
      attempts: 0,
      maxAttempts,
      availableAt: new Date(Date.now() + delaySeconds * 1000).toISOString(),
      createdAt: new Date().toISOString(),
    };

    if (!this.queues.has(queueName)) {
      this.queues.set(queueName, []);
    }

    this.queues.get(queueName)!.push(job);
    return job;
  }

  /**
   * Dequeue a batch of available jobs prioritized by P0->P4 and availableAt
   */
  public static async dequeueBatch(
    queueName: QueueName,
    batchSize = 10,
    workerId = 'worker-default'
  ): Promise<QueueJob[]> {
    const list = this.queues.get(queueName) || [];
    const now = new Date().toISOString();

    // Filter available pending jobs
    const available = list.filter(
      (j) => j.status === 'PENDING' && j.availableAt <= now
    );

    // Sort by priority weight desc, then createdAt asc
    available.sort((a, b) => {
      const pDiff = this.priorityWeight[b.priority] - this.priorityWeight[a.priority];
      if (pDiff !== 0) return pDiff;
      return a.createdAt.localeCompare(b.createdAt);
    });

    const leased = available.slice(0, batchSize);
    for (const job of leased) {
      job.status = 'LOCKED';
      job.lockedAt = now;
      job.lockedBy = workerId;
      job.attempts += 1;
    }

    return leased;
  }

  /**
   * Acknowledge successful job processing
   */
  public static async ack(jobId: string): Promise<boolean> {
    for (const [, list] of this.queues.entries()) {
      const index = list.findIndex((j) => j.id === jobId);
      if (index !== -1) {
        list[index].status = 'COMPLETED';
        list[index].completedAt = new Date().toISOString();
        // Remove completed job to keep queue lean
        list.splice(index, 1);
        return true;
      }
    }
    return false;
  }

  /**
   * Negative acknowledgement: handle failure, backoff retry, or route to dead-letter
   */
  public static async nack(
    jobId: string,
    error: string,
    sourceId = 'unknown'
  ): Promise<'RETRY' | 'DEAD_LETTER'> {
    for (const [queueName, list] of this.queues.entries()) {
      const job = list.find((j) => j.id === jobId);
      if (job) {
        job.error = error;
        job.lockedAt = undefined;
        job.lockedBy = undefined;

        if (job.status !== 'LOCKED') {
          job.attempts += 1;
        }

        if (job.attempts >= job.maxAttempts) {
          job.status = 'DEAD_LETTER';
          // Record dead-letter event
          this.deadLetterEvents.push({
            id: `dle-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            sourceId,
            eventType: `${queueName}_${job.jobType}`,
            payload: job.payload,
            error,
            attemptCount: job.attempts,
            createdAt: new Date().toISOString(),
          });
          // Remove from active queue
          const idx = list.indexOf(job);
          if (idx !== -1) list.splice(idx, 1);
          return 'DEAD_LETTER';
        } else {
          job.status = 'PENDING';
          // Exponential backoff: 30s * 2^(attempts-1)
          const backoffSec = 30 * Math.pow(2, job.attempts - 1);
          job.availableAt = new Date(Date.now() + backoffSec * 1000).toISOString();
          return 'RETRY';
        }
      }
    }
    return 'DEAD_LETTER';
  }

  /**
   * Get queue depths across all stages
   */
  public static getQueueDepths(): Record<QueueName, number> {
    const depths: Partial<Record<QueueName, number>> = {};
    const allQueues: QueueName[] = [
      'INGESTION', 'NORMALIZATION', 'DEDUPLICATION',
      'QUALITY', 'PUBLISHING', 'EXPIRY', 'RETRY', 'DEAD_LETTER'
    ];

    for (const q of allQueues) {
      if (q === 'DEAD_LETTER') {
        depths[q] = this.deadLetterEvents.filter((d) => !d.resolvedAt).length;
      } else {
        const list = this.queues.get(q) || [];
        depths[q] = list.filter((j) => j.status === 'PENDING' || j.status === 'LOCKED').length;
      }
    }

    return depths as Record<QueueName, number>;
  }

  /**
   * Fetch dead-letter items for admin review
   */
  public static getDeadLetterEvents(): DeadLetterEvent[] {
    return [...this.deadLetterEvents];
  }

  /**
   * Clear all queues (testing only)
   */
  public static resetAll(): void {
    this.queues.clear();
    this.deadLetterEvents = [];
  }
}
