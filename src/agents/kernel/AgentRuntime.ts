// src/agents/kernel/AgentRuntime.ts
// Master Autonomous Business OS Runtime for Founder/CEO Sanobar Jahan

import { kernelAgentRegistry } from './AgentRegistry';
import { kernelAgentScheduler } from './AgentScheduler';
import { kernelEventBus } from './EventBus';
import { kernelMemoryManager } from './MemoryManager';
import { kernelRiskEngine } from './RiskEngine';
import { kernelToolRegistry } from './ToolRegistry';
import { kernelWorkflowEngine } from './WorkflowEngine';
import { kernelAuditEngine } from './AuditEngine';

class MasterBusinessRuntime {
  private isBooted = false;

  boot() {
    if (this.isBooted) return;
    this.isBooted = true;

    console.log('🚀 [MasterBusinessRuntime] Booting 48-Worker Autonomous Operating System for Founder Sanobar Jahan...');
    kernelAgentScheduler.start();
    console.log('✅ [MasterBusinessRuntime] 9 Departments & 48 Specialist Workers Online.');
  }

  isReady(): boolean {
    return this.isBooted;
  }
}

export const masterBusinessRuntime = new MasterBusinessRuntime();
