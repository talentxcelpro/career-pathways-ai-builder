import { lazy, Suspense } from 'react';
import { Award, QrCode, BarChart3, Users, Shield, Trophy, Map } from "lucide-react";

const CompletedCareerIntelligenceSystem = lazy(() => import('../pages/CompletedCareerIntelligenceSystem').then(m => ({ default: m.CompletedCareerIntelligenceSystem })));
const InteractiveCareerRoadmapBuilder = lazy(() => import('../pages/InteractiveCareerRoadmapBuilder'));
const DynamicAchievementSystem = lazy(() => import('../pages/DynamicAchievementSystem'));
const SkillsVerificationCenter = lazy(() => import('../pages/SkillsVerificationCenter').then(m => ({ default: m.SkillsVerificationCenter })));
const InstantNetworkingSystem = lazy(() => import('../pages/InstantNetworkingSystem'));
const CareerIntelligenceDashboard = lazy(() => import('../pages/CareerIntelligenceDashboard'));
const QRNetworking = lazy(() => import('../pages/QRNetworking'));
const PublicPassportView = lazy(() => import('../pages/PublicPassportView'));
const PassportRouteHandler = lazy(() => import('@/components/passport/PassportRouteHandler'));
const CareerPassportDashboard = lazy(() => import('../pages/passport/CareerPassportDashboard'));
export const passportRoutes = [
  {
    title: "Career Passport",
    to: "/passport",
    icon: <Award className="h-4 w-4" />,
    page: <Suspense fallback={null}><CareerPassportDashboard /></Suspense>,
    isPublic: true,
  },
  {
    title: "Career Passport",
    to: "/passport/user/:userId",
    page: <Suspense fallback={null}><CareerPassportDashboard /></Suspense>,
    isPublic: true,
  },
  {
    title: "Career Passport",
    to: "/passport/:username",
    page: <Suspense fallback={null}><PassportRouteHandler /></Suspense>,
    isPublic: true,
  },
  {
    title: "Public Career Passport",
    to: "/passport/public/:identifier",
    page: <Suspense fallback={null}><PublicPassportView /></Suspense>,
    isPublic: true,
  },
  {
    title: "QR Networking",
    to: "/qr-networking",
    icon: <QrCode className="h-4 w-4" />,
    page: <Suspense fallback={null}><QRNetworking /></Suspense>,
    isPublic: true,
  },
  {
    title: "Career Intelligence",
    to: "/career-intelligence-dashboard",
    icon: <BarChart3 className="h-4 w-4" />,
    page: <Suspense fallback={null}><CareerIntelligenceDashboard /></Suspense>,
    isPublic: true,
  },
  {
    title: "Instant Networking",
    to: "/instant-networking",
    icon: <Users className="h-4 w-4" />,
    page: <Suspense fallback={null}><InstantNetworkingSystem /></Suspense>,
    isPublic: true,
  },
  {
    title: "Skills Verification",
    to: "/skills-verification",
    icon: <Shield className="h-4 w-4" />,
    page: <Suspense fallback={null}><SkillsVerificationCenter /></Suspense>,
    isPublic: true,
  },
  {
    title: "Achievement Center",
    to: "/achievements",
    icon: <Trophy className="h-4 w-4" />,
    page: <Suspense fallback={null}><DynamicAchievementSystem /></Suspense>,
    isPublic: true,
  },
  {
    title: "Roadmap Builder",
    to: "/roadmap-builder", 
    icon: <Map className="h-4 w-4" />,
    page: <Suspense fallback={null}><InteractiveCareerRoadmapBuilder /></Suspense>,
    isPublic: true,
  },
  {
    title: "Complete Intelligence",
    to: "/complete-intelligence",
    icon: <BarChart3 className="h-4 w-4" />,
    page: <Suspense fallback={null}><CompletedCareerIntelligenceSystem /></Suspense>,
    isPublic: true,
  },
];