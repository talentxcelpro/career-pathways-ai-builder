
export type AdminRole = 'super_admin' | 'content_admin' | 'job_admin' | 'support_admin' | 'moderator';

export interface AdminPermissions {
  canAccessDashboard: boolean;
  canAccessUsers: boolean;
  canAccessJobs: boolean;
  canAccessCompanies: boolean;
  canAccessLearning: boolean;
  canAccessNetwork: boolean;
  canAccessTools: boolean;
  canAccessResumes: boolean;
  canAccessCareerMap: boolean;
  canAccessEmployerRequests: boolean;
  canAccessAdmins: boolean;
  canAccessAnalytics: boolean;
  canAccessSecurity: boolean;
  canExportData: boolean;
  canModerateContent: boolean;
  canManageRoles: boolean;
}

export const ROLE_PERMISSIONS: Record<AdminRole, AdminPermissions> = {
  super_admin: {
    canAccessDashboard: true,
    canAccessUsers: true,
    canAccessJobs: true,
    canAccessCompanies: true,
    canAccessLearning: true,
    canAccessNetwork: true,
    canAccessTools: true,
    canAccessResumes: true,
    canAccessCareerMap: true,
    canAccessEmployerRequests: true,
    canAccessAdmins: true,
    canAccessAnalytics: true,
    canAccessSecurity: true,
    canExportData: true,
    canModerateContent: true,
    canManageRoles: true,
  },
  content_admin: {
    canAccessDashboard: true,
    canAccessUsers: false,
    canAccessJobs: true,
    canAccessCompanies: true,
    canAccessLearning: true,
    canAccessNetwork: true,
    canAccessTools: false,
    canAccessResumes: true,
    canAccessCareerMap: true,
    canAccessEmployerRequests: false,
    canAccessAdmins: false,
    canAccessAnalytics: true,
    canAccessSecurity: false,
    canExportData: true,
    canModerateContent: true,
    canManageRoles: false,
  },
  job_admin: {
    canAccessDashboard: true,
    canAccessUsers: false,
    canAccessJobs: true,
    canAccessCompanies: true,
    canAccessLearning: false,
    canAccessNetwork: false,
    canAccessTools: false,
    canAccessResumes: true,
    canAccessCareerMap: true,
    canAccessEmployerRequests: true,
    canAccessAdmins: false,
    canAccessAnalytics: true,
    canAccessSecurity: false,
    canExportData: true,
    canModerateContent: false,
    canManageRoles: false,
  },
  support_admin: {
    canAccessDashboard: true,
    canAccessUsers: true,
    canAccessJobs: false,
    canAccessCompanies: false,
    canAccessLearning: false,
    canAccessNetwork: true,
    canAccessTools: true,
    canAccessResumes: false,
    canAccessCareerMap: false,
    canAccessEmployerRequests: false,
    canAccessAdmins: false,
    canAccessAnalytics: false,
    canAccessSecurity: false,
    canExportData: false,
    canModerateContent: true,
    canManageRoles: false,
  },
  moderator: {
    canAccessDashboard: true,
    canAccessUsers: true,
    canAccessJobs: false,
    canAccessCompanies: false,
    canAccessLearning: false,
    canAccessNetwork: true,
    canAccessTools: false,
    canAccessResumes: false,
    canAccessCareerMap: false,
    canAccessEmployerRequests: false,
    canAccessAdmins: false,
    canAccessAnalytics: false,
    canAccessSecurity: false,
    canExportData: false,
    canModerateContent: true,
    canManageRoles: false,
  },
};
