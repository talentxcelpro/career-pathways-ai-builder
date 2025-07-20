
import { FileText } from "lucide-react";
import SimpleResumeBuilder from "@/pages/resume/SimpleResumeBuilder";
import EditResume from "@/pages/resume/EditResume";

export const resumeRoutes = [
  {
    title: "Resume Builder",
    to: "/resume/new",
    icon: <FileText className="h-4 w-4" />,
    page: <SimpleResumeBuilder />,
    requiresAuth: true,
  },
  {
    title: "Edit Resume",
    to: "/resume/edit/:id",
    page: <EditResume />,
    requiresAuth: true,
  },
];
