import { FileText, Upload, Edit, Download, Mail, Settings, CheckCircle } from "lucide-react";
import ResumeDashboard from "../pages/resume/ResumeDashboard";
import CreateResume from "../pages/resume/CreateResume";
import UploadResume from "../pages/resume/UploadResume";
import { StreamlinedResumeBuilder } from "../components/resume/StreamlinedResumeBuilder";
import ExportResume from "../pages/resume/ExportResume";
import CoverLetterGenerator from "../pages/resume/CoverLetterGenerator";
import EditCoverLetter from "../pages/resume/EditCoverLetter";
import ResumeSettings from "../pages/resume/ResumeSettings";
import ResumeChecker from "../pages/tools/ResumeChecker";
import { EnhancedResumeBuilder } from "../components/resume/enhanced/EnhancedResumeBuilder";

export const resumeRoutes = [
  {
    title: "TalentXcel Resume Dashboard",
    to: "/resume-builder",
    icon: <FileText className="h-4 w-4" />,
    page: <ResumeDashboard />,
  },
  {
    title: "Create New Resume",
    to: "/resume-builder/new",
    icon: <Edit className="h-4 w-4" />,
    page: <CreateResume />,
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
    page: <ResumeChecker />,
  },
  {
    title: "Enhanced Resume Builder - Edit",
    to: "/resume-builder/edit/:id",
    icon: <Edit className="h-4 w-4" />,
    page: <EnhancedResumeBuilder mode="edit" />,
  },
  {
    title: "Enhanced Resume Builder - New",
    to: "/resume-builder/edit/new",
    icon: <Edit className="h-4 w-4" />,
    page: <EnhancedResumeBuilder mode="create" />,
  },
  {
    title: "Enhanced Resume Builder - Create",
    to: "/resume-builder/edit",
    icon: <Edit className="h-4 w-4" />,
    page: <EnhancedResumeBuilder mode="create" />,
  },
  {
    title: "Streamlined Resume Builder (Legacy)",
    to: "/resume/edit/:id",
    icon: <Edit className="h-4 w-4" />,
    page: <StreamlinedResumeBuilder />,
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
