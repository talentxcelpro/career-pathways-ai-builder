
export type UserRole = 'job_seeker' | 'employer' | 'institute' | 'mentor' | 'admin';

export const ROLE_ROUTES: Record<UserRole, string> = {
  job_seeker: '/dashboard',
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
  const validRoles: UserRole[] = ['job_seeker', 'employer', 'institute', 'mentor', 'admin'];
  return validRoles.includes(roleStr as UserRole) ? (roleStr as UserRole) : 'job_seeker';
};
