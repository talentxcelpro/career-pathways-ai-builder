// src/agents/shared/Scheduler.ts
// Server-Side Autonomous Scheduler & Heartbeat Worker Loop

import { agentRegistry } from './AgentRegistry';
import { taskQueue } from './TaskQueue';
import { toolRegistry } from './ToolRegistry';
import { agentAuditLog } from './AuditLog';

class AutonomousScheduler {
  private isRunning = false;
  private intervalTimer: NodeJS.Timeout | null = null;
  private readonly HEARTBEAT_INTERVAL_MS = 60_000; // 60s standard business tick

  /**
   * Starts the background autonomous worker loop
   */
  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log('⚡ [Scheduler] Autonomous Business OS Kernel loop activated.');

    // Run initial cycle immediately
    this.tick();

    // Schedule regular pulses
    this.intervalTimer = setInterval(() => {
      this.tick();
    }, this.HEARTBEAT_INTERVAL_MS);
  }

  /**
   * Stops the background worker loop
   */
  stop() {
    if (!this.isRunning) return;
    this.isRunning = false;
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
      this.intervalTimer = null;
    }
    console.log('🛑 [Scheduler] Autonomous Business OS Kernel loop paused.');
  }

  /**
   * Executes a single business cycle tick: processes task queue and pulses active agents
   */
  async tick() {
    if (!this.isRunning) return;

    try {
      // 1. Process pending tasks from TaskQueue
      let pendingTask = taskQueue.getNextPendingTask();
      while (pendingTask) {
        taskQueue.updateTaskStatus(pendingTask.id, 'RUNNING');
        try {
          const result = await toolRegistry.invokeTool(
            pendingTask.toolName,
            pendingTask.inputs,
            pendingTask.agentName
          );
          taskQueue.updateTaskStatus(pendingTask.id, 'COMPLETED', result);
          agentRegistry.recordActivity(pendingTask.agentName);
        } catch (err: any) {
          taskQueue.updateTaskStatus(pendingTask.id, 'FAILED', undefined, err.message);
        }
        pendingTask = taskQueue.getNextPendingTask();
      }

      // 2. Pulse the Executive Agent (which coordinates all functional agents)
      const execAgent = agentRegistry.getAgent('ExecutiveAgent');
      if (execAgent) {
        await execAgent.pulse();
        agentRegistry.recordActivity('ExecutiveAgent');
      }
    } catch (err: any) {
      console.error('[Scheduler] Error during business cycle tick:', err);
    }
  }

  isLoopActive(): boolean {
    return this.isRunning;
  }
}

export const scheduler = new AutonomousScheduler();
