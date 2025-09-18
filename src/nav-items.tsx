import { NavItem } from "./types/nav-item";
import { coreRoutes } from "./navigation/coreRoutes";
import { authRoutes } from "./navigation/authRoutes";
import { jobRoutes } from "./navigation/jobRoutes";
import { companiesRoutes } from "./navigation/companiesRoutes";
import { learningRoutes } from "./navigation/learningRoutes";
import { networkRoutes } from "./navigation/networkRoutes";
import { profileRoutes } from "./navigation/profileRoutes";
import { careerMapRoutes } from "./navigation/careerMapRoutes";
import { toolsRoutes } from "./navigation/toolsRoutes";

import { employerRoutes } from "./navigation/employerRoutes";
import { collegesRoutes } from "./navigation/collegesRoutes";
import { marketplaceRoutes } from "./navigation/marketplaceRoutes";
import { seoRoutes } from "./navigation/seoRoutes";
import { resumeRoutes } from "./navigation/resumeRoutes";
import { adminRoutes } from "./navigation/adminRoutes";
import { enterpriseRoutes } from "./navigation/enterpriseRoutes";
import { proRoutes } from "./navigation/proRoutes";
import { socialRoutes } from "./navigation/socialRoutes";
import { assessmentRoutes } from "./navigation/assessmentRoutes";
import { referralRoutes } from "./navigation/referralRoutes";
import { passportRoutes } from "./navigation/passportRoutes";
import { mobileRoutes } from "./navigation/mobileRoutes";
import { analyticsRoutes } from "./navigation/analyticsRoutes";
import { growthRoutes } from "./navigation/growthRoutes";
import { gamificationRoutes } from "./navigation/gamificationRoutes";
import { publicRoutes } from "./navigation/publicRoutes";
import AIAgentDashboard from "./pages/ai/AIAgentDashboard";
import CampaignManager from "./pages/CampaignManager";
import MobileSearch from "./pages/mobile/MobileSearch";
import NotificationsPage from "./pages/NotificationsPage";
import TalentXcelServices from "./pages/TalentXcelServices";
import FeedEmbeds from "./pages/FeedEmbeds";

// AI Agent routes
export const aiAgentRoutes = [
  {
    title: "AI Career Agent",
    to: "/ai-agent",
    icon: "brain",
    page: <AIAgentDashboard />,
    description: "Your personalized AI career companion"
  }
];

// Campaign Manager routes
export const campaignRoutes = [
  {
    title: "Campaign Manager",
    to: "/campaigns",
    icon: "target",
    page: <CampaignManager />,
    description: "Launch and manage content & outreach campaigns",
    requiresAdminAccess: true
  }
];

// Feed Embeds routes
export const embedRoutes = [
  {
    title: "Feed Embeds",
    to: "/feed-embeds",
    icon: "link",
    page: <FeedEmbeds />,
    description: "Native-looking embeds for external content",
    isPublic: true
  }
];

// Mobile Search route
export const mobileSearchRoutes = [
  {
    title: "Mobile Search",
    to: "/mobile/search",
    icon: "search",
    page: <MobileSearch />,
    description: "Mobile search interface",
    isPublic: true,
    requiresAuth: true
  }
];

// Notifications route
export const notificationRoutes = [
  {
    title: "Notifications",
    to: "/notifications",
    icon: "bell",
    page: <NotificationsPage />,
    description: "Real-time notifications and alerts",
    requiresAuth: true
  }
];

// TalentXcel Services route
export const servicesRoutes = [
  {
    title: "TalentXcel Services",
    to: "/talentxcelservices",
    icon: "briefcase",
    page: <TalentXcelServices />,
    description: "Strategic Talent Solutions for the Future of Work",
    isPublic: true,
    requiresAuth: false
  }
];

export const navItems = [
  ...publicRoutes,
  ...coreRoutes,
  ...authRoutes,
  ...profileRoutes,
  ...jobRoutes,
  ...learningRoutes,
  ...toolsRoutes,
  ...resumeRoutes,
  ...networkRoutes,
  // Place passport routes before company slug route to avoid 404 on /passport
  ...passportRoutes,
  ...companiesRoutes,
  ...collegesRoutes,
  ...careerMapRoutes,
  ...employerRoutes,
  ...marketplaceRoutes,
  ...socialRoutes,
  ...proRoutes,
  ...assessmentRoutes,
  ...referralRoutes,
  ...gamificationRoutes,
  ...mobileRoutes,
  ...mobileSearchRoutes,
  ...notificationRoutes,
  ...servicesRoutes,
  ...analyticsRoutes,
  ...growthRoutes,
  ...aiAgentRoutes,
  ...campaignRoutes,
  ...embedRoutes,
  ...seoRoutes,
  ...adminRoutes,
  ...enterpriseRoutes,
];
