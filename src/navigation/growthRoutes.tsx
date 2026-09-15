import { lazy, Suspense } from 'react';
import { TrendingUp, Users, Star, BarChart3 } from "lucide-react";

const AdvancedAnalyticsPage = lazy(() => import('../pages/growth/AdvancedAnalyticsPage'));
const EnhancedCompanyPage = lazy(() => import('../pages/growth/EnhancedCompanyPage'));
const ContentStudioPage = lazy(() => import('../pages/growth/ContentStudioPage'));
const UserAcquisitionPage = lazy(() => import('../pages/growth/UserAcquisitionPage'));

export const growthRoutes = [
  {
    title: "User Acquisition Hub",
    to: "/growth/acquisition",
    icon: <Users className="h-4 w-4" />,
    page: <Suspense fallback={null}><UserAcquisitionPage /></Suspense>,
    description: "Advanced referral system and growth tools",
    isPublic: true,
  },
  {
    title: "Content Creation Studio",
    to: "/growth/content-studio",
    icon: <Star className="h-4 w-4" />,
    page: <Suspense fallback={null}><ContentStudioPage /></Suspense>,
    description: "AI-powered content creation and scheduling",
    isPublic: true,
  },
  {
    title: "Enhanced Company Profiles",
    to: "/growth/company-profiles",
    icon: <TrendingUp className="h-4 w-4" />,
    page: <Suspense fallback={null}><EnhancedCompanyPage /></Suspense>,
    description: "Rich company pages with media and analytics",
    isPublic: true,
  },
  {
    title: "Advanced Analytics",
    to: "/growth/analytics",
    icon: <BarChart3 className="h-4 w-4" />,
    page: <Suspense fallback={null}><AdvancedAnalyticsPage /></Suspense>,
    description: "Deep hiring insights and competitor analysis",
    isPublic: true,
  },
];