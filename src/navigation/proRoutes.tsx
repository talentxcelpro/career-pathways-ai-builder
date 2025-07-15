import { NavItem } from "../types/nav-item";
import { ProDashboard } from "../pages/pro/ProDashboard";
import { ProSubscription } from "../pages/pro/ProSubscription";
import ServiceManagement from "../pages/pro/ServiceManagement";
import AIBusinessToolkit from "../pages/pro/AIBusinessToolkit";

export const proRoutes: NavItem[] = [
  {
    title: "Pro Dashboard",
    to: "/pro",
    page: <ProDashboard />,
    requiresAuth: true
  },
  {
    title: "Service Management",
    to: "/pro/services",
    page: <ServiceManagement />,
    requiresAuth: true
  },
  {
    title: "AI Business Toolkit",
    to: "/pro/ai-toolkit",
    page: <AIBusinessToolkit />,
    requiresAuth: true
  },
  {
    title: "Pro Subscription",
    to: "/pro/subscription",
    page: <ProSubscription />,
    requiresAuth: true
  }
];