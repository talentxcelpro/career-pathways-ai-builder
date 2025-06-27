
import { Building2, Users, Settings } from "lucide-react";

// Main Employer Dashboard & Profile
import EmployerDashboard from "../../pages/employer/Dashboard";
import EmployerProfile from "../../pages/employer/Profile";
import EmployerSettings from "../../pages/employer/Settings";
import EmployerTeam from "../../pages/employer/Team";

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
    title: "Employer Team",
    to: "/employer/team",
    page: <EmployerTeam />,
  },
];
