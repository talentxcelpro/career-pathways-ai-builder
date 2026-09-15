import { lazy } from "react";
import { Award, QrCode, BarChart3, Users, Shield, Trophy, Map, Gauge } from "lucide-react";

const CareerPassportCommandCenter = lazy(() => import("../pages/passport/CareerPassportDashboard"));
const TalentScore = lazy(() => import("../pages/TalentScorePage"));
const PassportRouteHandler = lazy(() => import("@/components/passport/PassportRouteHandler"));
const PublicPassportView = lazy(() => import("../pages/PublicPassportView"));
const QRNetworking = lazy(() => import("../pages/QRNetworking"));
const CareerIntelligenceCommandCenter = lazy(() => import("../pages/CareerIntelligenceDashboard"));
const InstantNetworkingSystem = lazy(() => import("../pages/InstantNetworkingSystem"));
const SkillsVerificationCenter = lazy(() => import("../pages/SkillsVerificationCenter").then(m => ({ default: m.SkillsVerificationCenter })));
const DynamicAchievementSystem = lazy(() => import("../pages/DynamicAchievementSystem"));
const InteractiveCareerRoadmapBuilder = lazy(() => import("../pages/InteractiveCareerRoadmapBuilder"));
const CompletedCareerIntelligenceSystem = lazy(() => import("../pages/CompletedCareerIntelligenceSystem").then(m => ({ default: m.CompletedCareerIntelligenceSystem })));

export const passportRoutes = [
  {
    title: "Performance Index",
    to: "/talent-score",
    icon: <Gauge className="h-4 w-4" />,
    page: <TalentScore />,
    isPublic: false,
  },
  {
    title: "Evolution Hub",
    to: "/passport",
    icon: <Award className="h-4 w-4" />,
    page: <CareerPassportCommandCenter />,
    isPublic: true,
  },
  {
    title: "Evolution Hub",
    to: "/passport/user/:userId",
    page: <CareerPassportCommandCenter />,
    isPublic: true,
  },
  {
    title: "Evolution Hub",
    to: "/passport/:username",
    page: <PassportRouteHandler />,
    isPublic: true,
  },
  {
    title: "Evolution Sync Hub",
    to: "/passport/public/:identifier",
    page: <PublicPassportView />,
    isPublic: true,
  },
  {
    title: "Ecosystem Sync",
    to: "/qr-networking",
    icon: <QrCode className="h-4 w-4" />,
    page: <QRNetworking />,
    isPublic: true,
  },
  {
    title: "Intelligence Hub",
    to: "/career-intelligence-command-center",
    icon: <BarChart3 className="h-4 w-4" />,
    page: <CareerIntelligenceCommandCenter />,
    isPublic: true,
  },
  {
    title: "Ecosystem Sync",
    to: "/instant-networking",
    icon: <Users className="h-4 w-4" />,
    page: <InstantNetworkingSystem />,
    isPublic: true,
  },
  {
    title: "Capability Matrix",
    to: "/skills-verification",
    icon: <Shield className="h-4 w-4" />,
    page: <SkillsVerificationCenter />,
    isPublic: true,
  },
  {
    title: "Evolution Milestones",
    to: "/achievements",
    icon: <Trophy className="h-4 w-4" />,
    page: <DynamicAchievementSystem />,
    isPublic: true,
  },
  {
    title: "Evolution Roadmap",
    to: "/roadmap-builder", 
    icon: <Map className="h-4 w-4" />,
    page: <InteractiveCareerRoadmapBuilder />,
    isPublic: true,
  },
  {
    title: "Intelligence Matrix",
    to: "/complete-intelligence",
    icon: <BarChart3 className="h-4 w-4" />,
    page: <CompletedCareerIntelligenceSystem />,
    isPublic: true,
  },
];
