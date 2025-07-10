
import { Building2, Users, Settings, BarChart3 } from "lucide-react";

// Main Employer Dashboard & Profile
import EmployerDashboard from "../../pages/employer/Dashboard";
import EmployerProfile from "../../pages/employer/Profile";
import EmployerSettings from "../../pages/employer/Settings";
import EmployerTeam from "../../pages/employer/Team";
import TeamManagement from "../../pages/employer/TeamManagement";
import EmployerAnalytics from "../../pages/employer/analytics/EmployerAnalytics";
import EmployerApplications from "../../pages/employer/Applications";
import CompanyAccessRequestPage from "../../pages/employer/CompanyAccessRequest";
import AcceptInvitation from "../../pages/employer/AcceptInvitation";

export const employerCoreRoutes = [
  // Main Employer Routes
  {
    title: "Employer Dashboard",
    to: "/employer",
    icon: <Building2 className="h-4 w-4" />,
    page: <EmployerDashboard />,
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
    page: <TeamManagement />,
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
    page: <EmployerApplications />,
  },
  {
    title: "Employer Analytics",
    to: "/employer/analytics",
    icon: <BarChart3 className="h-4 w-4" />,
    page: <EmployerAnalytics />,
  },
  {
    title: "Accept Team Invitation",
    to: "/employer/team/accept/:token",
    page: <AcceptInvitation />,
    requiresAuth: false, // Users might not be logged in when clicking invitation links
  },
];
