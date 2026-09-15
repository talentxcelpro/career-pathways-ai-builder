// src/agents/kernel/RiskEngine.ts
// Risk Classification and Founder Escalation Router for Sanobar Jahan

import type { RiskLevel, RiskEscalation, DepartmentId } from './types';

class KernelRiskEngine {
  private escalations: RiskEscalation[] = [
    {
      id: 'esc-1',
      agentId: 'SocialDistributionAgent',
      department: 'growth_marketing',
      actionTitle: 'Paid Ad Spend Allocation',
      reason: 'Launch targeted founder campaign for 50 AI tools ($250 / ₹21,000). Paused per spend guardrail policy.',
      riskLevel: 'MEDIUM',
      financialAmountINR: 21000,
      payload: { platform: 'x_ads', targetAudience: 'ai_founders' },
      status: 'PENDING_FOUNDER_APPROVAL',
      createdAt: new Date().toISOString(),
    },
  ];

  classifyRisk(action: string, amountINR = 0): RiskLevel {
    if (amountINR > 50000 || action.includes('LEGAL_CONTRACT') || action.includes('REFUND_BULK')) {
      return 'CRITICAL';
    }
    if (amountINR > 0 || action.includes('PAID_AD_SPEND') || action.includes('ACCOUNT_SUSPENSION')) {
      return 'HIGH';
    }
    if (action.includes('CAMPAIGN_OUTREACH')) {
      return 'MEDIUM';
    }
    return 'LOW';
  }

  escalateToFounder(
    agentId: string,
    department: DepartmentId,
    actionTitle: string,
    reason: string,
    riskLevel: RiskLevel,
    payload: Record<string, any>,
    financialAmountINR?: number
  ): RiskEscalation {
    const escalation: RiskEscalation = {
      id: `esc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      agentId,
      department,
      actionTitle,
      reason,
      riskLevel,
      financialAmountINR,
      payload,
      status: 'PENDING_FOUNDER_APPROVAL',
      createdAt: new Date().toISOString(),
    };

    this.escalations.unshift(escalation);
    return escalation;
  }

  getPendingEscalations(): RiskEscalation[] {
    return this.escalations.filter((e) => e.status === 'PENDING_FOUNDER_APPROVAL');
  }

  resolveEscalation(id: string, approved: boolean, resolvedBy = 'Sanobar Jahan'): boolean {
    const item = this.escalations.find((e) => e.id === id);
    if (item) {
      item.status = approved ? 'APPROVED' : 'REJECTED';
      item.resolvedAt = new Date().toISOString();
      item.resolvedBy = resolvedBy;
      return true;
    }
    return false;
  }
}

export const kernelRiskEngine = new KernelRiskEngine();
