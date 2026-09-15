// src/agents/kernel/RecoveryEngine.ts
// Dead-letter Queue and Auto-Recovery for Failed Operations

export interface DeadLetterEntry {
  id: string;
  agentId: string;
  toolName: string;
  inputs: Record<string, any>;
  error: string;
  failedAt: string;
  attempts: number;
}

class KernelRecoveryEngine {
  private deadLetterQueue: DeadLetterEntry[] = [];

  pushToDeadLetter(agentId: string, toolName: string, inputs: Record<string, any>, error: string) {
    this.deadLetterQueue.push({
      id: `dlq-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      agentId,
      toolName,
      inputs,
      error,
      failedAt: new Date().toISOString(),
      attempts: 3,
    });
  }

  getDeadLetterQueue(): DeadLetterEntry[] {
    return [...this.deadLetterQueue];
  }

  clearDeadLetter(id: string) {
    this.deadLetterQueue = this.deadLetterQueue.filter((e) => e.id !== id);
  }
}

export const kernelRecoveryEngine = new KernelRecoveryEngine();
