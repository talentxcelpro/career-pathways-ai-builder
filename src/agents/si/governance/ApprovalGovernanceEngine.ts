// src/agents/si/governance/ApprovalGovernanceEngine.ts
// TalentXcel SI — Three-Tier Governance & Human Approval Infrastructure
// Enforces L1 (Automatic), L2 (Supervised), and L3 (Human Sign-Off)
// Guarantees: Duplicate prevention, Expiry enforcement, Role-based auth, Audit trail, and Emergency Kill-Switch.

import { kernelAuditEngine } from '@/agents/kernel/AuditEngine';
import { kernelEventBus } from '@/agents/kernel/EventBus';
import type { PermissionLevel, SIEngineId, SIApprovalRequest } from '../types';

export interface OperatorContext {
  id: string;
  role: 'admin' | 'founder' | 'operator' | 'restricted';
  email?: string;
}

export interface CreateApprovalParams {
  agentId: string;
  engineId: SIEngineId;
  action: string;
  description: string;
  permissionLevel: PermissionLevel;
  financialImpactINR?: number;
  payload: Record<string, any>;
  ttlHours?: number;
}

export class ApprovalGovernanceEngine {
  private requests = new Map<string, SIApprovalRequest>();
  private idempotencyIndex = new Map<string, string>(); // hash -> requestId
  private isEmergencyShutdown = false;

  constructor() {
    // Initial state
  }

  private computeIdempotencyKey(agentId: string, action: string, payload: Record<string, any>): string {
    const raw = `${agentId}::${action}::${JSON.stringify(payload)}`;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      hash = (hash << 5) - hash + raw.charCodeAt(i);
      hash |= 0;
    }
    return `req_key_${Math.abs(hash)}`;
  }

  // ── 1. Create Approval Request ─────────────────────────────────────────
  async createRequest(params: CreateApprovalParams): Promise<{ success: boolean; request?: SIApprovalRequest; error?: string }> {
    if (this.isEmergencyShutdown) {
      return { success: false, error: 'EMERGENCY_STOP_ACTIVE: Execution halted across all engines.' };
    }

    const idempotencyKey = this.computeIdempotencyKey(params.agentId, params.action, params.payload);
    
    // Duplicate Prevention: Check if active pending request exists for the same action & payload
    const existingId = this.idempotencyIndex.get(idempotencyKey);
    if (existingId) {
      const existing = this.requests.get(existingId);
      if (existing && existing.status === 'PENDING') {
        const isExpired = new Date(existing.expiresAt).getTime() < Date.now();
        if (!isExpired) {
          return { success: false, request: existing, error: 'DUPLICATE_PREVENTION: A pending approval request already exists for this action.' };
        }
      }
    }

    const ttlHours = params.ttlHours || 24;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttlHours * 3600 * 1000).toISOString();

    const request: SIApprovalRequest = {
      id: `appr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      agentId: params.agentId,
      engineId: params.engineId,
      action: params.action,
      description: params.description,
      permissionLevel: params.permissionLevel,
      financialImpactINR: params.financialImpactINR || 0,
      payload: params.payload,
      status: 'PENDING',
      requestedAt: now.toISOString(),
      expiresAt,
    };

    this.requests.set(request.id, request);
    this.idempotencyIndex.set(idempotencyKey, request.id);

    // Audit Log
    await kernelAuditEngine.record(params.agentId, params.engineId, 'APPROVAL_REQUEST_CREATED', {
      inputs: { approvalId: request.id, action: params.action, permissionLevel: params.permissionLevel },
      success: true,
    });

    // Event Bus Notification
    await kernelEventBus.publish(
      'GOAL_ASSIGNED',
      { approvalId: request.id, action: params.action, level: params.permissionLevel },
      params.agentId,
      params.engineId as any
    );

    return { success: true, request };
  }

  // ── 2. Get Pending Approvals (with automatic expiry sweep) ─────────────
  async getPendingRequests(): Promise<SIApprovalRequest[]> {
    const now = Date.now();
    const pending: SIApprovalRequest[] = [];

    for (const req of this.requests.values()) {
      if (req.status === 'PENDING') {
        if (new Date(req.expiresAt).getTime() <= now) {
          req.status = 'EXPIRED';
          req.resolvedAt = new Date(now).toISOString();
        } else {
          pending.push({ ...req });
        }
      }
    }

    return pending.sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
  }

  getRequestById(id: string): SIApprovalRequest | undefined {
    return this.requests.get(id);
  }

  // ── 3. Authorised Approval ─────────────────────────────────────────────
  async approveRequest(
    approvalId: string,
    operator: OperatorContext
  ): Promise<{ success: boolean; request?: SIApprovalRequest; error?: string }> {
    if (this.isEmergencyShutdown) {
      return { success: false, error: 'EMERGENCY_STOP_ACTIVE: Cannot approve actions during emergency shutdown.' };
    }

    const req = this.requests.get(approvalId);
    if (!req) {
      return { success: false, error: 'APPROVAL_NOT_FOUND' };
    }

    // Role-based Access Control Check
    if (operator.role === 'restricted') {
      return { success: false, error: 'UNAUTHORIZED: Restricted accounts cannot approve governance actions.' };
    }

    if (req.permissionLevel === 'L3_HUMAN_APPROVAL' && !['admin', 'founder'].includes(operator.role)) {
      return { success: false, error: 'UNAUTHORIZED: L3 Human Approval requires Administrator or Founder role.' };
    }

    // Expiry Check
    if (new Date(req.expiresAt).getTime() <= Date.now()) {
      req.status = 'EXPIRED';
      req.resolvedAt = new Date().toISOString();
      return { success: false, error: 'REQUEST_EXPIRED: This request has exceeded its validity window.' };
    }

    if (req.status !== 'PENDING') {
      return { success: false, error: `INVALID_STATE: Request is already ${req.status}.` };
    }

    req.status = 'APPROVED';
    req.resolvedAt = new Date().toISOString();
    req.resolvedBy = `${operator.role}:${operator.id}`;

    // Audit Log
    await kernelAuditEngine.record(req.agentId, req.engineId, 'APPROVAL_GRANTED', {
      inputs: { approvalId: req.id, resolvedBy: req.resolvedBy },
      success: true,
    });

    return { success: true, request: req };
  }

  // ── 4. Rejection ───────────────────────────────────────────────────────
  async rejectRequest(
    approvalId: string,
    operator: OperatorContext,
    reason: string
  ): Promise<{ success: boolean; request?: SIApprovalRequest; error?: string }> {
    const req = this.requests.get(approvalId);
    if (!req) return { success: false, error: 'APPROVAL_NOT_FOUND' };

    if (operator.role === 'restricted') {
      return { success: false, error: 'UNAUTHORIZED: Restricted accounts cannot reject governance actions.' };
    }

    req.status = 'REJECTED';
    req.resolvedAt = new Date().toISOString();
    req.resolvedBy = `${operator.role}:${operator.id}`;
    (req.payload as any).rejectionReason = reason;

    await kernelAuditEngine.record(req.agentId, req.engineId, 'APPROVAL_REJECTED', {
      inputs: { approvalId: req.id, reason, resolvedBy: req.resolvedBy },
      success: true,
    });

    return { success: true, request: req };
  }

  // ── 5. L3 Execution Blocking Guard ─────────────────────────────────────
  isL3ExecutionPermitted(actionKey: string): boolean {
    if (this.isEmergencyShutdown) return false;

    // Check if an APPROVED request exists with valid timestamp (within last 1 hour)
    for (const req of this.requests.values()) {
      if (req.action === actionKey && req.status === 'APPROVED' && req.resolvedAt) {
        const approvedAt = new Date(req.resolvedAt).getTime();
        if (Date.now() - approvedAt < 3600 * 1000) {
          return true; // Authorised execution window valid
        }
      }
    }
    return false;
  }

  // ── 6. Emergency Shutdown Interaction ──────────────────────────────────
  triggerEmergencyShutdown(): void {
    this.isEmergencyShutdown = true;
  }

  resumeOperations(): void {
    this.isEmergencyShutdown = false;
  }

  isEmergencyActive(): boolean {
    return this.isEmergencyShutdown;
  }
}

export const approvalGovernanceEngine = new ApprovalGovernanceEngine();
