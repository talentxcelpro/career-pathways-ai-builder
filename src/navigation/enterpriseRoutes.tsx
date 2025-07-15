import { NavItem } from "@/types/nav-item";
import { Building2, Settings, Users, Shield, Plug, FileText, Database, Download } from "lucide-react";
import { Enterprise } from "@/pages/Enterprise";

export const enterpriseRoutes: NavItem[] = [
  {
    title: "Enterprise",
    to: "/enterprise",
    page: <Enterprise />,
    icon: <Building2 className="h-4 w-4" />,
    requiresAuth: true,
  },
];