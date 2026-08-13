import { lazy, Suspense } from 'react';
import { NavItem } from "@/types/nav-item";
import { Building2, Settings, Users, Shield, Plug, FileText, Database, Download, TrendingUp, Brain, BarChart3, UserPlus } from "lucide-react";

const SpecializedRecruitment = lazy(() => import('@/pages/enterprise/SpecializedRecruitment').then(m => ({ default: m.SpecializedRecruitment })));
const TalentAnalytics = lazy(() => import('@/pages/enterprise/TalentAnalytics').then(m => ({ default: m.TalentAnalytics })));
const SkillGapAnalysis = lazy(() => import('@/pages/enterprise/SkillGapAnalysis').then(m => ({ default: m.SkillGapAnalysis })));
const InternalMobility = lazy(() => import('@/pages/enterprise/InternalMobility').then(m => ({ default: m.InternalMobility })));
const EnterpriseSolutions = lazy(() => import('@/components/enterprise/EnterpriseSolutions').then(m => ({ default: m.EnterpriseSolutions })));
const Enterprise = lazy(() => import('@/pages/Enterprise').then(m => ({ default: m.Enterprise })));

export const enterpriseRoutes: NavItem[] = [
  {
    title: "Enterprise Dashboard",
    to: "/enterprise",
    page: <Suspense fallback={null}><Enterprise /></Suspense>,
    icon: <Building2 className="h-4 w-4" />,
    isPublic: true,
  },
  {
    title: "Enterprise Solutions",
    to: "/enterprise/solutions",
    page: <Suspense fallback={null}><EnterpriseSolutions /></Suspense>,
    icon: <Building2 className="h-4 w-4" />,
    isPublic: true,
  },
  {
    title: "Internal Mobility",
    to: "/enterprise/internal-mobility",
    page: <Suspense fallback={null}><InternalMobility /></Suspense>,
    icon: <TrendingUp className="h-4 w-4" />,
    isPublic: true,
  },
  {
    title: "Skill Gap Analysis",
    to: "/enterprise/skill-gap",
    page: <Suspense fallback={null}><SkillGapAnalysis /></Suspense>,
    icon: <Brain className="h-4 w-4" />,
    isPublic: true,
  },
  {
    title: "Talent Analytics",
    to: "/enterprise/analytics",
    page: <Suspense fallback={null}><TalentAnalytics /></Suspense>,
    icon: <BarChart3 className="h-4 w-4" />,
    isPublic: true,
  },
  {
    title: "Specialized Recruitment",
    to: "/enterprise/recruitment",
    page: <Suspense fallback={null}><SpecializedRecruitment /></Suspense>,
    icon: <UserPlus className="h-4 w-4" />,
    isPublic: true,
  },
];