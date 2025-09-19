import { Briefcase, FileText, Heart, Bell, BarChart3, Building2, FolderOpen, Zap } from "lucide-react";
import Jobs from "../pages/Jobs";
import JobSearch from "../pages/JobSearch";
import JobDetails from "../pages/jobs/JobDetails";
import JobDetail from "../pages/JobDetail";
import { JobRedirectHandler } from "../components/jobs/JobRedirectHandler";
import JobPost from "../pages/jobs/JobPost";
import SavedJobs from "../pages/jobs/SavedJobs";
import MyApplications from "../pages/jobs/MyApplications";
import JobApply from "../pages/jobs/JobApply";
import JobAlerts from "../pages/jobs/Alerts";
import JobAnalytics from "../pages/jobs/Analytics";
import JobCategories from "../pages/jobs/JobCategories";
import CompaniesPage from "../pages/jobs/Companies";
import JobRecommendations from "../pages/jobs/Recommendations";
import SmartApply from "../pages/jobs/SmartApply";
import JobManage from "../pages/jobs/Manage";
import AppliedJobs from "../pages/jobs/AppliedJobs";
import JobApplicants from "../pages/jobs/JobApplicants";
import ApplicantDetail from "../pages/jobs/ApplicantDetail";
import ComprehensiveJobs from "../pages/ComprehensiveJobs";
import { JobUrlRedirect } from "../components/seo/JobUrlRedirect";

export const jobRoutes = [
  {
    title: "Jobs",
    to: "/jobs",
    icon: <Briefcase className="h-4 w-4" />,
    page: <Jobs />,
    isPublic: true,
    requiresAuth: false,
  },
  {
    title: "Job Search",
    to: "/search/jobs",
    icon: <Briefcase className="h-4 w-4" />,
    page: <JobSearch />,
    isPublic: true,
    requiresAuth: false,
  },
  {
    title: "Job Details",
    to: "/jobs/:slugOrId",
    page: <JobDetail />,
  },
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
    title: "Job Analytics",
    to: "/jobs/analytics",
    icon: <BarChart3 className="h-4 w-4" />,
    page: <JobAnalytics />,
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
    page: <ComprehensiveJobs />,
  },
];
