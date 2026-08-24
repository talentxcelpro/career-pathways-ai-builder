// src/agents/core/Guardrails.ts
// Programmatic Boundary Enforcer & Multi-Level Authority Guardrails

import type { AuthorityLevel } from './types';
import { kernelRiskEngine } from '../kernel/RiskEngine';

export class Guardrails {
  private readonly MAX_DAILY_OUTREACH = 100;
  private readonly MAX_TOUCHES_PER_PROSPECT = 3;
  private readonly FINANCIAL_APPROVAL_THRESHOLD_INR = 0; // Any spend > 0 requires Founder approval

  /**
   * Asserts whether a given operation can execute automatically or must pause for Founder Sanobar Jahan.
   */
  checkAuthorization(params: {
    agentId: string;
    department: string;
    actionName: string;
    authorityLevel: AuthorityLevel;
    financialAmountINR?: number;
    prospectTouchCount?: number;
  }): { allowed: boolean; reason?: string; requiresEscalation?: boolean } {
    // 1. Check strict prospect touch limit (Anti-spam)
    if (params.prospectTouchCount && params.prospectTouchCount >= this.MAX_TOUCHES_PER_PROSPECT) {
      return {
        allowed: false,
        reason: `ANTI_SPAM_VIOLATION: Prospect has reached maximum ${this.MAX_TOUCHES_PER_PROSPECT} permitted touches.`,
      };
    }

    // 2. Check financial expenditure (Level 2: Founder approval required for spend > ₹0)
    if (params.financialAmountINR && params.financialAmountINR > this.FINANCIAL_APPROVAL_THRESHOLD_INR) {
      kernelRiskEngine.escalate(
        params.agentId,
        params.department,
        params.actionName,
        `Financial spend of ₹${params.financialAmountINR.toLocaleString()} requires Founder Sanobar Jahan authorization.`,
        'HIGH',
        { financialAmountINR: params.financialAmountINR }
      );
      return {
        allowed: false,
        requiresEscalation: true,
        reason: `PAUSED_FOR_APPROVAL: Routed to Founder Sanobar Jahan approval queue.`,
      };
    }

    // 3. Level 3 (Legal, MOUs, sensitive changes)
    if (params.authorityLevel === 3) {
      kernelRiskEngine.escalate(
        params.agentId,
        params.department,
        params.actionName,
        `Level 3 legal/contractual action requires Founder Sanobar Jahan signature.`,
        'CRITICAL'
      );
      return {
        allowed: false,
        requiresEscalation: true,
        reason: `PAUSED_FOR_FOUNDER_SIGNATURE: Legal/MOU binding action.`,
      };
    }

    return { allowed: true };
  }
}

export const coreGuardrails = new Guardrails();
