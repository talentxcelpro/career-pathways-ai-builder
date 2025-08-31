
import { Compass } from "lucide-react";
import CareerMap from "../pages/CareerMap";
import Generate from "../pages/career-map/Generate";
import SkillsGap from "../pages/career-map/SkillsGap";
import Recommendations from "../pages/career-map/Recommendations";
import Comparison from "../pages/career-map/Comparison";
import AIRoadmapBuilder from "../pages/career-map/AIRoadmapBuilder";
import MyRoadmaps from "../pages/career-map/MyRoadmaps";
import RoadmapDetail from "../pages/career-map/RoadmapDetail";
import CareerSwitch from "../pages/career-map/CareerSwitch";

export const careerMapRoutes = [
  {
    title: "Career Map",
    to: "/career-map",
    icon: <Compass className="h-4 w-4" />,
    page: <CareerMap />,
    isPublic: false,
    requiresAdminAccess: true,
  },
  {
    title: "Generate Career Map",
    to: "/career-map/generate",
    page: <Generate />,
    isPublic: false,
    requiresAdminAccess: true,
  },
  {
    title: "AI Roadmap Builder",
    to: "/career-map/ai-roadmap-builder",
    page: <AIRoadmapBuilder />,
    isPublic: false,
    requiresAdminAccess: true,
  },
  {
    title: "My Roadmaps",
    to: "/career-map/my-roadmaps", 
    page: <MyRoadmaps />,
    isPublic: false,
    requiresAdminAccess: true,
  },
  {
    title: "Roadmap Detail",
    to: "/career-map/:id",
    page: <RoadmapDetail />,
    isPublic: false,
    requiresAdminAccess: true,
  },
  {
    title: "Skills Gap Analysis",
    to: "/career-map/skills-gap",
    page: <SkillsGap />,
    isPublic: false,
    requiresAdminAccess: true,
  },
  {
    title: "Career Recommendations",
    to: "/career-map/recommendations",
    page: <Recommendations />,
    isPublic: false,
    requiresAdminAccess: true,
  },
  {
    title: "Career Comparison",
    to: "/career-map/comparison",
    page: <Comparison />,
    isPublic: false,
    requiresAdminAccess: true,
  },
  {
    title: "Career Switch Evaluator",
    to: "/career-map/switch",
    page: <CareerSwitch />,
    isPublic: false,
    requiresAdminAccess: true,
  },
];
