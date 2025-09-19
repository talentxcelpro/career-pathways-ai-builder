
import { Building2, Users, Settings, BarChart3 } from "lucide-react";

// Main Employer Dashboard & Profile
import EmployerDashboard from "../../pages/employer/Dashboard";
import EmployerProfile from "../../pages/employer/Profile";
import EmployerSettings from "../../pages/employer/Settings";
import EmployerTeam from "../../pages/employer/Team";
import TeamManagement from "../../pages/employer/TeamManagement";
import EmployerAnalytics from "../../pages/employer/analytics/EmployerAnalytics";
import ApplicationsManager from "../../pages/employer/ApplicationsManager";
import CompanyAccessRequestPage from "../../pages/employer/CompanyAccessRequest";
import AcceptInvitation from "../../pages/employer/AcceptInvitation";
import { EmployerAccessGuard } from "../../components/employer/EmployerAccessGuard";

export const employerCoreRoutes = [
  // Main Employer Routes
  {
    title: "Employer Dashboard",
    to: "/employer/dashboard",
    icon: <Building2 className="h-4 w-4" />,
    page: <EmployerAccessGuard><EmployerDashboard /></EmployerAccessGuard>,
    requiresAuth: true,
    requiresEmployerAccess: true,
  },
  {
    title: "Employer Profile",
    to: "/employer/profile",
    page: <EmployerProfile />,
  },
  {
    title: "Employer Settings",
    to: "/employer/settings",
    page: <EmployerSettings />,
  },
  {
    title: "Team Management",
    to: "/employer/team",
    page: <EmployerAccessGuard><TeamManagement /></EmployerAccessGuard>,
    requiresAuth: true,
    requiresEmployerAccess: true,
  },
  {
    title: "Legacy Team Management",
    to: "/employer/team/legacy",
    page: <EmployerTeam />,
  },
  {
    title: "Company Access Requests",
    to: "/employer/company-access",
    page: <CompanyAccessRequestPage />,
  },
  {
    title: "Applications",
    to: "/employer/applications",
    icon: <Users className="h-4 w-4" />,
    page: <EmployerAccessGuard><ApplicationsManager /></EmployerAccessGuard>,
    requiresAuth: true,
    requiresEmployerAccess: true,
  },
  {
    title: "Employer Analytics",
    to: "/employer/analytics",
    icon: <BarChart3 className="h-4 w-4" />,
    page: <EmployerAccessGuard><EmployerAnalytics /></EmployerAccessGuard>,
    requiresAuth: true,
    requiresEmployerAccess: true,
  },
  {
    title: "Accept Team Invitation",
    to: "/employer/team/accept/:token",
    page: <AcceptInvitation />,
    requiresAuth: false, // Users might not be logged in when clicking invitation links
  },
];
