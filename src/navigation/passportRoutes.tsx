import { Award, QrCode, BarChart3, Users, Shield, Trophy, Map } from "lucide-react";
import CareerPassportDashboard from "../pages/passport/CareerPassportDashboard";
import PassportRouteHandler from "@/components/passport/PassportRouteHandler";
import PublicPassportView from "../pages/PublicPassportView";
import QRNetworking from "../pages/QRNetworking";
import CareerIntelligenceDashboard from "../pages/CareerIntelligenceDashboard";
import InstantNetworkingSystem from "../pages/InstantNetworkingSystem";
import { SkillsVerificationCenter } from "../pages/SkillsVerificationCenter";
import DynamicAchievementSystem from "../pages/DynamicAchievementSystem";
import InteractiveCareerRoadmapBuilder from "../pages/InteractiveCareerRoadmapBuilder";
import { CompletedCareerIntelligenceSystem } from "../pages/CompletedCareerIntelligenceSystem";
export const passportRoutes = [
  {
    title: "Career Passport",
    to: "/passport",
    icon: <Award className="h-4 w-4" />,
    page: <CareerPassportDashboard />,
    isPublic: true,
  },
  {
    title: "Career Passport",
    to: "/passport/user/:userId",
    page: <CareerPassportDashboard />,
    isPublic: true,
  },
  {
    title: "Career Passport",
    to: "/passport/:username",
    page: <PassportRouteHandler />,
    isPublic: true,
  },
  {
    title: "Public Career Passport",
    to: "/passport/public/:identifier",
    page: <PublicPassportView />,
    isPublic: true,
  },
  {
    title: "QR Networking",
    to: "/qr-networking",
    icon: <QrCode className="h-4 w-4" />,
    page: <QRNetworking />,
    isPublic: true,
  },
  {
    title: "Career Intelligence",
    to: "/career-intelligence-dashboard",
    icon: <BarChart3 className="h-4 w-4" />,
    page: <CareerIntelligenceDashboard />,
    isPublic: true,
  },
  {
    title: "Instant Networking",
    to: "/instant-networking",
    icon: <Users className="h-4 w-4" />,
    page: <InstantNetworkingSystem />,
    isPublic: true,
  },
  {
    title: "Skills Verification",
    to: "/skills-verification",
    icon: <Shield className="h-4 w-4" />,
    page: <SkillsVerificationCenter />,
    isPublic: true,
  },
  {
    title: "Achievement Center",
    to: "/achievements",
    icon: <Trophy className="h-4 w-4" />,
    page: <DynamicAchievementSystem />,
    isPublic: true,
  },
  {
    title: "Roadmap Builder",
    to: "/roadmap-builder", 
    icon: <Map className="h-4 w-4" />,
    page: <InteractiveCareerRoadmapBuilder />,
    isPublic: true,
  },
  {
    title: "Complete Intelligence",
    to: "/complete-intelligence",
    icon: <BarChart3 className="h-4 w-4" />,
    page: <CompletedCareerIntelligenceSystem />,
    isPublic: true,
  },
];