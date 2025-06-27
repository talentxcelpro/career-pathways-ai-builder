
export type UserRole = 'candidate' | 'employer' | 'institute' | 'mentor' | 'admin';

export const ROLE_ROUTES: Record<UserRole, string> = {
  candidate: '/dashboard',
  employer: '/employer/dashboard',
  institute: '/colleges',
  mentor: '/mentor/dashboard',
  admin: '/admin/dashboard'
};

export const getRedirectPathForRole = (role: UserRole, isFirstLogin: boolean = false): string => {
  if (isFirstLogin) {
    return '/onboarding/role';
  }
  return ROLE_ROUTES[role] || '/dashboard';
};

export const getUserRoleFromString = (roleStr: string): UserRole => {
  const validRoles: UserRole[] = ['candidate', 'employer', 'institute', 'mentor', 'admin'];
  return validRoles.includes(roleStr as UserRole) ? (roleStr as UserRole) : 'candidate';
};
