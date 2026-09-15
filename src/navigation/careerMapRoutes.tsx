import { lazy } from "react";
import { Compass, TrendingUp, Users, Shield, Target } from "lucide-react";

const CareerMap = lazy(() => import("../pages/CareerMap"));
const Generate = lazy(() => import("../pages/career-map/Generate"));
const SkillsGap = lazy(() => import("../pages/career-map/SkillsGap"));
const Recommendations = lazy(() => import("../pages/career-map/Recommendations"));
const Comparison = lazy(() => import("../pages/career-map/Comparison"));
const AIRoadmapBuilder = lazy(() => import("../pages/career-map/AIRoadmapBuilder"));
const MyRoadmaps = lazy(() => import("../pages/career-map/MyRoadmaps"));
const RoadmapDetail = lazy(() => import("../pages/career-map/RoadmapDetail"));
const CareerSwitch = lazy(() => import("../pages/career-map/CareerSwitch"));
const EnhancedCareerCareerAnalytics = lazy(() => import("../components/ai/EnhancedCareerAnalytics"));
const IndustryBenchmarking = lazy(() => import("../components/ai/IndustryBenchmarking"));
const CareerCredibilityScore = lazy(() => import("../components/ai/CareerCredibilityScore"));
const NetworkingIntelligence = lazy(() => import("../components/ai/NetworkingIntelligence"));
const ComprehensiveCareerIntelligence = lazy(() => import("../pages/ComprehensiveCareerIntelligence"));


export const careerMapRoutes = [
  {
    title: "Comprehensive CareerIntelligence",
    to: "/career-map/comprehensive-intelligence",
    icon: <Compass className="h-4 w-4" />,
    page: <ComprehensiveCareerIntelligence />,
    isPublic: true,
  },
  {
    title: "Career Map",
    to: "/career-map",
    icon: <Compass className="h-4 w-4" />,
    page: <CareerMap />,
    isPublic: true,
  },
  {
    title: "Generate Career Map",
    to: "/career-map/generate",
    page: <Generate />,
    isPublic: true,
  },
  {
    title: "AI Roadmap Builder",
    to: "/career-map/ai-roadmap-builder",
    page: <AIRoadmapBuilder />,
    isPublic: true,
  },
  {
    title: "My Roadmaps",
    to: "/career-map/my-roadmaps", 
    page: <MyRoadmaps />,
    isPublic: true,
  },
  {
    title: "Roadmap Detail",
    to: "/career-map/:id",
    page: <RoadmapDetail />,
    isPublic: true,
  },
  {
    title: "Skills Gap Analysis",
    to: "/career-map/skills-gap",
    page: <SkillsGap />,
    isPublic: true,
  },
  {
    title: "Career Recommendations",
    to: "/career-map/recommendations",
    page: <Recommendations />,
    isPublic: true,
  },
  {
    title: "Career Comparison",
    to: "/career-map/comparison",
    page: <Comparison />,
    isPublic: true,
  },
  {
    title: "Career Switch Evaluator",
    to: "/career-map/switch",
    page: <CareerSwitch />,
    isPublic: true,
  },
  {
    title: "Enhanced Career CareerAnalytics",
    to: "/career-map/enhanced-CareerAnalytics",
    icon: <TrendingUp className="h-4 w-4" />,
    page: <EnhancedCareerCareerAnalytics />,
    isPublic: true,
  },
  {
    title: "Industry Benchmarking",
    to: "/career-map/industry-benchmarking",
    icon: <Target className="h-4 w-4" />,
    page: <IndustryBenchmarking />,
    isPublic: true,
  },
  {
    title: "Career Credibility Score",
    to: "/career-map/credibility-score",
    icon: <Shield className="h-4 w-4" />,
    page: <CareerCredibilityScore />,
    isPublic: true,
  },
  {
    title: "Networking Intelligence",
    to: "/career-map/networking",
    icon: <Users className="h-4 w-4" />,
    page: <NetworkingIntelligence />,
    isPublic: true,
  },
];




