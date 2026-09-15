import { lazy } from "react";
import { Calculator, MessageSquare, Target, FileText, Users, BookOpen, Briefcase, User, TrendingUp, BarChart3, PieChart, Award, Shield, Search, ArrowRightLeft, Video, Star, Send, DollarSign, Network, Edit3, Scissors } from "lucide-react";

const RoleFitEvaluator = lazy(() => import("../pages/tools/RoleFitEvaluator"));
const MockInterviewSimulator = lazy(() => import("../pages/tools/MockInterviewSimulator"));
const AIOutreachGenerator = lazy(() => import("../pages/tools/AIOutreachGenerator"));
const ResumeTailorTool = lazy(() => import("../pages/tools/ResumeTailorTool"));
const SkillGapAnalyzer = lazy(() => import("../pages/tools/SkillGapAnalyzer"));
const InterviewQABank = lazy(() => import("../pages/tools/InterviewQABank"));  
const STARAnswerGenerator = lazy(() => import("../pages/tools/STARAnswerGenerator"));
const AIJobMatchGPT = lazy(() => import("../pages/tools/AIJobMatchGPT"));
const NetworkGrowthTracker = lazy(() => import("../pages/tools/NetworkGrowthTracker"));
const AILearningPathGenerator = lazy(() => import("../pages/tools/AILearningPathGenerator"));
const CareerChangeNavigator = lazy(() => import("../pages/tools/CareerChangeNavigator"));
const InterviewReadinessScore = lazy(() => import("../pages/tools/InterviewReadinessScore"));
const SmartApplyTool = lazy(() => import("../pages/tools/SmartApplyTool"));
const SalaryBenchmarkTool = lazy(() => import("../pages/tools/SalaryBenchmarkTool"));
const CoverLetterGenerator = lazy(() => import("../pages/tools/CoverLetterGenerator"));
const SkillAssessmentEngine = lazy(() => import("../pages/tools/SkillAssessmentEngine"));
const ToolsCommandCenter = lazy(() => import("../pages/tools/ToolsDashboard"));
const AICareerPathfinder = lazy(() => import("../pages/tools/AICareerPathfinder"));
const JobApplicationFunnel = lazy(() => import("../pages/tools/JobApplicationFunnel"));
const ResumePerformanceInsights = lazy(() => import("../pages/tools/ResumePerformanceInsights"));  
const CareerGrowthScore = lazy(() => import("../pages/tools/CareerGrowthScore"));
const CareerSWOTAnalysis = lazy(() => import("../pages/tools/CareerSWOTAnalysis"));
const SalaryAnalyzer = lazy(() => import("../pages/tools/SalaryAnalyzer"));
const InterviewPrep = lazy(() => import("../pages/tools/InterviewPrep"));
const CareerPathfinder = lazy(() => import("../pages/tools/CareerPathfinder"));
const ResumeOptimizer = lazy(() => import("../pages/tools/ResumeOptimizer"));
const ResumeBuilder = lazy(() => import("../pages/tools/ResumeBuilder"));
const NetworkBuilder = lazy(() => import("../pages/tools/NetworkBuilder"));
const SkillAssessor = lazy(() => import("../pages/tools/SkillAssessor"));
const JobMatcher = lazy(() => import("../pages/tools/JobMatcher"));
const ProfileScore = lazy(() => import("../pages/tools/ProfileScore").then(m => ({ default: m.ProfileScore })));
const MarketInsights = lazy(() => import("../pages/tools/MarketInsights"));
const ProfessionalBioWriter = lazy(() => import("../pages/tools/ProfessionalBioWriter"));
const ProfileOptimizer = lazy(() => import("../pages/tools/ProfileOptimizer").then(m => ({ default: m.ProfileOptimizer })));
const MentorConnectTool = lazy(() => import("../pages/tools/MentorConnectTool"));
const ResumeGapAnalyzer = lazy(() => import("../pages/tools/ResumeGapAnalyzer").then(m => ({ default: m.ResumeGapAnalyzer })));
const AIResumeBuilder = lazy(() => import("../pages/tools/AIResumeBuilder"));
const ResumeAnalysis = lazy(() => import("../pages/tools/ResumeAnalysis"));

import { ErrorBoundary } from "@/components/ErrorBoundary";


export const toolsRoutes = [
  {
    title: "Tools",
    to: "/tools",
    icon: <Target className="h-4 w-4" />,
    page: <ToolsCommandCenter />,
    isPublic: true,
  },
  {
    title: "Navigator Pathfinder",
    to: "/tools/navigator-pathfinder",
    icon: <Target className="h-4 w-4" />,
    page: <AICareerPathfinder />,
    isPublic: true,
  },
  {
    title: "Job Application Funnel",
    to: "/tools/job-application-funnel",
    icon: <BarChart3 className="h-4 w-4" />,
    page: <JobApplicationFunnel />,
    isPublic: true,
  },
  {
    title: "Resume Performance Insights",
    to: "/tools/resume-performance-insights",
    icon: <PieChart className="h-4 w-4" />,
    page: <ResumePerformanceInsights />,
    isPublic: true,
  },
  {
    title: "Career Growth Score",
    to: "/tools/career-growth-score",
    icon: <Award className="h-4 w-4" />,
    page: <CareerGrowthScore />,
    isPublic: true,
  },
  {
    title: "Career SWOT Analysis",
    to: "/tools/career-swot-analysis",
    icon: <Shield className="h-4 w-4" />,
    page: <CareerSWOTAnalysis />,
    isPublic: true,
  },
  // Career Tools
  {
    title: "Role Fit Evaluator",
    to: "/tools/role-fit-evaluator",
    icon: <Search className="h-4 w-4" />,
    page: <RoleFitEvaluator />,
    isPublic: true,
  },
  {
    title: "Career Change Navigator", 
    to: "/tools/career-change-navigator",
    icon: <ArrowRightLeft className="h-4 w-4" />,
    page: <CareerChangeNavigator />,
    isPublic: true,
  },
  // Interview Tools
  {
    title: "Mock Interview Simulator",
    to: "/tools/mock-interview-simulator", 
    icon: <Video className="h-4 w-4" />,
    page: <MockInterviewSimulator />,
    isPublic: true,
  },
  {
    title: "Interview Q&A Bank",
    to: "/tools/interview-qa-bank",
    icon: <MessageSquare className="h-4 w-4" />,
    page: <InterviewQABank />,
    isPublic: true,
  },
  {
    title: "STAR Answer Generator",
    to: "/tools/star-answer-generator",
    icon: <Star className="h-4 w-4" />,
    page: <STARAnswerGenerator />,
    isPublic: true,
  },
  {
    title: "Interview Readiness Score",
    to: "/tools/interview-readiness-score",
    icon: <Award className="h-4 w-4" />,
    page: <InterviewReadinessScore />,
    isPublic: true,
  },
  // Job Search Tools
  {
    title: "Precision Match Lab",
    to: "/tools/precision-match-lab", 
    icon: <Briefcase className="h-4 w-4" />,
    page: <AIJobMatchGPT />,
    isPublic: true,
  },
  {
    title: "Smart Apply Tool",
    to: "/tools/smart-apply-tool",
    icon: <Send className="h-4 w-4" />,
    page: <SmartApplyTool />,
    isPublic: true,
  },
  {
    title: "Salary Benchmark Tool",
    to: "/tools/salary-benchmark-tool",
    icon: <DollarSign className="h-4 w-4" />,
    page: <SalaryBenchmarkTool />,
    isPublic: true,
  },
  {
    title: "Resume Builder",
    to: "/tools/resume-builder",
    icon: <FileText className="h-4 w-4" />,
    page: <ResumeBuilder />,
    isPublic: true,
  },
  {
    title: "Salary Analyzer",
    to: "/tools/salary-analyzer",
    icon: <Calculator className="h-4 w-4" />,
    page: <SalaryAnalyzer />,
    isPublic: true,
  },
  {
    title: "Interview Prep",
    to: "/tools/interview-prep",
    icon: <MessageSquare className="h-4 w-4" />,
    page: <InterviewPrep />,
    isPublic: true,
  },
  {
    title: "Career Pathfinder",
    to: "/tools/career-pathfinder",
    icon: <Target className="h-4 w-4" />,
    page: <CareerPathfinder />,
    isPublic: true,
  },
  {
    title: "Resume Optimizer",
    to: "/tools/resume-optimizer",
    icon: <FileText className="h-4 w-4" />,
    page: <ResumeOptimizer />,
    isPublic: true,
  },
  {
    title: "Network Builder",
    to: "/tools/network-builder",
    icon: <Users className="h-4 w-4" />,
    page: <NetworkBuilder />,
    isPublic: true,
  },
  {
    title: "Skill Assessor",
    to: "/tools/skill-assessor",
    icon: <BookOpen className="h-4 w-4" />,
    page: <SkillAssessor />,
    isPublic: true,
  },
  {
    title: "Job Matcher",
    to: "/tools/job-matcher",
    icon: <Briefcase className="h-4 w-4" />,
    page: <JobMatcher />,
    isPublic: true,
  },
  {
    title: "Profile Scorer",
    to: "/tools/profile-scorer",
    icon: <User className="h-4 w-4" />,
    page: <ProfileScore />,
    isPublic: true,
  },
  {
    title: "Market Insights",
    to: "/tools/market-insights",
    icon: <TrendingUp className="h-4 w-4" />,
    page: <MarketInsights />,
    isPublic: true,
  },
  {
    title: "Growth Path Builder",
    to: "/tools/growth-path-builder",
    icon: <BookOpen className="h-4 w-4" />,
    page: <AILearningPathGenerator />,
    isPublic: true,
  },
  {
    title: "Cover Letter Generator",
    to: "/tools/cover-letter-generator",
    icon: <FileText className="h-4 w-4" />,
    page: <CoverLetterGenerator />,
    isPublic: true,
  },
  {
    title: "Skill Assessment Engine",
    to: "/tools/skill-assessment-engine",
    icon: <BookOpen className="h-4 w-4" />,
    page: <SkillAssessmentEngine />,
    isPublic: true,
  },
  {
    title: "Professional Bio Writer",
    to: "/tools/professional-bio-writer",
    icon: <Edit3 className="h-4 w-4" />,
    page: <ProfessionalBioWriter />,
    isPublic: true,
  },
  {
    title: "Profile Optimizer", 
    to: "/tools/profile-optimizer",
    icon: <User className="h-4 w-4" />,
    page: <ProfileOptimizer />,
    isPublic: true,
  },
  {
    title: "Mentor Connect Tool",
    to: "/tools/mentor-connect-tool", 
    icon: <Users className="h-4 w-4" />,
    page: <MentorConnectTool />,
    isPublic: true,
  },
  {
    title: "Resume Gap Analyzer",
    to: "/tools/resume-gap-analyzer",
    icon: <Target className="h-4 w-4" />,
    page: <ResumeGapAnalyzer />,
    isPublic: true,
  },
  {
    title: "Resume Builder Pro",
    to: "/tools/resume-builder-pro",
    icon: <FileText className="h-4 w-4" />,
    page: <AIResumeBuilder />,
    isPublic: true,
  },
  {
    title: "Resume Tailor Tool",
    to: "/tools/resume-tailor-tool",
    icon: <Scissors className="h-4 w-4" />,
    page: <ResumeTailorTool />,
    isPublic: true,
  },
  {
    title: "Skill Gap Analyzer",
    to: "/tools/skill-gap-analyzer",
    icon: <Target className="h-4 w-4" />,
    page: <ErrorBoundary><SkillGapAnalyzer /></ErrorBoundary>,
    isPublic: true,
  },
  {
    title: "Talent Network Growth",
    to: "/tools/talent-network-growth",
    icon: <Network className="h-4 w-4" />,
    page: <NetworkGrowthTracker />,
    isPublic: true,
  },
  {
    title: "Outreach Builder",
    to: "/tools/outreach-builder",
    icon: <Send className="h-4 w-4" />,
    page: <AIOutreachGenerator />,
    isPublic: true,
  },
  {
    title: "Resume Analysis",
    to: "/resume-analysis",
    icon: <FileText className="h-4 w-4" />,
    page: <ResumeAnalysis />,
    isPublic: true,
  },
  {
    title: "Interview Prep",
    to: "/interview-prep",
    icon: <MessageSquare className="h-4 w-4" />,
    page: <InterviewPrep />,
    isPublic: true,
  },
];
