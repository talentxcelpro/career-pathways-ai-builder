
import { FileText, Upload, Edit, Eye, Download, Mail, Settings } from "lucide-react";
import ResumeDashboard from "../pages/resume/ResumeDashboard";
import CreateResume from "../pages/resume/CreateResume";
import UploadResume from "../pages/resume/UploadResume";
import EditResume from "../pages/resume/EditResume";
import ResumeTemplates from "../pages/resume/ResumeTemplates";
import ExportResume from "../pages/resume/ExportResume";
import CoverLetterGenerator from "../pages/resume/CoverLetterGenerator";
import EditCoverLetter from "../pages/resume/EditCoverLetter";
import ResumeSettings from "../pages/resume/ResumeSettings";

export const resumeRoutes = [
  {
    title: "Resume Dashboard",
    to: "/resume",
    icon: <FileText className="h-4 w-4" />,
    page: <ResumeDashboard />,
  },
  {
    title: "Create New Resume",
    to: "/resume/new",
    icon: <Edit className="h-4 w-4" />,
    page: <CreateResume />,
  },
  {
    title: "Upload Resume",
    to: "/resume/upload",
    icon: <Upload className="h-4 w-4" />,
    page: <UploadResume />,
  },
  {
    title: "Edit Resume",
    to: "/resume/edit/:id",
    icon: <Edit className="h-4 w-4" />,
    page: <EditResume />,
  },
  {
    title: "Resume Templates",
    to: "/resume/templates",
    icon: <Eye className="h-4 w-4" />,
    page: <ResumeTemplates />,
  },
  {
    title: "Export Resume",
    to: "/resume/export/:id",
    icon: <Download className="h-4 w-4" />,
    page: <ExportResume />,
  },
  {
    title: "Cover Letter Generator",
    to: "/resume/cover-letter",
    icon: <Mail className="h-4 w-4" />,
    page: <CoverLetterGenerator />,
  },
  {
    title: "Edit Cover Letter",
    to: "/resume/cover-letter/edit/:id",
    icon: <Edit className="h-4 w-4" />,
    page: <EditCoverLetter />,
  },
  {
    title: "Resume Settings",
    to: "/resume/settings",
    icon: <Settings className="h-4 w-4" />,
    page: <ResumeSettings />,
  },
];
