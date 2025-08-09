
import { FileText, Sparkles } from "lucide-react";
import ResumeNew from "@/pages/resume/ResumeNew";
import EditResume from "@/pages/resume/EditResume";
import TalentXcelResumeBuilder from "@/pages/resume/TalentXcelResumeBuilder";
import ResumeEditorV1 from "@/pages/resume/ResumeEditorV1";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export const resumeRoutes = [
  {
    title: "Resume Builder",
    to: "/resume/new",
    icon: <FileText className="h-4 w-4" />,
    page: <ErrorBoundary><ResumeNew /></ErrorBoundary>,
    requiresAuth: false,
  },
  {
    title: "TalentXcel Resume Builder",
    to: "/resume-builder/enhanced/:id",
    icon: <Sparkles className="h-4 w-4" />,
    page: <TalentXcelResumeBuilder />,
    requiresAuth: true,
  },
  {
    title: "Edit Resume",
    to: "/resume/edit/:id",
    page: <EditResume />,
    requiresAuth: true,
  },
];
