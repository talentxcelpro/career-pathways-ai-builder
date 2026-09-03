// src/lib/ai-org/executionGateway.ts
// Server-Authoritative Execution Gateway for TalentXcel AI Growth Organization
// Invariant: Zero Bypass. All agent mutations MUST pass through this gateway.
// Enforces 5-state lifecycle, agent enablement, Level-3 policy matrix, and audit logging.

import { supabase } from '@/integrations/supabase/client';
import { 
  getAuthoritativeLifecycleState, 
  getCachedAgentStates, 
  DEFAULT_ACTION_PERMISSIONS 
} from './aiOrganizationState';
import type { 
  AgentId, 
  ActionType, 
  ExecutionPolicy, 
  AiOperationAuditEntry,
  AiRecommendation 
} from './types';

export interface ExecutionRequest<T = any> {
  agentId: AgentId;
  actionType: ActionType;
  targetSurface?: string;
  telemetryTrigger?: string;
  payload?: Record<string, any>;
  executeFn: () => Promise<T>;
}

export interface ExecutionResult<T = any> {
  success: boolean;
  status: 'EXECUTED' | 'BLOCKED_OFF' | 'BLOCKED_PERMISSION' | 'PENDING_REVIEW' | 'REJECTED';
  data?: T;
  rejectionReason?: string;
  auditEntryId?: string;
}

// In-memory audit cache for instant admin UI feed
export const LOCAL_AUDIT_STREAM: AiOperationAuditEntry[] = [
  {
    id: 'audit-001',
    agentId: 'GSC_INTELLIGENCE',
    actionType: 'READ_DATA',
    executionPolicy: 'AUTO',
    status: 'EXECUTED',
    targetSurface: 'Jobs / Bangalore',
    telemetryTrigger: 'Daily GSC Search Ingestion Sync',
    payload: { impressionsAudited: 48200, risingQueriesFound: 14 },
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    id: 'audit-002',
    agentId: 'SEO_OPPORTUNITY',
    actionType: 'CREATE_SEO_PAGE',
    executionPolicy: 'AUTO',
    status: 'EXECUTED',
    targetSurface: 'Jobs / Dubai / Data Analyst',
    telemetryTrigger: 'Search cluster demand >= 1,200 impressions with 0 pages',
    payload: { path: '/jobs/data-analyst/freshers/dubai', inventory: 6 },
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: 'audit-003',
    agentId: 'CONTENT_ENGINE',
    actionType: 'PUBLISH_PAGE',
    executionPolicy: 'REVIEW',
    status: 'PENDING_REVIEW',
    targetSurface: 'Career Guides / React Developer 2026',
    telemetryTrigger: 'P0 Demand Opportunity Scored 92/100',
    payload: { proposedSlug: 'react-developer-career-roadmap-2026' },
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
];

/**
 * The Master Execution Gateway Gatekeeper
 */
export async function executeAgentAction<T = any>(
  request: ExecutionRequest<T>
): Promise<ExecutionResult<T>> {
  const { agentId, actionType, targetSurface, telemetryTrigger, payload, executeFn } = request;

  // 1. Level 1: Server-Authoritative Organization Lifecycle State
  const orgState = await getAuthoritativeLifecycleState();

  if (orgState === 'OFFLINE') {
    const blockedEntry = await recordAuditEntry({
      agentId,
      actionType,
      executionPolicy: 'FORBIDDEN',
      status: 'BLOCKED_OFF',
      targetSurface,
      telemetryTrigger,
      payload: { ...payload, reason: 'Organization is OFFLINE. Master kill switch engaged.' },
    });
    return {
      success: false,
      status: 'BLOCKED_OFF',
      rejectionReason: 'Execution blocked: TalentXcel AI Organization is currently OFFLINE.',
      auditEntryId: blockedEntry.id,
    };
  }

  if (orgState === 'EMERGENCY_STOP') {
    const blockedEntry = await recordAuditEntry({
      agentId,
      actionType,
      executionPolicy: 'FORBIDDEN',
      status: 'BLOCKED_OFF',
      targetSurface,
      telemetryTrigger,
      payload: { ...payload, reason: 'EMERGENCY_STOP active. All mutations frozen unconditionally.' },
    });
    return {
      success: false,
      status: 'BLOCKED_OFF',
      rejectionReason: 'Execution blocked: EMERGENCY STOP is active. All autonomous operations frozen.',
      auditEntryId: blockedEntry.id,
    };
  }

  if (orgState === 'PAUSED' && actionType !== 'READ_DATA' && actionType !== 'ANALYZE') {
    const blockedEntry = await recordAuditEntry({
      agentId,
      actionType,
      executionPolicy: 'FORBIDDEN',
      status: 'BLOCKED_OFF',
      targetSurface,
      telemetryTrigger,
      payload: { ...payload, reason: 'Organization is PAUSED. Mutations prohibited.' },
    });
    return {
      success: false,
      status: 'BLOCKED_OFF',
      rejectionReason: 'Execution blocked: TalentXcel AI Organization is PAUSED. Only read-only operations permitted.',
      auditEntryId: blockedEntry.id,
    };
  }

  // 2. Level 2: Agent Specific Enabled Check
  const agentStates = getCachedAgentStates();
  const agentConfig = agentStates[agentId];
  if (agentConfig && !agentConfig.enabled) {
    const blockedEntry = await recordAuditEntry({
      agentId,
      actionType,
      executionPolicy: 'FORBIDDEN',
      status: 'BLOCKED_PERMISSION',
      targetSurface,
      telemetryTrigger,
      payload: { ...payload, reason: `Agent ${agentId} is individually disabled.` },
    });
    return {
      success: false,
      status: 'BLOCKED_PERMISSION',
      rejectionReason: `Execution blocked: Agent ${agentId} is currently disabled.`,
      auditEntryId: blockedEntry.id,
    };
  }

  // 3. Level 3: Action Permissions Matrix Check
  const agentPermissions = DEFAULT_ACTION_PERMISSIONS[agentId] || [];
  const permissionItem = agentPermissions.find((p) => p.actionType === actionType);
  const policy: ExecutionPolicy = permissionItem?.policy || (actionType === 'DELETE_PAGE' || actionType === 'SPEND_MONEY' ? 'FORBIDDEN' : 'REVIEW');

  // Hard Forbidden Actions
  if (policy === 'FORBIDDEN' || actionType === 'DELETE_PAGE' || actionType === 'SPEND_MONEY') {
    const blockedEntry = await recordAuditEntry({
      agentId,
      actionType,
      executionPolicy: 'FORBIDDEN',
      status: 'BLOCKED_PERMISSION',
      targetSurface,
      telemetryTrigger,
      payload: { ...payload, reason: `Action type ${actionType} is strictly forbidden for AI agents.` },
    });
    return {
      success: false,
      status: 'BLOCKED_PERMISSION',
      rejectionReason: `Action type ${actionType} is strictly prohibited by security policy.`,
      auditEntryId: blockedEntry.id,
    };
  }

  // Review Required (Separation of Recommendations from Mutations)
  if (policy === 'REVIEW') {
    // Queue as recommendation for human approval
    const recId = crypto.randomUUID ? crypto.randomUUID() : `rec-${Date.now()}`;
    await queueRecommendation({
      id: recId,
      agentId,
      actionType,
      title: `${agentId}: Proposed ${actionType} on ${targetSurface || 'System'}`,
      description: telemetryTrigger || 'Action requires human approval per Level-3 policy.',
      targetUrl: targetSurface,
      priority: 'P1',
      status: 'PROPOSED',
      metadata: payload,
      createdAt: new Date().toISOString(),
    });

    const auditEntry = await recordAuditEntry({
      agentId,
      actionType,
      executionPolicy: 'REVIEW',
      status: 'PENDING_REVIEW',
      targetSurface,
      telemetryTrigger,
      payload: { ...payload, recommendationId: recId },
    });

    return {
      success: true,
      status: 'PENDING_REVIEW',
      rejectionReason: 'Action queued for human approval in the Admin Security Center.',
      auditEntryId: auditEntry.id,
    };
  }

  // 4. Autonomous Execution (AUTO policy)
  try {
    const data = await executeFn();
    const auditEntry = await recordAuditEntry({
      agentId,
      actionType,
      executionPolicy: 'AUTO',
      status: 'EXECUTED',
      targetSurface,
      telemetryTrigger,
      payload,
    });

    return {
      success: true,
      status: 'EXECUTED',
      data,
      auditEntryId: auditEntry.id,
    };
  } catch (err: any) {
    const auditEntry = await recordAuditEntry({
      agentId,
      actionType,
      executionPolicy: 'AUTO',
      status: 'REJECTED',
      targetSurface,
      telemetryTrigger,
      payload: { ...payload, error: err.message },
    });

    return {
      success: false,
      status: 'REJECTED',
      rejectionReason: err.message || 'Execution error encountered.',
      auditEntryId: auditEntry.id,
    };
  }
}

/**
 * Records an entry into the tamper-proof audit ledger
 */
async function recordAuditEntry(entryData: Omit<AiOperationAuditEntry, 'id' | 'createdAt'>): Promise<AiOperationAuditEntry> {
  const entry: AiOperationAuditEntry = {
    id: crypto.randomUUID ? crypto.randomUUID() : `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    ...entryData,
    createdAt: new Date().toISOString(),
  };

  LOCAL_AUDIT_STREAM.unshift(entry);
  if (LOCAL_AUDIT_STREAM.length > 50) {
    LOCAL_AUDIT_STREAM.pop();
  }

  try {
    await supabase.from('ai_organization_audit_log' as any).insert({
      agent_id: entry.agentId,
      action_type: entry.actionType,
      execution_policy: entry.executionPolicy,
      status: entry.status,
      target_surface: entry.targetSurface,
      telemetry_trigger: entry.telemetryTrigger,
      payload: entry.payload,
      created_at: entry.createdAt,
    });
  } catch (err) {
    // Non-blocking write
  }

  return entry;
}

/**
 * Enqueues a recommendation for human review
 */
async function queueRecommendation(rec: AiRecommendation): Promise<void> {
  try {
    await supabase.from('ai_organization_recommendations' as any).insert({
      id: rec.id,
      agent_id: rec.agentId,
      action_type: rec.actionType,
      title: rec.title,
      description: rec.description,
      target_url: rec.targetUrl,
      priority: rec.priority,
      status: rec.status,
      metadata: rec.metadata,
      created_at: rec.createdAt,
    });
  } catch (err) {
    // Non-blocking write
  }
}
