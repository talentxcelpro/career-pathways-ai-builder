import { lazy, Suspense } from 'react';
import { Briefcase, FileText, Heart, Bell, BarChart3, Building2, FolderOpen, Zap, Brain } from "lucide-react";
const JobsPage = lazy(() => import('../components/performance/LazyRoutes').then(m => ({ default: m.JobsPage })));
const JobDetails = lazy(() => import('../pages/jobs/JobDetails'));
const JobDetail = lazy(() => import('../pages/JobDetail'));
const JobRedirectHandler = lazy(() => import('../components/jobs/JobRedirectHandler').then(m => ({ default: m.JobRedirectHandler })));
const JobPost = lazy(() => import('../pages/jobs/JobPost'));
const SavedJobs = lazy(() => import('../pages/jobs/SavedJobs'));
const MyApplications = lazy(() => import('../pages/jobs/MyApplications'));
const JobApply = lazy(() => import('../pages/jobs/JobApply'));
const JobAlerts = lazy(() => import('../pages/jobs/Alerts'));
const JobAnalytics = lazy(() => import('../pages/jobs/Analytics'));
const JobCategories = lazy(() => import('../pages/jobs/JobCategories'));
const CompaniesPage = lazy(() => import('../pages/jobs/Companies'));
const JobRecommendations = lazy(() => import('../pages/jobs/Recommendations'));
const SmartApply = lazy(() => import('../pages/jobs/SmartApply'));
const JobManage = lazy(() => import('../pages/jobs/Manage'));
const AppliedJobs = lazy(() => import('../pages/jobs/AppliedJobs'));
const JobApplicants = lazy(() => import('../pages/jobs/JobApplicants'));
const ApplicantDetail = lazy(() => import('../pages/jobs/ApplicantDetail'));
const ComprehensiveJobs = lazy(() => import('../pages/ComprehensiveJobs'));
const JobUrlRedirect = lazy(() => import('../components/seo/JobUrlRedirect').then(m => ({ default: m.JobUrlRedirect })));
const MobileJobs = lazy(() => import('../pages/mobile/MobileJobs'));
const CareerDashboard = lazy(() => import('../pages/CareerDashboard'));

export const jobRoutes = [
  {
    title: "Jobs",
    to: "/jobs",
    icon: <Briefcase className="h-4 w-4" />,
    page: <Suspense fallback={null}><JobsPage /></Suspense>,
    isPublic: true,
    requiresAuth: false,
  },
  {
    title: "Mobile Jobs",
    to: "/jobs/mobile",
    icon: <Briefcase className="h-4 w-4" />,
    page: <Suspense fallback={null}><MobileJobs /></Suspense>,
    isPublic: true,
    requiresAuth: false,
  },
  {
    title: "Career Dashboard",
    to: "/career-dashboard",
    icon: <BarChart3 className="h-4 w-4" />,
    page: <Suspense fallback={null}><CareerDashboard /></Suspense>,
    description: "AI-powered career intelligence and job matching dashboard",
    isPublic: false,
    requiresAuth: true,
  },
  {
    title: "AI Career Hub",
    to: "/jobs/ai-hub",
    icon: <Brain className="h-4 w-4" />,
    page: <Suspense fallback={null}><CareerDashboard /></Suspense>,
    description: "AI-powered job matching and career insights hub",
    isPublic: false,
    requiresAuth: true,
  },
  // Job Details route is handled manually in App.tsx to ensure proper precedence
  {
    title: "Legacy Job Redirect",
    to: "/job/:slugOrId",
    page: <Suspense fallback={null}><JobUrlRedirect /></Suspense>,
  },
  {
    title: "Numeric Job ID Redirect",
    to: "/jobs/:id(\\d+)",
    page: <Suspense fallback={null}><JobRedirectHandler /></Suspense>,
  },
  {
    title: "Apply for Job",
    to: "/jobs/:id/apply",
    page: <Suspense fallback={null}><JobApply /></Suspense>,
  },
  {
    title: "Post a Job",
    to: "/jobs/post",
    icon: <FileText className="h-4 w-4" />,
    page: <Suspense fallback={null}><JobPost /></Suspense>,
  },
  {
    title: "Saved Jobs",
    to: "/jobs/saved",
    icon: <Heart className="h-4 w-4" />,
    page: <Suspense fallback={null}><SavedJobs /></Suspense>,
  },
  {
    title: "My Applications",
    to: "/jobs/applied",
    icon: <FileText className="h-4 w-4" />,
    page: <Suspense fallback={null}><MyApplications /></Suspense>,
  },
  {
    title: "Job Alerts",
    to: "/jobs/alerts",
    icon: <Bell className="h-4 w-4" />,
    page: <Suspense fallback={null}><JobAlerts /></Suspense>,
  },
  {
    title: "Job Analytics",
    to: "/jobs/analytics",
    icon: <BarChart3 className="h-4 w-4" />,
    page: <Suspense fallback={null}><JobAnalytics /></Suspense>,
  },
  {
    title: "Job Categories",
    to: "/jobs/categories",
    icon: <FolderOpen className="h-4 w-4" />,
    page: <Suspense fallback={null}><JobCategories /></Suspense>,
  },
  {
    title: "Companies",
    to: "/jobs/companies",
    icon: <Building2 className="h-4 w-4" />,
    page: <Suspense fallback={null}><CompaniesPage /></Suspense>,
  },
  {
    title: "Job Recommendations",
    to: "/jobs/recommendations",
    icon: <Zap className="h-4 w-4" />,
    page: <Suspense fallback={null}><JobRecommendations /></Suspense>,
  },
  {
    title: "Smart Apply",
    to: "/jobs/smart-apply",
    icon: <Zap className="h-4 w-4" />,
    page: <Suspense fallback={null}><SmartApply /></Suspense>,
  },
  {
    title: "Manage Jobs",
    to: "/jobs/manage",
    page: <Suspense fallback={null}><JobManage /></Suspense>,
  },
  {
    title: "Applied Jobs",
    to: "/jobs/applied-jobs",
    page: <Suspense fallback={null}><AppliedJobs /></Suspense>,
  },
  {
    title: "Job Applicants",
    to: "/jobs/:id/applicants",
    page: <Suspense fallback={null}><JobApplicants /></Suspense>,
  },
  {
    title: "Applicant Detail",
    to: "/jobs/:jobId/applicants/:applicantId",
    page: <Suspense fallback={null}><ApplicantDetail /></Suspense>,
  },
  {
    title: "Comprehensive Jobs",
    to: "/jobs/comprehensive",
    page: <Suspense fallback={null}><ComprehensiveJobs /></Suspense>,
  },
];
