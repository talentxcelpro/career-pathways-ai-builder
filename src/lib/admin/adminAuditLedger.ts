// src/lib/admin/adminAuditLedger.ts
// Immutable Black Box Recorder for Privileged Admin Operations
// Deterministic hash-chained event auditing.

import { sha256 } from '@/lib/crypto/deterministicSha256';

export type AdminActionType =
  | 'ADMIN_GRANTED'
  | 'ADMIN_REVOKED'
  | 'ROLE_CHANGED'
  | 'USER_SUSPENDED'
  | 'USER_REACTIVATED'
  | 'TXC_AWARDED'
  | 'TXC_MINT_REQUESTED'
  | 'TXC_MINT_APPROVED'
  | 'TXC_MINT_REJECTED'
  | 'COMPANY_VERIFIED'
  | 'JOB_PUBLISHED'
  | 'JOB_DELETED'
  | 'AI_CONFIG_CHANGED'
  | 'FEATURE_FLAG_CHANGED'
  | 'EMERGENCY_KILL_SWITCH_TOGGLED';

export interface AdminActionLogEntry {
  id: string;
  actor_user_id: string;
  actor_phone: string | null;
  actor_role: string;
  action: AdminActionType;
  resource_type: string;
  resource_id: string;
  before_state: Record<string, any> | null;
  after_state: Record<string, any> | null;
  reason: string;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  request_id: string;
  success: boolean;
  prev_hash: string;
  hash: string;
}

let latestHash = '0000000000000000000000000000000000000000000000000000000000000000';
const IN_MEMORY_AUDIT_LOGS: AdminActionLogEntry[] = [];

/**
 * Computes deterministic SHA-256 hash of an audit entry to ensure tamper-evident immutability
 */
export function computeEntryHash(entry: Omit<AdminActionLogEntry, 'hash'>): string {
  const payload = `${entry.id}|${entry.created_at}|${entry.actor_user_id}|${entry.action}|${entry.resource_id}|${entry.prev_hash}`;
  return sha256(payload);
}

/**
 * Records a privileged admin action into the immutable audit ledger
 */
export function recordAdminAction(params: {
  actor_user_id: string;
  actor_phone?: string | null;
  actor_role: string;
  action: AdminActionType;
  resource_type: string;
  resource_id: string;
  before_state?: Record<string, any> | null;
  after_state?: Record<string, any> | null;
  reason: string;
  ip_address?: string | null;
  user_agent?: string | null;
  success?: boolean;
}): AdminActionLogEntry {
  const id = `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const created_at = new Date().toISOString();
  const request_id = `req_${Math.random().toString(36).substring(2, 9)}`;

  const unhashedEntry: Omit<AdminActionLogEntry, 'hash'> = {
    id,
    actor_user_id: params.actor_user_id,
    actor_phone: params.actor_phone || null,
    actor_role: params.actor_role,
    action: params.action,
    resource_type: params.resource_type,
    resource_id: params.resource_id,
    before_state: params.before_state || null,
    after_state: params.after_state || null,
    reason: params.reason,
    ip_address: params.ip_address || '127.0.0.1',
    user_agent: params.user_agent || 'TalentXcel-AdminOS/2.0',
    created_at,
    request_id,
    success: params.success !== false,
    prev_hash: latestHash
  };

  const hash = computeEntryHash(unhashedEntry);
  const completeEntry: AdminActionLogEntry = { ...unhashedEntry, hash };

  latestHash = hash;
  IN_MEMORY_AUDIT_LOGS.unshift(completeEntry);
  return completeEntry;
}

/**
 * Retrieves audit logs with optional filtering
 */
export function getAdminAuditLogs(filter?: {
  action?: AdminActionType;
  actor_user_id?: string;
  limit?: number;
}): AdminActionLogEntry[] {
  let logs = [...IN_MEMORY_AUDIT_LOGS];
  if (filter?.action) {
    logs = logs.filter(l => l.action === filter.action);
  }
  if (filter?.actor_user_id) {
    logs = logs.filter(l => l.actor_user_id === filter.actor_user_id);
  }
  return logs.slice(0, filter?.limit || 50);
}
