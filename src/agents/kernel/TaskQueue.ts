// src/agents/kernel/TaskQueue.ts
// Priority Work Task Queue with Idempotency and Status Tracking

export type TaskStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'BLOCKED';

export interface KernelTask {
  id: string;
  agentId: string;
  department: string;
  toolName: string;
  inputs: Record<string, any>;
  priority: 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';
  status: TaskStatus;
  idempotencyKey?: string;
  result?: any;
  error?: string;
  createdAt: string;
  executedAt?: string;
}

class KernelTaskQueue {
  private queue: KernelTask[] = [];
  private seenKeys = new Set<string>();

  enqueue(
    agentId: string,
    department: string,
    toolName: string,
    inputs: Record<string, any>,
    options?: { priority?: 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW'; idempotencyKey?: string }
  ): KernelTask | null {
    if (options?.idempotencyKey && this.seenKeys.has(options.idempotencyKey)) {
      return null;
    }
    if (options?.idempotencyKey) {
      this.seenKeys.add(options.idempotencyKey);
    }

    const task: KernelTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      agentId,
      department,
      toolName,
      inputs,
      priority: options?.priority || 'NORMAL',
      status: 'PENDING',
      idempotencyKey: options?.idempotencyKey,
      createdAt: new Date().toISOString(),
    };

    this.queue.push(task);
    return task;
  }

  getNextPending(): KernelTask | undefined {
    return this.queue.find((t) => t.status === 'PENDING');
  }

  updateStatus(taskId: string, status: TaskStatus, result?: any, error?: string) {
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

  getTasks(limit = 40): KernelTask[] {
    return this.queue.slice(-limit).reverse();
  }
}

export const kernelTaskQueue = new KernelTaskQueue();
