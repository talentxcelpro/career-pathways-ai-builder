import { FileText, Briefcase, TrendingUp, Building2, MessageSquare, Search } from "lucide-react";
import { TieredAccessGuard } from "@/components/access/TieredAccessGuard";
import ResumeBuilder from "../pages/tools/ResumeBuilder";
import Jobs from "../pages/Jobs";
import MarketInsights from "../pages/tools/MarketInsights";
import Companies from "../pages/Companies";
import InterviewPrep from "../pages/tools/InterviewPrep";
import AIJobMatchGPT from "../pages/tools/AIJobMatchGPT";

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
        <ResumeBuilder />
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
        <Jobs />
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
        <MarketInsights />
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
        <Companies />
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
        <InterviewPrep />
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
        <AIJobMatchGPT />
      </TieredAccessGuard>
    ),
    isPublic: true,
    requiresAuth: false,
    description: "Find jobs that match your skills with AI"
  },
];