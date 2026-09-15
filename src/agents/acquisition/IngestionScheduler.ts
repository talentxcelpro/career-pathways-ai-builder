// src/agents/acquisition/IngestionScheduler.ts
// Autonomous Ingestion Scheduler
// Executes background ingestion pulses on multi-tier cadences (15m jobs, 1h enrichment, 24h hygiene).

import { coreExternalAcquisitionEngine } from './ExternalAcquisitionEngine';

export class IngestionScheduler {
  private timer: NodeJS.Timeout | null = null;
  private isRunning = false;

  start() {
    if (this.isRunning) return;
    this.isRunning = true;

    // Run initial acquisition pulse
    coreExternalAcquisitionEngine.executeAcquisitionCycle();

    // Schedule 15-minute background pulse
    this.timer = setInterval(() => {
      coreExternalAcquisitionEngine.executeAcquisitionCycle();
    }, 15 * 60 * 1000);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isRunning = false;
  }

  isActive(): boolean {
    return this.isRunning;
  }
}

export const coreIngestionScheduler = new IngestionScheduler();
