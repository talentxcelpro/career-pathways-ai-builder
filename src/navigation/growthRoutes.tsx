import { TrendingUp, Users, Star, BarChart3 } from "lucide-react";
import UserAcquisitionPage from "../pages/growth/UserAcquisitionPage";
import ContentStudioPage from "../pages/growth/ContentStudioPage";
import EnhancedCompanyPage from "../pages/growth/EnhancedCompanyPage";
import AdvancedAnalyticsPage from "../pages/growth/AdvancedAnalyticsPage";

export const growthRoutes = [
  {
    title: "User Acquisition Hub",
    to: "/growth/acquisition",
    icon: <Users className="h-4 w-4" />,
    page: <UserAcquisitionPage />,
    description: "Advanced referral system and growth tools",
    requiresAuth: true,
  },
  {
    title: "Content Creation Studio",
    to: "/growth/content-studio",
    icon: <Star className="h-4 w-4" />,
    page: <ContentStudioPage />,
    description: "AI-powered content creation and scheduling",
    requiresAuth: true,
  },
  {
    title: "Enhanced Company Profiles",
    to: "/growth/company-profiles",
    icon: <TrendingUp className="h-4 w-4" />,
    page: <EnhancedCompanyPage />,
    description: "Rich company pages with media and analytics",
    requiresAuth: true,
  },
  {
    title: "Advanced Analytics",
    to: "/growth/analytics",
    icon: <BarChart3 className="h-4 w-4" />,
    page: <AdvancedAnalyticsPage />,
    description: "Deep hiring insights and competitor analysis",
    requiresAuth: true,
  },
];