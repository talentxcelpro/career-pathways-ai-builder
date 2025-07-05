
import { Brain, Calculator, MessageSquare, Target, FileText, Users, BookOpen, Briefcase, User, TrendingUp, BarChart3, PieChart, Award, Shield, Search, ArrowRightLeft, Video, Star, Send, DollarSign, Network, UserCheck, Mail, Edit3, Scissors } from "lucide-react";
import RoleFitEvaluator from "../pages/tools/RoleFitEvaluator";
import MockInterviewSimulator from "../pages/tools/MockInterviewSimulator";
import AIOutreachGenerator from "../pages/tools/AIOutreachGenerator";
import ResumeTailorTool from "../pages/tools/ResumeTailorTool";
import SkillGapAnalyzer from "../pages/tools/SkillGapAnalyzer";
import InterviewQABank from "../pages/tools/InterviewQABank";  
import STARAnswerGenerator from "../pages/tools/STARAnswerGenerator";
import AIJobMatchGPT from "../pages/tools/AIJobMatchGPT";
import NetworkGrowthTracker from "../pages/tools/NetworkGrowthTracker";
import AILearningPathGenerator from "../pages/tools/AILearningPathGenerator";
import ToolsDashboard from "../pages/tools/ToolsDashboard";
import AICareerPathfinder from "../pages/tools/AICareerPathfinder";
import JobApplicationFunnel from "../pages/tools/JobApplicationFunnel";
import ResumePerformanceInsights from "../pages/tools/ResumePerformanceInsights";  
import CareerGrowthScore from "../pages/tools/CareerGrowthScore";
import CareerSWOTAnalysis from "../pages/tools/CareerSWOTAnalysis";
import SalaryAnalyzer from "../pages/tools/SalaryAnalyzer";
import InterviewPrep from "../pages/tools/InterviewPrep";
import CareerPathfinder from "../pages/tools/CareerPathfinder";
import ResumeOptimizer from "../pages/tools/ResumeOptimizer";
import ResumeBuilder from "../pages/tools/ResumeBuilder";
import NetworkBuilder from "../pages/tools/NetworkBuilder";
import SkillAssessor from "../pages/tools/SkillAssessor";
import JobMatcher from "../pages/tools/JobMatcher";
import ProfileScore from "../pages/tools/ProfileScore";
import MarketInsights from "../pages/tools/MarketInsights";

export const toolsRoutes = [
  {
    title: "Tools",
    to: "/tools",
    icon: <Brain className="h-4 w-4" />,
    page: <ToolsDashboard />,
  },
  {
    title: "AI Career Pathfinder",
    to: "/tools/ai-career-pathfinder",
    icon: <Target className="h-4 w-4" />,
    page: <AICareerPathfinder />,
  },
  {
    title: "Job Application Funnel",
    to: "/tools/job-application-funnel",
    icon: <BarChart3 className="h-4 w-4" />,
    page: <JobApplicationFunnel />,
  },
  {
    title: "Resume Performance Insights",
    to: "/tools/resume-performance-insights",
    icon: <PieChart className="h-4 w-4" />,
    page: <ResumePerformanceInsights />,
  },
  {
    title: "Career Growth Score",
    to: "/tools/career-growth-score",
    icon: <Award className="h-4 w-4" />,
    page: <CareerGrowthScore />,
  },
  {
    title: "Career SWOT Analysis",
    to: "/tools/career-swot-analysis",
    icon: <Shield className="h-4 w-4" />,
    page: <CareerSWOTAnalysis />,
  },
  // Career Tools
  {
    title: "Role Fit Evaluator",
    to: "/tools/role-fit-evaluator",
    icon: <Search className="h-4 w-4" />,
    page: <RoleFitEvaluator />,
  },
  {
    title: "Career Change Navigator", 
    to: "/tools/career-change-navigator",
    icon: <ArrowRightLeft className="h-4 w-4" />,
    page: <CareerPathfinder />, // Temporary - similar functionality
  },
  // Interview Tools
  {
    title: "Mock Interview Simulator",
    to: "/tools/mock-interview-simulator", 
    icon: <Video className="h-4 w-4" />,
    page: <MockInterviewSimulator />,
  },
  {
    title: "Interview Q&A Bank",
    to: "/tools/interview-qa-bank",
    icon: <MessageSquare className="h-4 w-4" />,
    page: <InterviewQABank />,
  },
  {
    title: "STAR Answer Generator",
    to: "/tools/star-answer-generator",
    icon: <Star className="h-4 w-4" />,
    page: <STARAnswerGenerator />,
  },
  {
    title: "Interview Readiness Score",
    to: "/tools/interview-readiness-score",
    icon: <Award className="h-4 w-4" />,
    page: <ProfileScore />, // Temporary - similar functionality
  },
  // Job Search Tools
  {
    title: "AI Job Match GPT",
    to: "/tools/ai-job-match-gpt", 
    icon: <Briefcase className="h-4 w-4" />,
    page: <AIJobMatchGPT />,
  },
  {
    title: "Smart Apply Tool",
    to: "/tools/smart-apply-tool",
    icon: <Send className="h-4 w-4" />,
    page: <JobMatcher />, // Temporary - similar functionality
  },
  {
    title: "Salary Benchmark Tool",
    to: "/tools/salary-benchmark-tool",
    icon: <DollarSign className="h-4 w-4" />,
    page: <SalaryAnalyzer />, // Temporary - similar functionality
  },
  {
    title: "Resume Builder",
    to: "/tools/resume-builder",
    icon: <FileText className="h-4 w-4" />,
    page: <ResumeBuilder />,
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
  {
    title: "Job Matcher",
    to: "/tools/job-matcher",
    icon: <Briefcase className="h-4 w-4" />,
    page: <JobMatcher />,
  },
  {
    title: "Profile Scorer",
    to: "/tools/profile-scorer",
    icon: <User className="h-4 w-4" />,
    page: <ProfileScore />,
  },
  {
    title: "Market Insights",
    to: "/tools/market-insights",
    icon: <TrendingUp className="h-4 w-4" />,
    page: <MarketInsights />,
  },
];
