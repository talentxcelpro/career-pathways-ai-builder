import { lazy, Suspense } from "react";
import { HomeIcon, Settings, BarChart3 } from "lucide-react";

const Index = lazy(() => import("../pages/Index"));
const RealtimeDemoPage = lazy(() => import("../pages/RealtimeDemo"));
const TalentXcelResumeBuilder = lazy(() => import("../pages/resume/TalentXcelResumeBuilder"));
const About = lazy(() => import("../pages/About"));
const Contact = lazy(() => import("../pages/Contact"));
const Help = lazy(() => import("../pages/Help"));
const PrivacyPolicy = lazy(() => import("../pages/PrivacyPolicy"));
const Terms = lazy(() => import("../pages/Terms"));
const ReturnRefundPolicy = lazy(() => import("../pages/ReturnRefundPolicy").then(m => ({ default: m.ReturnRefundPolicy })));
const Blog = lazy(() => import("../pages/Blog"));
const BlogPost = lazy(() => import("../pages/BlogPost"));
const NotFound = lazy(() => import("../pages/NotFound"));
const Dashboard = lazy(() => import("../pages/Dashboard"));
const SEOAdmin = lazy(() => import("../pages/admin/SEOAdmin"));
const AdvancedSEOAdmin = lazy(() => import("../pages/admin/AdvancedSEOAdmin"));
const Phase5SEOAdmin = lazy(() => import("../pages/admin/Phase5SEOAdmin"));
const AdminDashboard = lazy(() => import("../pages/admin/AdminDashboard"));
const InvitationFlow = lazy(() => import("../pages/InvitationFlow"));
const MobileDemoPage = lazy(() => import("../pages/mobile/MobileDemoPage"));
const MobileAuth = lazy(() => import("../pages/auth/MobileAuth").then(m => ({ default: m.MobileAuth })));
const MobileResumeBuilder = lazy(() => import("../components/mobile/MobileResumeBuilder").then(m => ({ default: m.MobileResumeBuilder })));
const MobileNotifications = lazy(() => import("../components/mobile/MobileNotifications").then(m => ({ default: m.MobileNotifications })));
const MobileAIMatching = lazy(() => import("../components/mobile/MobileAIMatching").then(m => ({ default: m.MobileAIMatching })));
const MobileVideoInterview = lazy(() => import("../components/mobile/MobileVideoInterview").then(m => ({ default: m.MobileVideoInterview })));
const MobileAnalytics = lazy(() => import("../components/mobile/MobileAnalytics").then(m => ({ default: m.MobileAnalytics })));
const MobileSocialNetwork = lazy(() => import("../components/mobile/MobileSocialNetwork").then(m => ({ default: m.MobileSocialNetwork })));
const PublicServiceProfile = lazy(() => import("../pages/PublicServiceProfile"));
const MyApplications = lazy(() => import("../pages/MyApplications"));
const AccessControlTestPage = lazy(() => import("../components/admin/AccessControlTestPage").then(m => ({ default: m.AccessControlTestPage })));
const Careers = lazy(() => import("../pages/Careers"));
const Security = lazy(() => import("../pages/Security")); 
const ResumeTemplates = lazy(() => import("../pages/ResumeTemplates"));

const S = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={null}>{children}</Suspense>
);

export const coreRoutes = [
  {
    title: "Resume Builder",
    to: "/",
    icon: <HomeIcon className="h-4 w-4" />,
    page: <S><Index /></S>,
    exact: true,
    requiresAuth: false,
  },
  {
    title: "Dashboard",
    to: "/dashboard",
    icon: <BarChart3 className="h-4 w-4" />,
    page: <S><Dashboard /></S>,
    isPublic: true,
  },
  {
    title: "My Applications",
    to: "/my-applications",
    page: <S><MyApplications /></S>,
  },
  {
    title: "Admin Dashboard",
    to: "/admin",
    icon: <Settings className="h-4 w-4" />,
    page: <S><AdminDashboard /></S>,
  },
  {
    title: "About",
    to: "/about",
    page: <S><About /></S>,
  },
  {
    title: "Contact",
    to: "/contact",
    page: <S><Contact /></S>,
  },
  {
    title: "Help",
    to: "/help",
    page: <S><Help /></S>,
  },
  {
    title: "Privacy Policy",
    to: "/privacypolicy",
    page: <S><PrivacyPolicy /></S>,
  },
  {
    title: "Terms of Service",
    to: "/terms",
    page: <S><Terms /></S>,
  },
  {
    title: "Return & Refund Policy",
    to: "/return-refund-policy",
    page: <S><ReturnRefundPolicy /></S>,
  },
  {
    title: "Blog",
    to: "/blog",
    page: <S><Blog /></S>,
    isPublic: true,
    requiresAuth: false,
  },
  {
    title: "Blog Post",
    to: "/blog/:slug",
    page: <S><BlogPost /></S>,
    isPublic: true,
    requiresAuth: false,
  },
  {
    title: "Careers",
    to: "/careers",
    page: <S><Careers /></S>,
    isPublic: true,
    requiresAuth: false,
  },
  {
    title: "Security",
    to: "/security", 
    page: <S><Security /></S>,
    isPublic: true,
    requiresAuth: false,
  },
  {
    title: "Resume Templates",
    to: "/resume-templates",
    page: <S><ResumeTemplates /></S>,
    isPublic: true,
    requiresAuth: false,
  },
  {
    title: "SEO Admin",
    to: "/admin/seo",
    icon: <Settings className="h-4 w-4" />,
    page: <S><SEOAdmin /></S>,
  },
  {
    title: "Advanced SEO Admin",
    to: "/admin/seo/advanced",
    icon: <Settings className="h-4 w-4" />,
    page: <S><AdvancedSEOAdmin /></S>,
  },
  {
    title: "Phase 5 SEO Admin",
    to: "/admin/seo/phase5",
    icon: <Settings className="h-4 w-4" />,
    page: <S><Phase5SEOAdmin /></S>,
  },
  {
    title: "Invitation Flow Demo",
    to: "/invitation-flow",
    page: <S><InvitationFlow /></S>,
  },
  {
    title: "Mobile Demo",
    to: "/mobile-demo",
    page: <S><MobileDemoPage /></S>,
  },
  {
    title: "Real-time Demo",
    to: "/realtime-demo", 
    page: <S><RealtimeDemoPage /></S>,
    requiresAuth: false,
  },
  {
    title: "Mobile Notifications",
    to: "/mobile-notifications",
    page: <S><div className="p-4"><MobileNotifications /></div></S>,
  },
  {
    title: "AI Matching",
    to: "/mobile-ai-matching", 
    page: <S><div className="p-4"><MobileAIMatching /></div></S>,
  },
  {
    title: "Video Interview",
    to: "/mobile-video-interview",
    page: <S><div className="p-4"><MobileVideoInterview /></div></S>,
  },
  {
    title: "Analytics",
    to: "/mobile-analytics",
    page: <S><div className="p-4"><MobileAnalytics /></div></S>,
  },
  {
    title: "Social Network", 
    to: "/mobile-social-network",
    page: <S><div className="p-4"><MobileSocialNetwork /></div></S>,
  },
  {
    title: "Mobile Auth",
    to: "/mobile-auth",
    page: <S><MobileAuth /></S>,
  },
  {
    title: "Mobile Resume",
    to: "/mobile-resume",
    page: <S><MobileResumeBuilder /></S>,
  },
  {
    title: "Public Service Profile",
    to: "/:username/services",
    page: <S><PublicServiceProfile /></S>,
  },
  {
    title: "Access Control Test",
    to: "/access-control-test",
    page: <S><div className="p-4"><AccessControlTestPage /></div></S>,
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
    title: "Not Found",
    to: "*",
    page: <S><NotFound /></S>,
  },
];
