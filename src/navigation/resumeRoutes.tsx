
import { FileText } from "lucide-react";
import ComprehensiveResumeBuilder from "@/pages/resume/ComprehensiveResumeBuilder";
import EditResume from "@/pages/resume/EditResume";

export const resumeRoutes = [
  {
    title: "Resume Builder",
    to: "/resume/new",
    icon: <FileText className="h-4 w-4" />,
    page: <ComprehensiveResumeBuilder />,
  },
  {
    title: "Edit Resume",
    to: "/resume/edit/:id",
    page: <EditResume />,
  },
];
