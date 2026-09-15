import { lazy } from "react";
import { Briefcase, PlusCircle, Copy, XCircle, Star, Edit, Eye, Brain, Users, Calendar, MessageSquare, BarChart3, Activity, PieChart } from "lucide-react";

// Job Posting Flow
const JobPost = lazy(() => import("../../pages/jobs/JobPost"));
const JobPostAI = lazy(() => import("../../pages/employer/jobs/JobPostAI"));
const JobPostPreview = lazy(() => import("../../pages/employer/jobs/JobPostPreview"));
const JobPostSuccess = lazy(() => import("../../pages/employer/jobs/JobPostSuccess"));

// Job Management
const JobsManage = lazy(() => import("../../pages/jobs/Manage"));
const JobView = lazy(() => import("../../pages/employer/jobs/JobView"));
const JobEdit = lazy(() => import("../../pages/employer/jobs/JobEdit"));
const JobDuplicate = lazy(() => import("../../pages/employer/jobs/JobDuplicate"));
const JobClose = lazy(() => import("../../pages/employer/jobs/JobClose"));
const JobPromote = lazy(() => import("../../pages/employer/jobs/JobPromote"));

// Candidate Management
const JobApplicants = lazy(() => import("../../pages/jobs/JobApplicants"));
const ApplicantDetail = lazy(() => import("../../pages/jobs/ApplicantDetail"));
const CandidateNotes = lazy(() => import("../../pages/employer/candidates/CandidateNotes"));

// AI & Smart Tools
const SmartRecommend = lazy(() => import("../../pages/employer/ai/SmartRecommend"));
const AIInsights = lazy(() => import("../../pages/employer/ai/AIInsights"));
const AIShortlist = lazy(() => import("../../pages/employer/ai/AIShortlist"));

// Interview & Communication
const InterviewSchedule = lazy(() => import("../../pages/employer/interview/InterviewSchedule"));
const InterviewTestLink = lazy(() => import("../../pages/employer/interview/InterviewTestLink"));
const InterviewNotes = lazy(() => import("../../pages/employer/interview/InterviewNotes"));
const CommunicationResponses = lazy(() => import("../../pages/employer/communication/CommunicationResponses"));

// CareerAnalytics
const JobCareerAnalytics = lazy(() => import("../../pages/employer/analytics/JobAnalytics"));
const JobCareerAnalyticsHeatmap = lazy(() => import("../../pages/employer/analytics/JobAnalyticsHeatmap"));
const JobCareerAnalyticsSourceBreakdown = lazy(() => import("../../pages/employer/analytics/JobAnalyticsSourceBreakdown"));


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
    title: "Intelligence Metrics",
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

  // Job CareerAnalytics
  {
    title: "Job CareerAnalytics",
    to: "/jobs/manage/:id/CareerAnalytics",
    page: <JobCareerAnalytics />,
    isPublic: true,
  },
  {
    title: "CareerAnalytics Heatmap",
    to: "/jobs/manage/:id/CareerAnalytics/heatmap",
    page: <JobCareerAnalyticsHeatmap />,
    isPublic: true,
  },
  {
    title: "CareerAnalytics Source Breakdown",
    to: "/jobs/manage/:id/CareerAnalytics/source-breakdown",
    page: <JobCareerAnalyticsSourceBreakdown />,
    isPublic: true,
  },
];



