
import { FileText, Sparkles, Upload, Zap, Search, Target, PenTool, Video, Globe, TrendingUp } from "lucide-react";
import ResumeNew from "@/pages/resume/ResumeNew";
import EditResume from "@/pages/resume/EditResume";
import TalentXcelResumeBuilder from "@/pages/resume/TalentXcelResumeBuilder";
import ResumeEditorV1 from "@/pages/resume/ResumeEditorV1";
import ResumeHub from "@/pages/resume/ResumeHub";
import TemplateGallery from "@/pages/resume/TemplateGallery";
import UploadParser from "@/pages/resume/UploadParser";
import AIResumeBuilder from "@/pages/resume/AIResumeBuilder";
import ATSOptimizer from "@/pages/resume/ATSOptimizer";
import CoverLetterStudio from "@/pages/resume/CoverLetterStudio";
import InterviewPrepSuite from "@/pages/resume/InterviewPrepSuite";
import PortfolioBuilder from "@/pages/resume/PortfolioBuilder";
import CareerIntelligence from "@/pages/resume/CareerIntelligence";
import Dashboard from "@/pages/Dashboard";
import CompanyDashboard from "@/pages/companies/CompanyDashboard";
import { AnalyticsDashboard } from "@/components/resume/AnalyticsDashboard";
import LearningHub from "@/pages/LearningHub";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export const resumeRoutes = [
  {
    title: "Resume Hub",
    to: "/resume/new",
    icon: <Sparkles className="h-4 w-4" />,
    page: <ResumeHub />,
    requiresAuth: false,
    isPublic: true,
  },
  {
    title: "Resume Templates",
    to: "/resume/templates",
    icon: <FileText className="h-4 w-4" />,
    page: <TemplateGallery />,
    requiresAuth: false,
    isPublic: true,
  },
  {
    title: "Upload Resume",
    to: "/resume/upload",
    icon: <Upload className="h-4 w-4" />,
    page: <UploadParser />,
    requiresAuth: false,
    isPublic: true,
  },
  {
    title: "AI Resume Builder", 
    to: "/resume/builder",
    icon: <Sparkles className="h-4 w-4" />,
    page: <AIResumeBuilder />,
    requiresAuth: false,
    isPublic: true,
  },
  {
    title: "Cover Letter Studio",
    to: "/resume/cover-letter",
    icon: <PenTool className="h-4 w-4" />,
    page: <CoverLetterStudio />,
    requiresAuth: false,
    isPublic: true,
  },
  {
    title: "Interview Prep",
    to: "/resume/interview-prep", 
    icon: <Video className="h-4 w-4" />,
    page: <InterviewPrepSuite />,
    requiresAuth: false,
    isPublic: true,
  },
  {
    title: "Portfolio Builder",
    to: "/resume/portfolio",
    icon: <Globe className="h-4 w-4" />,
    page: <PortfolioBuilder />,
    requiresAuth: false,
    isPublic: true,
  },
  {
    title: "Career Intelligence",
    to: "/resume/career-intelligence",
    icon: <TrendingUp className="h-4 w-4" />,
    page: <CareerIntelligence />,
    requiresAuth: false,
    isPublic: true,
  },
  {
    title: "ATS Checker",
    to: "/resume/ats-check",
    icon: <Target className="h-4 w-4" />,
    page: <ATSOptimizer />,
    requiresAuth: false,
    isPublic: true,
  },
  {
    title: "Resume Dashboard",
    to: "/resume/dashboard",
    icon: <Target className="h-4 w-4" />,
    page: <Dashboard />,
    requiresAuth: false,
    isPublic: true,
  },
  {
    title: "Company Tools",
    to: "/resume/company-tools",
    icon: <Target className="h-4 w-4" />,
    page: <CompanyDashboard />,
    requiresAuth: false,
    isPublic: true,
  },
  {
    title: "Resume Analytics",
    to: "/resume/analytics",
    icon: <Target className="h-4 w-4" />,
    page: <AnalyticsDashboard resumeId="current" />,
    requiresAuth: false,
    isPublic: true,
  },
  {
    title: "Learning Hub",
    to: "/resume/learning-hub",
    icon: <Target className="h-4 w-4" />,
    page: <LearningHub />,
    requiresAuth: false,
    isPublic: true,
  },
  {
    title: "Resume Builder",
    to: "/resume/new",
    icon: <FileText className="h-4 w-4" />,
    page: <ErrorBoundary><ResumeNew /></ErrorBoundary>,
    requiresAuth: false,
    requiresAdminAccess: true,
    isPublic: false,
  },
  {
    title: "TalentXcel Resume Builder",
    to: "/resume-builder/enhanced/:id",
    icon: <Sparkles className="h-4 w-4" />,
    page: <TalentXcelResumeBuilder />,
    requiresAuth: true,
    requiresAdminAccess: true,
    isPublic: false,
  },
  {
    title: "Edit Resume",
    to: "/resume/edit/:id",
    page: <EditResume />,
    requiresAuth: true,
    requiresAdminAccess: true,
    isPublic: false,
  },
  {
    title: "Resume Editor V1",
    to: "/resume/editor/:id",
    page: <ErrorBoundary><ResumeEditorV1 /></ErrorBoundary>,
    requiresAuth: true,
    requiresAdminAccess: true,
    isPublic: false,
  },
];
