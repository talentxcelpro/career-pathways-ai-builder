
import { Building2 } from "lucide-react";
import EmployerDashboard from "../pages/employer/Dashboard";
import EmployerProfile from "../pages/employer/Profile";
import JobsManage from "../pages/jobs/Manage";

export const employerRoutes = [
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
    title: "Manage Jobs",
    to: "/jobs/manage",
    page: <JobsManage />,
  },
];
