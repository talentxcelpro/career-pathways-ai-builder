import { lazy, Suspense } from 'react';

import { FileText, Sparkles, Upload, Zap, Search, Target, PenTool, Video, Globe, TrendingUp } from "lucide-react";
const ResumeNew = lazy(() => import('@/pages/resume/ResumeNew'));
const EditResume = lazy(() => import('@/pages/resume/EditResume'));
const TalentXcelResumeBuilder = lazy(() => import('@/pages/resume/TalentXcelResumeBuilder'));
const ResumeEditorV1 = lazy(() => import('@/pages/resume/ResumeEditorV1'));
const ResumeHub = lazy(() => import('@/pages/resume/ResumeHub'));
const TemplateGallery = lazy(() => import('@/pages/resume/TemplateGallery'));
const UnifiedUploadPage = lazy(() => import('@/pages/resume/UnifiedUploadPage'));
const AIResumeBuilder = lazy(() => import('@/pages/resume/AIResumeBuilder'));
const ATSOptimizer = lazy(() => import('@/pages/resume/ATSOptimizer'));
const CoverLetterStudio = lazy(() => import('@/pages/resume/CoverLetterStudio'));
const InterviewPrepSuite = lazy(() => import('@/pages/resume/InterviewPrepSuite'));
const PortfolioBuilder = lazy(() => import('@/pages/resume/PortfolioBuilder'));
const CareerIntelligence = lazy(() => import('@/pages/resume/CareerIntelligence'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const CompanyDashboard = lazy(() => import('@/pages/companies/CompanyDashboard'));
const AnalyticsDashboard = lazy(() => import('@/components/resume/AnalyticsDashboard').then(m => ({ default: m.AnalyticsDashboard })));
const LearningHub = lazy(() => import('@/pages/LearningHub'));
import { ErrorBoundary } from "@/components/ErrorBoundary";
const AIEnhancement = lazy(() => import('@/pages/resume/AIEnhancement'));

export const resumeRoutes = [
  {
    title: "Resume Hub",
    to: "/resume/hub",
    icon: <Sparkles className="h-4 w-4" />,
    page: <Suspense fallback={null}><ResumeHub /></Suspense>,
    isPublic: true,
  },
  {
    title: "Resume Templates",
    to: "/resume/templates",
    icon: <FileText className="h-4 w-4" />,
    page: <Suspense fallback={null}><TemplateGallery /></Suspense>,
    isPublic: true,
  },
  {
    title: "Upload Resume",
    to: "/resume/upload",
    icon: <Upload className="h-4 w-4" />,
    page: <Suspense fallback={null}><UnifiedUploadPage /></Suspense>,
    isPublic: true,
  },
  {
    title: "AI Resume Builder", 
    to: "/resume/builder",
    icon: <Sparkles className="h-4 w-4" />,
    page: <Suspense fallback={null}><AIResumeBuilder /></Suspense>,
    isPublic: true,
  },
  {
    title: "Cover Letter Studio",
    to: "/resume/cover-letter",
    icon: <PenTool className="h-4 w-4" />,
    page: <Suspense fallback={null}><CoverLetterStudio /></Suspense>,
    isPublic: true,
  },
  {
    title: "Interview Prep",
    to: "/resume/interview-prep", 
    icon: <Video className="h-4 w-4" />,
    page: <Suspense fallback={null}><InterviewPrepSuite /></Suspense>,
    isPublic: true,
  },
  {
    title: "Portfolio Builder",
    to: "/resume/portfolio",
    icon: <Globe className="h-4 w-4" />,
    page: <Suspense fallback={null}><PortfolioBuilder /></Suspense>,
    isPublic: true,
  },
  {
    title: "Career Intelligence",
    to: "/resume/career-intelligence",
    icon: <TrendingUp className="h-4 w-4" />,
    page: <Suspense fallback={null}><CareerIntelligence /></Suspense>,
    isPublic: true,
  },
  {
    title: "AI Enhancement",
    to: "/resume/ai-enhancement",
    icon: <Sparkles className="h-4 w-4" />,
    page: <Suspense fallback={null}><AIEnhancement /></Suspense>,
    isPublic: true,
  },
  {
    title: "ATS Checker",
    to: "/resume/ats-check",
    icon: <Target className="h-4 w-4" />,
    page: <Suspense fallback={null}><ATSOptimizer /></Suspense>,
    isPublic: true,
  },
  {
    title: "Resume Dashboard",
    to: "/resume/dashboard",
    icon: <Target className="h-4 w-4" />,
    page: <Suspense fallback={null}><Dashboard /></Suspense>,
    isPublic: true,
  },
  {
    title: "Company Tools",
    to: "/resume/company-tools",
    icon: <Target className="h-4 w-4" />,
    page: <Suspense fallback={null}><CompanyDashboard /></Suspense>,
    isPublic: true,
  },
  {
    title: "Resume Analytics",
    to: "/resume/analytics",
    icon: <Target className="h-4 w-4" />,
    page: <Suspense fallback={null}><AnalyticsDashboard resumeId="current" /></Suspense>,
    isPublic: true,
  },
  {
    title: "Learning Hub",
    to: "/resume/learning-hub",
    icon: <Target className="h-4 w-4" />,
    page: <Suspense fallback={null}><LearningHub /></Suspense>,
    isPublic: true,
  },
  {
    title: "Resume Builder Wizard",
    to: "/resume/wizard",
    icon: <Sparkles className="h-4 w-4" />,
    page: <Suspense fallback={null}><TalentXcelResumeBuilder /></Suspense>,
    isPublic: true,
  },
  {
    title: "Resume Hub",
    to: "/resume/tools",
    icon: <FileText className="h-4 w-4" />,
    page: <Suspense fallback={null}><ErrorBoundary><ResumeNew /></ErrorBoundary></Suspense>,
    isPublic: true,
  },
  {
    title: "Edit Resume",
    to: "/resume/edit/:id",
    page: <Suspense fallback={null}><EditResume /></Suspense>,
    isPublic: true,
  },
  {
    title: "Resume Editor V1",
    to: "/resume/editor/:id",
    page: <Suspense fallback={null}><ErrorBoundary><ResumeEditorV1 /></ErrorBoundary></Suspense>,
    isPublic: true,
  },
];
