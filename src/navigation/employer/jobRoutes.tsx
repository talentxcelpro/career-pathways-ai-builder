import { Briefcase, PlusCircle, Copy, XCircle, Star, Edit, Eye, Brain, Users, Calendar, MessageSquare, BarChart3, Activity, PieChart } from "lucide-react";

// Job Posting Flow
import JobPost from "../../pages/jobs/JobPost";
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
    page: <JobPost />,
    isPublic: true,
  },
  {
    title: "AI Job Post",
    to: "/jobs/post/ai",
    page: <JobPostAI />,
    isPublic: true,
  },
  {
    title: "Job Preview",
    to: "/jobs/post/preview",
    page: <JobPostPreview />,
    isPublic: true,
  },
  {
    title: "Job Posted Success",
    to: "/jobs/post/success",
    page: <JobPostSuccess />,
    isPublic: true,
  },

  // Job Management
  {
    title: "Manage Jobs",
    to: "/jobs/manage",
    page: <JobsManage />,
    isPublic: true,
  },
  {
    title: "View Job",
    to: "/jobs/manage/:id",
    page: <JobView />,
    isPublic: true,
  },
  {
    title: "Edit Job",
    to: "/jobs/manage/:id/edit",
    page: <JobEdit />,
    isPublic: true,
  },
  {
    title: "Duplicate Job",
    to: "/jobs/manage/:id/duplicate",
    page: <JobDuplicate />,
    isPublic: true,
  },
  {
    title: "Close Job",
    to: "/jobs/manage/:id/close",
    page: <JobClose />,
    isPublic: true,
  },
  {
    title: "Promote Job",
    to: "/jobs/manage/:id/promote",
    page: <JobPromote />,
    isPublic: true,
  },

  // Candidate Management
  {
    title: "Job Applicants",
    to: "/jobs/manage/:id/applicants",
    page: <JobApplicants />,
    isPublic: true,
  },
  {
    title: "Applicant Detail",
    to: "/jobs/manage/:jobId/applicants/:applicantId",
    page: <ApplicantDetail />,
    isPublic: true,
  },
  {
    title: "Candidate Notes",
    to: "/jobs/manage/:jobId/applicants/:applicantId/notes",
    page: <CandidateNotes />,
    isPublic: true,
  },

  // AI & Smart Tools
  {
    title: "Smart Recommend",
    to: "/jobs/manage/:id/smart-recommend",
    page: <SmartRecommend />,
    isPublic: true,
  },
  {
    title: "AI Insights",
    to: "/jobs/manage/:id/ai-insights",
    page: <AIInsights />,
    isPublic: true,
  },
  {
    title: "AI Shortlist",
    to: "/jobs/manage/:id/ai-shortlist",
    page: <AIShortlist />,
    isPublic: true,
  },

  // Interview & Communication
  {
    title: "Interview Schedule",
    to: "/jobs/manage/:id/interview",
    page: <InterviewSchedule />,
    isPublic: true,
  },
  {
    title: "Interview Test Link",
    to: "/jobs/manage/:id/interview/test-link",
    page: <InterviewTestLink />,
    isPublic: true,
  },
  {
    title: "Interview Notes",
    to: "/jobs/manage/:id/interview/notes",
    page: <InterviewNotes />,
    isPublic: true,
  },
  {
    title: "Communication Responses",
    to: "/jobs/manage/:id/responses",
    page: <CommunicationResponses />,
    isPublic: true,
  },

  // Job Analytics
  {
    title: "Job Analytics",
    to: "/jobs/manage/:id/analytics",
    page: <JobAnalytics />,
    isPublic: true,
  },
  {
    title: "Analytics Heatmap",
    to: "/jobs/manage/:id/analytics/heatmap",
    page: <JobAnalyticsHeatmap />,
    isPublic: true,
  },
  {
    title: "Analytics Source Breakdown",
    to: "/jobs/manage/:id/analytics/source-breakdown",
    page: <JobAnalyticsSourceBreakdown />,
    isPublic: true,
  },
];