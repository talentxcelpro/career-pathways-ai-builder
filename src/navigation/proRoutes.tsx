import { NavItem } from "../types/nav-item";
import { ProDashboard } from "../pages/pro/ProDashboard";
import { ProSubscription } from "../pages/pro/ProSubscription";
import ServiceManagement from "../pages/pro/ServiceManagement";
import AIBusinessToolkit from "../pages/pro/AIBusinessToolkit";
import AdvancedAnalytics from "../pages/pro/AdvancedAnalytics";
import CRMDashboard from "../pages/pro/CRMDashboard";
import { ProProfile } from "../pages/pro/ProProfile";
import ProSubscriptionPolicy from "../pages/pro/ProSubscriptionPolicy";
import ProSetup from "../pages/pro/ProSetup";
import ProLeads from "../pages/pro/ProLeads";
import ProAITools from "../pages/pro/ProAITools";
import { TXCDiagnostics } from "../pages/pro/TXCDiagnostics";
import { Settings, Activity } from "lucide-react";

export const proRoutes: NavItem[] = [
  {
    title: "Pro Dashboard",
    to: "/pro",
    page: <ProDashboard />,
    isPublic: true
  },
  {
    title: "Set Up Services",
    to: "/pro/services",
    page: <ServiceManagement />,
    icon: <Settings className="h-4 w-4" />,
    isPublic: true
  },
  {
    title: "Pro Setup",
    to: "/pro/setup",
    page: <ProSetup />,
    isPublic: true
  },
  {
    title: "AI Business Toolkit",
    to: "/pro/ai-toolkit",
    page: <AIBusinessToolkit />,
    isPublic: true
  },
  {
    title: "Advanced Analytics",
    to: "/pro/analytics",
    page: <AdvancedAnalytics />,
    isPublic: true
  },
  {
    title: "CRM Dashboard",
    to: "/pro/crm",
    page: <CRMDashboard />,
    isPublic: true
  },
  {
    title: "Leads",
    to: "/pro/leads",
    page: <ProLeads />,
    isPublic: true
  },
  {
    title: "AI Tools",
    to: "/pro/ai-tools",
    page: <ProAITools />,
    isPublic: true
  },
  {
    title: "Pro Subscription",
    to: "/pro/subscription",
    page: <ProSubscription />,
    isPublic: true
  },
  {
    title: "Pro Profile",
    to: "/pro/profile",
    page: <ProProfile />,
    isPublic: true
  },
  {
    title: "Subscription Policy",
    to: "/pro/subscription-policy",
    page: <ProSubscriptionPolicy />,
    isPublic: true
  },
  {
    title: "TXC Diagnostics",
    to: "/pro/diagnostics",
    page: <TXCDiagnostics />,
    icon: <Activity className="h-4 w-4" />,
    isPublic: true
  }
];