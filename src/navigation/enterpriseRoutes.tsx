import { NavItem } from "@/types/nav-item";
import { Building2, Settings, Users, Shield, Plug, FileText, Database, Download, TrendingUp, Brain, BarChart3, UserPlus } from "lucide-react";
import { Enterprise } from "@/pages/Enterprise";
import { EnterpriseSolutions } from "@/components/enterprise/EnterpriseSolutions";
import { InternalMobility } from "@/pages/enterprise/InternalMobility";
import { SkillGapAnalysis } from "@/pages/enterprise/SkillGapAnalysis";
import { TalentAnalytics } from "@/pages/enterprise/TalentAnalytics";
import { SpecializedRecruitment } from "@/pages/enterprise/SpecializedRecruitment";

export const enterpriseRoutes: NavItem[] = [
  {
    title: "Enterprise Dashboard",
    to: "/enterprise",
    page: <Enterprise />,
    icon: <Building2 className="h-4 w-4" />,
    requiresAuth: true,
  },
  {
    title: "Enterprise Solutions",
    to: "/enterprise/solutions",
    page: <EnterpriseSolutions />,
    icon: <Building2 className="h-4 w-4" />,
    requiresAuth: false,
  },
  {
    title: "Internal Mobility",
    to: "/enterprise/internal-mobility",
    page: <InternalMobility />,
    icon: <TrendingUp className="h-4 w-4" />,
    requiresAuth: true,
  },
  {
    title: "Skill Gap Analysis",
    to: "/enterprise/skill-gap",
    page: <SkillGapAnalysis />,
    icon: <Brain className="h-4 w-4" />,
    requiresAuth: true,
  },
  {
    title: "Talent Analytics",
    to: "/enterprise/analytics",
    page: <TalentAnalytics />,
    icon: <BarChart3 className="h-4 w-4" />,
    requiresAuth: true,
  },
  {
    title: "Specialized Recruitment",
    to: "/enterprise/recruitment",
    page: <SpecializedRecruitment />,
    icon: <UserPlus className="h-4 w-4" />,
    requiresAuth: true,
  },
];