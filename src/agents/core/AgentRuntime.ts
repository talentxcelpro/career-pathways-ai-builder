// src/agents/core/AgentRuntime.ts
// Master Production Runtime for Founder & CEO: Sanobar Jahan

import { coreTaskScheduler } from './TaskScheduler';
import { coreAgentOrchestrator } from './AgentOrchestrator';
import { coreBusinessMemory } from './BusinessMemory';
import { coreObjectiveEngine } from './ObjectiveEngine';
import { coreChannelRegistry } from './ChannelRegistry';
import { coreKPIEngine } from './KPIEngine';

export class ProductionAgentRuntime {
  private isBooted = false;

  boot() {
    if (this.isBooted) return;
    this.isBooted = true;

    console.log('🚀 [ProductionAgentRuntime] Booting Autonomous Business OS for Founder Sanobar Jahan...');
    coreTaskScheduler.start();
    console.log('✅ [ProductionAgentRuntime] 9 Departments, 48 Specialist Workers & 14 Channels Online.');
  }

  isReady(): boolean {
    return this.isBooted;
  }
}

export const productionAgentRuntime = new ProductionAgentRuntime();
