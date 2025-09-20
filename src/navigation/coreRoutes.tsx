import { HomeIcon, Settings, BarChart3 } from "lucide-react";
import Index from "../pages/Index";
import RealtimeDemoPage from "../pages/RealtimeDemo";
import TalentXcelResumeBuilder from "../pages/resume/TalentXcelResumeBuilder";
import About from "../pages/About";
import Contact from "../pages/Contact";
import Help from "../pages/Help";
import PrivacyPolicy from "../pages/PrivacyPolicy";
import Terms from "../pages/Terms";
import { ReturnRefundPolicy } from "../pages/ReturnRefundPolicy";
import Blog from "../pages/Blog";
import NotFound from "../pages/NotFound";
import Dashboard from "../pages/Dashboard";
import SEOAdmin from "../pages/admin/SEOAdmin";
import AdvancedSEOAdmin from "../pages/admin/AdvancedSEOAdmin";
import Phase5SEOAdmin from "../pages/admin/Phase5SEOAdmin";
import AdminDashboard from "../pages/admin/AdminDashboard";
import InvitationFlow from "../pages/InvitationFlow";
import MobileDemoPage from "../pages/mobile/MobileDemoPage";
import { MobileAuth } from "../pages/auth/MobileAuth";
import { MobileResumeBuilder } from "../components/mobile/MobileResumeBuilder";
import { MobileNotifications } from "../components/mobile/MobileNotifications";
import { MobileAIMatching } from "../components/mobile/MobileAIMatching";
import { MobileVideoInterview } from "../components/mobile/MobileVideoInterview";
import { MobileAnalytics } from "../components/mobile/MobileAnalytics";
import { MobileSocialNetwork } from "../components/mobile/MobileSocialNetwork";
import PublicServiceProfile from "../pages/PublicServiceProfile";
import MyApplications from "../pages/MyApplications";
import { AccessControlTestPage } from "../components/admin/AccessControlTestPage";
import Careers from "../pages/Careers";
import Security from "../pages/Security"; 
import Api from "../pages/Api";
import ResumeTemplates from "../pages/ResumeTemplates";
import Feed from "../pages/Feed";
import SmartFeed from "../pages/SmartFeed";
import Trending from "../pages/Trending";
import Connections from "../pages/Connections";
import Discover from "../pages/Discover";
import AIConnect from "../pages/AIConnect";
import News from "../pages/News";
import LiveEvents from "../pages/LiveEvents";

export const coreRoutes = [
  {
    title: "Resume Builder - New",
    to: "/resume/new",
    page: <TalentXcelResumeBuilder />,
    isPublic: true,
    requiresAuth: false,
  },
  {
    title: "Resume Builder",
    to: "/",
    icon: <HomeIcon className="h-4 w-4" />,
    page: <Index />,
    exact: true,
    requiresAuth: false,
  },
  {
    title: "Dashboard",
    to: "/dashboard",
    icon: <BarChart3 className="h-4 w-4" />,
    page: <Dashboard />,
    isPublic: true,
    requiresAuth: true,
  },
  {
    title: "My Applications",
    to: "/my-applications",
    page: <MyApplications />,
  },
  {
    title: "Admin Dashboard",
    to: "/admin",
    icon: <Settings className="h-4 w-4" />,
    page: <AdminDashboard />,
  },
  {
    title: "About",
    to: "/about",
    page: <About />,
  },
  {
    title: "Contact",
    to: "/contact",
    page: <Contact />,
  },
  {
    title: "Help",
    to: "/help",
    page: <Help />,
  },
  {
    title: "Privacy Policy",
    to: "/privacypolicy",
    page: <PrivacyPolicy />,
  },
  {
    title: "Terms of Service",
    to: "/terms",
    page: <Terms />,
  },
  {
    title: "Return & Refund Policy",
    to: "/return-refund-policy",
    page: <ReturnRefundPolicy />,
  },
  {
    title: "Blog",
    to: "/blog",
    page: <Blog />,
  },
  {
    title: "Careers",
    to: "/careers",
    page: <Careers />,
    isPublic: true,
    requiresAuth: false,
  },
  {
    title: "Security",
    to: "/security", 
    page: <Security />,
    isPublic: true,
    requiresAuth: false,
  },
  // API route removed - admin access only
  {
    title: "Resume Templates",
    to: "/resume-templates",
    page: <ResumeTemplates />,
    isPublic: true,
    requiresAuth: false,
  },
  {
    title: "SEO Admin",
    to: "/admin/seo",
    icon: <Settings className="h-4 w-4" />,
    page: <SEOAdmin />,
  },
  {
    title: "Advanced SEO Admin",
    to: "/admin/seo/advanced",
    icon: <Settings className="h-4 w-4" />,
    page: <AdvancedSEOAdmin />,
  },
  {
    title: "Phase 5 SEO Admin",
    to: "/admin/seo/phase5",
    icon: <Settings className="h-4 w-4" />,
    page: <Phase5SEOAdmin />,
  },
  {
    title: "Invitation Flow Demo",
    to: "/invitation-flow",
    page: <InvitationFlow />,
  },
  {
    title: "Mobile Demo",
    to: "/mobile-demo",
    page: <MobileDemoPage />,
  },
  {
    title: "Real-time Demo",
    to: "/realtime-demo", 
    page: <RealtimeDemoPage />,
    requiresAuth: false,
  },
  {
    title: "Mobile Notifications",
    to: "/mobile-notifications",
    page: <div className="p-4"><MobileNotifications /></div>,
  },
  {
    title: "AI Matching",
    to: "/mobile-ai-matching", 
    page: <div className="p-4"><MobileAIMatching /></div>,
  },
  {
    title: "Video Interview",
    to: "/mobile-video-interview",
    page: <div className="p-4"><MobileVideoInterview /></div>,
  },
  {
    title: "Analytics",
    to: "/mobile-analytics",
    page: <div className="p-4"><MobileAnalytics /></div>,
  },
  {
    title: "Social Network", 
    to: "/mobile-social-network",
    page: <div className="p-4"><MobileSocialNetwork /></div>,
  },
  {
    title: "Mobile Auth",
    to: "/mobile-auth",
    page: <MobileAuth />,
  },
  {
    title: "Mobile Resume",
    to: "/mobile-resume",
    page: <MobileResumeBuilder />,
  },
  {
    title: "Public Service Profile",
    to: "/:username/services",
    page: <PublicServiceProfile />,
  },
  {
    title: "Access Control Test",
    to: "/access-control-test",
    page: <div className="p-4"><AccessControlTestPage /></div>,
    isPublic: true,
    requiresAuth: false,
  },
  {
    title: "Public Tools",
    to: "/public-tools",
    page: <div className="min-h-screen bg-background"><div className="container mx-auto"><div className="p-4">{/* PublicTools content will be imported */}</div></div></div>,
    isPublic: true,
    requiresAuth: false,
  },
  {
    title: "Feed",
    to: "/feed",
    page: <Feed />,
    isPublic: true,
    requiresAuth: false,
  },
  {
    title: "Smart Feed",
    to: "/smart-feed",
    page: <SmartFeed />,
    isPublic: true,
    requiresAuth: false,
  },
  {
    title: "Trending",
    to: "/trending",
    page: <Trending />,
    isPublic: true,
    requiresAuth: false,
  },
  {
    title: "Connections",
    to: "/connections",
    page: <Connections />,
    requiresAuth: true,
  },
  {
    title: "Discover",
    to: "/discover",
    page: <Discover />,
    isPublic: true,
    requiresAuth: false,
  },
  {
    title: "Analytics",
    to: "/analytics",
    page: <div className="p-4"><MobileAnalytics /></div>,
    requiresAuth: true,
  },
  {
    title: "AI Connect",
    to: "/ai-connect",
    page: <AIConnect />,
    requiresAuth: true,
  },
  {
    title: "News",
    to: "/news",
    page: <News />,
    isPublic: true,
    requiresAuth: false,
  },
  {
    title: "Live Events",
    to: "/live-events",
    page: <LiveEvents />,
    isPublic: true,
    requiresAuth: false,
  },
  {
    title: "Not Found",
    to: "*",
    page: <NotFound />,
  },
];
