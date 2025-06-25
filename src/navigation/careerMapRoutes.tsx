
import { Compass } from "lucide-react";
import CareerMap from "../pages/CareerMap";
import Generate from "../pages/career-map/Generate";
import SkillsGap from "../pages/career-map/SkillsGap";
import Recommendations from "../pages/career-map/Recommendations";
import Comparison from "../pages/career-map/Comparison";

export const careerMapRoutes = [
  {
    title: "Career Map",
    to: "/career-map",
    icon: <Compass className="h-4 w-4" />,
    page: <CareerMap />,
  },
  {
    title: "Generate Career Map",
    to: "/career-map/generate",
    page: <Generate />,
  },
  {
    title: "Skills Gap Analysis",
    to: "/career-map/skills-gap",
    page: <SkillsGap />,
  },
  {
    title: "Career Recommendations",
    to: "/career-map/recommendations",
    page: <Recommendations />,
  },
  {
    title: "Career Comparison",
    to: "/career-map/comparison",
    page: <Comparison />,
  },
];
