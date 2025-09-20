import { lazy } from "react";
import { Shield, Users, Building2, Home, Network, Briefcase, FileText, Wrench, GraduationCap, Map, CreditCard, BarChart3, Lock, Plus, Mail, Brain, Crown, MessageSquare, Search, Megaphone, Layout, Flag, Bot, Globe, AlertTriangle, Link, Newspaper, Coins, Upload, Database, Rocket, Eye } from "lucide-react";
import { LinkedInImportManager } from "../components/admin/LinkedInImportManager";
import { TokenWallet } from "../components/blockchain/TokenWallet";
import { BotPostManager } from "../components/admin/BotPostManager";
import TXCTokenManagement from "../pages/admin/TXCTokenManagement";
import TXCAwardsAndBonuses from "../pages/admin/TXCAwardsAndBonuses";
import TXCAnalytics from "../pages/admin/TXCAnalytics";
import { TXCBackfill } from "../pages/admin/TXCBackfill";
import LinkedInBulkUpload from "../pages/admin/LinkedInBulkUpload";
import LinkedInJobScraper from "../pages/admin/LinkedInJobScraper";
import LinkedInAnalytics from "../pages/admin/LinkedInAnalytics";
import EnterpriseSolutions from "../pages/admin/EnterpriseSolutions";
import EnterpriseAnalytics from "../pages/admin/EnterpriseAnalytics";
import EnterpriseClients from "../pages/admin/EnterpriseClients";
import EnterpriseBilling from "../pages/admin/EnterpriseBilling";
import SEOSuite from "../pages/admin/SEOSuite";
import TalentDatabase from "../pages/admin/TalentDatabase";
import CareerPlatform from "../pages/admin/CareerPlatform";
import { BotIdentityManager } from "../components/admin/BotIdentityManager";
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
import SecurityMonitoring from "../components/admin/SecurityMonitoring";
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
import BacklinkDashboard from "../pages/admin/BacklinkDashboard";
import { SEODashboard } from "../components/admin/SEODashboard";
import { SEODashboardNew } from "../components/admin/SEODashboardNew";
import { JobDataManager } from "../components/admin/JobDataManager";
import LinkBuildingDashboard from "../pages/admin/LinkBuildingDashboard";
import AgentOperationsPage from "../pages/admin/AgentOperations";
import NewsAutomationPage from "../pages/admin/NewsAutomationPage";
import ProductRequirementDocument from "../pages/admin/ProductRequirementDocument";
import NewsManagement from "../pages/admin/NewsManagement";
import EdgeFunctionsMonitor from "../pages/admin/EdgeFunctionsMonitor";
import LinkedInImporter from "../pages/admin/LinkedInImporter";
import EnterpriseOverview from "../pages/admin/EnterpriseOverview";

export const adminRoutes = [
  {
    title: "Admin Dashboard",
    to: "/admin",
    icon: <Shield className="h-4 w-4" />,
    page: <AdminDashboard />,
    requiresAuth: true,
  },
  {
    title: "User Management",
    to: "/admin/users",
    icon: <Users className="h-4 w-4" />,
    page: <UserManagement />,
    requiresAuth: true,
  },
  {
    title: "Pro Users",
    to: "/admin/pro-users",
    icon: <Crown className="h-4 w-4" />,
    page: <ProUsersPage />,
    requiresAuth: true,
  },
  {
    title: "Testimonials",
    to: "/admin/testimonials",
    icon: <MessageSquare className="h-4 w-4" />,
    page: <TestimonialsManagement />,
    requiresAuth: true,
  },
  {
    title: "Verification",
    to: "/admin/verification",
    icon: <Shield className="h-4 w-4" />,
    page: <VerificationManagement />,
    requiresAuth: true,
  },
  {
    title: "Employer Requests",
    to: "/admin/employer-requests",
    icon: <Building2 className="h-4 w-4" />,
    page: <EmployerRequestsAdmin />,
    requiresAuth: true,
  },
  {
    title: "Jobs Management",
    to: "/admin/jobs",
    icon: <Briefcase className="h-4 w-4" />,
    page: <JobsManagement />,
    requiresAuth: true,
  },
  {
    title: "Job Data Quality",
    to: "/admin/jobs/quality",
    icon: <AlertTriangle className="h-4 w-4" />,
    page: <JobDataManager />,
    requiresAuth: true,
  },
  {
    title: "Companies Management",
    to: "/admin/companies",
    icon: <Building2 className="h-4 w-4" />,
    page: <CompaniesManagement />,
    requiresAuth: true,
  },
  {
    title: "Network Management",
    to: "/admin/network",
    icon: <Network className="h-4 w-4" />,
    page: <NetworkManagement />,
    requiresAuth: true,
  },
  {
    title: "Learning Management",
    to: "/admin/learning",
    icon: <GraduationCap className="h-4 w-4" />,
    page: <LearningManagement />,
    requiresAuth: true,
  },
  {
    title: "Colleges Management",
    to: "/admin/colleges",
    icon: <GraduationCap className="h-4 w-4" />,
    page: <CollegesManagement />,
    requiresAuth: true,
  },
  {
    title: "Career Map Management",
    to: "/admin/career-map",
    icon: <Map className="h-4 w-4" />,
    page: <CareerMapManagement />,
    requiresAuth: true,
  },
  {
    title: "Resume Management",
    to: "/admin/resumes",
    icon: <FileText className="h-4 w-4" />,
    page: <ResumeManagement />,
    requiresAuth: true,
  },
  {
    title: "Tools Management",
    to: "/admin/tools",
    icon: <Wrench className="h-4 w-4" />,
    page: <ToolsManagement />,
    requiresAuth: true,
  },
  {
    title: "Home Management",
    to: "/admin/home",
    icon: <Home className="h-4 w-4" />,
    page: <HomeManagement />,
    requiresAuth: true,
  },
  {
    title: "Analytics & Reports",
    to: "/admin/analytics",
    icon: <BarChart3 className="h-4 w-4" />,
    page: <AnalyticsReports />,
    requiresAuth: true,
  },
  {
    title: "Pricing & Payments",
    to: "/admin/payments",
    icon: <CreditCard className="h-4 w-4" />,
    page: <PricingPayments />,
    requiresAuth: true,
  },
  {
    title: "Security Monitoring",
    to: "/admin/security",
    icon: <Lock className="h-4 w-4" />,
    page: <SecurityMonitoring />,
    requiresAuth: true,
  },
  {
    title: "Security Logs",
    to: "/admin/security-logs",
    icon: <Lock className="h-4 w-4" />,
    page: <SecurityLogs />,
    requiresAuth: true,
  },
  {
    title: "Email Automation",
    to: "/admin/email-automation", 
    icon: <Mail className="h-4 w-4" />,
    page: <EmailAutomationPage />,
    requiresAuth: true,
  },
  {
    title: "AI/ML Training Center",
    to: "/admin/ai-ml-training",
    icon: <Brain className="h-4 w-4" />,
    page: <AIMLTrainingCenter />,
    requiresAuth: true,
  },
  {
    title: "AI Management",
    to: "/admin/ai-management",
    icon: <Brain className="h-4 w-4" />,
    page: <AdminAIManagement />,
    requiresAuth: true,
  },
  {
    title: "Bot Management",
    to: "/admin/bots",
    icon: <Bot className="h-4 w-4" />,
    page: <BotManagement />,
    requiresAuth: true,
  },
  {
    title: "Bot Post Manager",
    to: "/admin/bot-posts",
    icon: <Bot className="h-4 w-4" />,
    page: <BotPostManager />,
    requiresAuth: true,
  },
  {
    title: "Bot Identity Manager",
    to: "/admin/bot-identity",
    icon: <Bot className="h-4 w-4" />,
    page: <BotIdentityManager />,
    requiresAuth: true,
  },
  {
    title: "AI Agent Operations",
    to: "/admin/agent-operations",
    icon: <Bot className="h-4 w-4" />,
    page: <AgentOperationsPage />,
    requiresAuth: true,
  },
  {
    title: "Admin Management",
    to: "/admin/admins",
    icon: <Shield className="h-4 w-4" />,
    page: <AdminManagement />,
    requiresAuth: true,
  },
  {
    title: "Create Course",
    to: "/admin/learning/create",
    icon: <Plus className="h-4 w-4" />,
    page: <CreateCourse />,
    requiresAuth: true,
  },
  {
    title: "Create Pricing Plan",
    to: "/admin/pricing/create",
    icon: <Plus className="h-4 w-4" />,
    page: <CreatePlan />,
    requiresAuth: true,
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
  },
  {
    title: "SEO Sitemap Dashboard",
    to: "/admin/seo-sitemap",
    icon: <Globe className="h-4 w-4" />,
    page: <SEODashboard />,
    requiresAuth: true,
  },
  {
    title: "SEO Enhancement Dashboard",
    to: "/admin/seo-enhancement",
    icon: <Search className="h-4 w-4" />,
    page: <SEODashboardNew />,
    requiresAuth: true,
  },
  {
    title: "AI Content Generator",
    to: "/admin/content",
    icon: <Brain className="h-4 w-4" />,
    page: lazy(() => import('@/components/admin/ContentManagement').then(m => ({ default: m.ContentManagement }))),
    requiresAuth: true,
  },
  {
    title: "Ad Campaign Manager", 
    to: "/admin/ad-campaigns",
    icon: <Megaphone className="h-4 w-4" />,
    page: <AdCampaignManager />,
    requiresAuth: true,
  },
  {
    title: "Smart Page Builder",
    to: "/admin/page-builder", 
    icon: <Layout className="h-4 w-4" />,
    page: <SmartPageBuilder />,
    requiresAuth: true,
  },
  {
    title: "AI Assistant Panel",
    to: "/admin/ai-assistant",
    icon: <Brain className="h-4 w-4" />,
    page: <AIAssistantPanel />,
    requiresAuth: true,
  },
  {
    title: "Advanced Content Hub",
    to: "/admin/content-hub",
    icon: <FileText className="h-4 w-4" />,
    page: <AdvancedContentHub />,
    requiresAuth: true,
  },
  {
    title: "Feature Flags Manager",
    to: "/admin/feature-flags",
    icon: <Flag className="h-4 w-4" />,
    page: <FeatureFlagsManager />,
    requiresAuth: true,
  },
  {
    title: "Analytics Dashboard",
    to: "/admin/analytics-dashboard",
    icon: <BarChart3 className="h-4 w-4" />,
    page: <AdvancedAnalyticsDashboard />,
    requiresAuth: true,
  },
  {
    title: "Performance Monitoring",
    to: "/admin/performance-monitoring",
    icon: <Shield className="h-4 w-4" />,
    page: <PerformanceMonitoring />,
    requiresAuth: true,
  },
  {
    title: "Integration Hub",
    to: "/admin/integration-hub",
    icon: <Network className="h-4 w-4" />,
    page: <IntegrationHub />,
    requiresAuth: true,
  },
  {
    title: "Link Building Command Center",
    to: "/admin/link-building",
    icon: <Link className="h-4 w-4" />,
    page: <LinkBuildingDashboard />,
    requiresAuth: true,
  },
  {
    title: "Backlink System",
    to: "/admin/backlinks",
    icon: <Network className="h-4 w-4" />,
    page: <BacklinkDashboard />,
    requiresAuth: true,
  },
  {
    title: "News Automation",
    to: "/admin/news-automation",
    icon: <Newspaper className="h-4 w-4" />,
    page: <NewsAutomationPage />,
    requiresAuth: true,
  },
  {
    title: "Product Requirements (PRD)",
    to: "/admin/prd", 
    icon: <FileText className="h-4 w-4" />,
    page: <ProductRequirementDocument />,
    requiresAuth: true,
  },
  {
    title: "LinkedIn Import Manager",
    to: "/admin/linkedin-import",
    icon: <Upload className="h-4 w-4" />,
    page: <LinkedInImportManager />,
    requiresAuth: true,
  },
  {
    title: "Token Wallet System",
    to: "/admin/token-wallet",
    icon: <Coins className="h-4 w-4" />,
    page: <TokenWallet />,
    requiresAuth: true,
  },
  {
    title: "TXC Token Management",
    to: "/admin/txc-tokens",
    icon: <Coins className="h-4 w-4" />,
    page: <TXCTokenManagement />,
    requiresAuth: true,
  },
  {
    title: "TXC Awards & Bonuses",
    to: "/admin/txc-awards",
    icon: <Coins className="h-4 w-4" />,
    page: <TXCAwardsAndBonuses />,
    requiresAuth: true,
  },
  {
    title: "TXC Backfill System",
    to: "/admin/txc-backfill",
    icon: <Coins className="h-4 w-4" />,
    page: <TXCBackfill />,
    requiresAuth: true,
  },
  {
    title: "TXC Analytics",
    to: "/admin/txc-analytics",
    icon: <BarChart3 className="h-4 w-4" />,
    page: <TXCAnalytics />,
    requiresAuth: true,
  },
  {
    title: "LinkedIn Bulk Upload",
    to: "/admin/linkedin-bulk-upload",
    icon: <Upload className="h-4 w-4" />,
    page: <LinkedInBulkUpload />,
    requiresAuth: true,
  },
  {
    title: "LinkedIn Job Scraper",
    to: "/admin/linkedin-scraper",
    icon: <Bot className="h-4 w-4" />,
    page: <LinkedInJobScraper />,
    requiresAuth: true,
  },
  {
    title: "LinkedIn Analytics",
    to: "/admin/linkedin-analytics",
    icon: <BarChart3 className="h-4 w-4" />,
    page: <LinkedInAnalytics />,
    requiresAuth: true,
  },
  {
    title: "Enterprise Solutions",
    to: "/admin/enterprise",
    icon: <Building2 className="h-4 w-4" />,
    page: <EnterpriseSolutions />,
    requiresAuth: true,
  },
  {
    title: "Enterprise Analytics",
    to: "/admin/enterprise/analytics",
    icon: <BarChart3 className="h-4 w-4" />,
    page: <EnterpriseAnalytics />,
    requiresAuth: true,
  },
  {
    title: "Enterprise Clients",
    to: "/admin/enterprise/clients",
    icon: <Building2 className="h-4 w-4" />,
    page: <EnterpriseClients />,
    requiresAuth: true,
  },
  {
    title: "Enterprise Billing",
    to: "/admin/enterprise/billing",
    icon: <CreditCard className="h-4 w-4" />,
    page: <EnterpriseBilling />,
    requiresAuth: true,
  },
  {
    title: "SEO Suite",
    to: "/admin/seo-suite",
    icon: <Search className="h-4 w-4" />,
    page: <SEOSuite />,
    requiresAuth: true,
  },
  {
    title: "Talent Database",
    to: "/admin/talent-database",
    icon: <Database className="h-4 w-4" />,
    page: <TalentDatabase />,
    requiresAuth: true,
  },
  {
    title: "Career Platform",
    to: "/admin/career-platform",
    icon: <Rocket className="h-4 w-4" />,
    page: <CareerPlatform />,
    requiresAuth: true,
  },
  {
    title: "News Management",
    to: "/admin/news-management",
    icon: <Newspaper className="h-4 w-4" />,
    page: <NewsManagement />,
    requiresAuth: true,
  },
  {
    title: "Edge Functions Monitor",
    to: "/admin/edge-functions-monitor",
    icon: <Eye className="h-4 w-4" />,
    page: <EdgeFunctionsMonitor />,
    requiresAuth: true,
  },
  {
    title: "LinkedIn Importer",
    to: "/admin/linkedin-importer",
    icon: <Upload className="h-4 w-4" />,
    page: <LinkedInImporter />,
    requiresAuth: true,
  },
  {
    title: "Enterprise Overview",
    to: "/admin/enterprise-overview",
    icon: <Building2 className="h-4 w-4" />,
    page: <EnterpriseOverview />,
    requiresAuth: true,
  }
];
