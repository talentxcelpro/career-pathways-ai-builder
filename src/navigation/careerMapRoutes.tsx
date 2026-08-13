import { lazy, Suspense } from 'react';

import { Compass, TrendingUp, Users, Shield, Target } from "lucide-react";

const ComprehensiveCareerIntelligence = lazy(() => import('../pages/ComprehensiveCareerIntelligence'));
const NetworkingIntelligence = lazy(() => import('../components/ai/NetworkingIntelligence'));
const CareerCredibilityScore = lazy(() => import('../components/ai/CareerCredibilityScore'));
const IndustryBenchmarking = lazy(() => import('../components/ai/IndustryBenchmarking'));
const EnhancedCareerAnalytics = lazy(() => import('../components/ai/EnhancedCareerAnalytics'));
const CareerSwitch = lazy(() => import('../pages/career-map/CareerSwitch'));
const RoadmapDetail = lazy(() => import('../pages/career-map/RoadmapDetail'));
const MyRoadmaps = lazy(() => import('../pages/career-map/MyRoadmaps'));
const AIRoadmapBuilder = lazy(() => import('../pages/career-map/AIRoadmapBuilder'));
const Comparison = lazy(() => import('../pages/career-map/Comparison'));
const Recommendations = lazy(() => import('../pages/career-map/Recommendations'));
const SkillsGap = lazy(() => import('../pages/career-map/SkillsGap'));
const Generate = lazy(() => import('../pages/career-map/Generate'));
const CareerMap = lazy(() => import('../pages/CareerMap'));

export const careerMapRoutes = [
  {
    title: "Comprehensive Career Intelligence",
    to: "/career-map/comprehensive-intelligence",
    icon: <Compass className="h-4 w-4" />,
    page: <Suspense fallback={null}><ComprehensiveCareerIntelligence /></Suspense>,
    isPublic: true,
  },
  {
    title: "Career Map",
    to: "/career-map",
    icon: <Compass className="h-4 w-4" />,
    page: <Suspense fallback={null}><CareerMap /></Suspense>,
    isPublic: true,
  },
  {
    title: "Generate Career Map",
    to: "/career-map/generate",
    page: <Suspense fallback={null}><Generate /></Suspense>,
    isPublic: true,
  },
  {
    title: "AI Roadmap Builder",
    to: "/career-map/ai-roadmap-builder",
    page: <Suspense fallback={null}><AIRoadmapBuilder /></Suspense>,
    isPublic: true,
  },
  {
    title: "My Roadmaps",
    to: "/career-map/my-roadmaps", 
    page: <Suspense fallback={null}><MyRoadmaps /></Suspense>,
    isPublic: true,
  },
  {
    title: "Roadmap Detail",
    to: "/career-map/:id",
    page: <Suspense fallback={null}><RoadmapDetail /></Suspense>,
    isPublic: true,
  },
  {
    title: "Skills Gap Analysis",
    to: "/career-map/skills-gap",
    page: <Suspense fallback={null}><SkillsGap /></Suspense>,
    isPublic: true,
  },
  {
    title: "Career Recommendations",
    to: "/career-map/recommendations",
    page: <Suspense fallback={null}><Recommendations /></Suspense>,
    isPublic: true,
  },
  {
    title: "Career Comparison",
    to: "/career-map/comparison",
    page: <Suspense fallback={null}><Comparison /></Suspense>,
    isPublic: true,
  },
  {
    title: "Career Switch Evaluator",
    to: "/career-map/switch",
    page: <Suspense fallback={null}><CareerSwitch /></Suspense>,
    isPublic: true,
  },
  {
    title: "Enhanced Career Analytics",
    to: "/career-map/enhanced-analytics",
    icon: <TrendingUp className="h-4 w-4" />,
    page: <Suspense fallback={null}><EnhancedCareerAnalytics /></Suspense>,
    isPublic: true,
  },
  {
    title: "Industry Benchmarking",
    to: "/career-map/industry-benchmarking",
    icon: <Target className="h-4 w-4" />,
    page: <Suspense fallback={null}><IndustryBenchmarking /></Suspense>,
    isPublic: true,
  },
  {
    title: "Career Credibility Score",
    to: "/career-map/credibility-score",
    icon: <Shield className="h-4 w-4" />,
    page: <Suspense fallback={null}><CareerCredibilityScore /></Suspense>,
    isPublic: true,
  },
  {
    title: "Networking Intelligence",
    to: "/career-map/networking",
    icon: <Users className="h-4 w-4" />,
    page: <Suspense fallback={null}><NetworkingIntelligence /></Suspense>,
    isPublic: true,
  },
];
