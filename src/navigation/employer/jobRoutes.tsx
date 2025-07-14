
import { Briefcase, PlusCircle, Copy, XCircle, Star, Edit, Eye, Brain, Users, Calendar, MessageSquare, BarChart3, Activity, PieChart } from "lucide-react";

// Job Posting Flow
import JobPost from "../../pages/jobs/JobPost";
import { EmployerAccessGuard } from "../../components/employer/EmployerAccessGuard";
import JobPostAI from "../../pages/employer/jobs/JobPostAI";
import JobPostPreview from "../../pages/employer/jobs/JobPostPreview";
import JobPostSuccess from "../../pages/employer/jobs/JobPostSuccess";

// Job Management
import JobsManage from "../../pages/jobs/Manage";
import JobView from "../../pages/employer/jobs/JobView";
import JobEdit from "../../pages/employer/jobs/JobEdit";
import JobDuplicate from "../../pages/employer/jobs/JobDuplicate";
import JobClose from "../../pages/employer/jobs/JobClose";
import JobPromote from "../../pages/employer/jobs/JobPromote";

// Candidate Management
import JobApplicants from "../../pages/jobs/JobApplicants";
import ApplicantDetail from "../../pages/jobs/ApplicantDetail";
import CandidateNotes from "../../pages/employer/candidates/CandidateNotes";

// AI & Smart Tools
import SmartRecommend from "../../pages/employer/ai/SmartRecommend";
import AIInsights from "../../pages/employer/ai/AIInsights";
import AIShortlist from "../../pages/employer/ai/AIShortlist";

// Interview & Communication
import InterviewSchedule from "../../pages/employer/interview/InterviewSchedule";
import InterviewTestLink from "../../pages/employer/interview/InterviewTestLink";
import InterviewNotes from "../../pages/employer/interview/InterviewNotes";
import CommunicationResponses from "../../pages/employer/communication/CommunicationResponses";

// Analytics
import JobAnalytics from "../../pages/employer/analytics/JobAnalytics";
import JobAnalyticsHeatmap from "../../pages/employer/analytics/JobAnalyticsHeatmap";
import JobAnalyticsSourceBreakdown from "../../pages/employer/analytics/JobAnalyticsSourceBreakdown";

export const employerJobRoutes = [
  // Job Posting Flow
  {
    title: "Post Job",
    to: "/jobs/post",
    page: <EmployerAccessGuard><JobPost /></EmployerAccessGuard>,
    requiresAuth: true,
    requiresEmployerAccess: true,
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
];
