// src/agents/shared/Permissions.ts
// Autonomous Operations Permissions & Authority Verifier

export type AgentPermission =
  | 'MARKETING_OUTBOUND_EMAIL'
  | 'MARKETING_SOCIAL_PUBLISH'
  | 'CLAIM1_NOTIFY_OUTBID'
  | 'REVENUE_AUDIT_READ'
  | 'REVENUE_REFUND_EXECUTE'
  | 'DATABASE_MUTATION'
  | 'EXTERNAL_API_CALL';

class PermissionEngine {
  private allowedPermissions = new Set<AgentPermission>([
    'MARKETING_OUTBOUND_EMAIL',
    'MARKETING_SOCIAL_PUBLISH',
    'CLAIM1_NOTIFY_OUTBID',
    'REVENUE_AUDIT_READ',
    'DATABASE_MUTATION',
    'EXTERNAL_API_CALL',
  ]);

  hasPermission(agentName: string, permission: AgentPermission): boolean {
    // Sensitive actions like refunds or legal contracts require explicit human authorization
    if (permission === 'REVENUE_REFUND_EXECUTE') {
      return false; // Pauses for Human in Exception Queue
    }
    return this.allowedPermissions.has(permission);
  }

  grantPermission(permission: AgentPermission) {
    this.allowedPermissions.add(permission);
  }

  revokePermission(permission: AgentPermission) {
    this.allowedPermissions.delete(permission);
  }
}

export const permissions = new PermissionEngine();
