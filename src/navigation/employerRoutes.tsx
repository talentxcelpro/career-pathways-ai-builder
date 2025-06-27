
import { Building2, Users, Settings, BarChart3, FileText, Brain, Calendar, MessageSquare, Target, TrendingUp, Award, Eye, ClipboardList, UserCheck, Mail, Briefcase, PlusCircle, Copy, XCircle, Star, Search, Lightbulb, UserPlus, Clock, Phone, PieChart, Activity, Folder, Bell, Edit, Trash2, Share2 } from "lucide-react";

// Main Employer Dashboard & Profile
import EmployerDashboard from "../pages/employer/Dashboard";
import EmployerProfile from "../pages/employer/Profile";
import EmployerSettings from "../pages/employer/Settings";
import EmployerTeam from "../pages/employer/Team";

// Job Posting Flow
import JobPost from "../pages/jobs/JobPost";
import JobPostAI from "../pages/employer/jobs/JobPostAI";
import JobPostPreview from "../pages/employer/jobs/JobPostPreview";
import JobPostSuccess from "../pages/employer/jobs/JobPostSuccess";

// Job Management
import JobsManage from "../pages/jobs/Manage";
import JobView from "../pages/employer/jobs/JobView";
import JobEdit from "../pages/employer/jobs/JobEdit";
import JobDuplicate from "../pages/employer/jobs/JobDuplicate";
import JobClose from "../pages/employer/jobs/JobClose";
import JobPromote from "../pages/employer/jobs/JobPromote";

// Candidate Management
import JobApplicants from "../pages/jobs/JobApplicants";
import ApplicantDetail from "../pages/jobs/ApplicantDetail";
import CandidateNotes from "../pages/employer/candidates/CandidateNotes";

// AI & Smart Tools
import SmartRecommend from "../pages/employer/ai/SmartRecommend";
import AIInsights from "../pages/employer/ai/AIInsights";
import AIShortlist from "../pages/employer/ai/AIShortlist";

// Interview & Communication
import InterviewSchedule from "../pages/employer/interview/InterviewSchedule";
import InterviewTestLink from "../pages/employer/interview/InterviewTestLink";
import InterviewNotes from "../pages/employer/interview/InterviewNotes";
import CommunicationResponses from "../pages/employer/communication/CommunicationResponses";

// Analytics
import JobAnalytics from "../pages/employer/analytics/JobAnalytics";
import JobAnalyticsHeatmap from "../pages/employer/analytics/JobAnalyticsHeatmap";
import JobAnalyticsSourceBreakdown from "../pages/employer/analytics/JobAnalyticsSourceBreakdown";

// Company Profile & Promotion
import CompanyProfileEdit from "../pages/employer/profile/CompanyProfileEdit";
import CompanyTeamManage from "../pages/employer/profile/CompanyTeamManage";
import CompanySocials from "../pages/employer/profile/CompanySocials";
import CompanyJobs from "../pages/employer/profile/CompanyJobs";

// CRM & Collaboration
import CRMCandidates from "../pages/employer/crm/CRMCandidates";
import CRMCandidateDetail from "../pages/employer/crm/CRMCandidateDetail";
import CRMNotes from "../pages/employer/crm/CRMNotes";
import CRMTeam from "../pages/employer/crm/CRMTeam";
import CRMReminders from "../pages/employer/crm/CRMReminders";
import CRMEmailTemplate from "../pages/employer/crm/CRMEmailTemplate";

export const employerRoutes = [
  // Main Employer Routes
  {
    title: "Employer Dashboard",
    to: "/employer",
    icon: <Building2 className="h-4 w-4" />,
    page: <EmployerDashboard />,
  },
  {
    title: "Employer Profile",
    to: "/employer/profile",
    page: <EmployerProfile />,
  },
  {
    title: "Employer Settings",
    to: "/employer/settings",
    page: <EmployerSettings />,
  },
  {
    title: "Employer Team",
    to: "/employer/team",
    page: <EmployerTeam />,
  },

  // Job Posting Flow
  {
    title: "Post Job",
    to: "/jobs/post",
    page: <JobPost />,
  },
  {
    title: "AI Job Post",
    to: "/jobs/post/ai",
    page: <JobPostAI />,
  },
  {
    title: "Job Preview",
    to: "/jobs/post/preview",
    page: <JobPostPreview />,
  },
  {
    title: "Job Posted Success",
    to: "/jobs/post/success",
    page: <JobPostSuccess />,
  },

  // Job Management
  {
    title: "Manage Jobs",
    to: "/jobs/manage",
    page: <JobsManage />,
  },
  {
    title: "View Job",
    to: "/jobs/manage/:id",
    page: <JobView />,
  },
  {
    title: "Edit Job",
    to: "/jobs/manage/:id/edit",
    page: <JobEdit />,
  },
  {
    title: "Duplicate Job",
    to: "/jobs/manage/:id/duplicate",
    page: <JobDuplicate />,
  },
  {
    title: "Close Job",
    to: "/jobs/manage/:id/close",
    page: <JobClose />,
  },
  {
    title: "Promote Job",
    to: "/jobs/manage/:id/promote",
    page: <JobPromote />,
  },

  // Candidate Management
  {
    title: "Job Applicants",
    to: "/jobs/manage/:id/applicants",
    page: <JobApplicants />,
  },
  {
    title: "Applicant Detail",
    to: "/jobs/manage/:jobId/applicants/:applicantId",
    page: <ApplicantDetail />,
  },
  {
    title: "Candidate Notes",
    to: "/jobs/manage/:jobId/applicants/:applicantId/notes",
    page: <CandidateNotes />,
  },

  // AI & Smart Tools
  {
    title: "Smart Recommend",
    to: "/jobs/manage/:id/smart-recommend",
    page: <SmartRecommend />,
  },
  {
    title: "AI Insights",
    to: "/jobs/manage/:id/ai-insights",
    page: <AIInsights />,
  },
  {
    title: "AI Shortlist",
    to: "/jobs/manage/:id/ai-shortlist",
    page: <AIShortlist />,
  },

  // Interview & Communication
  {
    title: "Interview Schedule",
    to: "/jobs/manage/:id/interview",
    page: <InterviewSchedule />,
  },
  {
    title: "Interview Test Link",
    to: "/jobs/manage/:id/interview/test-link",
    page: <InterviewTestLink />,
  },
  {
    title: "Interview Notes",
    to: "/jobs/manage/:id/interview/notes",
    page: <InterviewNotes />,
  },
  {
    title: "Communication Responses",
    to: "/jobs/manage/:id/responses",
    page: <CommunicationResponses />,
  },

  // Job Analytics
  {
    title: "Job Analytics",
    to: "/jobs/manage/:id/analytics",
    page: <JobAnalytics />,
  },
  {
    title: "Analytics Heatmap",
    to: "/jobs/manage/:id/analytics/heatmap",
    page: <JobAnalyticsHeatmap />,
  },
  {
    title: "Analytics Source Breakdown",
    to: "/jobs/manage/:id/analytics/source-breakdown",
    page: <JobAnalyticsSourceBreakdown />,
  },

  // Company Profile & Promotion
  {
    title: "Company Profile Edit",
    to: "/employer/profile/edit",
    page: <CompanyProfileEdit />,
  },
  {
    title: "Company Team Manage",
    to: "/employer/profile/team",
    page: <CompanyTeamManage />,
  },
  {
    title: "Company Socials",
    to: "/employer/profile/socials",
    page: <CompanySocials />,
  },
  {
    title: "Company Jobs",
    to: "/employer/profile/jobs",
    page: <CompanyJobs />,
  },

  // CRM & Collaboration
  {
    title: "CRM Candidates",
    to: "/employer/crm/candidates",
    page: <CRMCandidates />,
  },
  {
    title: "CRM Candidate Detail",
    to: "/employer/crm/:candidateId",
    page: <CRMCandidateDetail />,
  },
  {
    title: "CRM Notes",
    to: "/employer/crm/notes",
    page: <CRMNotes />,
  },
  {
    title: "CRM Team",
    to: "/employer/crm/team",
    page: <CRMTeam />,
  },
  {
    title: "CRM Reminders",
    to: "/employer/crm/reminders",
    page: <CRMReminders />,
  },
  {
    title: "CRM Email Template",
    to: "/employer/crm/email-template",
    page: <CRMEmailTemplate />,
  },
];
