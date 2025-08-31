
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
import CareerChangeNavigator from "../pages/tools/CareerChangeNavigator";
import InterviewReadinessScore from "../pages/tools/InterviewReadinessScore";
import SmartApplyTool from "../pages/tools/SmartApplyTool";
import SalaryBenchmarkTool from "../pages/tools/SalaryBenchmarkTool";
import CoverLetterGenerator from "../pages/tools/CoverLetterGenerator";
import SkillAssessmentEngine from "../pages/tools/SkillAssessmentEngine";
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
import { ProfileScore } from "../pages/tools/ProfileScore";
import MarketInsights from "../pages/tools/MarketInsights";
import ProfessionalBioWriter from "../pages/tools/ProfessionalBioWriter";
import { ProfileOptimizer } from "../pages/tools/ProfileOptimizer";
import MentorConnectTool from "../pages/tools/MentorConnectTool";
import { ResumeGapAnalyzer } from "../pages/tools/ResumeGapAnalyzer";
import AIResumeBuilder from "../pages/tools/AIResumeBuilder";
import ResumeAnalysis from "../pages/tools/ResumeAnalysis";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export const toolsRoutes = [
  {
    title: "Tools",
    to: "/tools",
    icon: <Brain className="h-4 w-4" />,
    page: <ToolsDashboard />,
    isPublic: false,
    requiresAdminAccess: true,
  },
  {
    title: "AI Career Pathfinder",
    to: "/tools/ai-career-pathfinder",
    icon: <Target className="h-4 w-4" />,
    page: <AICareerPathfinder />,
    isPublic: false,
    requiresAdminAccess: true,
  },
  {
    title: "Job Application Funnel",
    to: "/tools/job-application-funnel",
    icon: <BarChart3 className="h-4 w-4" />,
    page: <JobApplicationFunnel />,
    isPublic: false,
    requiresAdminAccess: true,
  },
  {
    title: "Resume Performance Insights",
    to: "/tools/resume-performance-insights",
    icon: <PieChart className="h-4 w-4" />,
    page: <ResumePerformanceInsights />,
    isPublic: false,
    requiresAdminAccess: true,
  },
  {
    title: "Career Growth Score",
    to: "/tools/career-growth-score",
    icon: <Award className="h-4 w-4" />,
    page: <CareerGrowthScore />,
    isPublic: false,
    requiresAdminAccess: true,
  },
  {
    title: "Career SWOT Analysis",
    to: "/tools/career-swot-analysis",
    icon: <Shield className="h-4 w-4" />,
    page: <CareerSWOTAnalysis />,
    isPublic: false,
    requiresAdminAccess: true,
  },
  // Career Tools
  {
    title: "Role Fit Evaluator",
    to: "/tools/role-fit-evaluator",
    icon: <Search className="h-4 w-4" />,
    page: <RoleFitEvaluator />,
    isPublic: false,
    requiresAdminAccess: true,
  },
  {
    title: "Career Change Navigator", 
    to: "/tools/career-change-navigator",
    icon: <ArrowRightLeft className="h-4 w-4" />,
    page: <CareerChangeNavigator />,
    isPublic: false,
    requiresAdminAccess: true,
  },
  // Interview Tools
  {
    title: "Mock Interview Simulator",
    to: "/tools/mock-interview-simulator", 
    icon: <Video className="h-4 w-4" />,
    page: <MockInterviewSimulator />,
    isPublic: false,
    requiresAdminAccess: true,
  },
  {
    title: "Interview Q&A Bank",
    to: "/tools/interview-qa-bank",
    icon: <MessageSquare className="h-4 w-4" />,
    page: <InterviewQABank />,
    isPublic: false,
    requiresAdminAccess: true,
  },
  {
    title: "STAR Answer Generator",
    to: "/tools/star-answer-generator",
    icon: <Star className="h-4 w-4" />,
    page: <STARAnswerGenerator />,
    isPublic: false,
    requiresAdminAccess: true,
  },
  {
    title: "Interview Readiness Score",
    to: "/tools/interview-readiness-score",
    icon: <Award className="h-4 w-4" />,
    page: <InterviewReadinessScore />,
    isPublic: false,
    requiresAdminAccess: true,
  },
  // Job Search Tools
  {
    title: "AI Job Match GPT",
    to: "/tools/ai-job-match-gpt", 
    icon: <Briefcase className="h-4 w-4" />,
    page: <AIJobMatchGPT />,
    isPublic: false,
    requiresAdminAccess: true,
  },
  {
    title: "Smart Apply Tool",
    to: "/tools/smart-apply-tool",
    icon: <Send className="h-4 w-4" />,
    page: <SmartApplyTool />,
    isPublic: false,
    requiresAdminAccess: true,
  },
  {
    title: "Salary Benchmark Tool",
    to: "/tools/salary-benchmark-tool",
    icon: <DollarSign className="h-4 w-4" />,
    page: <SalaryBenchmarkTool />,
    isPublic: false,
    requiresAdminAccess: true,
  },
  {
    title: "Resume Builder",
    to: "/tools/resume-builder",
    icon: <FileText className="h-4 w-4" />,
    page: <ResumeBuilder />,
    isPublic: false,
    requiresAdminAccess: true,
  },
  {
    title: "Salary Analyzer",
    to: "/tools/salary-analyzer",
    icon: <Calculator className="h-4 w-4" />,
    page: <SalaryAnalyzer />,
    isPublic: false,
    requiresAdminAccess: true,
  },
  {
    title: "Interview Prep",
    to: "/tools/interview-prep",
    icon: <MessageSquare className="h-4 w-4" />,
    page: <InterviewPrep />,
    isPublic: false,
    requiresAdminAccess: true,
  },
  {
    title: "Career Pathfinder",
    to: "/tools/career-pathfinder",
    icon: <Target className="h-4 w-4" />,
    page: <CareerPathfinder />,
    isPublic: false,
    requiresAdminAccess: true,
  },
  {
    title: "Resume Optimizer",
    to: "/tools/resume-optimizer",
    icon: <FileText className="h-4 w-4" />,
    page: <ResumeOptimizer />,
    isPublic: false,
    requiresAdminAccess: true,
  },
  {
    title: "Network Builder",
    to: "/tools/network-builder",
    icon: <Users className="h-4 w-4" />,
    page: <NetworkBuilder />,
    isPublic: false,
    requiresAdminAccess: true,
  },
  {
    title: "Skill Assessor",
    to: "/tools/skill-assessor",
    icon: <BookOpen className="h-4 w-4" />,
    page: <SkillAssessor />,
    isPublic: false,
    requiresAdminAccess: true,
  },
  {
    title: "Job Matcher",
    to: "/tools/job-matcher",
    icon: <Briefcase className="h-4 w-4" />,
    page: <JobMatcher />,
    isPublic: false,
    requiresAdminAccess: true,
  },
  {
    title: "Profile Scorer",
    to: "/tools/profile-scorer",
    icon: <User className="h-4 w-4" />,
    page: <ProfileScore />,
    isPublic: false,
    requiresAdminAccess: true,
  },
  {
    title: "Market Insights",
    to: "/tools/market-insights",
    icon: <TrendingUp className="h-4 w-4" />,
    page: <MarketInsights />,
    isPublic: false,
    requiresAdminAccess: true,
  },
  {
    title: "AI Learning Path Generator",
    to: "/tools/ai-learning-path-generator",
    icon: <BookOpen className="h-4 w-4" />,
    page: <AILearningPathGenerator />,
    isPublic: false,
    requiresAdminAccess: true,
  },
  {
    title: "Cover Letter Generator",
    to: "/tools/cover-letter-generator",
    icon: <FileText className="h-4 w-4" />,
    page: <CoverLetterGenerator />,
    isPublic: false,
    requiresAdminAccess: true,
  },
  {
    title: "Skill Assessment Engine",
    to: "/tools/skill-assessment-engine",
    icon: <BookOpen className="h-4 w-4" />,
    page: <SkillAssessmentEngine />,
    isPublic: false,
    requiresAdminAccess: true,
  },
  {
    title: "Professional Bio Writer",
    to: "/tools/professional-bio-writer",
    icon: <Edit3 className="h-4 w-4" />,
    page: <ProfessionalBioWriter />,
    isPublic: false,
    requiresAdminAccess: true,
  },
  {
    title: "AI Profile Optimizer", 
    to: "/tools/ai-profile-optimizer",
    icon: <User className="h-4 w-4" />,
    page: <ProfileOptimizer />,
    isPublic: false,
    requiresAdminAccess: true,
  },
  {
    title: "Mentor Connect Tool",
    to: "/tools/mentor-connect-tool", 
    icon: <Users className="h-4 w-4" />,
    page: <MentorConnectTool />,
    isPublic: false,
    requiresAdminAccess: true,
  },
  {
    title: "Resume Gap Analyzer",
    to: "/tools/resume-gap-analyzer",
    icon: <Target className="h-4 w-4" />,
    page: <ResumeGapAnalyzer />,
    isPublic: false,
    requiresAdminAccess: true,
  },
  {
    title: "AI Resume Builder",
    to: "/tools/ai-resume-builder",
    icon: <FileText className="h-4 w-4" />,
    page: <AIResumeBuilder />,
    isPublic: false,
    requiresAdminAccess: true,
  },
  {
    title: "Resume Tailor Tool",
    to: "/tools/resume-tailor-tool",
    icon: <Scissors className="h-4 w-4" />,
    page: <ResumeTailorTool />,
    isPublic: false,
    requiresAdminAccess: true,
  },
  {
    title: "Skill Gap Analyzer",
    to: "/tools/skill-gap-analyzer",
    icon: <Target className="h-4 w-4" />,
    page: <ErrorBoundary><SkillGapAnalyzer /></ErrorBoundary>,
    isPublic: false,
    requiresAdminAccess: true,
  },
  {
    title: "Network Growth Tracker",
    to: "/tools/network-growth-tracker",
    icon: <Network className="h-4 w-4" />,
    page: <NetworkGrowthTracker />,
    isPublic: false,
    requiresAdminAccess: true,
  },
  {
    title: "AI Outreach Generator",
    to: "/tools/ai-outreach-generator",
    icon: <Send className="h-4 w-4" />,
    page: <AIOutreachGenerator />,
    isPublic: false,
    requiresAdminAccess: true,
  },
  {
    title: "Resume Analysis",
    to: "/resume-analysis",
    icon: <FileText className="h-4 w-4" />,
    page: <ResumeAnalysis />,
    isPublic: false,
    requiresAdminAccess: true,
  },
  {
    title: "Interview Prep",
    to: "/interview-prep",
    icon: <MessageSquare className="h-4 w-4" />,
    page: <InterviewPrep />,
    isPublic: false,
    requiresAdminAccess: true,
  },
];
