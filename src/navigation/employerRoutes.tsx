import { lazy, Suspense } from 'react';
// Import refactored route modules
import { employerCoreRoutes } from "./employer/coreRoutes";
import { employerJobRoutes } from "./employer/jobRoutes";
import { employerProfileRoutes } from "./employer/profileRoutes";
import { employerCRMRoutes } from "./employer/crmRoutes";
import { EmployerAccessGuard } from "../components/employer/EmployerAccessGuard";

const CompanyDashboard = lazy(() => import('../pages/companies/CompanyDashboard'));
const EmployerLanding = lazy(() => import('../pages/employer/EmployerLanding'));
const RequestAccess = lazy(() => import('../pages/employer/RequestAccess'));

export const employerRoutes = [
  // Employer Landing Page (public route)
  {
    title: "Employer",
    to: "/employer",
    page: <Suspense fallback={null}><EmployerLanding /></Suspense>,
    requiresAuth: false,
    isPublic: true,
  },
  
  // Employer Access Request (public route)
  {
    title: "Request Employer Access",
    to: "/employer/request-access",
    page: <Suspense fallback={null}><RequestAccess /></Suspense>,
    requiresAuth: false,
  },
  
  // Company Dashboard
  {
    title: "Company Dashboard",
    to: "/company/dashboard",
    page: <Suspense fallback={null}><CompanyDashboard /></Suspense>,
  },
  
  // Core employer functionality
  ...employerCoreRoutes,
  
  // Job posting and management
  ...employerJobRoutes,
  
  // Company profile management
  ...employerProfileRoutes,
  
  // CRM and collaboration features
  ...employerCRMRoutes,
];
