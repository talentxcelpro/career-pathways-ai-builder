import React, { lazy, Suspense } from "react";
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

// Analytics
const JobAnalytics = lazy(() => import("../../pages/employer/analytics/JobAnalytics"));
const JobAnalyticsHeatmap = lazy(() => import("../../pages/employer/analytics/JobAnalyticsHeatmap"));
const JobAnalyticsSourceBreakdown = lazy(() => import("../../pages/employer/analytics/JobAnalyticsSourceBreakdown"));

const S = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={null}>{children}</Suspense>
);

export const employerJobRoutes = [
  // Job Posting Flow
  {
    title: "Post Job",
    to: "/jobs/post",
    page: <S><JobPost /></S>,
    isPublic: true,
  },
  {
    title: "AI Job Post",
    to: "/jobs/post/ai",
    page: <S><JobPostAI /></S>,
    isPublic: true,
  },
  {
    title: "Job Preview",
    to: "/jobs/post/preview",
    page: <S><JobPostPreview /></S>,
    isPublic: true,
  },
  {
    title: "Job Posted Success",
    to: "/jobs/post/success",
    page: <S><JobPostSuccess /></S>,
    isPublic: true,
  },

  // Job Management
  {
    title: "Manage Jobs",
    to: "/jobs/manage",
    page: <S><JobsManage /></S>,
    isPublic: true,
  },
  {
    title: "View Job",
    to: "/jobs/manage/:id",
    page: <S><JobView /></S>,
    isPublic: true,
  },
  {
    title: "Edit Job",
    to: "/jobs/manage/:id/edit",
    page: <S><JobEdit /></S>,
    isPublic: true,
  },
  {
    title: "Duplicate Job",
    to: "/jobs/manage/:id/duplicate",
    page: <S><JobDuplicate /></S>,
    isPublic: true,
  },
  {
    title: "Close Job",
    to: "/jobs/manage/:id/close",
    page: <S><JobClose /></S>,
    isPublic: true,
  },
  {
    title: "Promote Job",
    to: "/jobs/manage/:id/promote",
    page: <S><JobPromote /></S>,
    isPublic: true,
  },

  // Candidate Management
  {
    title: "Job Applicants",
    to: "/jobs/manage/:id/applicants",
    page: <S><JobApplicants /></S>,
    isPublic: true,
  },
  {
    title: "Applicant Detail",
    to: "/jobs/manage/:jobId/applicants/:applicantId",
    page: <S><ApplicantDetail /></S>,
    isPublic: true,
  },
  {
    title: "Candidate Notes",
    to: "/jobs/manage/:jobId/applicants/:applicantId/notes",
    page: <S><CandidateNotes /></S>,
    isPublic: true,
  },

  // AI & Smart Tools
  {
    title: "Smart Recommend",
    to: "/jobs/manage/:id/smart-recommend",
    page: <S><SmartRecommend /></S>,
    isPublic: true,
  },
  {
    title: "AI Insights",
    to: "/jobs/manage/:id/ai-insights",
    page: <S><AIInsights /></S>,
    isPublic: true,
  },
  {
    title: "AI Shortlist",
    to: "/jobs/manage/:id/ai-shortlist",
    page: <S><AIShortlist /></S>,
    isPublic: true,
  },

  // Interview & Communication
  {
    title: "Interview Schedule",
    to: "/employer/interview/schedule",
    page: <S><InterviewSchedule /></S>,
    isPublic: true,
  },
  {
    title: "Interview Schedule for Job",
    to: "/employer/interview/schedule/:id",
    page: <S><InterviewSchedule /></S>,
    isPublic: true,
  },
  {
    title: "Interview Schedule (Legacy)",
    to: "/jobs/manage/:id/interview",
    page: <S><InterviewSchedule /></S>,
    isPublic: true,
  },
  {
    title: "Interview Test Link",
    to: "/jobs/manage/:id/interview/test-link",
    page: <S><InterviewTestLink /></S>,
    isPublic: true,
  },
  {
    title: "Interview Notes",
    to: "/jobs/manage/:id/interview/notes",
    page: <S><InterviewNotes /></S>,
    isPublic: true,
  },
  {
    title: "Communication Responses",
    to: "/jobs/manage/:id/responses",
    page: <S><CommunicationResponses /></S>,
    isPublic: true,
  },

  // Job Analytics
  {
    title: "Job Analytics",
    to: "/jobs/manage/:id/analytics",
    page: <S><JobAnalytics /></S>,
    isPublic: true,
  },
  {
    title: "Analytics Heatmap",
    to: "/jobs/manage/:id/analytics/heatmap",
    page: <S><JobAnalyticsHeatmap /></S>,
    isPublic: true,
  },
  {
    title: "Analytics Source Breakdown",
    to: "/jobs/manage/:id/analytics/source-breakdown",
    page: <S><JobAnalyticsSourceBreakdown /></S>,
    isPublic: true,
  },
];