// src/agents/shared/TaskQueue.ts
// Asynchronous Work Task Queue with Priority, Deduplication, and Status Lifecycle

export type TaskPriority = 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';
export type TaskStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'BLOCKED';

export interface QueuedTask {
  id: string;
  agentName: string;
  toolName: string;
  inputs: Record<string, any>;
  priority: TaskPriority;
  status: TaskStatus;
  idempotencyKey?: string;
  retries: number;
  maxRetries: number;
  error?: string;
  result?: any;
  createdAt: string;
  executedAt?: string;
}

class AsynchronousTaskQueue {
  private queue: QueuedTask[] = [];
  private seenKeys = new Set<string>();
  private readonly MAX_HISTORY = 300;

  enqueue(
    agentName: string,
    toolName: string,
    inputs: Record<string, any>,
    options?: { priority?: TaskPriority; idempotencyKey?: string; maxRetries?: number }
  ): QueuedTask | null {
    if (options?.idempotencyKey && this.seenKeys.has(options.idempotencyKey)) {
      // Idempotency duplicate check: silently ignore duplicate
      return null;
    }

    if (options?.idempotencyKey) {
      this.seenKeys.add(options.idempotencyKey);
    }

    const task: QueuedTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      agentName,
      toolName,
      inputs,
      priority: options?.priority || 'NORMAL',
      status: 'PENDING',
      idempotencyKey: options?.idempotencyKey,
      retries: 0,
      maxRetries: options?.maxRetries ?? 3,
      createdAt: new Date().toISOString(),
    };

    this.queue.push(task);
    return task;
  }

  getNextPendingTask(): QueuedTask | undefined {
    return this.queue.find((t) => t.status === 'PENDING');
  }

  updateTaskStatus(taskId: string, status: TaskStatus, result?: any, error?: string) {
    const task = this.queue.find((t) => t.id === taskId);
    if (task) {
      task.status = status;
      task.result = result;
      task.error = error;
      if (status === 'COMPLETED' || status === 'FAILED') {
        task.executedAt = new Date().toISOString();
      }
    }
  }

  getTasks(limit = 50): QueuedTask[] {
    return this.queue.slice(-limit).reverse();
  }
}

export const taskQueue = new AsynchronousTaskQueue();
