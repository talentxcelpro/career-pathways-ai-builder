import { lazy } from "react";
import { HomeIcon, Settings, BarChart3 } from "lucide-react";

const Index = lazy(() => import("../pages/Index"));
const TalentXcelCore = lazy(() => import("../pages/TalentXcelCore"));
const RealtimeDemoPage = lazy(() => import("../pages/RealtimeDemo"));
const TalentXcelResumeBuilder = lazy(() => import("../pages/resume/TalentXcelResumeBuilder"));
const About = lazy(() => import("../pages/About"));
const Contact = lazy(() => import("../pages/Contact"));
const Help = lazy(() => import("../pages/Help"));
const PrivacyPolicy = lazy(() => import("../pages/PrivacyPolicy"));
const Terms = lazy(() => import("../pages/Terms"));
const ReturnRefundPolicy = lazy(() => import("../pages/ReturnRefundPolicy").then(m => ({ default: m.ReturnRefundPolicy })));
const Blog = lazy(() => import("../pages/Blog"));
const NotFound = lazy(() => import("../pages/NotFound"));
const CommandCenter = lazy(() => import("../pages/CommandCenter"));
const SEOAdmin = lazy(() => import("../pages/admin/SEOAdmin"));
const AdvancedSEOAdmin = lazy(() => import("../pages/admin/AdvancedSEOAdmin"));
const Phase5SEOAdmin = lazy(() => import("../pages/admin/Phase5SEOAdmin"));
const AdminCommandCenter = lazy(() => import("../pages/admin/AdminDashboard"));
const InvitationFlow = lazy(() => import("../pages/InvitationFlow"));
const MobileDemoPage = lazy(() => import("../pages/mobile/MobileDemoPage"));
const MobileAuth = lazy(() => import("../pages/auth/MobileAuth").then(m => ({ default: m.MobileAuth })));
const MobileResumeBuilder = lazy(() => import("../components/mobile/MobileResumeBuilder").then(m => ({ default: m.MobileResumeBuilder })));
const MobileNotifications = lazy(() => import("../components/mobile/MobileNotifications").then(m => ({ default: m.MobileNotifications })));
const MobileAIMatching = lazy(() => import("../components/mobile/MobileAIMatching").then(m => ({ default: m.MobileAIMatching })));
const MobileVideoInterview = lazy(() => import("../components/mobile/MobileVideoInterview").then(m => ({ default: m.MobileVideoInterview })));
const MobileCareerAnalytics = lazy(() => import("../components/mobile/MobileAnalytics").then(m => ({ default: m.MobileCareerAnalytics })));
const MobileSocialNetwork = lazy(() => import("../components/mobile/MobileSocialNetwork").then(m => ({ default: m.MobileSocialNetwork })));
const PublicServiceProfile = lazy(() => import("../pages/PublicServiceProfile"));
const MyApplications = lazy(() => import("../pages/MyApplications"));
const AccessControlTestPage = lazy(() => import("../components/admin/AccessControlTestPage").then(m => ({ default: m.AccessControlTestPage })));
const Careers = lazy(() => import("../pages/Careers"));
const Security = lazy(() => import("../pages/Security")); 
const Api = lazy(() => import("../pages/Api"));
const ResumeTemplates = lazy(() => import("../pages/ResumeTemplates"));


export const coreRoutes = [
  {
    title: "Home",
    to: "/",
    icon: <HomeIcon className="h-4 w-4" />,
    page: <Index />,
    exact: true,
    requiresAuth: false,
  },
  {
    title: "TalentXcel Core",
    to: "/career-os",
    icon: <BarChart3 className="h-4 w-4" />,
    page: <TalentXcelCore />,
    isPublic: false,
    requiresAuth: true,
  },
  {
    title: "Intelligence Hub",
    to: "/CommandCenter",
    icon: <BarChart3 className="h-4 w-4" />,
    page: <CommandCenter />,
    isPublic: true,
  },
  {
    title: "My Applications",
    to: "/my-applications",
    page: <MyApplications />,
  },
  {
    title: "Admin Intelligence Hub",
    to: "/admin",
    icon: <Settings className="h-4 w-4" />,
    page: <AdminCommandCenter />,
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
    title: "Precision Match",
    to: "/mobile-ai-matching", 
    page: <div className="p-4"><MobileAIMatching /></div>,
  },
  {
    title: "Video Interview",
    to: "/mobile-video-interview",
    page: <div className="p-4"><MobileVideoInterview /></div>,
  },
  {
    title: "Intelligence Matrix",
    to: "/mobile-CareerAnalytics",
    page: <div className="p-4"><MobileCareerAnalytics /></div>,
  },
  {
    title: "Ecosystem Sync", 
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
    title: "Not Found",
    to: "*",
    page: <NotFound />,
  },
];
