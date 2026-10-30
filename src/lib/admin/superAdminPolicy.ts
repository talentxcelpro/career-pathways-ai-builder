// src/lib/admin/superAdminPolicy.ts
// Authoritative Server-Side Super Admin Policy & Access Boundary
// Replaces insecure client-side phone number checks with verified database role assertions.

export interface AdminActor {
  id: string;
  phone?: string | null;
  email?: string | null;
  full_name?: string | null;
  role?: string | null;
}

/**
 * Predicate: Checks if the active user possesses verified Super Admin authority.
 * Authoritative check strictly evaluates server-validated role from public.user_roles.
 */
export function isSuperAdminUser(user?: AdminActor | null): boolean {
  if (!user || !user.role) return false;
  return user.role.toLowerCase().trim() === 'super_admin';
}

/**
 * Backward compatibility helper for legacy callers.
 * Administrative privileges can NEVER be derived from phone numbers alone.
 * Evaluates false by default to ensure fail-closed security.
 */
export function isSuperAdminPhone(_phone?: string | null): boolean {
  return false;
}

/**
 * Invariant Assertion: Prohibits dynamic creation or escalation of any user to Super Admin.
 * Super Admin authority cannot be granted via standard user-management workflows.
 */
export function prohibitSuperAdminCreation(requestedRole: string): void {
  if (requestedRole.toLowerCase().trim() === 'super_admin') {
    throw new Error(
      'SECURITY_VIOLATION: Super Admin authority is restricted and cannot be granted dynamically. Only authoritative database seeds or direct database administrators possess this status.'
    );
  }
}

/**
 * Invariant Assertion: Requires verified Super Admin authority to perform destructive/critical operations.
 */
export function assertSuperAdminAuthority(user: AdminActor, operationName: string): void {
  if (!isSuperAdminUser(user)) {
    throw new Error(
      `ACCESS_DENIED: Operation '${operationName}' requires Super Admin authority. User '${user.id}' has role '${user.role || 'none'}' and is not authorized.`
    );
  }
}
