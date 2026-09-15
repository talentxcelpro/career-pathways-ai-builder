import { lazy } from "react";
import { NavItem } from "@/types/nav-item";
import { Building2, TrendingUp, Target, BarChart3, UserPlus } from "lucide-react";

const Enterprise = lazy(() => import("@/pages/Enterprise").then(m => ({ default: m.Enterprise })));
const EnterpriseSolutions = lazy(() => import("@/components/enterprise/EnterpriseSolutions").then(m => ({ default: m.EnterpriseSolutions })));
const InternalMobility = lazy(() => import("@/pages/enterprise/InternalMobility").then(m => ({ default: m.InternalMobility })));
const SkillGapAnalysis = lazy(() => import("@/pages/enterprise/SkillGapAnalysis").then(m => ({ default: m.SkillGapAnalysis })));
const TalentCareerAnalytics = lazy(() => import("@/pages/enterprise/TalentAnalytics").then(m => ({ default: m.TalentCareerAnalytics })));
const SpecializedRecruitment = lazy(() => import("@/pages/enterprise/SpecializedRecruitment").then(m => ({ default: m.SpecializedRecruitment })));


export const enterpriseRoutes: NavItem[] = [
  {
    title: "Enterprise Command Center",
    to: "/enterprise",
    page: <Enterprise />,
    icon: <Building2 className="h-4 w-4" />,
    isPublic: true,
  },
  {
    title: "Enterprise Solutions",
    to: "/enterprise/solutions",
    page: <EnterpriseSolutions />,
    icon: <Building2 className="h-4 w-4" />,
    isPublic: true,
  },
  {
    title: "Internal Mobility",
    to: "/enterprise/internal-mobility",
    page: <InternalMobility />,
    icon: <TrendingUp className="h-4 w-4" />,
    isPublic: true,
  },
  {
    title: "Skill Gap Analysis",
    to: "/enterprise/skill-gap",
    page: <SkillGapAnalysis />,
    icon: <Target className="h-4 w-4" />,
    isPublic: true,
  },
  {
    title: "Talent Career Analytics",
    to: "/enterprise/career-analytics",
    page: <TalentCareerAnalytics />,
    icon: <BarChart3 className="h-4 w-4" />,
    isPublic: true,
  },
  {
    title: "Specialized Recruitment",
    to: "/enterprise/recruitment",
    page: <SpecializedRecruitment />,
    icon: <UserPlus className="h-4 w-4" />,
    isPublic: true,
  },
];



