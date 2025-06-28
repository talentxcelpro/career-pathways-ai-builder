
import { Brain, Calculator, MessageSquare } from "lucide-react";
import Tools from "../pages/Tools";
import SalaryAnalyzer from "../pages/tools/SalaryAnalyzer";
import InterviewPrep from "../pages/tools/InterviewPrep";

export const toolsRoutes = [
  {
    title: "Tools",
    to: "/tools",
    icon: <Brain className="h-4 w-4" />,
    page: <Tools />,
  },
  {
    title: "Salary Analyzer",
    to: "/tools/salary-analyzer",
    icon: <Calculator className="h-4 w-4" />,
    page: <SalaryAnalyzer />,
  },
  {
    title: "Interview Prep",
    to: "/tools/interview-prep",
    icon: <MessageSquare className="h-4 w-4" />,
    page: <InterviewPrep />,
  },
  // Placeholder routes for other tools - can be implemented later
  {
    title: "Resume Optimizer",
    to: "/tools/resume-optimizer",
    page: <Tools />, // Fallback to main tools page for now
  },
  {
    title: "Career Pathfinder",
    to: "/tools/career-pathfinder",
    page: <Tools />,
  },
  {
    title: "Network Builder",
    to: "/tools/network-builder",
    page: <Tools />,
  },
  {
    title: "Skill Assessor",
    to: "/tools/skill-assessor",
    page: <Tools />,
  },
  {
    title: "Job Matcher",
    to: "/tools/job-matcher",
    page: <Tools />,
  },
  {
    title: "Profile Scorer",
    to: "/tools/profile-scorer",
    page: <Tools />,
  },
  {
    title: "Market Insights",
    to: "/tools/market-insights",
    page: <Tools />,
  },
];
