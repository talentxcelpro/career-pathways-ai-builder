// src/agents/shared/Guardrails.ts
// Programmatic Boundary Enforcers & Safety Guardrails for Autonomous Agents

import type { GuardrailConfig } from './types';

export const DEFAULT_GUARDRAILS: GuardrailConfig = {
  maxDailyOutreach: 100,
  maxContactsPerProspect: 3,
  requireHumanApprovalForSpend: true,
  maxAutonomousBidAmountINR: 0,
  rateLimitPerMinute: 30,
};

class GuardrailEngine {
  private config: GuardrailConfig = { ...DEFAULT_GUARDRAILS };
  private actionCounters = new Map<string, number>();
  private lastResetDay = new Date().toDateString();

  constructor(customConfig?: Partial<GuardrailConfig>) {
    if (customConfig) {
      this.config = { ...this.config, ...customConfig };
    }
  }

  /**
   * Resets daily counters when day transitions
   */
  private checkDailyReset() {
    const today = new Date().toDateString();
    if (today !== this.lastResetDay) {
      this.actionCounters.clear();
      this.lastResetDay = today;
    }
  }

  /**
   * Checks if an outbound contact action is permitted under anti-spam rules
   */
  canContactProspect(currentContactCount: number): { allowed: boolean; reason?: string } {
    this.checkDailyReset();

    if (currentContactCount >= this.config.maxContactsPerProspect) {
      return {
        allowed: false,
        reason: `Prospect has reached maximum allowed contact limit (${this.config.maxContactsPerProspect} touches). Strict anti-spam rule active.`,
      };
    }

    const todayOutreach = this.actionCounters.get('daily_outreach') || 0;
    if (todayOutreach >= this.config.maxDailyOutreach) {
      return {
        allowed: false,
        reason: `Daily outreach ceiling reached (${this.config.maxDailyOutreach}/day).`,
      };
    }

    return { allowed: true };
  }

  /**
   * Checks if financial commitment requires human sign-off
   */
  canExecuteFinancialSpend(amountINR: number): { allowed: boolean; reason?: string } {
    if (this.config.requireHumanApprovalForSpend && amountINR > this.config.maxAutonomousBidAmountINR) {
      return {
        allowed: false,
        reason: `Financial spend of ₹${amountINR} exceeds autonomous limit (₹${this.config.maxAutonomousBidAmountINR}). Human sign-off required.`,
      };
    }

    return { allowed: true };
  }

  /**
   * Records a validated action against daily limits
   */
  recordAction(actionType: string) {
    this.checkDailyReset();
    const current = this.actionCounters.get(actionType) || 0;
    this.actionCounters.set(actionType, current + 1);
  }

  getConfig(): GuardrailConfig {
    return { ...this.config };
  }
}

export const guardrails = new GuardrailEngine();
