import { lazy, Suspense } from "react";
import { Navigate } from "react-router-dom";
import { Building2, Users, BarChart3 } from "lucide-react";

// Main Employer Dashboard & Profile (Lazy loaded to reduce initial bundle)
const EmployerProfile = lazy(() => import("../../pages/employer/Profile"));
const EmployerSettings = lazy(() => import("../../pages/employer/Settings"));
const EmployerTeam = lazy(() => import("../../pages/employer/Team"));
const TeamManagement = lazy(() => import("../../pages/employer/TeamManagement"));
const EmployerAnalytics = lazy(() => import("../../pages/employer/analytics/EmployerAnalytics"));
const EmployerApplications = lazy(() => import("../../pages/employer/Applications"));
const CompanyAccessRequestPage = lazy(() => import("../../pages/employer/CompanyAccessRequest"));
const AcceptInvitation = lazy(() => import("../../pages/employer/AcceptInvitation"));

export const employerCoreRoutes = [
  // Main Employer Routes
  {
    title: "Employer Dashboard",
    to: "/employer/dashboard",
    icon: <Building2 className="h-4 w-4" />,
    page: <Navigate to="/dashboard?view=role" replace />,
    isPublic: true,
  },
  {
    title: "Employer Profile",
    to: "/employer/profile",
    page: <Suspense fallback={null}><EmployerProfile /></Suspense>,
    isPublic: true,
  },
  {
    title: "Employer Settings",
    to: "/employer/settings",
    page: <Suspense fallback={null}><EmployerSettings /></Suspense>,
    isPublic: true,
  },
  {
    title: "Team Management",
    to: "/employer/team",
    page: <Suspense fallback={null}><TeamManagement /></Suspense>,
    isPublic: true,
  },
  {
    title: "Legacy Team Management",
    to: "/employer/team/legacy",
    page: <Suspense fallback={null}><EmployerTeam /></Suspense>,
    isPublic: true,
  },
  {
    title: "Company Access Requests",
    to: "/employer/company-access",
    page: <Suspense fallback={null}><CompanyAccessRequestPage /></Suspense>,
    isPublic: true,
  },
  {
    title: "Applications",
    to: "/employer/applications",
    icon: <Users className="h-4 w-4" />,
    page: <Suspense fallback={null}><EmployerApplications /></Suspense>,
    isPublic: true,
  },
  {
    title: "Employer Analytics",
    to: "/employer/analytics",
    icon: <BarChart3 className="h-4 w-4" />,
    page: <Suspense fallback={null}><EmployerAnalytics /></Suspense>,
    isPublic: true,
  },
  {
    title: "Accept Team Invitation",
    to: "/employer/team/accept/:token",
    page: <Suspense fallback={null}><AcceptInvitation /></Suspense>,
    isPublic: true,
  },
];
