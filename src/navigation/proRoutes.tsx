import { NavItem } from "../types/nav-item";
import { ProDashboard } from "../pages/pro/ProDashboard";
import { ProSubscription } from "../pages/pro/ProSubscription";
import ServiceManagement from "../pages/pro/ServiceManagement";
import AIBusinessToolkit from "../pages/pro/AIBusinessToolkit";
import AdvancedAnalytics from "../pages/pro/AdvancedAnalytics";
import CRMDashboard from "../pages/pro/CRMDashboard";
import { ProProfile } from "../pages/pro/ProProfile";
import ProSubscriptionPolicy from "../pages/pro/ProSubscriptionPolicy";
import { Settings } from "lucide-react";

export const proRoutes: NavItem[] = [
  {
    title: "Pro Dashboard",
    to: "/pro",
    page: <ProDashboard />,
    requiresAuth: true
  },
  {
    title: "Set Up Services",
    to: "/pro/services",
    page: <ServiceManagement />,
    icon: <Settings className="h-4 w-4" />,
    requiresAuth: true
  },
  {
    title: "AI Business Toolkit",
    to: "/pro/ai-toolkit",
    page: <AIBusinessToolkit />,
    requiresAuth: true
  },
  {
    title: "Advanced Analytics",
    to: "/pro/analytics",
    page: <AdvancedAnalytics />,
    requiresAuth: true
  },
  {
    title: "CRM Dashboard",
    to: "/pro/crm",
    page: <CRMDashboard />,
    requiresAuth: true
  },
  {
    title: "Pro Subscription",
    to: "/pro/subscription",
    page: <ProSubscription />,
    requiresAuth: true
  },
  {
    title: "Pro Profile",
    to: "/pro/profile",
    page: <ProProfile />,
    requiresAuth: true
  },
  {
    title: "Subscription Policy",
    to: "/pro/subscription-policy",
    page: <ProSubscriptionPolicy />,
    requiresAuth: false
  }
];