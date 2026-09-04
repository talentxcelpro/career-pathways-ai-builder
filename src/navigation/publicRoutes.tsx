import { lazy, Suspense } from "react";
import { FileText, Briefcase, TrendingUp, Building2, MessageSquare, Search } from "lucide-react";
import { TieredAccessGuard } from "@/components/access/TieredAccessGuard";

const ResumeBuilder = lazy(() => import("../pages/tools/ResumeBuilder"));
const Jobs = lazy(() => import("../pages/Jobs"));
const MarketInsights = lazy(() => import("../pages/tools/MarketInsights"));
const Companies = lazy(() => import("../pages/Companies"));
const InterviewPrep = lazy(() => import("../pages/tools/InterviewPrep"));
const AIJobMatchGPT = lazy(() => import("../pages/tools/AIJobMatchGPT"));

const S = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={null}>{children}</Suspense>
);

export const publicRoutes = [
  {
    title: "Free Resume Builder",
    to: "/public/resume-builder",
    icon: <FileText className="h-4 w-4" />,
    page: (
      <TieredAccessGuard
        feature="resume_builder_basic"
        requiresAuth={false}
        requiredTier="free"
      >
        <S><ResumeBuilder /></S>
      </TieredAccessGuard>
    ),
    isPublic: true,
    requiresAuth: false,
    description: "Create professional resumes with our free builder"
  },
  {
    title: "Job Search",
    to: "/public/jobs",
    icon: <Briefcase className="h-4 w-4" />,
    page: (
      <TieredAccessGuard
        feature="job_search"
        requiresAuth={false}
        requiredTier="free"
      >
        <S><Jobs /></S>
      </TieredAccessGuard>
    ),
    isPublic: true,
    requiresAuth: false,
    description: "Search and discover job opportunities"
  },
  {
    title: "Career Insights",
    to: "/public/market-insights",
    icon: <TrendingUp className="h-4 w-4" />,
    page: (
      <TieredAccessGuard
        feature="career_guidance"
        requiresAuth={false}
        requiredTier="free"
      >
        <S><MarketInsights /></S>
      </TieredAccessGuard>
    ),
    isPublic: true,
    requiresAuth: false,
    description: "Get market insights and career guidance"
  },
  {
    title: "Company Profiles",
    to: "/public/companies",
    icon: <Building2 className="h-4 w-4" />,
    page: (
      <TieredAccessGuard
        feature="company_insights"
        requiresAuth={false}
        requiredTier="free"
      >
        <S><Companies /></S>
      </TieredAccessGuard>
    ),
    isPublic: true,
    requiresAuth: false,
    description: "Explore company profiles and insights"
  },
  {
    title: "Interview Prep",
    to: "/public/interview-prep",
    icon: <MessageSquare className="h-4 w-4" />,
    page: (
      <TieredAccessGuard
        feature="interview_prep"
        requiresAuth={false}
        requiredTier="free"
      >
        <S><InterviewPrep /></S>
      </TieredAccessGuard>
    ),
    isPublic: true,
    requiresAuth: false,
    description: "Prepare for interviews with our free resources"
  },
  {
    title: "AI Job Matching",
    to: "/public/job-matcher",
    icon: <Search className="h-4 w-4" />,
    page: (
      <TieredAccessGuard
        feature="ai_job_matching_basic"
        requiresAuth={false}
        requiredTier="free"
      >
        <S><AIJobMatchGPT /></S>
      </TieredAccessGuard>
    ),
    isPublic: true,
    requiresAuth: false,
    description: "Find jobs that match your skills with AI"
  },
];