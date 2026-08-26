// src/lib/admin/superAdminPolicy.ts
// Root Super Admin Identity Policy & Immutability Invariant
// Hard-locks Super Admin authority strictly to the 2 authorized root credentials.

export const ROOT_SUPER_ADMIN_PHONES = Object.freeze([
  '9910678611',
  '+919910678611',
  '9717845477',
  '+919717845477'
]);

export interface AdminActor {
  id: string;
  phone?: string | null;
  email?: string | null;
  full_name?: string | null;
  role?: string | null;
}

/**
 * Normalizes phone number to standard 10-digit format for robust comparison
 */
export function normalizePhoneNumber(phone?: string | null): string {
  if (!phone) return '';
  return phone.replace(/[^0-9]/g, '').slice(-10);
}

/**
 * Predicate: Checks if a given phone number belongs to one of the 2 root Super Admins
 */
export function isSuperAdminPhone(phone?: string | null): boolean {
  const norm = normalizePhoneNumber(phone);
  return norm === '9910678611' || norm === '9717845477';
}

/**
 * Predicate: Checks if the active user possesses Root Super Admin authority
 */
export function isSuperAdminUser(user?: AdminActor | null): boolean {
  if (!user) return false;
  return isSuperAdminPhone(user.phone);
}

/**
 * Invariant Assertion: Prohibits dynamic creation or escalation of any user to Super Admin.
 * The platform UI, API, and Edge Functions must never allow appointing another Super Admin.
 */
export function prohibitSuperAdminCreation(requestedRole: string): void {
  if (requestedRole.toLowerCase().trim() === 'super_admin') {
    throw new Error(
      'SECURITY_VIOLATION: Super Admin authority is an immutable root credential and cannot be granted dynamically. Only root holders (9910678611 / 9717845477) possess this status.'
    );
  }
}

/**
 * Invariant Assertion: Requires root Super Admin authority to perform destructive/critical operations
 */
export function assertSuperAdminAuthority(user: AdminActor, operationName: string): void {
  if (!isSuperAdminUser(user)) {
    throw new Error(
      `ACCESS_DENIED: Operation '${operationName}' requires Root Super Admin authority. User '${user.phone || user.id}' is not authorized.`
    );
  }
}
