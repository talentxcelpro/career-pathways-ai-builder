
import { FileText, Upload, Edit, Download, Mail, Settings } from "lucide-react";
import ResumeBuilder from "../pages/resume/ResumeBuilder";
import NewResume from "../pages/resume/NewResume";
import EditResume from "../pages/resume/EditResume";
import ExportResume from "../pages/resume/ExportResume";
import CoverLetterGenerator from "../pages/resume/CoverLetterGenerator";
import EditCoverLetter from "../pages/resume/EditCoverLetter";
import ResumeSettings from "../pages/resume/ResumeSettings";

export const resumeRoutes = [
  {
    title: "Resume Builder Dashboard",
    to: "/resume-builder",
    icon: <FileText className="h-4 w-4" />,
    page: <ResumeBuilder />,
  },
  {
    title: "Create New Resume",
    to: "/resume-builder/new",
    icon: <Edit className="h-4 w-4" />,
    page: <NewResume />,
  },
  {
    title: "Edit Resume",
    to: "/resume-builder/edit/:id",
    icon: <Edit className="h-4 w-4" />,
    page: <EditResume />,
  },
  {
    title: "Export Resume",
    to: "/resume-builder/export/:id",
    icon: <Download className="h-4 w-4" />,
    page: <ExportResume />,
  },
  {
    title: "Cover Letter Generator",
    to: "/resume-builder/cover-letter",
    icon: <Mail className="h-4 w-4" />,
    page: <CoverLetterGenerator />,
  },
  {
    title: "Edit Cover Letter",
    to: "/resume-builder/cover-letter/edit/:id",
    icon: <Edit className="h-4 w-4" />,
    page: <EditCoverLetter />,
  },
  {
    title: "Resume Builder Settings",
    to: "/resume-builder/settings",
    icon: <Settings className="h-4 w-4" />,
    page: <ResumeSettings />,
  },
];
