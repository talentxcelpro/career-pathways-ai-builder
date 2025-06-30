
import { Shield, Users, Building2, Home, Network, Briefcase, FileText, Wrench, GraduationCap, Map, CreditCard, BarChart3, Lock } from "lucide-react";
import EmployerRequests from "../pages/admin/EmployerRequests";
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

export const adminRoutes = [
  {
    title: "Admin Dashboard",
    to: "/admin",
    icon: <Shield className="h-4 w-4" />,
    page: <AdminDashboard />,
    requiresAuth: true,
    permission: "canAccessDashboard" as const,
  },
  {
    title: "Admin Management",
    to: "/admin/admins",
    icon: <Shield className="h-4 w-4" />,
    page: <AdminManagement />,
    requiresAuth: true,
    permission: "canAccessAdmins" as const,
  },
  {
    title: "User Management",
    to: "/admin/users",
    icon: <Users className="h-4 w-4" />,
    page: <UserManagement />,
    requiresAuth: true,
    permission: "canAccessUsers" as const,
  },
  {
    title: "Home Management",
    to: "/admin/home",
    icon: <Home className="h-4 w-4" />,
    page: <HomeManagement />,
    requiresAuth: true,
    permission: "canAccessDashboard" as const,
  },
  {
    title: "Network Management",
    to: "/admin/network",
    icon: <Network className="h-4 w-4" />,
    page: <NetworkManagement />,
    requiresAuth: true,
    permission: "canAccessNetwork" as const,
  },
  {
    title: "Jobs Management",
    to: "/admin/jobs",
    icon: <Briefcase className="h-4 w-4" />,
    page: <JobsManagement />,
    requiresAuth: true,
    permission: "canAccessJobs" as const,
  },
  {
    title: "Resume Management",
    to: "/admin/resumes",
    icon: <FileText className="h-4 w-4" />,
    page: <ResumeManagement />,
    requiresAuth: true,
    permission: "canAccessResumes" as const,
  },
  {
    title: "Tools Management",
    to: "/admin/tools",
    icon: <Wrench className="h-4 w-4" />,
    page: <ToolsManagement />,
    requiresAuth: true,
    permission: "canAccessTools" as const,
  },
  {
    title: "Companies Management",
    to: "/admin/companies",
    icon: <Building2 className="h-4 w-4" />,
    page: <CompaniesManagement />,
    requiresAuth: true,
    permission: "canAccessCompanies" as const,
  },
  {
    title: "Learning Management",
    to: "/admin/learning",
    icon: <GraduationCap className="h-4 w-4" />,
    page: <LearningManagement />,
    requiresAuth: true,
    permission: "canAccessLearning" as const,
  },
  {
    title: "Career Map Management",
    to: "/admin/career-map",
    icon: <Map className="h-4 w-4" />,
    page: <CareerMapManagement />,
    requiresAuth: true,
    permission: "canAccessCareerMap" as const,
  },
  {
    title: "Employer Requests",
    to: "/admin/employer-requests",
    icon: <Building2 className="h-4 w-4" />,
    page: <EmployerRequests />,
    requiresAuth: true,
    permission: "canAccessEmployerRequests" as const,
  },
  {
    title: "Pricing & Payments",
    to: "/admin/payments",
    icon: <CreditCard className="h-4 w-4" />,
    page: <PricingPayments />,
    requiresAuth: true,
    permission: "canAccessDashboard" as const,
  },
  {
    title: "Analytics & Reports",
    to: "/admin/analytics",
    icon: <BarChart3 className="h-4 w-4" />,
    page: <AnalyticsReports />,
    requiresAuth: true,
    permission: "canAccessAnalytics" as const,
  },
  {
    title: "Security & Logs",
    to: "/admin/security",
    icon: <Lock className="h-4 w-4" />,
    page: <SecurityLogs />,
    requiresAuth: true,
    permission: "canAccessSecurity" as const,
  },
];
