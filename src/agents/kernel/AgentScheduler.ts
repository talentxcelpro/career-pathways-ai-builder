// src/agents/kernel/AgentScheduler.ts
// Background Worker Heartbeat & Scheduled Pulse Engine

import { kernelTaskQueue } from './TaskQueue';
import { kernelToolRegistry } from './ToolRegistry';
import { kernelAgentRegistry } from './AgentRegistry';
import { kernelAuditEngine } from './AuditEngine';

class KernelAgentScheduler {
  private isRunning = false;
  private timer: NodeJS.Timeout | null = null;
  private readonly TICK_INTERVAL_MS = 60_000; // 60s standard business tick

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log('⚡ [AgentScheduler] 48-Worker Autonomous Operating Loop Activated.');
    this.tick();
    this.timer = setInterval(() => this.tick(), this.TICK_INTERVAL_MS);
  }

  stop() {
    if (!this.isRunning) return;
    this.isRunning = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    console.log('🛑 [AgentScheduler] Autonomous Loop Paused.');
  }

  async tick() {
    if (!this.isRunning) return;

    try {
      // 1. Process asynchronous work tasks from the queue
      let task = kernelTaskQueue.getNextPending();
      while (task) {
        kernelTaskQueue.updateStatus(task.id, 'RUNNING');
        kernelAgentRegistry.setWorkerStatus(task.agentId, 'RUNNING');

        try {
          const result = await kernelToolRegistry.invoke(task.toolName, task.inputs, task.agentId);
          kernelTaskQueue.updateStatus(task.id, 'COMPLETED', result);
          kernelAgentRegistry.setWorkerStatus(task.agentId, 'IDLE');
          await kernelAuditEngine.record(task.agentId, task.department, `TASK_${task.toolName}`, {
            toolName: task.toolName,
            inputs: task.inputs,
            outputs: result,
            success: true,
          });
        } catch (err: any) {
          kernelTaskQueue.updateStatus(task.id, 'FAILED', undefined, err.message);
          kernelAgentRegistry.setWorkerStatus(task.agentId, 'IDLE', err.message);
          await kernelAuditEngine.record(task.agentId, task.department, `TASK_${task.toolName}`, {
            toolName: task.toolName,
            inputs: task.inputs,
            error: err.message,
            success: false,
          });
        }
        task = kernelTaskQueue.getNextPending();
      }
    } catch (err) {
      console.error('[AgentScheduler] Tick error:', err);
    }
  }

  isActive(): boolean {
    return this.isRunning;
  }
}

export const kernelAgentScheduler = new KernelAgentScheduler();
