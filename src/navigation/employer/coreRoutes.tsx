import { lazy } from "react";
import { Building2, Users, Settings, BarChart3 } from "lucide-react";

// Main Employer CommandCenter & Profile
const EmployerCommandCenter = lazy(() => import("../../pages/employer/EmployerDashboard").then(m => ({ default: m.EmployerCommandCenter })));
const EmployerProfile = lazy(() => import("../../pages/employer/Profile"));
const EmployerSettings = lazy(() => import("../../pages/employer/Settings"));
const EmployerTeam = lazy(() => import("../../pages/employer/Team"));
const TeamManagement = lazy(() => import("../../pages/employer/TeamManagement"));
const EmployerCareerAnalytics = lazy(() => import("../../pages/employer/analytics/EmployerAnalytics"));
const EmployerApplications = lazy(() => import("../../pages/employer/Applications"));
const CompanyAccessRequestPage = lazy(() => import("../../pages/employer/CompanyAccessRequest"));
const AcceptInvitation = lazy(() => import("../../pages/employer/AcceptInvitation"));
import { EmployerAccessGuard } from "../../components/employer/EmployerAccessGuard";


export const employerCoreRoutes = [
  // Main Employer Routes
  {
    title: "Employer CommandCenter",
    to: "/employer/CommandCenter",
    icon: <Building2 className="h-4 w-4" />,
    page: <EmployerCommandCenter />,
    isPublic: true,
  },
  {
    title: "Employer Profile",
    to: "/employer/profile",
    page: <EmployerProfile />,
    isPublic: true,
  },
  {
    title: "Employer Settings",
    to: "/employer/settings",
    page: <EmployerSettings />,
    isPublic: true,
  },
  {
    title: "Team Management",
    to: "/employer/team",
    page: <TeamManagement />,
    isPublic: true,
  },
  {
    title: "Legacy Team Management",
    to: "/employer/team/legacy",
    page: <EmployerTeam />,
    isPublic: true,
  },
  {
    title: "Company Access Requests",
    to: "/employer/company-access",
    page: <CompanyAccessRequestPage />,
    isPublic: true,
  },
  {
    title: "Applications",
    to: "/employer/applications",
    icon: <Users className="h-4 w-4" />,
    page: <EmployerApplications />,
    isPublic: true,
  },
  {
    title: "Employer CareerAnalytics",
    to: "/employer/CareerAnalytics",
    icon: <BarChart3 className="h-4 w-4" />,
    page: <EmployerCareerAnalytics />,
    isPublic: true,
  },
  {
    title: "Accept Team Invitation",
    to: "/employer/team/accept/:token",
    page: <AcceptInvitation />,
    isPublic: true,
  },
];




