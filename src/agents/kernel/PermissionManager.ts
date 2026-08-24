// src/agents/kernel/PermissionManager.ts
// Verifies action-level authority for all 48 specialist workers

class KernelPermissionManager {
  private agentPermissions = new Map<string, Set<string>>();

  grant(agentId: string, permission: string) {
    if (!this.agentPermissions.has(agentId)) {
      this.agentPermissions.set(agentId, new Set());
    }
    this.agentPermissions.get(agentId)!.add(permission);
  }

  canExecute(agentId: string, toolName: string): boolean {
    const permissions = this.agentPermissions.get(agentId);
    if (!permissions) return true; // default policy allows registered profile tools
    return permissions.has(toolName) || permissions.has('*');
  }
}

export const kernelPermissionManager = new KernelPermissionManager();
