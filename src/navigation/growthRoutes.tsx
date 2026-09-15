import { lazy } from "react";
import { TrendingUp, Users, Star, BarChart3 } from "lucide-react";

const UserAcquisitionPage = lazy(() => import("../pages/growth/UserAcquisitionPage"));
const ContentStudioPage = lazy(() => import("../pages/growth/ContentStudioPage"));
const EnhancedCompanyPage = lazy(() => import("../pages/growth/EnhancedCompanyPage"));
const AdvancedCareerAnalyticsPage = lazy(() => import("../pages/growth/AdvancedAnalyticsPage"));


export const growthRoutes = [
  {
    title: "User Acquisition Hub",
    to: "/growth/acquisition",
    icon: <Users className="h-4 w-4" />,
    page: <UserAcquisitionPage />,
    description: "Advanced referral system and growth tools",
    isPublic: true,
  },
  {
    title: "Content Creation Studio",
    to: "/growth/content-studio",
    icon: <Star className="h-4 w-4" />,
    page: <ContentStudioPage />,
    description: "Performance content creation and scheduling",
    isPublic: true,
  },
  {
    title: "Enhanced Company Profiles",
    to: "/growth/company-profiles",
    icon: <TrendingUp className="h-4 w-4" />,
    page: <EnhancedCompanyPage />,
    description: "Rich company pages with media and Career Analytics",
    isPublic: true,
  },
  {
    title: "Advanced Career Analytics",
    to: "/growth/career-analytics",
    icon: <BarChart3 className="h-4 w-4" />,
    page: <AdvancedCareerAnalyticsPage />,
    description: "Deep hiring insights and competitor analysis",
    isPublic: true,
  },
];



