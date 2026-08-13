import { lazy, Suspense } from 'react';
import { NavItem } from "../types/nav-item";
import { Settings, Activity } from "lucide-react";

const TXCDiagnostics = lazy(() => import('../pages/pro/TXCDiagnostics').then(m => ({ default: m.TXCDiagnostics })));
const ProAITools = lazy(() => import('../pages/pro/ProAITools'));
const ProLeads = lazy(() => import('../pages/pro/ProLeads'));
const ProSetup = lazy(() => import('../pages/pro/ProSetup'));
const ProSubscriptionPolicy = lazy(() => import('../pages/pro/ProSubscriptionPolicy'));
const ProProfile = lazy(() => import('../pages/pro/ProProfile').then(m => ({ default: m.ProProfile })));
const CRMDashboard = lazy(() => import('../pages/pro/CRMDashboard'));
const AdvancedAnalytics = lazy(() => import('../pages/pro/AdvancedAnalytics'));
const AIBusinessToolkit = lazy(() => import('../pages/pro/AIBusinessToolkit'));
const ServiceManagement = lazy(() => import('../pages/pro/ServiceManagement'));
const ProSubscription = lazy(() => import('../pages/pro/ProSubscription').then(m => ({ default: m.ProSubscription })));
const ProDashboard = lazy(() => import('../pages/pro/ProDashboard').then(m => ({ default: m.ProDashboard })));

export const proRoutes: NavItem[] = [
  {
    title: "Pro Dashboard",
    to: "/pro",
    page: <Suspense fallback={null}><ProDashboard /></Suspense>,
    isPublic: true
  },
  {
    title: "Set Up Services",
    to: "/pro/services",
    page: <Suspense fallback={null}><ServiceManagement /></Suspense>,
    icon: <Settings className="h-4 w-4" />,
    isPublic: true
  },
  {
    title: "Pro Setup",
    to: "/pro/setup",
    page: <Suspense fallback={null}><ProSetup /></Suspense>,
    isPublic: true
  },
  {
    title: "AI Business Toolkit",
    to: "/pro/ai-toolkit",
    page: <Suspense fallback={null}><AIBusinessToolkit /></Suspense>,
    isPublic: true
  },
  {
    title: "Advanced Analytics",
    to: "/pro/analytics",
    page: <Suspense fallback={null}><AdvancedAnalytics /></Suspense>,
    isPublic: true
  },
  {
    title: "CRM Dashboard",
    to: "/pro/crm",
    page: <Suspense fallback={null}><CRMDashboard /></Suspense>,
    isPublic: true
  },
  {
    title: "Leads",
    to: "/pro/leads",
    page: <Suspense fallback={null}><ProLeads /></Suspense>,
    isPublic: true
  },
  {
    title: "AI Tools",
    to: "/pro/ai-tools",
    page: <Suspense fallback={null}><ProAITools /></Suspense>,
    isPublic: true
  },
  {
    title: "Pro Subscription",
    to: "/pro/subscription",
    page: <Suspense fallback={null}><ProSubscription /></Suspense>,
    isPublic: true
  },
  {
    title: "Pro Profile",
    to: "/pro/profile",
    page: <Suspense fallback={null}><ProProfile /></Suspense>,
    isPublic: true
  },
  {
    title: "Subscription Policy",
    to: "/pro/subscription-policy",
    page: <Suspense fallback={null}><ProSubscriptionPolicy /></Suspense>,
    isPublic: true
  },
  {
    title: "TXC Diagnostics",
    to: "/pro/diagnostics",
    page: <Suspense fallback={null}><TXCDiagnostics /></Suspense>,
    icon: <Activity className="h-4 w-4" />,
    isPublic: true
  }
];