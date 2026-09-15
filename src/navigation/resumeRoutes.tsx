import { lazy } from "react";
import { FileText, Sparkles, Upload, Zap, Search, Target, PenTool, Video, Globe, TrendingUp } from "lucide-react";

const ResumeNew = lazy(() => import("@/pages/resume/ResumeNew"));
const EditResume = lazy(() => import("@/pages/resume/EditResume"));
const TalentXcelResumeBuilder = lazy(() => import("@/pages/resume/TalentXcelResumeBuilder"));
const ResumeEditorV1 = lazy(() => import("@/pages/resume/ResumeEditorV1"));
const ResumeHub = lazy(() => import("@/pages/resume/ResumeHub"));
const TemplateGallery = lazy(() => import("@/pages/resume/TemplateGallery"));
const UnifiedUploadPage = lazy(() => import("@/pages/resume/UnifiedUploadPage"));
const AIResumeBuilder = lazy(() => import("@/pages/resume/AIResumeBuilder"));
const ATSOptimizer = lazy(() => import("@/pages/resume/ATSOptimizer"));
const CoverLetterStudio = lazy(() => import("@/pages/resume/CoverLetterStudio"));
const InterviewPrepSuite = lazy(() => import("@/pages/resume/InterviewPrepSuite"));
const PortfolioBuilder = lazy(() => import("@/pages/resume/PortfolioBuilder"));
const CareerIntelligence = lazy(() => import("@/pages/resume/CareerIntelligence"));
const CommandCenter = lazy(() => import("@/pages/CommandCenter"));
const CompanyCommandCenter = lazy(() => import("@/pages/companies/CompanyDashboard"));
const CareerAnalyticsCommandCenter = lazy(() => import("@/components/resume/AnalyticsDashboard").then(m => ({ default: m.CareerAnalyticsCommandCenter })));
const LearningHub = lazy(() => import("@/pages/LearningHub"));
const AIEnhancement = lazy(() => import("@/pages/resume/AIEnhancement"));

import { ErrorBoundary } from "@/components/ErrorBoundary";


export const resumeRoutes = [
  {
    title: "Resume Hub",
    to: "/resume/hub",
    icon: <Sparkles className="h-4 w-4" />,
    page: <ResumeHub />,
    isPublic: true,
  },
  {
    title: "Resume Templates",
    to: "/resume/templates",
    icon: <FileText className="h-4 w-4" />,
    page: <TemplateGallery />,
    isPublic: true,
  },
  {
    title: "Upload Resume",
    to: "/resume/upload",
    icon: <Upload className="h-4 w-4" />,
    page: <UnifiedUploadPage />,
    isPublic: true,
  },
  {
    title: "Resume Builder Pro", 
    to: "/resume/builder",
    icon: <Sparkles className="h-4 w-4" />,
    page: <AIResumeBuilder />,
    isPublic: true,
  },
  {
    title: "Cover Letter Studio",
    to: "/resume/cover-letter",
    icon: <PenTool className="h-4 w-4" />,
    page: <CoverLetterStudio />,
    isPublic: true,
  },
  {
    title: "Interview Prep",
    to: "/resume/interview-prep", 
    icon: <Video className="h-4 w-4" />,
    page: <InterviewPrepSuite />,
    isPublic: true,
  },
  {
    title: "Portfolio Builder",
    to: "/resume/portfolio",
    icon: <Globe className="h-4 w-4" />,
    page: <PortfolioBuilder />,
    isPublic: true,
  },
  {
    title: "Professional Intelligence",
    to: "/resume/career-intelligence",
    icon: <TrendingUp className="h-4 w-4" />,
    page: <CareerIntelligence />,
    isPublic: true,
  },
  {
    title: "Resume Enhancement",
    to: "/resume/enhancement",
    icon: <Sparkles className="h-4 w-4" />,
    page: <AIEnhancement />,
    isPublic: true,
  },
  {
    title: "ATS Checker",
    to: "/resume/ats-check",
    icon: <Target className="h-4 w-4" />,
    page: <ATSOptimizer />,
    isPublic: true,
  },
  {
    title: "Resume Command Center",
    to: "/resume/command-center",
    icon: <Target className="h-4 w-4" />,
    page: <CommandCenter />,
    isPublic: true,
  },
  {
    title: "Company Tools",
    to: "/resume/company-tools",
    icon: <Target className="h-4 w-4" />,
    page: <CompanyCommandCenter />,
    isPublic: true,
  },
  {
    title: "Resume Career Analytics",
    to: "/resume/career-analytics",
    icon: <Target className="h-4 w-4" />,
    page: <CareerAnalyticsCommandCenter resumeId="current" />,
    isPublic: true,
  },
  {
    title: "Learning Hub",
    to: "/resume/learning-hub",
    icon: <Target className="h-4 w-4" />,
    page: <LearningHub />,
    isPublic: true,
  },
  {
    title: "Resume Builder Wizard",
    to: "/resume/wizard",
    icon: <Sparkles className="h-4 w-4" />,
    page: <TalentXcelResumeBuilder />,
    isPublic: true,
  },
  {
    title: "Resume Hub",
    to: "/resume/tools",
    icon: <FileText className="h-4 w-4" />,
    page: <ErrorBoundary><ResumeNew /></ErrorBoundary>,
    isPublic: true,
  },
  {
    title: "Edit Resume",
    to: "/resume/edit/:id",
    page: <EditResume />,
    isPublic: true,
  },
  {
    title: "Resume Editor V1",
    to: "/resume/editor/:id",
    page: <ErrorBoundary><ResumeEditorV1 /></ErrorBoundary>,
    isPublic: true,
  },
];




