import { lazy } from "react";
import { Shield, Users, Building2, Home, Network, Briefcase, FileText, Wrench, GraduationCap, Map, CreditCard, BarChart3, Lock, Plus, Mail, Brain, Crown, MessageSquare, Search, Megaphone, Layout, Flag, Bot, Globe } from "lucide-react";
import { TestimonialsManagement } from "../components/admin/TestimonialsManagement";
import { VerificationManagement } from "../components/admin/VerificationManagement";
import EmployerRequestsAdmin from "../pages/admin/EmployerRequestsAdmin";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminManagement from "../pages/admin/AdminManagement";
import UserManagement from "../pages/admin/UserManagement";
import HomeManagement from "../pages/admin/HomeManagement";
import NetworkManagement from "../pages/admin/NetworkManagement";
import JobsManagement from "../pages/admin/JobsManagement";
import ResumeManagement from "../pages/admin/ResumeManagement";
import ToolsManagement from "../pages/admin/ToolsManagement";
import CompaniesManagement from "../pages/admin/CompaniesManagement";
import LearningManagement from "../pages/admin/LearningManagement";
import CareerMapManagement from "../pages/admin/CareerMapManagement";
import PricingPayments from "../pages/admin/PricingPayments";
import AnalyticsReports from "../pages/admin/AnalyticsReports";
import SecurityLogs from "../pages/admin/SecurityLogs";
import CreateCourse from "../pages/admin/learning/CreateCourse";
import CreatePlan from "../pages/admin/pricing/CreatePlan";
import EmailAutomationPage from "../pages/admin/EmailAutomation";
import AIMLTrainingCenter from "../pages/admin/AIMLTrainingCenter";
import AdminAIManagement from "../pages/AdminAIManagement";
import BotManagement from "../pages/admin/BotManagement";
import CollegesManagement from "../pages/admin/CollegesManagement";
import { ProUsersPage } from "../components/admin/ProUsersPage";
import SEOManagement from "../pages/admin/SEOManagement";
import AdvancedSEOManager from "../pages/admin/AdvancedSEOManager";
import AdCampaignManager from "../pages/admin/AdCampaignManager";
import SmartPageBuilder from "../pages/admin/SmartPageBuilder";
import AIAssistantPanel from "../pages/admin/AIAssistantPanel";
import AdvancedContentHub from "../pages/admin/AdvancedContentHub";
import FeatureFlagsManager from "../pages/admin/FeatureFlagsManager";
import AdvancedAnalyticsDashboard from "../pages/admin/AdvancedAnalyticsDashboard";
import PerformanceMonitoring from "../pages/admin/PerformanceMonitoring";
import IntegrationHub from "../pages/admin/IntegrationHub";
import { SEODashboard } from "../components/admin/SEODashboard";

export const adminRoutes = [
  {
    title: "Admin Dashboard",
    to: "/admin",
    icon: <Shield className="h-4 w-4" />,
    page: <AdminDashboard />,
    requiresAuth: true,
    permission: "canAccessDashboard" as const,
    description: "Platform overview and analytics"
  },
  {
    title: "User Management",
    to: "/admin/users",
    icon: <Users className="h-4 w-4" />,
    page: <UserManagement />,
    requiresAuth: true,
    permission: "canAccessUsers" as const,
    description: "Manage and moderate all users"
  },
  {
    title: "Pro Users",
    to: "/admin/pro-users",
    icon: <Crown className="h-4 w-4" />,
    page: <ProUsersPage />,
    requiresAuth: true,
    permission: "canAccessDashboard" as const,
    description: "Manage Pro subscriptions & Elite users"
  },
  {
    title: "Testimonials",
    to: "/admin/testimonials",
    icon: <MessageSquare className="h-4 w-4" />,
    page: <TestimonialsManagement />,
    requiresAuth: true,
    permission: "canAccessDashboard" as const,
    description: "Manage user testimonials"
  },
  {
    title: "Verification",
    to: "/admin/verification",
    icon: <Shield className="h-4 w-4" />,
    page: <VerificationManagement />,
    requiresAuth: true,
    permission: "canAccessDashboard" as const,
    description: "Manage user verification requests"
  },
  {
    title: "Employer Requests",
    to: "/admin/employer-requests",
    icon: <Building2 className="h-4 w-4" />,
    page: <EmployerRequestsAdmin />,
    requiresAuth: true,
    permission: "canAccessEmployerRequests" as const,
    description: "Review and approve employer applications"
  },
  {
    title: "Jobs Management",
    to: "/admin/jobs",
    icon: <Briefcase className="h-4 w-4" />,
    page: <JobsManagement />,
    requiresAuth: true,
    permission: "canAccessJobs" as const,
    description: "Manage job postings and categories"
  },
  {
    title: "Companies Management",
    to: "/admin/companies",
    icon: <Building2 className="h-4 w-4" />,
    page: <CompaniesManagement />,
    requiresAuth: true,
    permission: "canAccessCompanies" as const,
    description: "Company profiles and verification"
  },
  {
    title: "Network Management",
    to: "/admin/network",
    icon: <Network className="h-4 w-4" />,
    page: <NetworkManagement />,
    requiresAuth: true,
    permission: "canAccessNetwork" as const,
    description: "Social network and community moderation"
  },
  {
    title: "Learning Management",
    to: "/admin/learning",
    icon: <GraduationCap className="h-4 w-4" />,
    page: <LearningManagement />,
    requiresAuth: true,
    permission: "canAccessLearning" as const,
    description: "Courses and learning paths"
  },
  {
    title: "Colleges Management",
    to: "/admin/colleges",
    icon: <GraduationCap className="h-4 w-4" />,
    page: <CollegesManagement />,
    requiresAuth: true,
    permission: "canAccessColleges" as const,
    description: "College management & verification"
  },
  {
    title: "Career Map Management",
    to: "/admin/career-map",
    icon: <Map className="h-4 w-4" />,
    page: <CareerMapManagement />,
    requiresAuth: true,
    permission: "canAccessCareerMap" as const,
    description: "Career guidance and pathways"
  },
  {
    title: "Resume Management",
    to: "/admin/resumes",
    icon: <FileText className="h-4 w-4" />,
    page: <ResumeManagement />,
    requiresAuth: true,
    permission: "canAccessResumes" as const,
    description: "Resume templates and tools"
  },
  {
    title: "Tools Management",
    to: "/admin/tools",
    icon: <Wrench className="h-4 w-4" />,
    page: <ToolsManagement />,
    requiresAuth: true,
    permission: "canAccessTools" as const,
    description: "AI tools and utilities"
  },
  {
    title: "Home Management",
    to: "/admin/home",
    icon: <Home className="h-4 w-4" />,
    page: <HomeManagement />,
    requiresAuth: true,
    permission: "canAccessDashboard" as const,
    description: "Homepage content management"
  },
  {
    title: "Analytics & Reports",
    to: "/admin/analytics",
    icon: <BarChart3 className="h-4 w-4" />,
    page: <AnalyticsReports />,
    requiresAuth: true,
    permission: "canAccessAnalytics" as const,
    description: "Platform analytics and reports"
  },
  {
    title: "Pricing & Payments",
    to: "/admin/payments",
    icon: <CreditCard className="h-4 w-4" />,
    page: <PricingPayments />,
    requiresAuth: true,
    permission: "canAccessDashboard" as const,
    description: "Pricing plans and payment management"
  },
  {
    title: "Security & Logs",
    to: "/admin/security",
    icon: <Lock className="h-4 w-4" />,
    page: <SecurityLogs />,
    requiresAuth: true,
    permission: "canAccessSecurity" as const,
    description: "Security logs and audit trails"
  },
  {
    title: "Email Automation",
    to: "/admin/email-automation", 
    icon: <Mail className="h-4 w-4" />,
    page: <EmailAutomationPage />,
    requiresAuth: true,
    permission: "canAccessDashboard" as const,
    description: "Configure automated email templates and triggers"
  },
  {
    title: "AI/ML Training Center",
    to: "/admin/ai-ml-training",
    icon: <Brain className="h-4 w-4" />,
    page: <AIMLTrainingCenter />,
    requiresAuth: true,
    permission: "canAccessDashboard" as const,
    description: "Train, fine-tune, monitor, and manage AI models personalized for platform services"
  },
  {
    title: "AI Management",
    to: "/admin/ai-management",
    icon: <Brain className="h-4 w-4" />,
    page: <AdminAIManagement />,
    requiresAuth: true,
    permission: "canAccessReports" as const,
    description: "Monitor and manage AI features across the platform"
  },
  {
    title: "Bot Management",
    to: "/admin/bots",
    icon: <Bot className="h-4 w-4" />,
    page: <BotManagement />,
    requiresAuth: true,
    permission: "canAccessDashboard" as const,
    description: "AI content generation bots"
  },
  {
    title: "Admin Management",
    to: "/admin/admins",
    icon: <Shield className="h-4 w-4" />,
    page: <AdminManagement />,
    requiresAuth: true,
    permission: "canAccessAdmins" as const,
    description: "Manage administrator accounts"
  },
  {
    title: "Create Course",
    to: "/admin/learning/create",
    icon: <Plus className="h-4 w-4" />,
    page: <CreateCourse />,
    requiresAuth: true,
    permission: "canAccessLearning" as const,
    description: "Create new learning courses"
  },
  {
    title: "Create Pricing Plan",
    to: "/admin/pricing/create",
    icon: <Plus className="h-4 w-4" />,
    page: <CreatePlan />,
    requiresAuth: true,
    permission: "canAccessDashboard" as const,
    description: "Create new subscription plans"
  },
  {
    title: "SEO Management",
    to: "/admin/seo",
    icon: <Search className="h-4 w-4" />,
    page: <SEOManagement />,
    requiresAuth: true,
  },
  {
    title: "Advanced SEO Manager",
    to: "/admin/advanced-seo",
    icon: <Search className="h-4 w-4" />,
    page: <AdvancedSEOManager />,
    requiresAuth: true,
    permission: "canAccessDashboard" as const,
    description: "Comprehensive SEO management tools"
  },
  {
    title: "SEO Sitemap Dashboard",
    to: "/admin/seo-sitemap",
    icon: <Globe className="h-4 w-4" />,
    page: <SEODashboard />,
    requiresAuth: true,
    permission: "canAccessDashboard" as const,
    description: "Monitor sitemaps and search engine submissions"
  },
  {
    title: "AI Content Generator",
    to: "/admin/content",
    icon: <Brain className="h-4 w-4" />,
    page: lazy(() => import('@/components/admin/ContentManagement').then(m => ({ default: m.ContentManagement }))),
    requiresAuth: true,
    permission: "canAccessDashboard" as const,
    description: "AI-powered content generation and management"
  },
  {
    title: "Ad Campaign Manager", 
    to: "/admin/ad-campaigns",
    icon: <Megaphone className="h-4 w-4" />,
    page: <AdCampaignManager />,
    requiresAuth: true,
    permission: "canAccessDashboard" as const,
    description: "Create and manage advertising campaigns"
  },
  {
    title: "Smart Page Builder",
    to: "/admin/page-builder", 
    icon: <Layout className="h-4 w-4" />,
    page: <SmartPageBuilder />,
    requiresAuth: true,
    permission: "canAccessDashboard" as const,
    description: "Create and customize landing pages"
  },
  {
    title: "AI Assistant Panel",
    to: "/admin/ai-assistant",
    icon: <Brain className="h-4 w-4" />,
    page: <AIAssistantPanel />,
    requiresAuth: true,
    permission: "canAccessDashboard" as const,
    description: "Smart AI suggestions and insights"
  },
  {
    title: "Advanced Content Hub",
    to: "/admin/content-hub",
    icon: <FileText className="h-4 w-4" />,
    page: <AdvancedContentHub />,
    requiresAuth: true,
    permission: "canAccessDashboard" as const,
    description: "AI-powered content creation and management"
  },
  {
    title: "Feature Flags Manager",
    to: "/admin/feature-flags",
    icon: <Flag className="h-4 w-4" />,
    page: <FeatureFlagsManager />,
    requiresAuth: true,
    permission: "canAccessDashboard" as const,
    description: "Control feature rollouts and A/B testing"
  },
  {
    title: "Analytics Dashboard",
    to: "/admin/analytics-dashboard",
    icon: <BarChart3 className="h-4 w-4" />,
    page: <AdvancedAnalyticsDashboard />,
    requiresAuth: true,
    permission: "canAccessDashboard" as const,
    description: "Advanced analytics and insights"
  },
  {
    title: "Performance Monitoring",
    to: "/admin/performance-monitoring",
    icon: <Shield className="h-4 w-4" />,
    page: <PerformanceMonitoring />,
    requiresAuth: true,
    permission: "canAccessDashboard" as const,
    description: "System health and performance metrics"
  },
  {
    title: "Integration Hub",
    to: "/admin/integration-hub",
    icon: <Network className="h-4 w-4" />,
    page: <IntegrationHub />,
    requiresAuth: true,
    permission: "canAccessDashboard" as const,
    description: "Manage third-party integrations"
  }
];
