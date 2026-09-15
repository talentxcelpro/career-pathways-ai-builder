import { lazy } from "react";
import { Shield, Users, Building2, Home, Network, Briefcase, FileText, Wrench, GraduationCap, Map, CreditCard, BarChart3, Lock, Plus, Mail, Crown, MessageSquare, Search, Megaphone, Layout, Flag, Globe, AlertTriangle, Link, Newspaper, Coins, Upload, Database, Rocket, Eye } from "lucide-react";
const TXCTokenManagement = lazy(() => import("../pages/admin/TXCTokenManagement"));
const TXCAwardsAndBonuses = lazy(() => import("../pages/admin/TXCAwardsAndBonuses"));
const TXCCareerAnalytics = lazy(() => import("../pages/admin/TXCAnalytics"));
const TXCBackfill = lazy(() => import("../pages/admin/TXCBackfill"));
const TXCStore = lazy(() => import("../pages/admin/TXCStore"));
const TXCSpendingHistory = lazy(() => import("../pages/admin/TXCSpendingHistory"));
const LinkedInBulkUpload = lazy(() => import("../pages/admin/LinkedInBulkUpload"));
const LinkedInJobScraper = lazy(() => import("../pages/admin/LinkedInJobScraper"));
const LinkedInCareerAnalytics = lazy(() => import("../pages/admin/LinkedInAnalytics"));
const EnterpriseSolutions = lazy(() => import("../pages/admin/EnterpriseSolutions"));
const EnterpriseCareerAnalytics = lazy(() => import("../pages/admin/EnterpriseAnalytics"));
const EnterpriseClients = lazy(() => import("../pages/admin/EnterpriseClients"));
const EnterpriseBilling = lazy(() => import("../pages/admin/EnterpriseBilling"));
const SEOSuite = lazy(() => import("../pages/admin/SEOSuite"));
const TalentDatabase = lazy(() => import("../pages/admin/TalentDatabase"));
const CareerPlatform = lazy(() => import("../pages/admin/CareerPlatform"));
const EmployerRequestsAdmin = lazy(() => import("../pages/admin/EmployerRequestsAdmin"));
const AdminCommandCenter = lazy(() => import("../pages/admin/AdminDashboard"));
const AdminManagement = lazy(() => import("../pages/admin/AdminManagement"));
const UserManagement = lazy(() => import("../pages/admin/UserManagement"));
const HomeManagement = lazy(() => import("../pages/admin/HomeManagement"));
const NetworkManagement = lazy(() => import("../pages/admin/NetworkManagement"));
const JobsManagement = lazy(() => import("../pages/admin/JobsManagement"));
const ResumeManagement = lazy(() => import("../pages/admin/ResumeManagement"));
const ToolsManagement = lazy(() => import("../pages/admin/ToolsManagement"));
const CompaniesManagement = lazy(() => import("../pages/admin/CompaniesManagement"));
const LearningManagement = lazy(() => import("../pages/admin/LearningManagement"));
const CareerMapManagement = lazy(() => import("../pages/admin/CareerMapManagement"));
const CareerAnalyticsReports = lazy(() => import("../pages/admin/AnalyticsReports"));
const SecurityLogs = lazy(() => import("../pages/admin/SecurityLogs"));
const CreateCourse = lazy(() => import("../pages/admin/learning/CreateCourse"));
const EmailAutomationPage = lazy(() => import("../pages/admin/EmailAutomation"));
const AIMLTrainingCenter = lazy(() => import("../pages/admin/AIMLTrainingCenter"));
const AdminAIManagement = lazy(() => import("../pages/AdminAIManagement"));
const BotManagement = lazy(() => import("../pages/admin/BotManagement"));
const CollegesManagement = lazy(() => import("../pages/admin/CollegesManagement"));
const SEOManagement = lazy(() => import("../pages/admin/SEOManagement"));
const AdvancedSEOManager = lazy(() => import("../pages/admin/AdvancedSEOManager"));
const AdCampaignManager = lazy(() => import("../pages/admin/AdCampaignManager"));
const SmartPageBuilder = lazy(() => import("../pages/admin/SmartPageBuilder"));
const AINavigatorPanel = lazy(() => import("../pages/admin/AINavigatorPanel"));
const AdvancedContentHub = lazy(() => import("../pages/admin/AdvancedContentHub"));
const FeatureFlagsManager = lazy(() => import("../pages/admin/FeatureFlagsManager"));
const AdvancedCareerAnalyticsCommandCenter = lazy(() => import("../pages/admin/AdvancedAnalyticsDashboard"));
const PerformanceMonitoring = lazy(() => import("../pages/admin/PerformanceMonitoring"));
const IntegrationHub = lazy(() => import("../pages/admin/IntegrationHub"));
const BacklinkCommandCenter = lazy(() => import("../pages/admin/BacklinkDashboard"));
const LinkBuildingCommandCenter = lazy(() => import("../pages/admin/LinkBuildingDashboard"));
const AgentOperationsPage = lazy(() => import("../pages/admin/AgentOperations"));
const NewsAutomationPage = lazy(() => import("../pages/admin/NewsAutomationPage"));
const ProductRequirementDocument = lazy(() => import("../pages/admin/ProductRequirementDocument"));
const NewsManagement = lazy(() => import("../pages/admin/NewsManagement"));
const EdgeFunctionsMonitor = lazy(() => import("../pages/admin/EdgeFunctionsMonitor"));
const LinkedInImporter = lazy(() => import("../pages/admin/LinkedInImporter"));
const EnterpriseOverview = lazy(() => import("../pages/admin/EnterpriseOverview"));
const BulkUserImports = lazy(() => import("../pages/admin/BulkUserImports"));

// Static component imports (small components or wrappers stay static if needed, but pages must be lazy)
import { LinkedInImportManager } from "../components/admin/LinkedInImportManager";
import { TokenWallet } from "../components/blockchain/TokenWallet";
import { BotPostManager } from "../components/admin/BotPostManager";
import { BotIdentityManager } from "../components/admin/BotIdentityManager";
import { TestimonialsManagement } from "../components/admin/TestimonialsManagement";
import { VerificationManagement } from "../components/admin/VerificationManagement";
import { SecurityMonitoring } from "../components/admin/SecurityMonitoring";
import { ProUsersPage } from "../components/admin/ProUsersPage";
import { SEOCommandCenter } from "../components/admin/SEODashboard";
import { SEOCommandCenterNew } from "../components/admin/SEODashboardNew";
import { JobDataManager } from "../components/admin/JobDataManager";
import Phase1CommandCenter from "../components/network/Phase1Dashboard";


export const adminRoutes = [
  {
    title: "Admin Command Center",
    to: "/admin",
    icon: <Shield className="h-4 w-4" />,
    page: <AdminCommandCenter />,
    isPublic: true,
  },
  {
    title: "Bulk User Imports",
    to: "/admin/bulk-imports",
    icon: <Upload className="h-4 w-4" />,
    page: <BulkUserImports />,
    isPublic: true,
  },
  {
    title: "Phase 1",
    to: "/admin/phase1",
    icon: <Rocket className="h-4 w-4" />,
    page: <Phase1CommandCenter />,
    isPublic: true,
  },
  {
    title: "User Management",
    to: "/admin/users",
    icon: <Users className="h-4 w-4" />,
    page: <UserManagement />,
    isPublic: true,
  },
  {
    title: "Pro Users",
    to: "/admin/pro-users",
    icon: <Crown className="h-4 w-4" />,
    page: <ProUsersPage />,
    isPublic: true,
  },
  {
    title: "Testimonials",
    to: "/admin/testimonials",
    icon: <MessageSquare className="h-4 w-4" />,
    page: <TestimonialsManagement />,
    isPublic: true,
  },
  {
    title: "Verification",
    to: "/admin/verification",
    icon: <Shield className="h-4 w-4" />,
    page: <VerificationManagement />,
    isPublic: true,
  },
  {
    title: "Employer Requests",
    to: "/admin/employer-requests",
    icon: <Building2 className="h-4 w-4" />,
    page: <EmployerRequestsAdmin />,
    isPublic: true,
  },
  {
    title: "Jobs Management",
    to: "/admin/jobs",
    icon: <Briefcase className="h-4 w-4" />,
    page: <JobsManagement />,
    isPublic: true,
  },
  {
    title: "Job Data Quality",
    to: "/admin/jobs/quality",
    icon: <AlertTriangle className="h-4 w-4" />,
    page: <JobDataManager />,
    isPublic: true,
  },
  {
    title: "Companies Management",
    to: "/admin/companies",
    icon: <Building2 className="h-4 w-4" />,
    page: <CompaniesManagement />,
    isPublic: true,
  },
  {
    title: "Network Management",
    to: "/admin/network",
    icon: <Network className="h-4 w-4" />,
    page: <NetworkManagement />,
    isPublic: true,
  },
  {
    title: "Learning Management",
    to: "/admin/learning",
    icon: <GraduationCap className="h-4 w-4" />,
    page: <LearningManagement />,
    isPublic: true,
  },
  {
    title: "Colleges Management",
    to: "/admin/colleges",
    icon: <GraduationCap className="h-4 w-4" />,
    page: <CollegesManagement />,
    isPublic: true,
  },
  {
    title: "Career Map Management",
    to: "/admin/career-map",
    icon: <Map className="h-4 w-4" />,
    page: <CareerMapManagement />,
    isPublic: true,
  },
  {
    title: "Resume Management",
    to: "/admin/resumes",
    icon: <FileText className="h-4 w-4" />,
    page: <ResumeManagement />,
    isPublic: true,
  },
  {
    title: "Tools Management",
    to: "/admin/tools",
    icon: <Wrench className="h-4 w-4" />,
    page: <ToolsManagement />,
    isPublic: true,
  },
  {
    title: "Home Management",
    to: "/admin/home",
    icon: <Home className="h-4 w-4" />,
    page: <HomeManagement />,
    isPublic: true,
  },
  {
    title: "Career Analytics & Reports",
    to: "/admin/career-analytics",
    icon: <BarChart3 className="h-4 w-4" />,
    page: <CareerAnalyticsReports />,
    isPublic: true,
  },
  // Removed traditional pricing & payments - using TXC only
  {
    title: "Security Monitoring",
    to: "/admin/security",
    icon: <Lock className="h-4 w-4" />,
    page: <SecurityMonitoring />,
    isPublic: true,
  },
  {
    title: "Security Logs",
    to: "/admin/security-logs",
    icon: <Lock className="h-4 w-4" />,
    page: <SecurityLogs />,
    isPublic: true,
  },
  {
    title: "Email Automation",
    to: "/admin/email-automation", 
    icon: <Mail className="h-4 w-4" />,
    page: <EmailAutomationPage />,
    isPublic: true,
  },
  {
    title: "Talent Engine Training Center",
    to: "/admin/talent-engine-training",
    icon: <Wrench className="h-4 w-4" />,
    page: <AIMLTrainingCenter />,
    isPublic: true,
  },
  {
    title: "Talent Engine Management",
    to: "/admin/talent-engine-management",
    icon: <Wrench className="h-4 w-4" />,
    page: <AdminAIManagement />,
    isPublic: true,
  },
  {
    title: "Automation Management",
    to: "/admin/automation",
    icon: <Wrench className="h-4 w-4" />,
    page: <BotManagement />,
    isPublic: true,
  },
  {
    title: "Automation Post Manager",
    to: "/admin/automation-posts",
    icon: <Wrench className="h-4 w-4" />,
    page: <BotPostManager />,
    isPublic: true,
  },
  {
    title: "Automation Identity Manager",
    to: "/admin/automation-identity",
    icon: <Wrench className="h-4 w-4" />,
    page: <BotIdentityManager />,
    isPublic: true,
  },
  {
    title: "Navigator Operations",
    to: "/admin/agent-operations",
    icon: <Wrench className="h-4 w-4" />,
    page: <AgentOperationsPage />,
    isPublic: true,
  },
  {
    title: "Admin Management",
    to: "/admin/admins",
    icon: <Shield className="h-4 w-4" />,
    page: <AdminManagement />,
    isPublic: true,
  },
  {
    title: "Create Course",
    to: "/admin/learning/create",
    icon: <Plus className="h-4 w-4" />,
    page: <CreateCourse />,
    isPublic: true,
  },
  // Removed traditional pricing plan creation - using TXC only
  {
    title: "SEO Management",
    to: "/admin/seo",
    icon: <Search className="h-4 w-4" />,
    page: <SEOManagement />,
    isPublic: true,
  },
  {
    title: "Advanced SEO Manager",
    to: "/admin/advanced-seo",
    icon: <Search className="h-4 w-4" />,
    page: <AdvancedSEOManager />,
    isPublic: true,
  },
  {
    title: "SEO Sitemap Command Center",
    to: "/admin/seo-sitemap",
    icon: <Globe className="h-4 w-4" />,
    page: <SEOCommandCenter />,
    isPublic: true,
  },
  {
    title: "SEO Enhancement Command Center",
    to: "/admin/seo-enhancement",
    icon: <Search className="h-4 w-4" />,
    page: <SEOCommandCenterNew />,
    isPublic: true,
  },
  {
    title: "Content Generator",
    to: "/admin/content",
    icon: <FileText className="h-4 w-4" />,
    page: lazy(() => import('@/components/admin/ContentManagement').then(m => ({ default: m.ContentManagement }))),
    isPublic: true,
  },
  {
    title: "Ad Campaign Manager", 
    to: "/admin/ad-campaigns",
    icon: <Megaphone className="h-4 w-4" />,
    page: <AdCampaignManager />,
    isPublic: true,
  },
  {
    title: "Smart Page Builder",
    to: "/admin/page-builder", 
    icon: <Layout className="h-4 w-4" />,
    page: <SmartPageBuilder />,
    isPublic: true,
  },
  {
    title: "TalentXcel Navigator Panel",
    to: "/admin/navigator",
    icon: <Wrench className="h-4 w-4" />,
    page: <AINavigatorPanel />,
    isPublic: true,
  },
  {
    title: "Advanced Content Hub",
    to: "/admin/content-hub",
    icon: <FileText className="h-4 w-4" />,
    page: <AdvancedContentHub />,
    isPublic: true,
  },
  {
    title: "Feature Flags Manager",
    to: "/admin/feature-flags",
    icon: <Flag className="h-4 w-4" />,
    page: <FeatureFlagsManager />,
    isPublic: true,
  },
  {
    title: "Career Analytics Command Center",
    to: "/admin/career-analytics-command-center",
    icon: <BarChart3 className="h-4 w-4" />,
    page: <AdvancedCareerAnalyticsCommandCenter />,
    isPublic: true,
  },
  {
    title: "Performance Monitoring",
    to: "/admin/performance-monitoring",
    icon: <Shield className="h-4 w-4" />,
    page: <PerformanceMonitoring />,
    isPublic: true,
  },
  {
    title: "Integration Hub",
    to: "/admin/integration-hub",
    icon: <Network className="h-4 w-4" />,
    page: <IntegrationHub />,
    isPublic: true,
  },
  {
    title: "Link Building Command Center",
    to: "/admin/link-building",
    icon: <Link className="h-4 w-4" />,
    page: <LinkBuildingCommandCenter />,
    isPublic: true,
  },
  {
    title: "Backlink System",
    to: "/admin/backlinks",
    icon: <Network className="h-4 w-4" />,
    page: <BacklinkCommandCenter />,
    isPublic: true,
  },
  {
    title: "News Automation",
    to: "/admin/news-automation",
    icon: <Newspaper className="h-4 w-4" />,
    page: <NewsAutomationPage />,
    isPublic: true,
  },
  {
    title: "Product Requirements (PRD)",
    to: "/admin/prd", 
    icon: <FileText className="h-4 w-4" />,
    page: <ProductRequirementDocument />,
    isPublic: true,
  },
  {
    title: "LinkedIn Import Manager",
    to: "/admin/linkedin-import",
    icon: <Upload className="h-4 w-4" />,
    page: <LinkedInImportManager />,
    isPublic: true,
  },
  {
    title: "Token Wallet System",
    to: "/admin/token-wallet",
    icon: <Coins className="h-4 w-4" />,
    page: <TokenWallet />,
    isPublic: true,
  },
  {
    title: "TXC Token Management",
    to: "/admin/txc-tokens",
    icon: <Coins className="h-4 w-4" />,
    page: <TXCTokenManagement />,
    isPublic: true,
  },
  {
    title: "TXC Awards & Bonuses",
    to: "/admin/txc-awards",
    icon: <Coins className="h-4 w-4" />,
    page: <TXCAwardsAndBonuses />,
    isPublic: true,
  },
  {
    title: "TXC Backfill System",
    to: "/admin/txc-backfill",
    icon: <Coins className="h-4 w-4" />,
    page: <TXCBackfill />,
    isPublic: true,
  },
  {
    title: "TXC Career Analytics",
    to: "/admin/txc-career-analytics",
    icon: <BarChart3 className="h-4 w-4" />,
    page: <TXCCareerAnalytics />,
    isPublic: true,
  },
  {
    title: "TXC Store",
    to: "/admin/txc-store",
    icon: <Coins className="h-4 w-4" />,
    page: <TXCStore />,
    isPublic: true,
  },
  {
    title: "TXC Spending History",
    to: "/admin/txc-spending",
    icon: <Coins className="h-4 w-4" />,
    page: <TXCSpendingHistory />,
    isPublic: true,
  },
  {
    title: "LinkedIn Bulk Upload",
    to: "/admin/linkedin-bulk-upload",
    icon: <Upload className="h-4 w-4" />,
    page: <LinkedInBulkUpload />,
    isPublic: true,
  },
  {
    title: "LinkedIn Job Scraper",
    to: "/admin/linkedin-scraper",
    icon: <Wrench className="h-4 w-4" />,
    page: <LinkedInJobScraper />,
    isPublic: true,
  },
  {
    title: "LinkedIn Career Analytics",
    to: "/admin/linkedin-career-analytics",
    icon: <BarChart3 className="h-4 w-4" />,
    page: <LinkedInCareerAnalytics />,
    isPublic: true,
  },
  {
    title: "Enterprise Solutions",
    to: "/admin/enterprise",
    icon: <Building2 className="h-4 w-4" />,
    page: <EnterpriseSolutions />,
    isPublic: true,
  },
  {
    title: "Enterprise Career Analytics",
    to: "/admin/enterprise/career-analytics",
    icon: <BarChart3 className="h-4 w-4" />,
    page: <EnterpriseCareerAnalytics />,
    isPublic: true,
  },
  {
    title: "Enterprise Clients",
    to: "/admin/enterprise/clients",
    icon: <Building2 className="h-4 w-4" />,
    page: <EnterpriseClients />,
    isPublic: true,
  },
  {
    title: "Enterprise Billing",
    to: "/admin/enterprise/billing",
    icon: <CreditCard className="h-4 w-4" />,
    page: <EnterpriseBilling />,
    isPublic: true,
  },
  {
    title: "SEO Suite",
    to: "/admin/seo-suite",
    icon: <Search className="h-4 w-4" />,
    page: <SEOSuite />,
    isPublic: true,
  },
  {
    title: "SEO Automation Command Center",
    to: "/admin/seo-command-center",
    icon: <Rocket className="h-4 w-4" />,
    page: lazy(() => import('../pages/SEODashboard').then(m => ({ default: m.default }))),
    requiresAdminAccess: true,
    isPublic: true,
  },
  {
    title: "Talent Database",
    to: "/admin/talent-database",
    icon: <Database className="h-4 w-4" />,
    page: <TalentDatabase />,
    isPublic: true,
  },
  {
    title: "Career Platform",
    to: "/admin/career-platform",
    icon: <Rocket className="h-4 w-4" />,
    page: <CareerPlatform />,
    isPublic: true,
  },
  {
    title: "News Management",
    to: "/admin/news-management",
    icon: <Newspaper className="h-4 w-4" />,
    page: <NewsManagement />,
    isPublic: true,
  },
  {
    title: "Edge Functions Monitor",
    to: "/admin/edge-functions-monitor",
    icon: <Eye className="h-4 w-4" />,
    page: <EdgeFunctionsMonitor />,
    isPublic: true,
  },
  {
    title: "LinkedIn Importer",
    to: "/admin/linkedin-importer",
    icon: <Upload className="h-4 w-4" />,
    page: <LinkedInImporter />,
    isPublic: true,
  },
  {
    title: "Enterprise Overview",
    to: "/admin/enterprise-overview",
    icon: <Building2 className="h-4 w-4" />,
    page: <EnterpriseOverview />,
    isPublic: true,
  }
];




