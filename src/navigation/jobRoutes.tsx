import { lazy } from "react";
import { Briefcase, FileText, Heart, Bell, BarChart3, Building2, FolderOpen, Zap, Brain } from "lucide-react";

// Use existing LazyRoutes or convert others to lazy
import { JobsPage } from "../components/performance/LazyRoutes";
const JobDetails = lazy(() => import("../pages/jobs/JobDetails"));
const JobDetail = lazy(() => import("../pages/JobDetail"));
const JobPost = lazy(() => import("../pages/jobs/JobPost"));
const SavedJobs = lazy(() => import("../pages/jobs/SavedJobs"));
const MyApplications = lazy(() => import("../pages/jobs/MyApplications"));
const JobApply = lazy(() => import("../pages/jobs/JobApply"));
const JobAlerts = lazy(() => import("../pages/jobs/Alerts"));
const JobCareerAnalytics = lazy(() => import("../pages/jobs/Analytics"));
const JobCategories = lazy(() => import("../pages/jobs/JobCategories"));
const CompaniesPage = lazy(() => import("../pages/jobs/Companies"));
const JobRecommendations = lazy(() => import("../pages/jobs/Recommendations"));
const SmartApply = lazy(() => import("../pages/jobs/SmartApply"));
const JobManage = lazy(() => import("../pages/jobs/Manage"));
const AppliedJobs = lazy(() => import("../pages/jobs/AppliedJobs"));
const JobApplicants = lazy(() => import("../pages/jobs/JobApplicants"));
const ApplicantDetail = lazy(() => import("../pages/jobs/ApplicantDetail"));
const ComprehensiveJobs = lazy(() => import("../pages/ComprehensiveJobs"));
const MobileJobs = lazy(() => import("../pages/mobile/MobileJobs"));
const CareerCommandCenter = lazy(() => import("../pages/CommandCenter"));
const TalentBeacon = lazy(() => import("../pages/jobs/TalentBeacon"));

import { JobRedirectHandler } from "../components/jobs/JobRedirectHandler";
import { JobUrlRedirect } from "../components/seo/JobUrlRedirect";


export const jobRoutes = [
  {
    title: "Matches",
    to: "/jobs",
    icon: <Briefcase className="h-4 w-4" />,
    page: <JobsPage />,
    isPublic: true,
    requiresAuth: false,
  },
  {
    title: "Mobile Matches",
    to: "/jobs/mobile",
    icon: <Briefcase className="h-4 w-4" />,
    page: <JobsPage />,
    isPublic: true,
    requiresAuth: false,
  },
  {
    title: "Career CommandCenter",
    to: "/career-CommandCenter",
    icon: <BarChart3 className="h-4 w-4" />,
    page: <CareerCommandCenter />,
    description: "Performance CareerIntelligence and job matching CommandCenter",
    isPublic: false,
    requiresAuth: true,
  },
  {
    title: "AI Opportunity Hub",
    to: "/jobs/ai-hub",
    icon: <Brain className="h-4 w-4" />,
    page: <CareerCommandCenter />,
    description: "Performance job matching and career insights hub",
    isPublic: false,
    requiresAuth: true,
  },
  // Job Details route is handled manually in App.tsx to ensure proper precedence
  {
    title: "Legacy Job Redirect",
    to: "/job/:slugOrId",
    page: <JobUrlRedirect />,
  },
  {
    title: "Numeric Job ID Redirect",
    to: "/jobs/:id(\\d+)",
    page: <JobRedirectHandler />,
  },
  {
    title: "Apply for Job",
    to: "/jobs/:id/apply",
    page: <JobApply />,
  },
  {
    title: "Post a Job",
    to: "/jobs/post",
    icon: <FileText className="h-4 w-4" />,
    page: <JobPost />,
  },
  {
    title: "Saved Jobs",
    to: "/jobs/saved",
    icon: <Heart className="h-4 w-4" />,
    page: <SavedJobs />,
  },
  {
    title: "My Applications",
    to: "/jobs/applied",
    icon: <FileText className="h-4 w-4" />,
    page: <MyApplications />,
  },
  {
    title: "Job Alerts",
    to: "/jobs/alerts",
    icon: <Bell className="h-4 w-4" />,
    page: <JobAlerts />,
  },
  {
    title: "Job CareerAnalytics",
    to: "/jobs/CareerAnalytics",
    icon: <BarChart3 className="h-4 w-4" />,
    page: <JobCareerAnalytics />,
  },
  {
    title: "Job Categories",
    to: "/jobs/categories",
    icon: <FolderOpen className="h-4 w-4" />,
    page: <JobCategories />,
  },
  {
    title: "Companies",
    to: "/jobs/companies",
    icon: <Building2 className="h-4 w-4" />,
    page: <CompaniesPage />,
  },
  {
    title: "Job Recommendations",
    to: "/jobs/recommendations",
    icon: <Zap className="h-4 w-4" />,
    page: <JobRecommendations />,
  },
  {
    title: "Smart Apply",
    to: "/jobs/smart-apply",
    icon: <Zap className="h-4 w-4" />,
    page: <SmartApply />,
  },
  {
    title: "Manage Jobs",
    to: "/jobs/manage",
    page: <JobManage />,
  },
  {
    title: "Applied Jobs",
    to: "/jobs/applied-jobs",
    page: <AppliedJobs />,
  },
  {
    title: "Job Applicants",
    to: "/jobs/:id/applicants",
    page: <JobApplicants />,
  },
  {
    title: "Applicant Detail",
    to: "/jobs/:jobId/applicants/:applicantId",
    page: <ApplicantDetail />,
  },
  {
    title: "Comprehensive Jobs",
    to: "/jobs/comprehensive",
    page: <JobsPage />,
  },
  {
    title: "Talent Beacon",
    to: "/talent-beacon",
    icon: <Zap className="h-4 w-4" />,
    page: <TalentBeacon />,
    description: "Reverse Job Match: Companies looking for you",
    isPublic: false,
    requiresAuth: true,
  },
];




