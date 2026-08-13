import React from "react";
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
import { aiRoutes } from "./navigation/aiRoutes";
import { analyticsRoutes } from "./navigation/analyticsRoutes";
import { growthRoutes } from "./navigation/growthRoutes";
import { gamificationRoutes } from "./navigation/gamificationRoutes";
import { publicRoutes } from "./navigation/publicRoutes";
import { informationArchitectureRoutes } from "./navigation/informationArchitectureRoutes";

// ── Lazy-loaded nav pages ─────────────────────────────────────────────────
const AIAgentDashboard  = React.lazy(() => import("./pages/ai/AIAgentDashboard"));
const CampaignManager   = React.lazy(() => import("./pages/CampaignManager"));
const MobileSearch      = React.lazy(() => import("./pages/mobile/MobileSearch"));
const NotificationsPage = React.lazy(() => import("./pages/NotificationsPage"));
const TalentXcelServices= React.lazy(() => import("./pages/TalentXcelServices"));
const FeedEmbeds        = React.lazy(() => import("./pages/FeedEmbeds"));
const LinkedInToolsHub  = React.lazy(() => import("./pages/admin/LinkedInToolsHub"));
const TestingDashboard  = React.lazy(() => import("./pages/TestingDashboard").then(m => ({ default: m.TestingDashboard })));
const SavedJobsPage     = React.lazy(() => import("./pages/SavedJobs").then(m => ({ default: m.SavedJobsPage })));

const S = ({ C }: { C: React.LazyExoticComponent<any> }) => (
  <React.Suspense fallback={null}><C /></React.Suspense>
);

// AI Agent routes
export const aiAgentRoutes = [
  {
    title: "AI Career Agent",
    to: "/ai-agent",
    icon: "brain",
    page: <S C={AIAgentDashboard} />,
    description: "Your personalized AI career companion",
    isPublic: true
  }
];

// Campaign Manager routes
export const campaignRoutes = [
  {
    title: "Campaign Manager",
    to: "/campaigns",
    icon: "target",
    page: <S C={CampaignManager} />,
    description: "Launch and manage content & outreach campaigns",
    isPublic: true
  }
];

// Feed Embeds routes
export const embedRoutes = [
  {
    title: "Feed Embeds",
    to: "/feed-embeds",
    icon: "link",
    page: <S C={FeedEmbeds} />,
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
    page: <S C={MobileSearch} />,
    description: "Mobile search interface",
    isPublic: true
  }
];

// Notifications route
export const notificationRoutes = [
  {
    title: "Notifications",
    to: "/notifications",
    icon: "bell",
    page: <S C={NotificationsPage} />,
    description: "Real-time notifications and alerts",
    isPublic: true
  }
];

// TalentXcel Services route
export const servicesRoutes = [
  {
    title: "TalentXcel Services",
    to: "/talentxcelservices",
    icon: "briefcase",
    page: <S C={TalentXcelServices} />,
    description: "Strategic Talent Solutions for the Future of Work",
    isPublic: true
  }
];

// LinkedIn Tools Hub route
export const linkedInToolsRoutes = [
  {
    title: "LinkedIn Tools Hub",
    to: "/admin/linkedin-tools",
    icon: "linkedin",
    page: <S C={LinkedInToolsHub} />,
    description: "Advanced LinkedIn data management and automation",
    isPublic: true
  }
];

// Testing Dashboard route
export const testingRoutes = [
  {
    title: "Testing Dashboard",
    to: "/testing",
    icon: "flask",
    page: <S C={TestingDashboard} />,
    description: "Test all notification and automation features",
    isPublic: true
  }
];

// Saved Jobs route
export const savedJobsRoutes = [
  {
    title: "Saved Jobs",
    to: "/saved-jobs",
    icon: "heart",
    page: <S C={SavedJobsPage} />,
    description: "View your liked and bookmarked jobs",
    isPublic: false
  }
];

export const navItems = [
  // Public SEO information architecture — registered first so its static
  // paths win over legacy dynamic routes (/employers/:name, /resources/:tool).
  ...informationArchitectureRoutes,
  ...publicRoutes,
  ...coreRoutes,
  ...authRoutes,
  ...profileRoutes,
  // jobRoutes commented out to prevent route conflicts with JobDetails
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
  ...aiRoutes,
  ...aiAgentRoutes,
  ...campaignRoutes,
  ...embedRoutes,
  ...savedJobsRoutes,
  ...linkedInToolsRoutes,
  ...testingRoutes,
  ...seoRoutes,
  ...adminRoutes,
  ...enterpriseRoutes,
];
