
import { FileText, Edit } from "lucide-react";
import { StreamlinedResumeCreator } from "../pages/resume/StreamlinedResumeCreator";
import { EnhancedResumeBuilder } from "../components/resume/enhanced/EnhancedResumeBuilder";

export const resumeRoutes = [
  {
    title: "Create Resume",
    to: "/resume/new",
    icon: <FileText className="h-4 w-4" />,
    page: <StreamlinedResumeCreator />,
  },
  {
    title: "Edit Resume",
    to: "/resume/edit/:id",
    icon: <Edit className="h-4 w-4" />,
    page: <EnhancedResumeBuilder mode="edit" />,
  },
];
