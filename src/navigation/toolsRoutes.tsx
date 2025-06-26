
import Tools from "../pages/Tools";
import ResumeCheck from "../pages/tools/ResumeCheck";
import CoverLetter from "../pages/tools/CoverLetter";
import SalaryAnalyzer from "../pages/tools/SalaryAnalyzer";
import InterviewPrep from "../pages/tools/InterviewPrep";
import AICareerAssistant from "../pages/tools/AICareerAssistant";
import ProfileScore from "../pages/tools/ProfileScore";
import MarketInsights from "../pages/tools/MarketInsights";
import ToolsDashboard from "../pages/tools/ToolsDashboard";

export const toolsRoutes = [
  {
    title: "Tools",
    to: "/tools",
    page: <Tools />,
  },
  {
    title: "Tools Dashboard",
    to: "/tools/dashboard",
    page: <ToolsDashboard />,
  },
  {
    title: "Resume Checker",
    to: "/tools/resume-check",
    page: <ResumeCheck />,
  },
  {
    title: "Cover Letter Generator",
    to: "/tools/cover-letter",
    page: <CoverLetter />,
  },
  {
    title: "Salary Analyzer",
    to: "/tools/salary-analyzer",
    page: <SalaryAnalyzer />,
  },
  {
    title: "Interview Prep",
    to: "/tools/interview-prep",
    page: <InterviewPrep />,
  },
  {
    title: "AI Career Assistant",
    to: "/tools/ai-assistant",
    page: <AICareerAssistant />,
  },
  {
    title: "Profile Score",
    to: "/tools/profile-score",
    page: <ProfileScore />,
  },
  {
    title: "Market Insights",
    to: "/tools/market-insights",
    page: <MarketInsights />,
  },
];
