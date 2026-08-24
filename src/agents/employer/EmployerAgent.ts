// src/agents/employer/EmployerAgent.ts
// Autonomous Employer Acquisition Operating Agent
// Delegates closed-loop execution to EmployerAcquisitionEngine

import { coreEmployerAcquisitionEngine } from './EmployerAcquisitionEngine';

export class EmployerAgent {
  readonly name = 'EmployerAgent';

  async runEmployerCycle(): Promise<{ actionsTaken: number; qualifiedCount: number; contactedCount: number }> {
    const report = await coreEmployerAcquisitionEngine.executeAcquisitionLoop();
    return {
      actionsTaken: report.signalsProcessed + report.outreachDispatched,
      qualifiedCount: report.opportunitiesQualified,
      contactedCount: report.outreachDispatched,
    };
  }

  getStatus(): 'RUNNING' | 'IDLE' {
    return 'IDLE';
  }
}

export const employerAgent = new EmployerAgent();
