
import { FileText, Sparkles } from "lucide-react";
import { EnhancedResumeBuilder } from "@/components/resume/enhanced/EnhancedResumeBuilder";
import EditResume from "@/pages/resume/EditResume";
import TalentXcelResumeBuilder from "@/pages/resume/TalentXcelResumeBuilder";

export const resumeRoutes = [
  {
    title: "Resume Builder",
    to: "/resume/new",
    icon: <FileText className="h-4 w-4" />,
    page: <SimpleResumeBuilder />,
    requiresAuth: true,
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
