
import { Brain, Calculator, MessageSquare, Target, FileText, Users, BookOpen, Briefcase, User, TrendingUp } from "lucide-react";
import Tools from "../pages/Tools";
import SalaryAnalyzer from "../pages/tools/SalaryAnalyzer";
import InterviewPrep from "../pages/tools/InterviewPrep";
import CareerPathfinder from "../pages/tools/CareerPathfinder";
import ResumeOptimizer from "../pages/tools/ResumeOptimizer";
import NetworkBuilder from "../pages/tools/NetworkBuilder";
import SkillAssessor from "../pages/tools/SkillAssessor";

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
  {
    title: "Career Pathfinder",
    to: "/tools/career-pathfinder",
    icon: <Target className="h-4 w-4" />,
    page: <CareerPathfinder />,
  },
  {
    title: "Resume Optimizer",
    to: "/tools/resume-optimizer",
    icon: <FileText className="h-4 w-4" />,
    page: <ResumeOptimizer />,
  },
  {
    title: "Network Builder",
    to: "/tools/network-builder",
    icon: <Users className="h-4 w-4" />,
    page: <NetworkBuilder />,
  },
  {
    title: "Skill Assessor",
    to: "/tools/skill-assessor",
    icon: <BookOpen className="h-4 w-4" />,
    page: <SkillAssessor />,
  },
  // Placeholder routes for other tools - can be implemented later
  {
    title: "Job Matcher",
    to: "/tools/job-matcher",
    page: <Tools />, // Fallback to main tools page for now
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
