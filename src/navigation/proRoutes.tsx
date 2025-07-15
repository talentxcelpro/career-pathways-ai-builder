import { NavItem } from "../types/nav-item";
import { ProDashboard } from "../pages/pro/ProDashboard";
import { ProSubscription } from "../pages/pro/ProSubscription";

export const proRoutes: NavItem[] = [
  {
    title: "Pro Dashboard",
    to: "/pro",
    page: <ProDashboard />,
    requiresAuth: true
  },
  {
    title: "Pro Subscription",
    to: "/pro/subscription",
    page: <ProSubscription />,
    requiresAuth: true
  }
];