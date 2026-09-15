import { lazy } from "react";
// Import refactored route modules
import { employerCoreRoutes } from "./employer/coreRoutes";
import { employerJobRoutes } from "./employer/jobRoutes";
import { employerProfileRoutes } from "./employer/profileRoutes";
import { employerCRMRoutes } from "./employer/crmRoutes";

const RequestAccess = lazy(() => import("../pages/employer/RequestAccess"));
const EmployerLanding = lazy(() => import("../pages/employer/EmployerLanding"));
const CompanyCommandCenter = lazy(() => import("../pages/companies/CompanyDashboard"));
import { EmployerAccessGuard } from "../components/employer/EmployerAccessGuard";


export const employerRoutes = [
  // Employer Landing Page (public route)
  {
    title: "Employer",
    to: "/employer",
    page: <EmployerLanding />,
    requiresAuth: false,
    isPublic: true,
  },
  
  // Employer Access Request (public route)
  {
    title: "Request Employer Access",
    to: "/employer/request-access",
    page: <RequestAccess />,
    requiresAuth: false,
  },
  
  // Company Command Center
  {
    title: "Company Command Center",
    to: "/company/command-center",
    page: <CompanyCommandCenter />,
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


