
import { Shield, Users, Building2 } from "lucide-react";
import EmployerRequests from "../pages/admin/EmployerRequests";

export const adminRoutes = [
  {
    title: "Admin - Employer Requests",
    to: "/admin/employer-requests",
    icon: <Building2 className="h-4 w-4" />,
    page: <EmployerRequests />,
    requiresAuth: true,
  },
];
