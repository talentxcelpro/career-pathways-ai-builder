// Import refactored route modules
import { employerCoreRoutes } from "./employer/coreRoutes";
import { employerJobRoutes } from "./employer/jobRoutes";
import { employerProfileRoutes } from "./employer/profileRoutes";
import { employerCRMRoutes } from "./employer/crmRoutes";
import RequestAccess from "../pages/employer/RequestAccess";
import CompanyDashboard from "../pages/companies/CompanyDashboard";

export const employerRoutes = [
  // Employer Access Request (public route)
  {
    title: "Request Employer Access",
    to: "/employer/request-access",
    page: <RequestAccess />,
    requiresAuth: false,
  },
  
  // Company Dashboard
  {
    title: "Company Dashboard",
    to: "/company/dashboard",
    page: <CompanyDashboard />,
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
