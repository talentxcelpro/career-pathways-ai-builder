
import { FileText, Upload, Edit, Download, Mail, Settings, CheckCircle, Palette } from "lucide-react";
import AppleResumeDashboard from "../pages/resume/AppleResumeDashboard";
import AppleTemplateSelection from "../pages/resume/AppleTemplateSelection";
import AppleResumeEditor from "../pages/resume/AppleResumeEditor";
import AppleResumeChecker from "../pages/resume/AppleResumeChecker";
import UploadResume from "../pages/resume/UploadResume";
import ExportResume from "../pages/resume/ExportResume";
import CoverLetterGenerator from "../pages/resume/CoverLetterGenerator";
import EditCoverLetter from "../pages/resume/EditCoverLetter";
import ResumeSettings from "../pages/resume/ResumeSettings";

export const resumeRoutes = [
  {
    title: "TalentXcel Resume Dashboard",
    to: "/resume-builder",
    icon: <FileText className="h-4 w-4" />,
    page: <AppleResumeDashboard />,
  },
  {
    title: "Template Selection",
    to: "/resume-builder/templates",
    icon: <Palette className="h-4 w-4" />,
    page: <AppleTemplateSelection />,
  },
  {
    title: "Create New Resume",
    to: "/resume-builder/new",
    icon: <Edit className="h-4 w-4" />,
    page: <AppleResumeEditor />,
  },
  {
    title: "Edit Resume",
    to: "/resume-builder/edit/:id",
    icon: <Edit className="h-4 w-4" />,
    page: <AppleResumeEditor />,
  },
  {
    title: "Upload Resume",
    to: "/resume-builder/upload",
    icon: <Upload className="h-4 w-4" />,
    page: <UploadResume />,
  },
  {
    title: "TalentXcel Resume Checker",
    to: "/resume-builder/checker",
    icon: <CheckCircle className="h-4 w-4" />,
    page: <AppleResumeChecker />,
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
