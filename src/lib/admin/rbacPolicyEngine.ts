// src/lib/admin/rbacPolicyEngine.ts
// Granular Admin RBAC & Scoped Permission Policy Engine
// Replaces broad role=admin with least-privilege permission matrix.

import { isSuperAdminUser, AdminActor } from './superAdminPolicy';

export type AdminScope =
  | 'users.read'
  | 'users.write'
  | 'users.suspend'
  | 'employers.read'
  | 'employers.approve'
  | 'employers.reject'
  | 'jobs.read'
  | 'jobs.write'
  | 'jobs.delete'
  | 'content.read'
  | 'content.write'
  | 'content.publish'
  | 'seo.read'
  | 'seo.write'
  | 'txc.read'
  | 'txc.award'
  | 'txc.treasury'
  | 'txc.adjust'
  | 'billing.read'
  | 'billing.write'
  | 'ai.read'
  | 'ai.configure'
  | 'agents.read'
  | 'agents.execute_low_risk'
  | 'agents.execute_high_risk'
  | 'moderation.read'
  | 'moderation.write'
  | 'security.read'
  | 'security.emergency';

export type ScopedAdminRole =
  | 'SUPER_ADMIN'
  | 'SEO_ADMIN'
  | 'CONTENT_ADMIN'
  | 'MODERATION_ADMIN'
  | 'EMPLOYER_ADMIN'
  | 'ENTERPRISE_ADMIN'
  | 'FINANCE_ADMIN'
  | 'AI_AGENT_ADMIN'
  | 'SUPPORT_OPERATIONS_ADMIN';

export const ROLE_SCOPE_MATRIX: Record<ScopedAdminRole, readonly AdminScope[]> = Object.freeze({
  SUPER_ADMIN: [
    'users.read', 'users.write', 'users.suspend',
    'employers.read', 'employers.approve', 'employers.reject',
    'jobs.read', 'jobs.write', 'jobs.delete',
    'content.read', 'content.write', 'content.publish',
    'seo.read', 'seo.write',
    'txc.read', 'txc.award', 'txc.treasury', 'txc.adjust',
    'billing.read', 'billing.write',
    'ai.read', 'ai.configure',
    'agents.read', 'agents.execute_low_risk', 'agents.execute_high_risk',
    'moderation.read', 'moderation.write',
    'security.read', 'security.emergency'
  ],
  SEO_ADMIN: [
    'seo.read', 'seo.write',
    'content.read', 'content.write',
    'jobs.read'
  ],
  CONTENT_ADMIN: [
    'content.read', 'content.write', 'content.publish',
    'moderation.read', 'moderation.write'
  ],
  MODERATION_ADMIN: [
    'moderation.read', 'moderation.write',
    'users.read', 'users.suspend'
  ],
  EMPLOYER_ADMIN: [
    'employers.read', 'employers.approve', 'employers.reject',
    'jobs.read', 'jobs.write', 'jobs.delete',
    'users.read'
  ],
  ENTERPRISE_ADMIN: [
    'billing.read', 'billing.write',
    'employers.read', 'users.read'
  ],
  FINANCE_ADMIN: [
    'billing.read', 'billing.write',
    'txc.read', 'txc.award'
  ],
  AI_AGENT_ADMIN: [
    'ai.read', 'ai.configure',
    'agents.read', 'agents.execute_low_risk'
  ],
  SUPPORT_OPERATIONS_ADMIN: [
    'users.read', 'jobs.read', 'employers.read',
    'moderation.read', 'security.read'
  ]
});

export interface PermissionEvaluationResult {
  allowed: boolean;
  reason: string;
  evaluatedRole: ScopedAdminRole;
  requiredScope: AdminScope;
}

/**
 * Resolves the effective scoped role for an admin actor
 */
export function resolveEffectiveRole(user: AdminActor): ScopedAdminRole {
  if (isSuperAdminUser(user)) {
    return 'SUPER_ADMIN';
  }
  
  const rawRole = (user.role || '').toUpperCase();
  if (rawRole in ROLE_SCOPE_MATRIX && rawRole !== 'SUPER_ADMIN') {
    return rawRole as ScopedAdminRole;
  }
  
  return 'SUPPORT_OPERATIONS_ADMIN';
}

/**
 * Evaluates whether an admin has authorization for a specific action scope
 */
export function evaluateAdminPermission(
  user: AdminActor,
  requiredScope: AdminScope
): PermissionEvaluationResult {
  const effectiveRole = resolveEffectiveRole(user);
  const grantedScopes = ROLE_SCOPE_MATRIX[effectiveRole] || [];
  
  const allowed = grantedScopes.includes(requiredScope);
  
  return {
    allowed,
    evaluatedRole: effectiveRole,
    requiredScope,
    reason: allowed
      ? `Scope '${requiredScope}' permitted under role '${effectiveRole}'`
      : `Scope '${requiredScope}' DENIED: Role '${effectiveRole}' does not hold required privileges.`
  };
}
