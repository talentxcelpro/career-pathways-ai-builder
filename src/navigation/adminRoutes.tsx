import { lazy, Suspense } from 'react';;
import { Shield, Users, Building2, Home, Network, Briefcase, FileText, Wrench, GraduationCap, Map, CreditCard, BarChart3, Lock, Plus, Mail, Brain, Crown, MessageSquare, Search, Megaphone, Layout, Flag, Bot, Globe, AlertTriangle, Link, Newspaper, Coins, Upload, Database, Rocket, Eye, Target, TrendingUp, Calendar } from "lucide-react";

const BulkUserImports = lazy(() => import('../pages/admin/BulkUserImports'));
const SocialMarketingDashboard = lazy(() => import('../pages/admin/SocialMarketingDashboard'));
const SocialContentStudio = lazy(() => import('../pages/admin/SocialContentStudio'));
const SocialMarketingCalendar = lazy(() => import('../pages/admin/SocialMarketingCalendar'));
const Phase1Dashboard = lazy(() => import('../components/network/Phase1Dashboard'));
const EnterpriseOverview = lazy(() => import('../pages/admin/EnterpriseOverview'));
const LinkedInImporter = lazy(() => import('../pages/admin/LinkedInImporter'));
const EdgeFunctionsMonitor = lazy(() => import('../pages/admin/EdgeFunctionsMonitor'));
const NewsManagement = lazy(() => import('../pages/admin/NewsManagement'));
const ProductRequirementDocument = lazy(() => import('../pages/admin/ProductRequirementDocument'));
const NewsAutomationPage = lazy(() => import('../pages/admin/NewsAutomationPage'));
const AgentOperationsPage = lazy(() => import('../pages/admin/AgentOperations'));
const EducationAgentControlCenter = lazy(() => import('../pages/admin/EducationAgentControlCenter'));
const LinkBuildingDashboard = lazy(() => import('../pages/admin/LinkBuildingDashboard'));
const JobDataManager = lazy(() => import('../components/admin/JobDataManager').then(m => ({ default: m.JobDataManager })));
const SEODashboardNew = lazy(() => import('../components/admin/SEODashboardNew').then(m => ({ default: m.SEODashboardNew })));
const SEODashboard = lazy(() => import('../components/admin/SEODashboard').then(m => ({ default: m.SEODashboard })));
const BacklinkDashboard = lazy(() => import('../pages/admin/BacklinkDashboard'));
const IntegrationHub = lazy(() => import('../pages/admin/IntegrationHub'));
const PerformanceMonitoring = lazy(() => import('../pages/admin/PerformanceMonitoring'));
const AdvancedAnalyticsDashboard = lazy(() => import('../pages/admin/AdvancedAnalyticsDashboard'));
const FeatureFlagsManager = lazy(() => import('../pages/admin/FeatureFlagsManager'));
const AdvancedContentHub = lazy(() => import('../pages/admin/AdvancedContentHub'));
const AIAssistantPanel = lazy(() => import('../pages/admin/AIAssistantPanel'));
const SmartPageBuilder = lazy(() => import('../pages/admin/SmartPageBuilder'));
const AdCampaignManager = lazy(() => import('../pages/admin/AdCampaignManager'));
const AdvancedSEOManager = lazy(() => import('../pages/admin/AdvancedSEOManager'));
const SEOManagement = lazy(() => import('../pages/admin/SEOManagement'));
const ProUsersPage = lazy(() => import('../components/admin/ProUsersPage').then(m => ({ default: m.ProUsersPage })));
const CollegesManagement = lazy(() => import('../pages/admin/CollegesManagement'));
const BotManagement = lazy(() => import('../pages/admin/BotManagement'));
const AdminAIManagement = lazy(() => import('../pages/AdminAIManagement'));
const AIMLTrainingCenter = lazy(() => import('../pages/admin/AIMLTrainingCenter'));
const EmailAutomationPage = lazy(() => import('../pages/admin/EmailAutomation'));
const CreateCourse = lazy(() => import('../pages/admin/learning/CreateCourse'));
const SecurityMonitoring = lazy(() => import('../components/admin/SecurityMonitoring'));
const SecurityLogs = lazy(() => import('../pages/admin/SecurityLogs'));
const AnalyticsReports = lazy(() => import('../pages/admin/AnalyticsReports'));
const CareerMapManagement = lazy(() => import('../pages/admin/CareerMapManagement'));
const LearningManagement = lazy(() => import('../pages/admin/LearningManagement'));
const CompaniesManagement = lazy(() => import('../pages/admin/CompaniesManagement'));
const ToolsManagement = lazy(() => import('../pages/admin/ToolsManagement'));
const ResumeManagement = lazy(() => import('../pages/admin/ResumeManagement'));
const JobsManagement = lazy(() => import('../pages/admin/JobsManagement'));
const NetworkManagement = lazy(() => import('../pages/admin/NetworkManagement'));
const HomeManagement = lazy(() => import('../pages/admin/HomeManagement'));
const UserManagement = lazy(() => import('../pages/admin/UserManagement'));
const AdminManagement = lazy(() => import('../pages/admin/AdminManagement'));
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const EmployerRequestsAdmin = lazy(() => import('../pages/admin/EmployerRequestsAdmin'));
const Claim1Admin = lazy(() => import('../pages/admin/Claim1Admin'));
const AutonomousGrowthOS = lazy(() => import('../pages/admin/AutonomousGrowthOS'));
const AutonomousBusinessControlPlane = lazy(() => import('../pages/admin/AutonomousBusinessControlPlane'));
const VerificationManagement = lazy(() => import('../components/admin/VerificationManagement').then(m => ({ default: m.VerificationManagement })));
const TestimonialsManagement = lazy(() => import('../components/admin/TestimonialsManagement').then(m => ({ default: m.TestimonialsManagement })));
const BotIdentityManager = lazy(() => import('../components/admin/BotIdentityManager').then(m => ({ default: m.BotIdentityManager })));
const CareerPlatform = lazy(() => import('../pages/admin/CareerPlatform'));
const TalentDatabase = lazy(() => import('../pages/admin/TalentDatabase'));
const SEOSuite = lazy(() => import('../pages/admin/SEOSuite'));
const EnterpriseBilling = lazy(() => import('../pages/admin/EnterpriseBilling'));
const GoogleJobPostingHealth = lazy(() => import('../pages/admin/GoogleJobPostingHealth'));
const GoogleSearchHealthCenter = lazy(() => import('../pages/admin/GoogleSearchHealthCenter'));
const AIOrganizationControlCenter = lazy(() => import('../pages/admin/AIOrganizationControlCenter'));
const GrowthOperationsCenter = lazy(() => import('../pages/admin/GrowthOperationsCenter'));
const SearchEntityDashboard = lazy(() => import('../pages/admin/SearchEntityDashboard'));
const OrganicAcquisitionDashboard = lazy(() => import('../pages/admin/OrganicAcquisitionDashboard'));
const EnterpriseClients = lazy(() => import('../pages/admin/EnterpriseClients'));
const EnterpriseAnalytics = lazy(() => import('../pages/admin/EnterpriseAnalytics'));
const EnterpriseSolutions = lazy(() => import('../pages/admin/EnterpriseSolutions'));
const LinkedInAnalytics = lazy(() => import('../pages/admin/LinkedInAnalytics'));
const LinkedInJobScraper = lazy(() => import('../pages/admin/LinkedInJobScraper'));
const LinkedInBulkUpload = lazy(() => import('../pages/admin/LinkedInBulkUpload'));
const TXCSpendingHistory = lazy(() => import('../pages/admin/TXCSpendingHistory'));
const TXCStore = lazy(() => import('../pages/admin/TXCStore'));
const TXCBackfill = lazy(() => import('../pages/admin/TXCBackfill'));
const TXCAnalytics = lazy(() => import('../pages/admin/TXCAnalytics'));
const TXCAwardsAndBonuses = lazy(() => import('../pages/admin/TXCAwardsAndBonuses'));
const BotPostManager = lazy(() => import('../components/admin/BotPostManager').then(m => ({ default: m.BotPostManager })));
const TokenWallet = lazy(() => import('../components/blockchain/TokenWallet').then(m => ({ default: m.TokenWallet })));
const TXCTokenManagement = lazy(() => import('../pages/admin/TXCTokenManagement'));
const TXCPricing = lazy(() => import('../pages/TXCPricing'));
const LinkedInImportManager = lazy(() => import('../components/admin/LinkedInImportManager').then(m => ({ default: m.LinkedInImportManager })));
// Using TXC Token Economy for Pricing

export const adminRoutes = [
  {
    title: "Admin Dashboard",
    to: "/admin",
    icon: <Shield className="h-4 w-4" />,
    page: <Suspense fallback={null}><AdminDashboard /></Suspense>,
    isPublic: true,
  },
  {
    title: "Autonomous Growth OS",
    to: "/admin/autonomous-os",
    icon: <Rocket className="h-4 w-4" />,
    page: <Suspense fallback={null}><AutonomousGrowthOS /></Suspense>,
    isPublic: true,
  },
  {
    title: "Claim #1",
    to: "/admin/claim1",
    icon: <Crown className="h-4 w-4" />,
    page: <Suspense fallback={null}><Claim1Admin /></Suspense>,
    isPublic: true,
  },
  {
    title: "Bulk User Imports",
    to: "/admin/bulk-imports",
    icon: <Upload className="h-4 w-4" />,
    page: <Suspense fallback={null}><BulkUserImports /></Suspense>,
    isPublic: true,
  },
  {
    title: "Phase 1",
    to: "/admin/phase1",
    icon: <Rocket className="h-4 w-4" />,
    page: <Suspense fallback={null}><Phase1Dashboard /></Suspense>,
    isPublic: true,
  },
  {
    title: "User Management",
    to: "/admin/users",
    icon: <Users className="h-4 w-4" />,
    page: <Suspense fallback={null}><UserManagement /></Suspense>,
    isPublic: true,
  },
  {
    title: "Pro Users",
    to: "/admin/pro-users",
    icon: <Crown className="h-4 w-4" />,
    page: <Suspense fallback={null}><ProUsersPage /></Suspense>,
    isPublic: true,
  },
  {
    title: "Testimonials",
    to: "/admin/testimonials",
    icon: <MessageSquare className="h-4 w-4" />,
    page: <Suspense fallback={null}><TestimonialsManagement /></Suspense>,
    isPublic: true,
  },
  {
    title: "Verification",
    to: "/admin/verification",
    icon: <Shield className="h-4 w-4" />,
    page: <Suspense fallback={null}><VerificationManagement /></Suspense>,
    isPublic: true,
  },
  {
    title: "Employer Requests",
    to: "/admin/employer-requests",
    icon: <Building2 className="h-4 w-4" />,
    page: <Suspense fallback={null}><EmployerRequestsAdmin /></Suspense>,
    isPublic: true,
  },
  {
    title: "Jobs Management",
    to: "/admin/jobs",
    icon: <Briefcase className="h-4 w-4" />,
    page: <Suspense fallback={null}><JobsManagement /></Suspense>,
    isPublic: true,
  },
  {
    title: "Job Data Quality",
    to: "/admin/jobs/quality",
    icon: <AlertTriangle className="h-4 w-4" />,
    page: <Suspense fallback={null}><JobDataManager /></Suspense>,
    isPublic: true,
  },
  {
    title: "Companies Management",
    to: "/admin/companies",
    icon: <Building2 className="h-4 w-4" />,
    page: <Suspense fallback={null}><CompaniesManagement /></Suspense>,
    isPublic: true,
  },
  {
    title: "Network Management",
    to: "/admin/network",
    icon: <Network className="h-4 w-4" />,
    page: <Suspense fallback={null}><NetworkManagement /></Suspense>,
    isPublic: true,
  },
  {
    title: "Learning Management",
    to: "/admin/learning",
    icon: <GraduationCap className="h-4 w-4" />,
    page: <Suspense fallback={null}><LearningManagement /></Suspense>,
    isPublic: true,
  },
  {
    title: "Colleges Management",
    to: "/admin/colleges",
    icon: <GraduationCap className="h-4 w-4" />,
    page: <Suspense fallback={null}><CollegesManagement /></Suspense>,
    isPublic: true,
  },
  {
    title: "Career Map Management",
    to: "/admin/career-map",
    icon: <Map className="h-4 w-4" />,
    page: <Suspense fallback={null}><CareerMapManagement /></Suspense>,
    isPublic: true,
  },
  {
    title: "Resume Management",
    to: "/admin/resumes",
    icon: <FileText className="h-4 w-4" />,
    page: <Suspense fallback={null}><ResumeManagement /></Suspense>,
    isPublic: true,
  },
  {
    title: "Tools Management",
    to: "/admin/tools",
    icon: <Wrench className="h-4 w-4" />,
    page: <Suspense fallback={null}><ToolsManagement /></Suspense>,
    isPublic: true,
  },
  {
    title: "Home Management",
    to: "/admin/home",
    icon: <Home className="h-4 w-4" />,
    page: <Suspense fallback={null}><HomeManagement /></Suspense>,
    isPublic: true,
  },
  {
    title: "Analytics & Reports",
    to: "/admin/analytics",
    icon: <BarChart3 className="h-4 w-4" />,
    page: <Suspense fallback={null}><AnalyticsReports /></Suspense>,
    isPublic: true,
  },
  // Removed traditional pricing & payments - using TXC only
  {
    title: "Security Monitoring",
    to: "/admin/security",
    icon: <Lock className="h-4 w-4" />,
    page: <Suspense fallback={null}><SecurityMonitoring /></Suspense>,
    isPublic: true,
  },
  {
    title: "Security Logs",
    to: "/admin/security-logs",
    icon: <Lock className="h-4 w-4" />,
    page: <Suspense fallback={null}><SecurityLogs /></Suspense>,
    isPublic: true,
  },
  {
    title: "Email Automation",
    to: "/admin/email-automation", 
    icon: <Mail className="h-4 w-4" />,
    page: <Suspense fallback={null}><EmailAutomationPage /></Suspense>,
    isPublic: true,
  },
  {
    title: "AI/ML Training Center",
    to: "/admin/ai-ml-training",
    icon: <Brain className="h-4 w-4" />,
    page: <Suspense fallback={null}><AIMLTrainingCenter /></Suspense>,
    isPublic: true,
  },
  {
    title: "AI Management",
    to: "/admin/ai-management",
    icon: <Brain className="h-4 w-4" />,
    page: <Suspense fallback={null}><AdminAIManagement /></Suspense>,
    isPublic: true,
  },
  {
    title: "Bot Management",
    to: "/admin/bots",
    icon: <Bot className="h-4 w-4" />,
    page: <Suspense fallback={null}><BotManagement /></Suspense>,
    isPublic: true,
  },
  {
    title: "Bot Post Manager",
    to: "/admin/bot-posts",
    icon: <Bot className="h-4 w-4" />,
    page: <Suspense fallback={null}><BotPostManager /></Suspense>,
    isPublic: true,
  },
  {
    title: "Bot Identity Manager",
    to: "/admin/bot-identity",
    icon: <Bot className="h-4 w-4" />,
    page: <Suspense fallback={null}><BotIdentityManager /></Suspense>,
    isPublic: true,
  },
  {
    title: "AI Agent Operations",
    to: "/admin/agent-operations",
    icon: <Bot className="h-4 w-4" />,
    page: <Suspense fallback={null}><AgentOperationsPage /></Suspense>,
    isPublic: true,
  },
  {
    title: "Admin Management",
    to: "/admin/admins",
    icon: <Shield className="h-4 w-4" />,
    page: <Suspense fallback={null}><AdminManagement /></Suspense>,
    isPublic: true,
  },
  {
    title: "Create Course",
    to: "/admin/learning/create",
    icon: <Plus className="h-4 w-4" />,
    page: <Suspense fallback={null}><CreateCourse /></Suspense>,
    isPublic: true,
  },
  {
    title: "TXC Pricing Plans",
    to: "/admin/pricing/create",
    icon: <CreditCard className="h-4 w-4" />,
    page: <Suspense fallback={null}><TXCPricing /></Suspense>,
    isPublic: true,
  },
  {
    title: "SEO Management",
    to: "/admin/seo",
    icon: <Search className="h-4 w-4" />,
    page: <Suspense fallback={null}><SEOManagement /></Suspense>,
    isPublic: true,
  },
  {
    title: "Advanced SEO Manager",
    to: "/admin/advanced-seo",
    icon: <Search className="h-4 w-4" />,
    page: <Suspense fallback={null}><AdvancedSEOManager /></Suspense>,
    isPublic: true,
  },
  {
    title: "SEO Sitemap Dashboard",
    to: "/admin/seo-sitemap",
    icon: <Globe className="h-4 w-4" />,
    page: <Suspense fallback={null}><SEODashboard /></Suspense>,
    isPublic: true,
  },
  {
    title: "SEO Enhancement Dashboard",
    to: "/admin/seo-enhancement",
    icon: <Search className="h-4 w-4" />,
    page: <Suspense fallback={null}><SEODashboardNew /></Suspense>,
    isPublic: true,
  },
  {
    title: "AI Content Generator",
    to: "/admin/content",
    icon: <Brain className="h-4 w-4" />,
    page: lazy(() => import('@/components/admin/ContentManagement').then(m => ({ default: m.ContentManagement }))),
    isPublic: true,
  },
  {
    title: "Ad Campaign Manager", 
    to: "/admin/ad-campaigns",
    icon: <Megaphone className="h-4 w-4" />,
    page: <Suspense fallback={null}><AdCampaignManager /></Suspense>,
    isPublic: true,
  },
  {
    title: "Smart Page Builder",
    to: "/admin/page-builder", 
    icon: <Layout className="h-4 w-4" />,
    page: <Suspense fallback={null}><SmartPageBuilder /></Suspense>,
    isPublic: true,
  },
  {
    title: "AI Assistant Panel",
    to: "/admin/ai-assistant",
    icon: <Brain className="h-4 w-4" />,
    page: <Suspense fallback={null}><AIAssistantPanel /></Suspense>,
    isPublic: true,
  },
  {
    title: "Advanced Content Hub",
    to: "/admin/content-hub",
    icon: <FileText className="h-4 w-4" />,
    page: <Suspense fallback={null}><AdvancedContentHub /></Suspense>,
    isPublic: true,
  },
  {
    title: "Feature Flags Manager",
    to: "/admin/feature-flags",
    icon: <Flag className="h-4 w-4" />,
    page: <Suspense fallback={null}><FeatureFlagsManager /></Suspense>,
    isPublic: true,
  },
  {
    title: "Analytics Dashboard",
    to: "/admin/analytics-dashboard",
    icon: <BarChart3 className="h-4 w-4" />,
    page: <Suspense fallback={null}><AdvancedAnalyticsDashboard /></Suspense>,
    isPublic: true,
  },
  {
    title: "Performance Monitoring",
    to: "/admin/performance-monitoring",
    icon: <Shield className="h-4 w-4" />,
    page: <Suspense fallback={null}><PerformanceMonitoring /></Suspense>,
    isPublic: true,
  },
  {
    title: "Integration Hub",
    to: "/admin/integration-hub",
    icon: <Network className="h-4 w-4" />,
    page: <Suspense fallback={null}><IntegrationHub /></Suspense>,
    isPublic: true,
  },
  {
    title: "Link Building Command Center",
    to: "/admin/link-building",
    icon: <Link className="h-4 w-4" />,
    page: <Suspense fallback={null}><LinkBuildingDashboard /></Suspense>,
    isPublic: true,
  },
  {
    title: "Backlink System",
    to: "/admin/backlinks",
    icon: <Network className="h-4 w-4" />,
    page: <Suspense fallback={null}><BacklinkDashboard /></Suspense>,
    isPublic: true,
  },
  {
    title: "News Automation",
    to: "/admin/news-automation",
    icon: <Newspaper className="h-4 w-4" />,
    page: <Suspense fallback={null}><NewsAutomationPage /></Suspense>,
    isPublic: true,
  },
  {
    title: "Product Requirements (PRD)",
    to: "/admin/prd", 
    icon: <FileText className="h-4 w-4" />,
    page: <Suspense fallback={null}><ProductRequirementDocument /></Suspense>,
    isPublic: true,
  },
  {
    title: "LinkedIn Import Manager",
    to: "/admin/linkedin-import",
    icon: <Upload className="h-4 w-4" />,
    page: <Suspense fallback={null}><LinkedInImportManager /></Suspense>,
    isPublic: true,
  },
  {
    title: "Token Wallet System",
    to: "/admin/token-wallet",
    icon: <Coins className="h-4 w-4" />,
    page: <Suspense fallback={null}><TokenWallet /></Suspense>,
    isPublic: true,
  },
  {
    title: "TXC Token Management",
    to: "/admin/txc-tokens",
    icon: <Coins className="h-4 w-4" />,
    page: <Suspense fallback={null}><TXCTokenManagement /></Suspense>,
    isPublic: true,
  },
  {
    title: "TXC Awards & Bonuses",
    to: "/admin/txc-awards",
    icon: <Coins className="h-4 w-4" />,
    page: <Suspense fallback={null}><TXCAwardsAndBonuses /></Suspense>,
    isPublic: true,
  },
  {
    title: "TXC Backfill System",
    to: "/admin/txc-backfill",
    icon: <Coins className="h-4 w-4" />,
    page: <Suspense fallback={null}><TXCBackfill /></Suspense>,
    isPublic: true,
  },
  {
    title: "TXC Analytics",
    to: "/admin/txc-analytics",
    icon: <BarChart3 className="h-4 w-4" />,
    page: <Suspense fallback={null}><TXCAnalytics /></Suspense>,
    isPublic: true,
  },
  {
    title: "TXC Store",
    to: "/admin/txc-store",
    icon: <Coins className="h-4 w-4" />,
    page: <Suspense fallback={null}><TXCStore /></Suspense>,
    isPublic: true,
  },
  {
    title: "TXC Spending History",
    to: "/admin/txc-spending",
    icon: <Coins className="h-4 w-4" />,
    page: <Suspense fallback={null}><TXCSpendingHistory /></Suspense>,
    isPublic: true,
  },
  {
    title: "LinkedIn Bulk Upload",
    to: "/admin/linkedin-bulk-upload",
    icon: <Upload className="h-4 w-4" />,
    page: <Suspense fallback={null}><LinkedInBulkUpload /></Suspense>,
    isPublic: true,
  },
  {
    title: "LinkedIn Job Scraper",
    to: "/admin/linkedin-scraper",
    icon: <Bot className="h-4 w-4" />,
    page: <Suspense fallback={null}><LinkedInJobScraper /></Suspense>,
    isPublic: true,
  },
  {
    title: "LinkedIn Analytics",
    to: "/admin/linkedin-analytics",
    icon: <BarChart3 className="h-4 w-4" />,
    page: <Suspense fallback={null}><LinkedInAnalytics /></Suspense>,
    isPublic: true,
  },
  {
    title: "Enterprise Solutions",
    to: "/admin/enterprise",
    icon: <Building2 className="h-4 w-4" />,
    page: <Suspense fallback={null}><EnterpriseSolutions /></Suspense>,
    isPublic: true,
  },
  {
    title: "Enterprise Analytics",
    to: "/admin/enterprise/analytics",
    icon: <BarChart3 className="h-4 w-4" />,
    page: <Suspense fallback={null}><EnterpriseAnalytics /></Suspense>,
    isPublic: true,
  },
  {
    title: "Enterprise Clients",
    to: "/admin/enterprise/clients",
    icon: <Building2 className="h-4 w-4" />,
    page: <Suspense fallback={null}><EnterpriseClients /></Suspense>,
    isPublic: true,
  },
  {
    title: "Enterprise Billing",
    to: "/admin/enterprise/billing",
    icon: <CreditCard className="h-4 w-4" />,
    page: <Suspense fallback={null}><EnterpriseBilling /></Suspense>,
    isPublic: true,
  },
  {
    title: "SEO Suite",
    to: "/admin/seo-suite",
    icon: <Search className="h-4 w-4" />,
    page: <Suspense fallback={null}><SEOSuite /></Suspense>,
    isPublic: true,
  },
  {
    title: "Organic Acquisition OS",
    to: "/admin/seo/acquisition",
    icon: <Target className="h-4 w-4 text-emerald-400" />,
    page: <Suspense fallback={null}><OrganicAcquisitionDashboard /></Suspense>,
    isPublic: true,
  },
  {
    title: "Search Entity Graph",
    to: "/admin/seo/entities",
    icon: <Network className="h-4 w-4 text-purple-400" />,
    page: <Suspense fallback={null}><SearchEntityDashboard /></Suspense>,
    isPublic: true,
  },
  {
    title: "Google Search Health Center",
    to: "/admin/seo/google",
    icon: <Search className="h-4 w-4 text-sky-400" />,
    page: <Suspense fallback={null}><GoogleSearchHealthCenter /></Suspense>,
    isPublic: true,
  },
  {
    title: "Google Job Postings Sync",
    to: "/admin/seo/google-jobs",
    icon: <Briefcase className="h-4 w-4" />,
    page: <Suspense fallback={null}><GoogleJobPostingHealth /></Suspense>,
    isPublic: true,
  },
  {
    title: "SEO Automation Dashboard",
    to: "/admin/seo-dashboard",
    icon: <Rocket className="h-4 w-4" />,
    page: lazy(() => import('../pages/SEODashboard').then(m => ({ default: m.default }))),
    requiresAdminAccess: true,
    isPublic: true,
  },
  {
    title: "Talent Database",
    to: "/admin/talent-database",
    icon: <Database className="h-4 w-4" />,
    page: <Suspense fallback={null}><TalentDatabase /></Suspense>,
    isPublic: true,
  },
  {
    title: "Career Platform",
    to: "/admin/career-platform",
    icon: <Rocket className="h-4 w-4" />,
    page: <Suspense fallback={null}><CareerPlatform /></Suspense>,
    isPublic: true,
  },
  {
    title: "News Management",
    to: "/admin/news-management",
    icon: <Newspaper className="h-4 w-4" />,
    page: <Suspense fallback={null}><NewsManagement /></Suspense>,
    isPublic: true,
  },
  {
    title: "Edge Functions Monitor",
    to: "/admin/edge-functions-monitor",
    icon: <Eye className="h-4 w-4" />,
    page: <Suspense fallback={null}><EdgeFunctionsMonitor /></Suspense>,
    isPublic: true,
  },
  {
    title: "LinkedIn Importer",
    to: "/admin/linkedin-importer",
    icon: <Upload className="h-4 w-4" />,
    page: <Suspense fallback={null}><LinkedInImporter /></Suspense>,
    isPublic: true,
  },
  {
    title: "Enterprise Overview",
    to: "/admin/enterprise-overview",
    icon: <Building2 className="h-4 w-4" />,
    page: <Suspense fallback={null}><EnterpriseOverview /></Suspense>,
    isPublic: true,
  },
  {
    title: "Education Intelligence Agent",
    to: "/admin/education-agent",
    icon: <GraduationCap className="h-4 w-4" />,
    page: <Suspense fallback={null}><EducationAgentControlCenter /></Suspense>,
    isPublic: true,
  },
  {
    title: "Autonomous Business OS",
    to: "/admin/autonomous-os",
    icon: <Bot className="h-4 w-4 text-primary" />,
    page: <Suspense fallback={null}><AutonomousBusinessControlPlane /></Suspense>,
    isPublic: true,
  },
  {
    title: "AI Growth Organization",
    to: "/admin/ai-organization",
    icon: <Bot className="h-4 w-4 text-purple-400" />,
    page: <Suspense fallback={null}><AIOrganizationControlCenter /></Suspense>,
    isPublic: true,
  },
  {
    title: "Growth Operations Center",
    to: "/admin/growth-operations",
    icon: <TrendingUp className="h-4 w-4 text-emerald-400" />,
    page: <Suspense fallback={null}><GrowthOperationsCenter /></Suspense>,
    isPublic: true,
  },
  {
    title: "AI Content Factory",
    to: "/admin/social-marketing",
    icon: <Bot className="h-4 w-4 text-blue-400" />,
    page: <Suspense fallback={null}><SocialMarketingDashboard /></Suspense>,
    isPublic: true,
  },
  {
    title: "Social Content Studio",
    to: "/admin/social-marketing/studio",
    icon: <Rocket className="h-4 w-4 text-pink-400" />,
    page: <Suspense fallback={null}><SocialContentStudio /></Suspense>,
    isPublic: true,
  },
  {
    title: "Content Review Calendar",
    to: "/admin/social-marketing/calendar",
    icon: <Calendar className="h-4 w-4 text-amber-400" />,
    page: <Suspense fallback={null}><SocialMarketingCalendar /></Suspense>,
    isPublic: true,
  }
];

