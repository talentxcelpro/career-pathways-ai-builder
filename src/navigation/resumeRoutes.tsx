
import { FileText, Sparkles, Upload, Zap, Search, Target } from "lucide-react";
import ResumeNew from "@/pages/resume/ResumeNew";
import EditResume from "@/pages/resume/EditResume";
import TalentXcelResumeBuilder from "@/pages/resume/TalentXcelResumeBuilder";
import ResumeEditorV1 from "@/pages/resume/ResumeEditorV1";
import TemplateGallery from "@/pages/resume/TemplateGallery";
import UploadParser from "@/pages/resume/UploadParser";
import AIResumeBuilder from "@/pages/resume/AIResumeBuilder";
import ATSOptimizer from "@/pages/resume/ATSOptimizer";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export const resumeRoutes = [
  {
    title: "Resume Templates",
    to: "/templates",
    icon: <FileText className="h-4 w-4" />,
    page: <TemplateGallery />,
    requiresAuth: false,
    isPublic: true,
  },
  {
    title: "Upload Resume",
    to: "/upload",
    icon: <Upload className="h-4 w-4" />,
    page: <UploadParser />,
    requiresAuth: false,
    isPublic: true,
  },
  {
    title: "AI Resume Builder", 
    to: "/builder",
    icon: <Sparkles className="h-4 w-4" />,
    page: <AIResumeBuilder />,
    requiresAuth: false,
    isPublic: true,
  },
  {
    title: "ATS Checker",
    to: "/ats-check",
    icon: <Target className="h-4 w-4" />,
    page: <ATSOptimizer />,
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
