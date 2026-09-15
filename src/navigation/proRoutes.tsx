import { lazy } from "react";
import { NavItem } from "../types/nav-item";
const ProCommandCenter = lazy(() => import("../pages/pro/ProDashboard").then(m => ({ default: m.ProCommandCenter })));
const ProSubscription = lazy(() => import("../pages/pro/ProSubscription").then(m => ({ default: m.ProSubscription })));
const ServiceManagement = lazy(() => import("../pages/pro/ServiceManagement"));
const AIBusinessToolkit = lazy(() => import("../pages/pro/AIBusinessToolkit"));
const AdvancedCareerAnalytics = lazy(() => import("../pages/pro/AdvancedAnalytics"));
const CRMCommandCenter = lazy(() => import("../pages/pro/CRMDashboard"));
const ProProfile = lazy(() => import("../pages/pro/ProProfile").then(m => ({ default: m.ProProfile })));
const ProSubscriptionPolicy = lazy(() => import("../pages/pro/ProSubscriptionPolicy"));
const ProSetup = lazy(() => import("../pages/pro/ProSetup"));
const ProLeads = lazy(() => import("../pages/pro/ProLeads"));
const ProAITools = lazy(() => import("../pages/pro/ProAITools"));
const TXCDiagnostics = lazy(() => import("../pages/pro/TXCDiagnostics").then(m => ({ default: m.TXCDiagnostics })));

import { Settings, Activity } from "lucide-react";

export const proRoutes: NavItem[] = [
  {
    title: "Pro Command Center",
    to: "/pro",
    page: <ProCommandCenter />,
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
    title: "Talent Engine Toolkit",
    to: "/pro/talent-engine-toolkit",
    page: <AIBusinessToolkit />,
    isPublic: true
  },
  {
    title: "Advanced Career Analytics",
    to: "/pro/career-analytics",
    page: <AdvancedCareerAnalytics />,
    isPublic: true
  },
  {
    title: "CRM Command Center",
    to: "/pro/crm",
    page: <CRMCommandCenter />,
    isPublic: true
  },
  {
    title: "Leads",
    to: "/pro/leads",
    page: <ProLeads />,
    isPublic: true
  },
  {
    title: "Navigator Tools",
    to: "/pro/navigator-tools",
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



